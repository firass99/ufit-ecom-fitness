import { Module } from '@nestjs/common';
import { NutritionistsService } from './nutritionists.service';
import { NutritionistsController } from './nutritionists.controller';

@Module({
  controllers: [NutritionistsController],
  providers: [NutritionistsService],
})
export class NutritionistsModule {}
