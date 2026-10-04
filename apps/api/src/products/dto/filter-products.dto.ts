import {
  IsOptional,
  IsArray,
  IsEnum,
  IsString,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Gender, Size } from '@prisma/client';

function splitCommaStringToArray<T>(enumType?: Record<string, T>) {
  return ({ value }: { value: any }) => {
    if (!value) return undefined;

    const rawArray =
      typeof value === 'string'
        ? value.split(',').map((v) => v.trim())
        : Array.isArray(value)
          ? value
          : [String(value).trim()];

    if (enumType) {
      return rawArray.filter((v) => Object.values(enumType).includes(v as any));
    }

    return rawArray;
  };
}

export class FilterProductsDto {
  @IsOptional()
  @IsArray()
  @IsEnum(Size, { each: true })
  @Transform(splitCommaStringToArray(Size))
  sizes?: Size[];

  @IsOptional()
  @IsArray()
  @IsEnum(Gender, { each: true })
  @Transform(splitCommaStringToArray(Gender))
  genders?: Gender[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(splitCommaStringToArray())
  colors?: string[];

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  brandId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  limit?: number;

  // 'price_asc' | 'price_desc' | (omit)
  @IsOptional()
  @Transform(({ value }) =>
    value === 'price_asc' || value === 'price_desc' ? value : undefined,
  )
  sort?: 'price_asc' | 'price_desc';

  // availability
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === 'all'
      ? undefined
      : value === 'true' || value === true,
  )
  @IsBoolean()
  isAvailable?: boolean;
}
