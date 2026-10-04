import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { DatabaseModule } from 'src/database/database.module';
import { MeilisearchModule } from 'src/meilisearch/meilisearch.module';

@Module({
  imports: [DatabaseModule, MeilisearchModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
