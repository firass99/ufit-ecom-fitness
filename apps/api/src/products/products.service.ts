import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { Currency, Prisma, PrismaClient } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductsDto } from './dto/filter-products.dto';
import { MeilisearchService } from 'src/meilisearch/meilisearch.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly meilSearchService: MeilisearchService,
  ) {}

  private getActivePrice(price: {
    price: Prisma.Decimal;
    salePrice?: Prisma.Decimal | null;
    saleStartAt?: Date | null;
    saleEndAt?: Date | null;
  }): Prisma.Decimal {
    const now = new Date();
    const isOnSale =
      !!price.salePrice &&
      (!price.saleStartAt || price.saleStartAt <= now) &&
      (!price.saleEndAt || price.saleEndAt >= now);

    return isOnSale ? (price.salePrice as Prisma.Decimal) : price.price;
  }

  private formatProductForSearch(product: any, currency?: Currency) {
    const priceObj = currency
      ? product.prices?.find((p) => p.currency === currency)
      : (product.prices?.[0] ?? null);

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      image: product.images?.[0] ?? null,
      price: priceObj ? this.getActivePrice(priceObj) : null,
      stock: product.stock,
      isAvailable: product.isAvailable,
      translations: product.translations?.map((tr) => ({
        locale: tr.locale,
        name: tr.name,
        description: tr.description,
      })),
    };
  }

  // ✅ CREATE PRODUCT
  async create(dto: CreateProductDto) {
    console.log('THIS IS CREATE PRODUCT SERVICE');

    try {
      const { translations, prices, variants, hasVariants, ...rest } = dto;
      const resolvedHasVariants = hasVariants ?? !!variants?.length;

      const product = await this.prisma.product.create({
        data: {
          ...rest,
          hasVariants: resolvedHasVariants,
          translations: translations?.length
            ? { create: translations }
            : undefined,
          prices:
            !resolvedHasVariants && prices?.length
              ? {
                  create: prices.map((p) => ({
                    ...p,
                    price: new Prisma.Decimal(p.price),
                    salePrice: p.salePrice
                      ? new Prisma.Decimal(p.salePrice)
                      : undefined,
                  })),
                }
              : undefined,
          variants:
            resolvedHasVariants && variants?.length
              ? {
                  create: variants.map((v) => ({
                    size: v.size ?? null,
                    color: v.color ?? null,
                    gender: v.gender,
                    stock: v.stock ?? 0,
                    prices: {
                      create: v.prices.map((vp) => ({
                        ...vp,
                        price: new Prisma.Decimal(vp.price),
                        salePrice: vp.salePrice
                          ? new Prisma.Decimal(vp.salePrice)
                          : undefined,
                      })),
                    },
                  })),
                }
              : undefined,
        },
        include: {
          translations: true,
          prices: true,
          category: true,
        },
      });

      // pick a currency for search indexing gracefully
      const indexCurrency: Currency | undefined = prices?.[0]?.currency;
      await this.meilSearchService.addOrUpdate('products', [
        this.formatProductForSearch(product, indexCurrency),
      ]);

      return product;
    } catch (error: any) {
      // Prisma unique violation (e.g., unique composite on variantId+currency or productId+currency)
      if (error?.code === 'P2002') {
        throw new BadRequestException(
          `Duplicate unique field(s): ${Array.isArray(error.meta?.target) ? error.meta.target.join(', ') : error.meta?.target}`,
        );
      }
      console.error('🔥 Product creation failed:', error);
      throw new InternalServerErrorException('Error creating product');
    }
  }

  // ✅ UPDATE PRODUCT (simplified partial update; extend as needed)
  async update(id: string, dto: UpdateProductDto) {
    try {
      const found = await this.prisma.product.findUnique({ where: { id } });
      if (!found) throw new NotFoundException('Product not found');

      const { translations, prices, variants, hasVariants, ...rest } = dto;
      const resolvedHasVariants = hasVariants ?? !!variants?.length;

      // 1. Update Translations
      if (translations?.length) {
        for (const t of translations) {
          await this.prisma.productTranslation.upsert({
            where: { productId_locale: { productId: id, locale: t.locale } },
            update: { name: t.name, description: t.description },
            create: { ...t, productId: id },
          });
        }
      }

      // 2. Update base prices if !hasVariants
      if (!resolvedHasVariants && prices?.length) {
        for (const p of prices) {
          await this.prisma.productPrice.upsert({
            where: {
              productId_currency: {
                productId: id,
                currency: p.currency,
              },
            },
            update: {
              price: new Prisma.Decimal(p.price),
              salePrice: p.salePrice ? new Prisma.Decimal(p.salePrice) : null,
              saleStartAt: p.saleStartAt ?? null,
              saleEndAt: p.saleEndAt ?? null,
            },
            create: {
              ...p,
              productId: id,
              price: new Prisma.Decimal(p.price),
              salePrice: p.salePrice
                ? new Prisma.Decimal(p.salePrice)
                : undefined,
            },
          });
        }
      }

      // 3. 🔥 Update variants (if any)
      if (resolvedHasVariants && variants?.length) {
        // delete old variants + their prices
        await this.prisma.variant.deleteMany({
          where: { productId: id },
        });

        for (const v of variants) {
          await this.prisma.variant.create({
            data: {
              productId: id,
              size: v.size,
              color: v.color,
              gender: v.gender,
              stock: v.stock,
              prices: {
                create: v.prices.map((p) => ({
                  currency: p.currency,
                  price: new Prisma.Decimal(p.price),
                  salePrice: p.salePrice
                    ? new Prisma.Decimal(p.salePrice)
                    : undefined,
                  saleStartAt: p.saleStartAt ?? null,
                  saleEndAt: p.saleEndAt ?? null,
                })),
              },
            },
          });
        }
      }

      // 4. Update the base product
      await this.prisma.product.update({
        where: { id },
        data: {
          ...rest,
          hasVariants: resolvedHasVariants,
        },
      });

      return this.findOne(id);
    } catch (error) {
      console.error('🔥 Product update failed:', error);
      throw new InternalServerErrorException('Failed to update product');
    }
  }

  // ✅ FIND ALL with proper pagination and currency-aware active-price filter
  async findAll(filter: FilterProductsDto) {
    console.log('THIS IS FIND ALL PRODUCTS SERVICE');

    const {
      page = 1,
      limit = 12,
      categoryId,
      brandId,
      search,
      genders,
      sizes,
      colors,
      sort, // 'price_asc' | 'price_desc' | undefined
      isAvailable, // boolean | undefined
    } = filter;

    const baseWhere: Prisma.ProductWhereInput = {
      ...(typeof isAvailable === 'boolean' ? { isAvailable } : {}),
      ...(categoryId && { categoryId }),
      ...(brandId && { brandId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          {
            translations: {
              some: {
                name: { contains: search, mode: 'insensitive' },
              },
            },
          },
        ],
      }),
      ...(genders?.length || sizes?.length || colors?.length
        ? {
            variants: {
              some: {
                ...(genders?.length && { gender: { in: genders } }),
                ...(sizes?.length && { size: { in: sizes } }),
                ...(colors?.length && { color: { in: colors } }),
              },
            },
          }
        : {}),
    };

    const sortingByPrice = sort === 'price_asc' || sort === 'price_desc';

    // Fast path when not sorting by price
    if (!sortingByPrice) {
      const [total, data] = await Promise.all([
        this.prisma.product.count({ where: baseWhere }),
        this.prisma.product.findMany({
          where: baseWhere,
          include: {
            translations: true,
            prices: true,
            variants: { include: { prices: true } },
            category: { include: { translations: true } },
            brand: true,
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      // pick a currency for search indexing gracefully
      /*       const indexCurrency: Currency | undefined = prices?.[0]?.currency;
       */ await this.meilSearchService.addOrUpdate('products', [
        this.formatProductForSearch(
          data.map((p) => {
            return {
              name: p.name,
              description: p.description,
              images: p.images,
              stock: p.stock,
              isAvailable: p.isAvailable,
              brandId: p.brandId,
              categoryId: p.categoryId,
              hasVariants: p.hasVariants,
              createdAt: p.createdAt,
              updatedAt: p.updatedAt,
              translations: p.translations,
              prices: p.prices,
              variants: p.variants,
              category: p.category,
              brand: p.brand,
            };
          }) /*,  indexCurrency */,
        ),
      ]);

      return {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        data,
      };
    }

    // Sorting by price:
    // 1) get ids + prices
    const candidates = await this.prisma.product.findMany({
      where: baseWhere,
      select: {
        id: true,
        prices: {
          select: {
            price: true,
            salePrice: true,
            saleStartAt: true,
            saleEndAt: true,
          },
        },
      },
    });

    const now = new Date();
    const activePriceOfRow = (row: {
      price: Prisma.Decimal;
      salePrice: Prisma.Decimal | null;
      saleStartAt: Date | null;
      saleEndAt: Date | null;
    }) => {
      const saleActive =
        row.salePrice &&
        (!row.saleStartAt || row.saleStartAt <= now) &&
        (!row.saleEndAt || row.saleEndAt >= now);
      return Number(saleActive ? row.salePrice! : row.price);
    };

    // 2) compute min active price across all currencies for each product
    const withMinPrice = candidates
      .map((p) => {
        if (!p.prices || p.prices.length === 0) return null;
        const min = Math.min(...p.prices.map(activePriceOfRow));
        return { id: p.id, minPrice: Number.isFinite(min) ? min : Infinity };
      })
      .filter(Boolean) as { id: string; minPrice: number }[];

    // 3) sort + paginate
    withMinPrice.sort((a, b) =>
      sort === 'price_asc' ? a.minPrice - b.minPrice : b.minPrice - a.minPrice,
    );

    const total = withMinPrice.length;
    const start = (page - 1) * limit;
    const pageIds = withMinPrice.slice(start, start + limit).map((x) => x.id);

    // 4) fetch full objects
    const data = await this.prisma.product.findMany({
      where: { id: { in: pageIds } },
      include: {
        translations: true,
        prices: true,
        variants: { include: { prices: true } },
        category: { include: { translations: true } },
        brand: true,
      },
    });

    // keep the order of pageIds
    const order = new Map(pageIds.map((id, i) => [id, i]));
    data.sort((a, b) => order.get(a.id)! - order.get(b.id)!);

    return {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      data,
    };
  }

  async findOne(id: string, currency?: Currency) {
    console.log('THIS IS FIND PRODUCT SERVICE');

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        translations: true,
        prices: true,
        variants: { include: { prices: true } },
        category: { include: { translations: true } },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    //console.log('THIS IS THE PRODUCT :: ', product);

    /*     await this.meilSearchService.addOrUpdate('products', [
          this.formatProductForSearch(product, currency),
        ]); */

    console.log('THE PRODUCT INFO IS : ', product);

    return product;
  }

  async remove(id: string) {
    try {
      /*       const found = await this.prisma.product.findUnique({ where: { id } });
            if (!found) throw new NotFoundException('Product not found');
      
            return await this.prisma.product.update({
              where: { id },
              data: { isAvailable: false },
            }); */
      const deletedProduct = await this.prisma.product.delete({
        where: { id },
      });
      return deletedProduct;
    } catch (error) {
      console.error('🔥 Product delete failed:', error);
      throw new InternalServerErrorException('Failed to delete product');
    }
  }
}
