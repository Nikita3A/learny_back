import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonsService } from './lessons.service';
import { Lesson } from './models/lesson.entity';
import { AiService } from 'src/ai/ai.service';
import { UnitsModule } from 'src/units/units.module'; // Import UnitsModule to use UnitsService
import { LessonsController } from './lessons.controller';
import { Unit } from 'src/units/models/unit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lesson, Unit]),
  ],
  controllers: [LessonsController],
  providers: [LessonsService, AiService],
  exports: [LessonsService],
})
export class LessonsModule {}
