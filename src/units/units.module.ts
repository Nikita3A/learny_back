import { Module } from '@nestjs/common';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from 'src/courses/models/course.entity';
import { Lesson } from 'src/lessons/models/lesson.entity';
import { User } from 'src/users/models/user.entity';
import { Unit } from './models/unit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Unit, Lesson, User])
  ],
  controllers: [UnitsController],
  providers: [UnitsService]
})
export class UnitsModule {}
