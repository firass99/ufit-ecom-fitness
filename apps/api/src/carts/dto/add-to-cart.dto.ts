import { Currency } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class AddToCartDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsEnum(Currency) // enum: ['USD', 'EUR', 'TND', 'AED', 'SAR']
  currency: Currency;
}

/* import { IsString, IsInt, Min, Max, IsOptional, IsEnum } from 'class-validator';
import { Currency } from '@prisma/client';

export class AddToCartDto {
  @IsOptional()
  @IsString()
  variantId?: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsInt()
  @Min(-100) // Or adjust limits based on your use case
  @Max(100)
  quantity: number;

  @IsOptional()
  @IsEnum(Currency, {
    message: `currency must be one of: ${Object.values(Currency).join(', ')}`,
  })
  currency?: Currency;
}
 */
