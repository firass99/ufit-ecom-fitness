import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { MeilisearchService } from 'src/meilisearch/meilisearch.service';
///import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly meilSearchService: MeilisearchService,
  ) {}

  async create(dto: CreateCategoryDto) {
    const { translations, ...categoryData } = dto;

    const cat = await this.prisma.category.create({
      data: {
        ...categoryData,
        translations: {
          create: translations,
        },
      },
      include: {
        translations: true,
      },
    });
    //meilisearch
    await this.meilSearchService.addOrUpdate('categories', [cat]);
    return cat;
  }

  async findAll() {
    const categories = await this.prisma.category.findMany({
      include: {
        /* : lang
          ? {
            where: { locale: lang },
            take: 1,
          } */
        translations: true,
        products: {
          include: {
            variants: true,
          },
        },
      },
    });

    if (!categories.length) {
      throw new NotFoundException('No categories found');
    }

    //meilsearch indexing update
    await this.meilSearchService.addOrUpdate('categories', [...categories]);

    return categories.map((cat) => ({
      ...cat /*, 
      name: cat.translations?.[0]?.name || cat.name,
      description: cat.translations?.[0]?.description || cat.description, */,
    }));
  }

  async findOne(id: string, lang?: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        translations: lang
          ? {
              where: { locale: lang },
              take: 1,
            }
          : true,
        products: {
          include: {
            variants: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    await this.meilSearchService.addOrUpdate('categories', [category]);

    return {
      ...category,
    };
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { translations: true },
    });
    if (!category) throw new NotFoundException('Category not found');

    const incoming = dto.translations || [];
    const existingIds = category.translations.map((t) => t.id);
    const incomingIds = incoming.map((t) => t.id).filter(Boolean);

    const toDelete = existingIds.filter((id) => !incomingIds.includes(id));
    if (toDelete.length) {
      await this.prisma.categoryTranslation.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    for (const t of incoming) {
      if (t.id) {
        await this.prisma.categoryTranslation.update({
          where: { id: t.id },
          data: { locale: t.locale, name: t.name, description: t.description },
        });
      } else {
        await this.prisma.categoryTranslation.create({
          data: {
            categoryId: id,
            locale: t.locale,
            name: t.name,
            description: t.description,
          },
        });
      }
    }

    await this.meilSearchService.addOrUpdate('categories', [category]);

    return this.prisma.category.update({
      where: { id },
      data: { name: dto.name, description: dto.description, image: dto.image },
      include: { translations: true },
    });
  }

  async remove(id: string) {
    try {
      await this.findOne(id);
      //meili search delete, index/ID
      await this.meilSearchService.delete('categories', id);
      return this.prisma.category.delete({
        where: { id },
      });
    } catch {
      throw new BadRequestException(
        'Cannot delete: Category belongs to other tables',
      );
    }
  }

  async updateImage(id: string, imagePath: string) {
    await this.findOne(id);

    return this.prisma.category.update({
      where: { id },
      data: { image: imagePath },
    });
  }
}
