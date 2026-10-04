import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';

@Injectable()
export class CoachesService {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateCoachDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== 'COACH')
      throw new BadRequestException('User is not a coach');

    const exists = await this.prisma.coach.findUnique({
      where: { userId: data.userId },
    });
    if (exists)
      throw new BadRequestException(
        'Coach profile already exists for this user',
      );

    return this.prisma.coach.create({ data });
  }

  async findAll() {
    return this.prisma.coach.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const coach = await this.prisma.coach.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!coach) throw new NotFoundException('Coach not found');
    return coach;
  }

  async update(id: string, data: UpdateCoachDto) {
    return this.prisma.coach.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.coach.delete({ where: { id } });
  }
}
