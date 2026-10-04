import { IsInt, IsString, IsUUID } from 'class-validator';

export class CreateAthleteDto {
  @IsInt()
  age: number;

  @IsInt()
  weight: number;

  @IsInt()
  height: number;

  @IsString()
  address: string;

  @IsString()
  phone: string;

  @IsUUID()
  userId: string;
}
