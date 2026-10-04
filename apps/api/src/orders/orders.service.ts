import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PromotionsService } from 'src/promotions/promotions.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaClient,
    private promosService: PromotionsService,
  ) {}

  private getActivePrice({
    price,
    salePrice,
    saleStartAt,
    saleEndAt,
  }: {
    price: Decimal;
    salePrice?: Decimal | null;
    saleStartAt?: Date | null;
    saleEndAt?: Date | null;
  }): number {
    const now = new Date();
    if (
      salePrice !== null &&
      salePrice !== undefined &&
      (!saleStartAt || now >= saleStartAt) &&
      (!saleEndAt || now <= saleEndAt)
    ) {
      return Number(salePrice);
    }
    return Number(price);
  }

  /*   async create(createOrderDto: CreateOrderDto) {
      try {
        const { items, userId, shippingAddress, phoneNumber, currency } =
          createOrderDto;
  
        if (!currency) throw new BadRequestException('Currency is required');
        if (!items.length)
          throw new BadRequestException('Order must contain at least one item');
  
        const orderItems = await Promise.all(
          items.map(async (item) => {
            const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
            if (quantity <= 0)
              throw new BadRequestException('Quantity must be > 0');
  
            if (item.variantId) {
              const variant = await this.prisma.variant.findUnique({
                where: { id: item.variantId },
              });
              if (!variant)
                throw new NotFoundException(`Variant ${item.variantId} not found`);
              if (variant.stock < quantity)
                throw new BadRequestException(
                  `Insufficient stock for variant ${item.variantId}`,
                );
  
              const variantPrice = await this.prisma.variantPrice.findUnique({
                where: {
                  variantId_currency: {
                    variantId: item.variantId,
                    currency,
                  },
                },
              });
  
              if (!variantPrice)
                throw new NotFoundException(
                  `Price not found for variant ${item.variantId} in ${currency}`,
                );
  
              const unitPrice = this.getActivePrice(variantPrice);
  
              return {
                variantId: item.variantId,
                quantity,
                unitPrice,
                currency,
              };
            }
  
            if (item.productId) {
              const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
              });
              if (!product)
                throw new NotFoundException(`Product ${item.productId} not found`);
              if ((product.stock ?? 0) < quantity)
                throw new BadRequestException(
                  `Insufficient stock for product ${item.productId}`,
                );
  
              const productPrice = await this.prisma.productPrice.findUnique({
                where: {
                  productId_currency: {
                    productId: item.productId,
                    currency,
                  },
                },
              });
  
              if (!productPrice)
                throw new NotFoundException(
                  `Price not found for product ${item.productId} in ${currency}`,
                );
  
              const unitPrice = this.getActivePrice(productPrice);
  
              return {
                productId: item.productId,
                quantity,
                unitPrice,
                currency,
              };
            }
  
            throw new BadRequestException(
              'Each item must have variantId or productId',
            );
          }),
        );
  
        const totalPrice = orderItems.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0,
        );
  
        const order = await this.prisma.order.create({
          data: {
            userId,
            shippingAddress,
            phoneNumber,
            currency,
            totalPrice,
            items: {
              create: orderItems,
            },
          },
          include: {
            items: {
              include: {
                variant: { include: { product: true } },
                product: true,
              },
            },
            payment: true,
          },
        });
  
        // Update stock after order success
        await Promise.all(
          items.map(async (item) => {
            const quantity = item.quantity ?? 1;
            if (item.variantId) {
              await this.prisma.variant.update({
                where: { id: item.variantId },
                data: { stock: { decrement: quantity } },
              });
            } else if (item.productId) {
              await this.prisma.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: quantity } },
              });
            }
          }),
        );
  
        return order;
      } catch (error) {
        console.error('Order creation failed:', error);
        throw new BadRequestException(error?.message || 'Failed to create order');
      }
    }
   */

  async create(createOrderDto: CreateOrderDto) {
    try {
      const {
        items,
        userId,
        shippingAddress,
        phoneNumber,
        currency,
        promoId, // 👈 from dto
        totalPrice,
      } = createOrderDto;

      if (!currency) throw new BadRequestException('Currency is required');
      if (!items.length)
        throw new BadRequestException('Order must contain at least one item');

      /*       // 👇 Validate promo code if provided
            let promo = null;
            if (promoCode) {
              promo = await this.promosService.validatePromo(promoCode); // Injected
            } */

      // Build order items
      const orderItems = await Promise.all(
        items.map(async (item) => {
          const quantity =
            typeof item.quantity === 'number' ? item.quantity : 1;
          if (quantity <= 0)
            throw new BadRequestException('Quantity must be > 0');

          if (item.variantId) {
            const variant = await this.prisma.variant.findUnique({
              where: { id: item.variantId },
            });
            if (!variant)
              throw new NotFoundException(
                `Variant ${item.variantId} not found`,
              );
            if (variant.stock < quantity)
              throw new BadRequestException(
                `Insufficient stock for variant ${item.variantId}`,
              );

            const variantPrice = await this.prisma.variantPrice.findUnique({
              where: {
                variantId_currency: {
                  variantId: item.variantId,
                  currency,
                },
              },
            });

            if (!variantPrice)
              throw new NotFoundException(
                `Price not found for variant ${item.variantId} in ${currency}`,
              );

            const unitPrice = this.getActivePrice(variantPrice);

            return {
              variantId: item.variantId,
              quantity,
              unitPrice,
              currency,
            };
          }

          if (item.productId) {
            const product = await this.prisma.product.findUnique({
              where: { id: item.productId },
            });
            if (!product)
              throw new NotFoundException(
                `Product ${item.productId} not found`,
              );
            if ((product.stock ?? 0) < quantity)
              throw new BadRequestException(
                `Insufficient stock for product ${item.productId}`,
              );

            const productPrice = await this.prisma.productPrice.findUnique({
              where: {
                productId_currency: {
                  productId: item.productId,
                  currency,
                },
              },
            });

            if (!productPrice)
              throw new NotFoundException(
                `Price not found for product ${item.productId} in ${currency}`,
              );

            const unitPrice = this.getActivePrice(productPrice);

            return {
              productId: item.productId,
              quantity,
              unitPrice,
              currency,
            };
          }

          throw new BadRequestException(
            'Each item must have variantId or productId',
          );
        }),
      );

      // Calculate total
      /*       const baseTotal = orderItems.reduce(
              (sum, item) => sum + item.unitPrice * item.quantity,
              0,
            ); */

      /*       let totalPrice = baseTotal;
       */
      // 👇 Apply discount if promo valid
      /*       if (promo) {
              if (promo.discountType === 'PERCENTAGE') {
                totalPrice = totalPrice * (1 - Number(promo.value) / 100);
              } else if (promo.discountType === 'FIXED') {
                totalPrice = Math.max(0, totalPrice - Number(promo.value));
              }
            } */

      const order = await this.prisma.order.create({
        data: {
          userId,
          shippingAddress,
          phoneNumber,
          currency,
          totalPrice,
          promoId, // 👈 attach promo
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              variant: { include: { product: true } },
              product: true,
            },
          },
          payment: true,
          promo: true, // 👈 include promo
        },
      });

      // Decrease stock
      await Promise.all(
        items.map(async (item) => {
          const quantity = item.quantity ?? 1;
          if (item.variantId) {
            await this.prisma.variant.update({
              where: { id: item.variantId },
              data: { stock: { decrement: quantity } },
            });
          } else if (item.productId) {
            await this.prisma.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: quantity } },
            });
          }
        }),
      );

      // 👇 Update promo usage count
      /*       if (promo) {
              await this.prisma.promo.update({
                where: { id: promo.id },
                data: { usedCount: { increment: 1 } },
              });
            } */

      return order;
    } catch (error) {
      console.error('Order creation failed:', error);
      throw new BadRequestException(error?.message || 'Failed to create order');
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    status?: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    try {
      const where: any = {};

      if (status) where.status = status;
      if (dateFrom)
        where.createdAt = {
          ...(where.createdAt || {}),
          gte: new Date(dateFrom),
        };
      if (dateTo)
        where.createdAt = {
          ...(where.createdAt || {}),
          lte: new Date(dateTo),
        };

      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: {
                variant: { include: { product: true } },
                product: true,
              },
            },
            user: true,
            payment: true,
          },
        }),
        this.prisma.order.count({ where }),
      ]);

      return {
        data: orders,
        total,
        totalPages: Math.ceil(total / limit),
        page,
      };
    } catch (error) {
      console.error('[FindAll Orders Error]', error);
      throw new BadRequestException('Failed to fetch orders');
    }
  }

  async findOne(id: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              variant: { include: { product: true } },
              product: true,
            },
          },
          payment: true,
        },
      });

      if (!order) throw new NotFoundException(`Order ${id} not found`);
      return order;
    } catch (error) {
      console.error('[Find Order Error]', error);
      throw new BadRequestException('Failed to fetch order');
    }
  }

  async findByUser(id: string) {
    try {
      if (!id) throw new BadRequestException('User ID is required');

      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException(`User ${id} not found`);

      const orders = await this.prisma.order.findMany({
        where: { userId: id },
        include: {
          items: {
            include: {
              variant: { include: { product: true } },
              product: true,
            },
          },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        data: orders,
        message: orders.length ? undefined : 'User has no orders yet',
      };
    } catch (error) {
      console.error('[FindByUser Orders Error]', error);
      throw new BadRequestException(error?.message || 'Failed to fetch orders');
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    try {
      return await this.prisma.order.update({
        where: { id },
        data: { status: updateOrderDto.status },
        include: {
          items: {
            include: {
              variant: { include: { product: true } },
              product: true,
            },
          },
          payment: true,
        },
      });
    } catch (error) {
      console.error('[Update Order Error]', error);
      throw new BadRequestException(error?.message || 'Failed to update order');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.order.delete({ where: { id } });
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Order ${id} not found`);
      }
      console.error('[Delete Order Error]', error);
      throw new BadRequestException('Failed to delete order');
    }
  }
}

/* // orders.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaClient) {}

  private getActivePrice({
    price,
    salePrice,
    saleStartAt,
    saleEndAt,
  }: {
    price: Decimal;
    salePrice?: Decimal | null;
    saleStartAt?: Date | null;
    saleEndAt?: Date | null;
  }): number {
    const now = new Date();
    if (
      salePrice !== null &&
      salePrice !== undefined &&
      (!saleStartAt || now >= saleStartAt) &&
      (!saleEndAt || now <= saleEndAt)
    ) {
      return Number(salePrice);
    }
    return Number(price);
  }

  async create(createOrderDto: CreateOrderDto) {
    const { items, userId, shippingAddress, phoneNumber, currency } =
      createOrderDto;

    if (!currency) throw new BadRequestException('Currency is required');

    const orderItems = await Promise.all(
      items.map(async (item) => {
        const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
        if (quantity <= 0)
          throw new BadRequestException('Quantity must be > 0');

        if (item.variantId) {
          const variant = await this.prisma.variant.findUnique({
            where: { id: item.variantId },
          });
          if (!variant)
            throw new NotFoundException(`Variant ${item.variantId} not found`);
          if (variant.stock < quantity)
            throw new BadRequestException(
              `Insufficient stock for variant ${item.variantId}`,
            );

          const variantPrice = await this.prisma.variantPrice.findUnique({
            where: {
              variantId_currency: {
                variantId: item.variantId,
                currency,
              },
            },
          });

          if (!variantPrice)
            throw new NotFoundException(
              `Price not found for variant ${item.variantId} in ${currency}`,
            );

          const unitPrice = this.getActivePrice(variantPrice);

          return {
            variantId: item.variantId,
            quantity,
            unitPrice,
            currency,
          };
        }

        if (item.productId) {
          const product = await this.prisma.product.findUnique({
            where: { id: item.productId },
          });
          if (!product)
            throw new NotFoundException(`Product ${item.productId} not found`);
          if ((product.stock ?? 0) < quantity)
            throw new BadRequestException(
              `Insufficient stock for product ${item.productId}`,
            );

          const productPrice = await this.prisma.productPrice.findUnique({
            where: {
              productId_currency: {
                productId: item.productId,
                currency,
              },
            },
          });

          if (!productPrice)
            throw new NotFoundException(
              `Price not found for product ${item.productId} in ${currency}`,
            );

          const unitPrice = this.getActivePrice(productPrice);

          return {
            productId: item.productId,
            quantity,
            unitPrice,
            currency,
          };
        }

        throw new BadRequestException(
          'Each item must have variantId or productId',
        );
      }),
    );

    const totalPrice = orderItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    const order = await this.prisma.order.create({
      data: {
        userId,
        shippingAddress,
        phoneNumber,
        currency,
        totalPrice,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            variant: { include: { product: true } },
            product: true,
          },
        },
        payment: true,
      },
    });

    // Decrease stock after order is successful
    await Promise.all(
      items.map(async (item) => {
        const quantity = item.quantity ?? 1;
        if (item.variantId) {
          await this.prisma.variant.update({
            where: { id: item.variantId },
            data: {
              stock: { decrement: quantity },
            },
          });
        } else if (item.productId) {
          await this.prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: quantity },
            },
          });
        }
      }),
    );

    return order;
  }

  async findAll(
    page = 1,
    limit = 10,
    status?: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    const where: any = {};

    if (status) where.status = status;
    if (dateFrom)
      where.createdAt = { ...(where.createdAt || {}), gte: new Date(dateFrom) };
    if (dateTo)
      where.createdAt = { ...(where.createdAt || {}), lte: new Date(dateTo) };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              variant: { include: { product: true } },
              product: true,
            },
          },
          user: true,
          payment: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      total,
      totalPages: Math.ceil(total / limit),
      page,
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            variant: { include: { product: true } },
            product: true,
          },
        },
        payment: true,
      },
    });

    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async findByUser(id: string) {
    try {
      // Validate user ID
      if (!id) {
        throw new BadRequestException('User ID is required');
      }

      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Get orders with related data
      const orders = await this.prisma.order.findMany({
        where: { userId: id },
        include: {
          items: {
            include: {
              variant: { include: { product: true } },
              product: true,
            },
          },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Return empty array with message if no orders found
      if (orders.length === 0) {
        return {
          message: 'User has no orders yet',
          data: [],
        };
      }

      return {
        data: orders,
      };
    } catch (error) {
      // Handle specific Prisma errors
      if (error?.code === 'P2023') {
        throw new BadRequestException('Invalid ID format');
      }

      // Re-throw NestJS exceptions
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      // Log unexpected errors and throw generic error
      console.error('Error fetching user orders:', error);
      throw new BadRequestException('Failed to fetch user orders');
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    try {
      return await this.prisma.order.update({
        where: { id },
        data: { status: updateOrderDto.status },
        include: {
          items: {
            include: {
              variant: { include: { product: true } },
              product: true,
            },
          },
          payment: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error?.message || 'Failed to update order');
    }
  }

  async remove(id: string) {
    return await this.prisma.order.delete({ where: { id } });
  }
}
 */
