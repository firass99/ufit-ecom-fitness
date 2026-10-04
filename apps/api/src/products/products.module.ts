import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaClient } from '@prisma/client';
import { MulterModule } from '../multer/multer.module';
import { MeilisearchModule } from 'src/meilisearch/meilisearch.module';

@Module({
  imports: [MulterModule, MeilisearchModule],
  controllers: [ProductsController],
  providers: [ProductsService, PrismaClient],
})
export class ProductsModule {}
