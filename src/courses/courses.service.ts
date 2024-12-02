// src/courses/courses.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './models/course.entity';
import { Unit } from './models/unit.entity';
import { Lesson } from './models/lesson.entity';
import { CreateCourseDto } from './models/course.interface';
import { AiService } from '../ai/ai.service';


@Injectable()
export class CoursesService {
  constructor(
    private aiService: AiService,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
  ) {}

  async createCourse(createCourseDto: CreateCourseDto): Promise<Course> {
    const { language, theme, targetAudience, learningObjectives, courseStructure } = createCourseDto;

    const prompt = `Create a course plan for the following parameters:
    Language: ${language}
    Theme: ${theme}
    Target Audience: ${targetAudience}
    Learning Objectives: ${learningObjectives}
    Course Structure: ${courseStructure}.
    The plan should include units and each unit should have a list of lesson titles.`;

    const coursePlan = await this.aiService.generateWithGroq(prompt);
    console.log(coursePlan);
    
    // Step 2: Create the Course entity
    const course = this.courseRepository.create({
      language,
      theme,
      targetAudience,
      learningObjectives,
      courseStructure,
      units: [],
    });

    // Step 3: Populate the course with units and lessons from the API response
    // for (const unitData of coursePlan.units) {
    //   const unit = new Unit();
    //   unit.title = unitData.title;
    //   unit.course = course;

    //   for (const lessonTitle of unitData.lessons) {
    //     const lesson = new Lesson();
    //     lesson.title = lessonTitle;
    //     lesson.unit = unit;
    //     unit.lessons.push(lesson);
    //   }

    //   course.units.push(unit);
    // }

    return await this.courseRepository.save(course);
  }

  // Helper method to make a request to ChatGPT API and retrieve the course plan using fetch
  private async getCoursePlanFromChatGPT(
    language: string,
    theme: string,
    targetAudience: string,
    learningObjectives: string,
    courseStructure: string,
  ) {
    const prompt = `Create a course plan for the following parameters:
    Language: ${language}
    Theme: ${theme}
    Target Audience: ${targetAudience}
    Learning Objectives: ${learningObjectives}
    Course Structure: ${courseStructure}.
    The plan should include units and each unit should have a list of lesson titles.`;

    try {
      const response = await this.aiService.generateWithOpenAI(prompt, 'gpt-3.5-turbo');
      const coursePlan = JSON.parse(response);
      return coursePlan;
    } catch (error) {
      console.error('Error fetching course plan from ChatGPT:', error);
      throw new Error('Failed to generate course plan');
    }
  }
}
