import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, Size, Currency } from '@prisma/client';

// ---------- Translations ----------
class ProductTranslationInput {
  @IsString()
  locale: string;

  @IsString()
  name: string;

  @IsString()
  description: string;
}

// ---------- Product Prices ----------
class ProductPriceInput {
  @IsEnum(Currency)
  currency: Currency;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  saleStartAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  saleEndAt?: Date;
}

// ---------- Variant Prices ----------
class VariantPriceInput {
  @IsEnum(Currency)
  currency: Currency;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  saleStartAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  saleEndAt?: Date;
}

// ---------- Variants ----------
class VariantInput {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsEnum(Size)
  size?: Size;

  @IsOptional()
  @IsString()
  color?: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsNumber()
  stock: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantPriceInput)
  prices: VariantPriceInput[];
}

// ---------- Main DTO ----------
export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  brandId?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductTranslationInput)
  translations: ProductTranslationInput[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductPriceInput)
  prices: ProductPriceInput[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantInput)
  variants?: VariantInput[];

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsBoolean()
  hasVariants?: boolean; // ✅ NEW
}
