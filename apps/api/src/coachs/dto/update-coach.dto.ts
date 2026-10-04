import { IsString, IsArray, IsOptional } from 'class-validator';

export class UpdateCoachDto {
  @IsOptional()
  @IsString()
  gymAddress?: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialities?: string[];
}
