import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  create(@Body() createCartDto: CreateCartDto) {
    return this.cartsService.create(createCartDto);
  }

  @Get(':userId')
  findOne(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.cartsService.findOne(userId);
  }

  @Patch(':userId/reduce')
  reduceCart(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.cartsService.findOne(userId);
  }

  @Post(':userId/items')
  addItem(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this.cartsService.addItem(userId, addToCartDto);
  }

  @Delete(':userId/items/:itemId')
  removeItem(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.cartsService.removeItem(userId, itemId);
  }

  @Delete(':userId')
  clear(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.cartsService.clear(userId);
  }
}
