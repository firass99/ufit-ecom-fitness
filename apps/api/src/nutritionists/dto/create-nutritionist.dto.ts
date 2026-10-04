import { IsString, IsUUID } from 'class-validator';

export class CreateNutritionistDto {
  @IsString()
  workingAddress: string;

  @IsString()
  phone: string;

  @IsString()
  experience: string;

  @IsString()
  cv: string; // If you use file upload, use string for path or URL

  @IsUUID()
  userId: string;
}
