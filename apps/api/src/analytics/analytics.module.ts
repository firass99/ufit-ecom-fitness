import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { UsersService } from 'src/users/users.service';
import { BrandsService } from 'src/brands/brands.service';
import { PromotionsService } from 'src/promotions/promotions.service';
import { CategoriesService } from 'src/categories/categories.service';
import { ProductsService } from 'src/products/products.service';
import { MeilisearchModule } from 'src/meilisearch/meilisearch.module';
import { MulterModule } from '@nestjs/platform-express';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [MulterModule, MeilisearchModule],
  controllers: [AnalyticsController],
  providers: [
    UsersService,
    ProductsService,
    CategoriesService,
    PromotionsService,
    BrandsService,
    AnalyticsService,
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
