import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient, Currency } from '@prisma/client';
import { CreateCartDto } from './dto/create-cart.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartsService {
  constructor(private prisma: PrismaClient) {}

  /*   async create(createCartDto: CreateCartDto) {
      const existingCart = await this.prisma.cart.findUnique({
        where: { userId: createCartDto.userId },
      });
  
      if (existingCart) {
        throw new BadRequestException('User already has a cart');
      }
  
      return this.prisma.cart.create({
        data: createCartDto,
        include: {
          items: {
            include: {
              variant: { include: { product: true } },
              product: true,
            },
          },
        },
      });
    } */

  /*   async create(createCartDto: CreateCartDto) {
      const existingCart = await this.prisma.cart.findUnique({
        where: { userId: createCartDto.userId },
      });
  
      if (existingCart) {
        throw new BadRequestException('User already has a cart');
      }
  
      return this.prisma.cart.create({
        data: {
          user: {
            connect: {
              id: createCartDto.userId,
            },
          },
        },
        include: {
          items: {
            include: {
              variant: { include: { product: true } },
              product: true,
            },
          },
        },
      });
    } */

  async create(createCartDto: CreateCartDto) {
    const existingCart = await this.prisma.cart.findUnique({
      where: { userId: createCartDto.userId },
    });

    if (existingCart) {
      throw new BadRequestException('User already has a cart');
    }

    return this.prisma.cart.create({
      data: {
        user: {
          connect: {
            id: createCartDto.userId,
          },
        },
        currency: createCartDto.currency,
      },
      include: {
        items: {
          include: {
            variant: { include: { product: true } },
            product: true,
          },
        },
      },
    });
  }

  async findOne(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
                prices: true,
              },
            },
            product: {
              include: { prices: true },
            },
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException(`Cart not found for user ${userId}`);
    }

    return cart;
  }

  async addItem(userId: string, dto: AddToCartDto & { currency?: Currency }) {
    console.log('THIS IS USER ID : ', userId);

    console.log('THIS IS ADD TO CART ITEMS DTO  : ', dto);

    const cart = await this.prisma.cart.upsert({
      where: { userId },
      create: {
        user: { connect: { id: userId } },
        currency: dto.currency,
      },
      update: {},
    });

    const currency = dto.currency;
    let stock = 0;
    let price = 0;
    let existingItem = null;

    if (dto.variantId) {
      const variant = await this.prisma.variant.findUnique({
        where: { id: dto.variantId },
        include: { product: true },
      });

      if (!variant) {
        throw new NotFoundException(`Variant ${dto.variantId} not found`);
      }

      stock = variant.stock;

      const variantPrice = await this.prisma.variantPrice.findUnique({
        where: {
          variantId_currency: {
            variantId: dto.variantId,
            currency,
          },
        },
      });

      if (!variantPrice) {
        throw new NotFoundException(
          `Price not found for variant in ${currency}`,
        );
      }

      price = Number(variantPrice.salePrice ?? variantPrice.price);

      existingItem = await this.prisma.cartItem.findUnique({
        where: {
          cartId_variantId: {
            cartId: cart.id,
            variantId: dto.variantId,
          },
        },
      });
    } else if (dto.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: dto.productId },
      });

      if (!product) {
        throw new NotFoundException(`Product ${dto.productId} not found`);
      }

      stock = product.stock ?? 0;

      const productPrice = await this.prisma.productPrice.findUnique({
        where: {
          productId_currency: {
            productId: dto.productId,
            currency,
          },
        },
      });

      if (!productPrice) {
        throw new NotFoundException(
          `Price not found for product in ${currency}`,
        );
      }

      price = Number(productPrice.salePrice ?? productPrice.price);

      existingItem = await this.prisma.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: dto.productId,
          },
        },
      });
    } else {
      throw new BadRequestException(
        'Must provide either variantId or productId',
      );
    }

    // Stock check
    if (dto.quantity > 0 && stock < dto.quantity) {
      throw new BadRequestException('Not enough stock');
    }

    if (existingItem) {
      const newQuantity = existingItem.quantity + dto.quantity;

      if (newQuantity <= 0) {
        await this.prisma.cartItem.delete({ where: { id: existingItem.id } });
        return null;
      }

      if (newQuantity > stock) {
        throw new BadRequestException('Cannot add more than available stock');
      }

      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          variant: { include: { product: true, prices: true } },
          product: { include: { prices: true } },
        },
      });
    }

    if (dto.quantity > 0) {
      return this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: dto.variantId ?? null,
          productId: dto.productId ?? null,
          quantity: dto.quantity,
        },
        include: {
          variant: { include: { product: true, prices: true } },
          product: { include: { prices: true } },
        },
      });
    }

    throw new BadRequestException('Cannot decrement non-existing cart item');
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      throw new NotFoundException(`Cart not found for user ${userId}`);
    }

    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      throw new NotFoundException(`Item ${itemId} not found in cart`);
    }

    return this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  async clear(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException(`Cart not found for user ${userId}`);
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.findOne(userId);
  }
}
