import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from './models/course.entity';
import { Unit } from './models/unit.entity';
import { Lesson } from './models/lesson.entity';
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
