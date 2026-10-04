import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { NutritionistsService } from './nutritionists.service';
import { CreateNutritionistDto } from './dto/create-nutritionist.dto';
import { UpdateNutritionistDto } from './dto/update-nutritionist.dto';

@Controller('nutritionists')
export class NutritionistsController {
  constructor(private readonly nutritionistsService: NutritionistsService) {}

  @Post()
  create(@Body() dto: CreateNutritionistDto) {
    return this.nutritionistsService.create(dto);
  }

  @Get()
  findAll() {
    return this.nutritionistsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nutritionistsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNutritionistDto) {
    return this.nutritionistsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nutritionistsService.remove(id);
  }
}
