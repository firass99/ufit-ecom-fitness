import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PromotionsModule } from 'src/promotions/promotions.module';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [PromotionsModule],
})
export class OrdersModule {}
