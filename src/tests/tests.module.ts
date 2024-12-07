import { Module } from '@nestjs/common';
import { TestsService } from './tests.service';
import { TestsController } from './tests.controller';
import { Lesson } from 'src/lessons/models/lesson.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './models/question.entity';
import { Test } from './models/test.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lesson, Test, Question])
  ],
  providers: [TestsService],
  controllers: [TestsController]
})
export class TestsModule {}
