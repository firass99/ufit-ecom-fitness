import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  IsEnum,
  Min,
  isString,
  IsDecimal,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Currency } from '@prisma/client'; // 👈

export class OrderItemDto {
  @IsOptional()
  @IsString()
  variantId?: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsDecimal()
  unitPrice;

  @Transform(({ value }) => parseInt(value), { toClassOnly: true })
  @IsInt()
  @Min(1)
  quantity: number;
  /*   @Type(() => Number)
    @IsInt()
    quantity: number; */
}

export class CreateOrderDto {
  @IsString()
  userId: string;

  @IsEnum(Currency) // 👈 this is critical now
  currency: Currency;

  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  totalPrice?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  promoCode?: string;

  @IsOptional()
  @IsString()
  promoId?: string;

  @IsOptional()
  @IsString()
  trackingCode: string;

  @IsOptional()
  @IsString()
  shippingProvider: string;

  @IsOptional()
  @IsString()
  estimatedDeliveryDate: string;
}
