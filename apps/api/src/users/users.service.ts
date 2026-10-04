// NestJS: Update UsersService to include related models
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take: limit,
        include: {
          athlete: true,
          coach: true,
          nutritionist: true,
          session: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return { data, totalPages };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        athlete: true,
        coach: true,
        nutritionist: true,
      },
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }
  //type safety ERROR LOGIN START HERE
  async findOneByEmaill(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        athlete: true,
        coach: true,
        nutritionist: true,
      },
    });
    console.log('user from findOneByEmail', user);

    if (!user)
      throw new NotFoundException(`Find One by email ${email} not found`);
    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    console.log('user from findOneByEmail', user);
    return user;
  }
  ///////////////ERROR HERE END//
  async update(id: string, updateUserDto: UpdateUserDto) {
    console.log(
      'UPPPPPPDATE THE USER ',
      id,
      'WITH THIISS DATA ::  ',
      updateUserDto,
    );

    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
