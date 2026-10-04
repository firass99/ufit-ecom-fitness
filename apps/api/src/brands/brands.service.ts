import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(dto: CreateBrandDto) {
    try {
      return await this.prisma.brand.create({
        data: {
          name: dto.name,
          logo: dto.logo,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create brand');
    }
  }
  async findAll(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const [data, total] = await this.prisma.$transaction([
        this.prisma.brand.findMany({
          skip,
          take: limit,
          include: {
            products: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.brand.count(),
      ]);

      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch brands');
    }
  }

  /*   async findAll() {
      try {
        return await this.prisma.brand.findMany({
          include: {
            products: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
      } catch (error) {
        throw new InternalServerErrorException('Failed to fetch brands');
      }
    }
   */
  async findOne(id: string) {
    try {
      const brand = await this.prisma.brand.findUnique({
        where: { id },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
        },
      });

      if (!brand) {
        throw new NotFoundException(`Brand with ID "${id}" not found`);
      }

      return brand;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch brand');
    }
  }

  async update(id: string, dto: UpdateBrandDto) {
    try {
      await this.findOne(id); // ensure exists

      return await this.prisma.brand.update({
        where: { id },
        data: {
          ...dto,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update brand');
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id); // ensure exists

      return await this.prisma.brand.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete brand');
    }
  }
}
