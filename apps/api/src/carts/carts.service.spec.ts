import { Test, TestingModule } from '@nestjs/testing';
import { CartsService } from './carts.service';
import { BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

describe('CartsService', () => {
  let service: CartsService;
  //let prisma: PrismaClient;

  const mockPrismaService = {
    cart: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    cartItem: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartsService,
        {
          provide: PrismaClient,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CartsService>(CartsService);
    //prisma = module.get<PrismaClient>(PrismaClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new cart', async () => {
      const createCartDto = { userId: 'user-123' };
      mockPrismaService.cart.findUnique.mockResolvedValue(null);
      mockPrismaService.cart.create.mockResolvedValue({
        id: 'cart-123',
        ...createCartDto,
      });

      const result = await service.create(createCartDto);

      expect(result).toEqual({ id: 'cart-123', ...createCartDto });
      expect(mockPrismaService.cart.create).toHaveBeenCalledWith({
        data: createCartDto,
        include: { items: { include: { product: true } } },
      });
    });

    it('should throw BadRequestException if cart already exists', async () => {
      const createCartDto = { userId: 'user-123' };
      mockPrismaService.cart.findUnique.mockResolvedValue({ id: 'cart-123' });

      await expect(service.create(createCartDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
