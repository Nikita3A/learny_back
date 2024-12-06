import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './models/lesson.entity';
// import { Unit } from '../units/models/unit.entity';
// import { CreateLessonDto } from './dtos/create-lesson.dto';
import { AiService } from 'src/ai/ai.service';
import { UnitsService } from 'src/units/units.service';
// import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(
    private aiService: AiService,
    private unitsService: UnitsService,
    @InjectRepository(Lesson) private readonly lessonRepository: Repository<Lesson>,
  ) {}

  async createLesson(unitId: number, userPrompt): Promise<Lesson> {
    const unit = await this.unitsService.getUnitById(unitId);
    
    if (!unit) {
      throw new NotFoundException('Unit not found.');
    }

    const prompt = `
    You are an AI tasked with creating a new lesson for a course unit. The course unit is titled "${unit.title}" 
    and got lessons "${unit.lessons}". 
    Below are the titles of the existing lessons in this unit:
        
    Here is additional input from the user for context: "${userPrompt}".
    
    Using this information, generate a detailed response in the following format:
    {
      "title": "New Lesson Title",
      "content": "Detailed content for the new lesson that complements the existing lessons and aligns with the unit theme."
    }
    
    Ensure the new lesson fits logically within the unit, does not duplicate existing lessons, and provides a fresh perspective or valuable addition to the unit's content. 
    Respond only with the JSON object in the specified format.
    `;

    const aiResponse = await this.aiService.generateWithGroq(prompt);
    const { title, content } = JSON.parse(aiResponse);

    const lesson = this.lessonRepository.create({
      title,
      content,
      unit,
    });

    return this.lessonRepository.save(lesson);
  }

  async getLessonsByUnit(unitId: number): Promise<Lesson[]> {
    return this.lessonRepository.find({
      where: { unit: { id: unitId } },
      relations: ['unit'],
    });
  }

  async getLessonById(id: number): Promise<Lesson> {
    return this.lessonRepository.findOne({
      where: { id },
      relations: ['unit'],
    });
  }

//   async updateLesson(id: number, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
//     await this.lessonRepository.update(id, updateLessonDto);
//     return this.getLessonById(id);
//   }

  async generateLessonContent(lessonId: number): Promise<void> {    
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['unit'], // Ensures we have access to the parent unit
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found.');
    }

    const prompt = `
      You are an AI tasked with generating content for a lesson.
      The lesson is titled "${lesson.title}" and belongs to the course unit "${lesson.unit.title}".

      Generate detailed and structured content that aligns with the lesson's title and the unit's overall theme.
      The response should be in plain text and should provide clear, comprehensive, and engaging educational material.
    `;

    const aiResponse = await this.aiService.generateWithGroq(prompt);

    lesson.content = aiResponse; // Save the generated content
    await this.lessonRepository.save(lesson);
  }

  async deleteLesson(id: number): Promise<void> {
    await this.lessonRepository.delete(id);
  }
}
