import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from './models/course.entity';
import { Unit } from '../units/models/unit.entity';
import { Lesson } from '../lessons/models/lesson.entity';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/models/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Unit, Lesson, User])
  ],
  providers: [CoursesService, UsersService],
  controllers: [CoursesController],
})
export class CoursesModule {}
