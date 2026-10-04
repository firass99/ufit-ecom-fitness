import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CreateAthleteDto } from './dto/create-athlete.dto';
import { AthletesService } from './athletes.service';
import { UpdateAthleteDto } from './dto/update-athlete.dto';

@Controller('athletes')
export class AthletesController {
  constructor(private readonly athleteService: AthletesService) {}

  @Post()
  create(@Body() dto: CreateAthleteDto) {
    return this.athleteService.create(dto);
  }

  @Get()
  findAll() {
    return this.athleteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.athleteService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAthleteDto) {
    return this.athleteService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.athleteService.remove(id);
  }
}
