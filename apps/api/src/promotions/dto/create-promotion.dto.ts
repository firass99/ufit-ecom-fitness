// create-promo.dto.ts
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsDecimal,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';
import { DiscountType } from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreatePromotionDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(DiscountType)
  discountType: DiscountType;

  @Transform(({ value }) => value?.toString())
  @IsDecimal()
  value: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUsage?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
