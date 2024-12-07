import { Controller, Post, Get, Delete, Param, NotFoundException } from '@nestjs/common';
import { TestsService } from './tests.service';

@Controller('lessons/:lessonId/tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post()
  async generateTest(@Param('lessonId') lessonId: number) {
    const generatedTest = await this.testsService.generateTest(lessonId);
    return { message: 'Test generated successfully.', test: generatedTest };
  }

  @Get()
  async getTest(@Param('lessonId') lessonId: number) {
    const test = await this.testsService.getTestByLessonId(lessonId);
    if (!test) {
      throw new NotFoundException('Test not found for the specified lesson.');
    }
    return { test };
  }

  @Delete()
  async deleteTest(@Param('lessonId') lessonId: number) {
    await this.testsService.deleteTestByLessonId(lessonId);
    return { message: 'Test deleted successfully.' };
  }
}
