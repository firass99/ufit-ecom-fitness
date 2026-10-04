import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateAthleteDto } from './dto/create-athlete.dto';
import { UpdateAthleteDto } from './dto/update-athlete.dto';

@Injectable()
export class AthletesService {
  constructor(private prisma: PrismaClient) {}

  // athlete.service.ts
  async create(data: CreateAthleteDto) {
    // 1. Get user from userId
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== 'ATHLETE')
      throw new BadRequestException('User is not an athlete');

    // 2. Check for existing profile
    const exists = await this.prisma.athlete.findUnique({
      where: { userId: data.userId },
    });
    if (exists)
      throw new BadRequestException(
        'Athlete profile already exists for this user',
      );

    // 3. Create athlete
    return this.prisma.athlete.create({ data });
  }

  async findAll() {
    return this.prisma.athlete.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const athlete = await this.prisma.athlete.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!athlete) throw new NotFoundException('Athlete not found');
    return athlete;
  }

  async update(id: string, data: UpdateAthleteDto) {
    return this.prisma.athlete.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.athlete.delete({ where: { id } });
  }
}
