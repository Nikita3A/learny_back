import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from './models/course.entity';
import { Unit } from './models/unit.entity';
import { Lesson } from './models/lesson.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Unit, Lesson])
  ],
  providers: [CoursesService],
  controllers: [CoursesController],
})
export class CoursesModule {}
