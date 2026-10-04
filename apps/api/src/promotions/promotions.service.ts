// src/promo/promo.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaClient) {}

  async create(dto: CreatePromotionDto) {
    try {
      return await this.prisma.promo.create({ data: dto });
    } catch (error) {
      throw new BadRequestException(
        error?.message || 'Failed to create promotion',
      );
    }
  }

  async findAll(page: number = 1, limit: number = 10) {
    try {
      const [data, total] = await this.prisma.$transaction([
        this.prisma.promo.findMany({
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.promo.count(),
      ]);

      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new BadRequestException('Failed to retrieve promotions');
    }
  }

  async findOne(id: string) {
    try {
      const promo = await this.prisma.promo.findUnique({ where: { id } });
      if (!promo) throw new NotFoundException('Promotion not found');
      return promo;
    } catch (error) {
      throw new BadRequestException(
        error?.message || 'Failed to get promotion',
      );
    }
  }

  async update(id: string, dto: UpdatePromotionDto) {
    try {
      return await this.prisma.promo.update({ where: { id }, data: dto });
    } catch (error) {
      throw new BadRequestException(
        error?.message || 'Failed to update promotion',
      );
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.promo.delete({ where: { id } });
    } catch (error) {
      throw new BadRequestException(
        error?.message || 'Failed to delete promotion',
      );
    }
  }

  async validatePromo(code: string, now = new Date()) {
    try {
      if (!code || typeof code !== 'string') {
        throw new BadRequestException('Promo code must be a valid string');
      }

      const promo = await this.prisma.promo.findFirst({
        where: {
          code,
          isActive: true,
          AND: [
            {
              OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
            },
            {
              OR: [
                { maxUsage: null },
                {
                  maxUsage: {
                    gt: 0,
                  },
                },
              ],
            },
          ],
        },
      });

      if (!promo) {
        throw new NotFoundException(
          'Promo code is invalid, expired, or inactive',
        );
      }

      if (promo.maxUsage !== null && promo.usedCount >= promo.maxUsage) {
        throw new BadRequestException('Promo code has reached its usage limit');
      }

      // ✅ Increment usedCount
      const updatedPromo = await this.prisma.promo.update({
        where: { id: promo.id },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      });

      return updatedPromo;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Promo validation error:', error);
      throw new BadRequestException('Failed to validate promo code');
    }
  }
}

/* import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromoDto } from './dto/update-promotion.dto';


@Injectable()

export class PromotionsService {
  constructor(private prisma: PrismaClient) { }

  async create(dto: CreatePromotionDto) {
    return this.prisma.promo.create({ data: dto });
  }

  async findAll() {
    return this.prisma.promo.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const promo = await this.prisma.promo.findUnique({ where: { id } });
    if (!promo) throw new NotFoundException(`Promo ${id} not found`);
    return promo;
  }

  async update(id: string, dto: UpdatePromoDto) {
    return this.prisma.promo.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.promo.delete({ where: { id } });
  }

  async validateCode(code: string) {
    const promo = await this.prisma.promo.findUnique({ where: { code } });
    if (!promo || !promo.isActive || (promo.expiresAt && new Date(promo.expiresAt) < new Date()))
      throw new NotFoundException('Promo code is invalid or expired');
    return promo;
  }
}
 */
