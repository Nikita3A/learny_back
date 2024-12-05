import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dtos/create-lesson.dto';
// import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('units/:unitId/lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post('/')
  async createLesson(
    @Param('unitId') unitId: number,
    @Body() createLessonDto: CreateLessonDto,
  ) {
    return this.lessonsService.createLesson(unitId, createLessonDto);
  }

  @Get('/')
  async getLessons(@Param('unitId') unitId: number) {
    return this.lessonsService.getLessonsByUnit(unitId);
  }

  @Get('/:id')
  async getLessonById(@Param('id') id: number) {
    return this.lessonsService.getLessonById(id);
  }

//   @Put('/:id')
//   async updateLesson(
//     @Param('id') id: number,
//     @Body() updateLessonDto: UpdateLessonDto,
//   ) {
//     return this.lessonsService.updateLesson(id, updateLessonDto);
//   }

  @Delete('/:id')
  async deleteLesson(@Param('id') id: number) {
    return this.lessonsService.deleteLesson(id);
  }
}
