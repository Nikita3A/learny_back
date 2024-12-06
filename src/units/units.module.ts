import { Module } from '@nestjs/common';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Unit } from './models/unit.entity';
import { CoursesService } from 'src/courses/courses.service';
import { LessonsService } from 'src/lessons/lessons.service';
import { Course } from 'src/courses/models/course.entity';
import { Lesson } from 'src/lessons/models/lesson.entity';
import { User } from 'src/users/models/user.entity';
import { UsersService } from 'src/users/users.service';
import { AiService } from 'src/ai/ai.service';

@Module({
  // imports: [TypeOrmModule.forFeature([Unit])], // Ensure Unit entity is included
  imports: [
    TypeOrmModule.forFeature([Course, Unit, Lesson, User])
  ],
  controllers: [UnitsController],
  providers: [UnitsService, CoursesService, LessonsService, UsersService, AiService],
  exports: [UnitsService], // Export UnitsService for use in other modules
})
export class UnitsModule {}
