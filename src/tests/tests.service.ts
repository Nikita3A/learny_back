import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { Test, TestStatus } from './models/test.entity';
import { Question } from './models/question.entity';
import { Lesson } from '../lessons/models/lesson.entity';
import { AiService } from '../ai/ai.service';
import { log } from 'console';

@Injectable()
export class TestsService {
  constructor(
    @InjectRepository(Test) private testRepository: Repository<Test>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Lesson) private lessonRepository: Repository<Lesson>,
    @InjectQueue('tests') private readonly queue: Queue,
    private readonly aiService: AiService,
  ) {}

  async generateTest(lessonId: number): Promise<Test> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found.');
    }

    const aiPrompt = lesson.content
      ? `Generate test questions as a JSON array based on the following content:\n\n${lesson.content}\n\nEach question should follow this structure:
    [
      {
        "questionText": "Question text",
        "options": ["Option 1", "Option 2", "Option 3"],
        "correctAnswer": "Option", // or ["Option 1", "Option 2"]
        "type": "single" // or "multiple" or "text"
      },
      ...
    ]
    **Important:** Respond only with the JSON object above. Do not include any additional text, explanations, or comments. Just the JSON.
    **Important:** For correctAnswer should be only string of text. For many option use ";" to separate options in string. Don't use any brackets.`
      : `Generate test questions as a JSON array based on the lesson title:\n\n"${lesson.title}"\n\nEach question should follow this structure:
    [
      {
        "questionText": "Question text",
        "options": ["Option 1", "Option 2", "Option 3"],
        "correctAnswer": "Option", // or ["Option 1", "Option 2"]
        "type": "single" // or "multiple" or "text"
      },
      ...
    ]
    **Important:** Respond only with the JSON object above. Do not include any additional text, explanations, or comments. Just the JSON.
    **Important:** For correctAnswer should be only string of text. For many option use ";" to separate options in string. Don't use any brackets.`;

    const aiResponse = await this.aiService.generateWithGroq(aiPrompt);
    console.log('res: ', aiResponse);

    const questionsData = JSON.parse(aiResponse); // AI should return structured data

    const test = this.testRepository.create({ lesson });
    await this.testRepository.save(test);

    for (const questionData of questionsData) {
      const question = this.questionRepository.create({
        questionText: questionData.questionText,
        options: questionData.options || null,
        correctAnswer: questionData.correctAnswer || null,
        type: questionData.type,
        test,
      });
      await this.questionRepository.save(question);
    }

    return test;
  }

  async getTestByLessonId(lessonId: number): Promise<Test> {
    const test = await this.testRepository.findOne({
      where: { lesson: { id: lessonId } },
      relations: ['questions'],
    });
    return test;
  }

  async deleteTestByLessonId(lessonId: number): Promise<void> {
    const test = await this.testRepository.findOne({
      where: { lesson: { id: lessonId } },
    });
    if (!test) {
      throw new NotFoundException('Test not found for the specified lesson.');
    }

    await this.testRepository.remove(test);
  }

  // async enqueueGenerateTest(lessonId: number) {
  //   // idempotent: if already pending/ready, avoid duplicate work
  //   const existing = await this.testRepository.findOne({
  //     where: { lesson: { id: lessonId } },
  //   });
  //   if (existing && existing.status === 'pending') return;

  //   if (!existing) {
  //     const placeholder = this.testRepository.create({
  //       lesson: { id: lessonId } as any,
  //       status: TestStatus.PENDING,
  //     });
  //     await this.testRepository.save(placeholder);
  //   } else {
  //     existing.status = TestStatus.PENDING;
  //     await this.testRepository.save(existing);
  //   }

  //   try {
  //     await this.queue.add(
  //       'generate-test',
  //       { lessonId },
  //       { jobId: `generate-test:${lessonId}` },
  //     );
  //     console.log('Job added successfully to queue for lessonId:', lessonId);
  //   } catch (error) {
  //     console.error('Error adding job to queue:', error);
  //   }

  //   // console.log('Adding job to queue for lessonId:', lessonId);
  //   // // enqueue a single job per lesson (use jobId to dedupe)
  //   // await this.queue.add(
  //   //   'generate-test',
  //   //   { lessonId },
  //   //   { jobId: `generate-test:${lessonId}` },
  //   // );
  //   // console.log('Job added successfully to queue for lessonId:', lessonId);
  // }

  // worker (separate process) will call this to actually run AI + persist questions
  async enqueueGenerateTest(lessonId: number) {
    try {
      // idempotent: if already pending/ready, avoid duplicate work
      const existing = await this.testRepository.findOne({
        where: { lesson: { id: lessonId } },
      });
      if (existing && existing.status === 'pending') {
        console.log('Test generation already pending for lessonId:', lessonId);
        return;
      }
      if (!existing) {
        const placeholder = this.testRepository.create({
          lesson: { id: lessonId } as any,
          status: TestStatus.PENDING,
        });
        await this.testRepository.save(placeholder);
      } else {
        existing.status = TestStatus.PENDING;
        await this.testRepository.save(existing);
      }
      // enqueue a single job per lesson (use jobId to dedupe)
      console.log('Adding job to queue for lessonId:', lessonId);
      const job = await this.queue.add(
        'generate-test',
        { lessonId },
        { jobId: `generate-test:${lessonId}` },
      );
      console.log(
        'Job added successfully to queue for lessonId:',
        lessonId,
        'Job ID:',
        job.id,
      );
      console.log('After await this.queue.add(...)');
    } catch (error) {
      console.error('Error in enqueueGenerateTest:', error);
    }
  }

  async generateTestSync(lessonId: number) {
    console.log('Generating test for lesson', lessonId);
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
    });
    if (!lesson) throw new NotFoundException('Lesson not found.');

    // find placeholder or existing test (with questions)
    let test = await this.testRepository.findOne({
      where: { lesson: { id: lessonId } },
      relations: ['questions'],
    });

    if (!test) {
      test = this.testRepository.create({ lesson });
    }

    test.status = TestStatus.PENDING;
    await this.testRepository.save(test);

    try {
      const aiPrompt = lesson.content
        ? `Generate test questions as a JSON array based on the following content:\n\n${lesson.content}\n\n... 
        Return only the JSON of the questions any other text or markers is not allowed. I need field "questionText", "options" (array of strings), "correctAnswer" (string), "type" ("single", "multiple", "text").`
        : `Generate test questions as a JSON array based on the lesson title:\n\n"${lesson.title}"\n\n... 
        Return only the JSON of the questions any other text or markers is not allowed. I need field "questionText", "options" (array of strings), "correctAnswer" (string), "type" ("single", "multiple", "text").`;

      const aiResponse = await this.aiService.generateWithGroq(aiPrompt);
      console.log('AI response:', aiResponse);

      // Robust parsing + validation
      let questionsData: any = null;
      try {
        try {
          questionsData = JSON.parse(String(aiResponse));
        } catch (err) {
          // try to extract the first JSON object/array from noisy model output
          const m = String(aiResponse).match(/(\[.*\]|\{.*\})/s);
          if (m) questionsData = JSON.parse(m[1]);
        }
      } catch (parseErr) {
        console.error('Failed to parse AI response for lesson', lessonId, parseErr);
        test.status = TestStatus.FAILED;
        test.errorLog = `parse error: ${String(parseErr?.message || parseErr)} -- raw: ${String(aiResponse).slice(0, 2000)}`;
        await this.testRepository.save(test);
        throw parseErr;
      }

      if (!Array.isArray(questionsData)) {
        console.error('AI response is not an array for lesson', lessonId);
        test.status = TestStatus.FAILED;
        test.errorLog = `invalid format: expected array but got ${typeof questionsData} -- raw: ${String(aiResponse).slice(0, 2000)}`;
        await this.testRepository.save(test);
        throw new Error('AI response format invalid: expected array of questions');
      }

      console.log('AI JSON parsed successfully, items:', questionsData.length);

      // remove old questions (if any)
      if (test.questions && test.questions.length) {
        await this.questionRepository.remove(test.questions);
      }

      const createdQuestions: Question[] = [];
      for (const raw of questionsData) {
        // normalize possible shapes and perform required-field check
        const questionText = raw.questionText ?? raw.text ?? raw.question ?? null;
        if (!questionText || String(questionText).trim() === '') {
          console.warn('Skipping question without text for lesson', lessonId, raw);
          continue; // skip invalid item
        }

        // normalize options: accept array or semicolon-delimited string
        let options = null;
        if (Array.isArray(raw.options) && raw.options.length > 0) {
          options = raw.options;
        } else if (typeof raw.options === 'string' && raw.options.trim() !== '') {
          options = raw.options.split(';').map((s: string) => s.trim()).filter(Boolean);
        }

        const correctAnswer = raw.correctAnswer ?? null;
        const type = raw.type ?? 'single';

        const question = this.questionRepository.create({
          questionText: String(questionText).trim(),
          options: options && options.length > 0 ? options : null,
          correctAnswer: correctAnswer ? String(correctAnswer).trim() : null,
          type,
          test,
        });
        createdQuestions.push(await this.questionRepository.save(question));
      }

      if (createdQuestions.length === 0) {
        console.error('No valid questions generated for lesson', lessonId);
        test.status = TestStatus.FAILED;
        test.errorLog = `no valid questions parsed from AI response -- raw: ${String(aiResponse).slice(0,2000)}`;
        await this.testRepository.save(test);
        throw new Error('AI returned no valid questions');
      }

      test.questions = createdQuestions;
      test.status = TestStatus.READY;
      test.generatedAt = new Date();
      test.errorLog = null;
      await this.testRepository.save(test);

      return test;
    } catch (err: any) {
      test.status = TestStatus.FAILED;
      test.errorLog = String(err?.message || err);
      await this.testRepository.save(test);
      throw err;
    }
  }

  async getTestStatusAndQuestions(lessonId: number) {
    const test = await this.testRepository.findOne({
      where: { lesson: { id: lessonId } },
      relations: ['questions'],
    });
    if (!test) return { status: TestStatus.NONE, questions: [] };
    return { status: test.status, questions: test.questions || [] };
  }
}
