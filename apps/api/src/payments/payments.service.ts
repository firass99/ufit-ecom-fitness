import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus, PrismaClient } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaClient) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: createPaymentDto.orderId },
    });

    if (!order) {
      throw new NotFoundException(
        `Order ${createPaymentDto.orderId} not found`,
      );
    }

    // Here you would typically integrate with a payment provider
    // For now, we'll create a payment record
    return this.prisma.payment.create({
      data: {
        orderId: createPaymentDto.orderId,
        amount: createPaymentDto.amount,
        provider: createPaymentDto.provider,
        status: PaymentStatus.PROCESSING,
      },
    });
  }

  async findAll() {
    return this.prisma.payment.findMany({
      include: {
        order: true,
      },
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        order: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${id} not found`);
    }

    return payment;
  }

  async updateStatus(id: string, status: PaymentStatus) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${id} not found`);
    }

    return this.prisma.payment.update({
      where: { id },
      data: { status },
      include: {
        order: true,
      },
    });
  }
}
