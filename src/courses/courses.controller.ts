// src/courses/courses.controller.ts
import { Controller, Post, Body, Get, Param, UseGuards, Delete, ForbiddenException, Put } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dtos/course.interface';
import { Course } from './models/course.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { GetUserFromToken } from 'src/auth/decorators/getUser';
import { UpdateCourseDto } from './dtos/UpdateCourseDto.model';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post('/')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createCourse(@Body() createCourseDto: CreateCourseDto, @GetUserFromToken('id') userId: number,): Promise<Course> {    
    return this.coursesService.createCourse(createCourseDto, userId);
  }

  @Get('/')
  async getAllCourses(): Promise<Course[]> {
    return this.coursesService.getAllCourses();
  }

  @Get('/users')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getUserCourses(@GetUserFromToken('id') userId: number): Promise<Course[]> {
    return this.coursesService.getUserCourses(userId);
  }

  @Get('/:id')
  async getCourseById(@Param('id') id: number): Promise<Course> {
    return this.coursesService.getCourseById(id);
  }

  @Delete('/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async deleteCourse(@Param('id') courseId: number, @GetUserFromToken('id') userId: number): Promise<void> {
    const isDeleted = await this.coursesService.deleteCourse(courseId, userId);
    if (!isDeleted) {
      throw new ForbiddenException('You are not authorized to delete this course.');
    }
  }

  // @Put('/:id')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // async updateCourse(
  //   @Param('id') courseId: number,
  //   @Body() updateCourseDto: UpdateCourseDto,
  //   @GetUserFromToken('id') userId: number,
  // ): Promise<Course> {
  //   const updatedCourse = await this.coursesService.updateCourse(courseId, updateCourseDto, userId);
  //   if (!updatedCourse) {
  //     throw new ForbiddenException('You are not authorized to update this course.');
  //   }
  //   return updatedCourse;
  // }
}

