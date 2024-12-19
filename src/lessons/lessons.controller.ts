import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, Patch, All, NotFoundException } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dtos/create-lesson.dto';
// import { UpdateLessonDto } from './dto/update-lesson.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtStrategy } from 'src/auth/guards/jwt-strategy';

@Controller('units/:unitId/lessons')
@ApiBearerAuth()
@UseGuards(JwtStrategy)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  // @All('*')
  // handleAllRequests(@Param() params, @Body() body) {
  //   console.log('Params:', params);
  //   console.log('Body:', body);
  //   throw new NotFoundException('Route not found');
  // }
  
  @Post('/')
  async generateLesson(
    @Param('unitId') unitId: number,
    @Body() userPrompt: string,
  ) {
    return this.lessonsService.generateLesson(unitId, userPrompt);
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

  @Patch('/:id')
  async generateLessonContent(@Param('id') lessonId: number): Promise<{ message: string }> {
    await this.lessonsService.generateLessonContent(lessonId);
    return { message: 'Lesson content successfully generated.' };
  }

  @Delete('/:id')
  async deleteLesson(@Param('id') id: number) {
    return this.lessonsService.deleteLesson(id);
  }
}
