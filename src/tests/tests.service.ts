import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test } from './models/test.entity';
import { Question } from './models/question.entity';
import { Lesson } from '../lessons/models/lesson.entity';
import { AiService } from '../ai/ai.service';

@Injectable()
export class TestsService {
  constructor(
    @InjectRepository(Test) private testRepository: Repository<Test>,
    @InjectRepository(Question) private questionRepository: Repository<Question>,
    @InjectRepository(Lesson) private lessonRepository: Repository<Lesson>,
    private readonly aiService: AiService,
  ) {}

  async generateTest(lessonId: number): Promise<Test> {
    const lesson = await this.lessonRepository.findOne({ where: { id: lessonId } });

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
    const test = await this.testRepository.findOne({ where: { lesson: { id: lessonId } } });
    if (!test) {
      throw new NotFoundException('Test not found for the specified lesson.');
    }

    await this.testRepository.remove(test);
  }
}
