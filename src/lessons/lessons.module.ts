import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/courses/models/course.entity';
import { Unit } from 'src/units/models/unit.entity';
import { User } from 'src/users/models/user.entity';
import { Lesson } from './models/lesson.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Unit, Lesson, User])
  ],
  providers: [LessonsService],
  controllers: [LessonsController]
})
export class LessonsModule {}
