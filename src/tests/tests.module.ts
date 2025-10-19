import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { TestsService } from './tests.service';
import { Test } from './models/test.entity';
import { Question } from './models/question.entity';
import { Lesson } from '../lessons/models/lesson.entity';
import { AiService } from '../ai/ai.service';
import { TestsProcessor } from './tests.processor';
import { TestsController } from './tests.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Test, Question, Lesson]),
    BullModule.registerQueue({
      name: 'tests',
      defaultJobOptions: { removeOnComplete: true },
    }),
  ],
  controllers: [TestsController],
  providers: [TestsService, AiService, TestsProcessor],
  exports: [TestsService],
})
export class TestsModule {}
