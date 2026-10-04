import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateNutritionistDto } from './dto/create-nutritionist.dto';
import { UpdateNutritionistDto } from './dto/update-nutritionist.dto';

@Injectable()
export class NutritionistsService {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateNutritionistDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== 'NUTRITIONIST')
      throw new BadRequestException('User is not a nutritionist');

    const exists = await this.prisma.nutritionist.findUnique({
      where: { userId: data.userId },
    });
    if (exists)
      throw new BadRequestException(
        'Nutritionist profile already exists for this user',
      );

    return this.prisma.nutritionist.create({ data });
  }

  async findAll() {
    return this.prisma.nutritionist.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const nutritionist = await this.prisma.nutritionist.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!nutritionist) throw new NotFoundException('Nutritionist not found');
    return nutritionist;
  }

  async update(id: string, data: UpdateNutritionistDto) {
    return this.prisma.nutritionist.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.nutritionist.delete({ where: { id } });
  }
}
