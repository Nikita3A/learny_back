import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './models/unit.entity';
import { Course } from '../courses/models/course.entity';
import { CreateUnitDto } from './dtos/create-unit.dto';
import { CoursesService } from 'src/courses/courses.service';
import { AiService } from 'src/ai/ai.service';
import { LessonsService } from 'src/lessons/lessons.service';
// import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService {
  constructor(
    private coursesService: CoursesService,
    private aiService: AiService,
    private lessonsService: LessonsService,
    @InjectRepository(Unit) private readonly unitRepository: Repository<Unit>,
  ) {}

  async createUnit(courseId: number, userPrompt: string): Promise<Unit> {
    const course = await this.coursesService.getCourseById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }
  
    const prompt = `
      You are an AI tasked with creating a new unit for a course.
      The course is titled "${course.theme}" and is designed for "${course.targetAudience}".
      Existing units in the course:
      ${course.units.map((unit) => `- ${unit.title}`).join('\n') || 'None'}
    
      Additional user input for context: "${userPrompt}"
    
      Using this information, generate a JSON response in the following format:
      {
        "title": "Unit Title",
        "lessons": ["Lesson 1 Title", "Lesson 2 Title", "Lesson 3 Title"]
      }
    
      **Important:** Respond only with the JSON object above. Do not include any additional text, explanations, or comments. Just the JSON.
    `;
  
    const aiResponse = await this.aiService.generateWithGroq(prompt);
    
    const { title, lessons } = JSON.parse(aiResponse);

    const newUnit = this.unitRepository.create({ title, course });
    const savedUnit = await this.unitRepository.save(newUnit);
  
    for (const lessonTitle of lessons) {
      await this.lessonsService.createLesson(savedUnit.id, lessonTitle);
    }
  
    return savedUnit;
  }
  

  async getUnitsByCourse(courseId: number): Promise<Unit[]> {
    return this.unitRepository.find({
      where: { course: { id: courseId } },
      relations: ['lessons', 'course'],
    });
  }

  async getUnitById(id: number): Promise<Unit> {
    return this.unitRepository.findOne({
      where: { id },
      relations: ['lessons'],
    });
  }

//   async updateUnit(id: number, updateUnitDto: UpdateUnitDto): Promise<Unit> {
//     await this.unitRepository.update(id, updateUnitDto);
//     return this.getUnitById(id);
//   }

  async deleteUnit(id: number): Promise<void> {
    await this.unitRepository.delete(id);
  }
}
