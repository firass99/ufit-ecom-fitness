import { Module } from '@nestjs/common';
import { CoachesController } from './coachs.controller';
import { CoachesService } from './coachs.service';

@Module({
  controllers: [CoachesController],
  providers: [CoachesService],
})
export class CoachsModule {}
