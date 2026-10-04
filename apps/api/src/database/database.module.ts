import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { PrismaClient } from '@prisma/client';

@Global()
@Module({
  providers: [DatabaseService, PrismaClient],
  exports: [DatabaseService, PrismaClient],
})
export class DatabaseModule {}
