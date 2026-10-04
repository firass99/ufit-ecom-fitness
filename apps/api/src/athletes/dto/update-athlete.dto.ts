import { IsInt, IsString, IsOptional } from 'class-validator';

export class UpdateAthleteDto {
  @IsOptional()
  @IsInt()
  age?: number;

  @IsOptional()
  @IsInt()
  weight?: number;

  @IsOptional()
  @IsInt()
  height?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
