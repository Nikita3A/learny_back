import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { TestsService } from './tests.service';

@Processor('tests')
@Injectable()
export class TestsProcessor {
  constructor(private readonly testsService: TestsService) {
    console.log('✅ TestsProcessor initialized');

  }

  @Process('generate-test')
  async handleGenerateTest(job: Job<{ lessonId: number }>) {
    console.log('Processing job:', job.id, 'with data:', job.data);
    const { lessonId } = job.data;
    
    await this.testsService.generateTestSync(lessonId);
  }
}