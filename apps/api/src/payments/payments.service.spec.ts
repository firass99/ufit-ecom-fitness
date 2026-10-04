import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { NotFoundException } from '@nestjs/common';
import { PaymentStatus, PrismaClient } from '@prisma/client';

describe('PaymentsService', () => {
  let service: PaymentsService;

  const mockPrismaService = {
    payment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    order: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PrismaClient,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new payment', async () => {
      const createPaymentDto = {
        orderId: 'order-123',
        amount: 100,
        provider: 'stripe',
      };

      mockPrismaService.order.findUnique.mockResolvedValue({ id: 'order-123' });
      mockPrismaService.payment.create.mockResolvedValue({
        id: 'payment-123',
        ...createPaymentDto,
        status: PaymentStatus.PROCESSING,
      });

      const result = await service.create(createPaymentDto);

      expect(result).toEqual({
        id: 'payment-123',
        ...createPaymentDto,
        status: PaymentStatus.PROCESSING,
      });
      expect(mockPrismaService.payment.create).toHaveBeenCalledWith({
        data: {
          orderId: createPaymentDto.orderId,
          amount: createPaymentDto.amount,
          provider: createPaymentDto.provider,
          status: PaymentStatus.PROCESSING,
        },
      });
    });

    it('should throw NotFoundException if order not found', async () => {
      const createPaymentDto = {
        orderId: 'order-123',
        amount: 100,
        provider: 'stripe',
      };

      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.create(createPaymentDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // Add more test cases for other methods
});
