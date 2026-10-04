import { IsString, IsUUID, IsArray } from 'class-validator';

export class CreateCoachDto {
  @IsString()
  gymAddress: string;

  @IsString()
  experience: string;

  @IsString()
  phone: string;

  @IsArray()
  @IsString({ each: true })
  specialities: string[];

  @IsUUID()
  userId: string;
}
