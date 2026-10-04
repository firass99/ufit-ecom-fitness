import { IsString, IsOptional } from 'class-validator';

export class UpdateNutritionistDto {
  @IsOptional()
  @IsString()
  workingAddress?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  cv?: string;
}
