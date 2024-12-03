// src/courses/courses.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './models/course.interface';
import { Course } from './models/course.entity';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post('/')
  async createCourse(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
    return this.coursesService.createCourse(createCourseDto);
  }

  @Get('/')
  async getAllCourses(): Promise<Course[]> {
    return this.coursesService.getAllCourses();
  }

  @Get('/:id')
  async getCourseById(@Param('id') id: number): Promise<Course> {
    return this.coursesService.getCourseById(id);
  }
}
