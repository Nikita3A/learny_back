import { Controller, Get, Post, Param, HttpCode } from '@nestjs/common';
import { TestsService } from './tests.service';

@Controller('lessons/:lessonId/tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get('/')
  async getTest(@Param('lessonId') lessonId: string) {
    // returns { status: 'pending'|'ready'|'failed', questions: [...] }
    return this.testsService.getTestStatusAndQuestions(Number(lessonId));
  }

  @Post('/')
  @HttpCode(202)
  async generateTest(@Param('lessonId') lessonId: string) {
    console.log(`CONTROLLER Enqueue test generation for lesson ${lessonId}`);
    // enqueue job (idempotent). returns 202 Accepted.
    await this.testsService.enqueueGenerateTest(Number(lessonId));
    return { status: 'accepted' };
  }
}
