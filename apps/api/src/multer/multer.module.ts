import { Module } from '@nestjs/common';
import { MulterController } from './multer.controller';
import { MulterService } from './multer.service';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [MulterController],
  providers: [MulterService, PrismaClient],
  exports: [MulterService],
})
export class MulterModule {}
