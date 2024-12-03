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

  // async createCourse(createCourseDto: CreateCourseDto, provider: 'gpt' | 'groq'): Promise<Course> {
  async createCourse(createCourseDto: CreateCourseDto): Promise<Course> {
    const { language, theme, targetAudience, learningObjectives, courseStructure } = createCourseDto;
  
    const prompt = `You are an AI tasked with creating a course plan. Please respond only with a valid JSON object. 
    The course plan should have the following structure:
    
    {
      "units": [
        {
          "title": "Unit Title",
          "lessons": ["Lesson 1 Title", "Lesson 2 Title", "Lesson 3 Title"]
        },
        {
          "title": "Another Unit Title",
          "lessons": ["Lesson 1 Title", "Lesson 2 Title"]
        }
      ]
    }
    
    Here are the parameters for the course:
    Language: ${language}
    Theme: ${theme}
    Target Audience: ${targetAudience}
    Learning Objectives: ${learningObjectives}
    Course Structure: ${courseStructure}.
    
    Please respond only with the JSON structure above, nothing else.`;
  
    // Step 1: Generate response from the selected AI
    const aiResponse = await this.aiService.generateWithGroq(prompt);
  
    // Step 2: Parse and validate the AI response
    const coursePlan = this.parseCoursePlanResponse(aiResponse);
  
    // Step 3: Create the Course entity
    const course = this.courseRepository.create({
      language,
      theme,
      targetAudience,
      learningObjectives,
      courseStructure,
      units: [],
    });
  
    // Step 4: Populate units and lessons
    for (const unitData of coursePlan.units) {
      const unit = new Unit();
      unit.title = unitData.title;
  
      // Do not set `unit.course` to avoid circular reference
      unit.lessons = [];
  
      for (const lessonTitle of unitData.lessons) {
        const lesson = new Lesson();
        lesson.title = lessonTitle;
  
        // Avoid setting `lesson.unit` explicitly here
        unit.lessons.push(lesson);
      }
  
      course.units.push(unit);
    }
  
    // Save course and its relations
    return await this.courseRepository.save(course); // TypeORM handles relationships post-save
  }    
  
  private parseCoursePlanResponse(response: string | object): { units: { title: string; lessons: string[] }[] } {
    let parsedResponse;
  
    try {
      // If the response is a string, parse it as JSON
      parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      throw new Error('Invalid JSON response');
    }
  
    // Validate that the response has the required structure
    if (!parsedResponse || !Array.isArray(parsedResponse.units)) {
      console.error('Invalid response structure:', parsedResponse);
      throw new Error('Response does not contain valid units');
    }
  
    // Normalize the structure if needed (e.g., handle variations in model responses)
    const normalizedUnits = parsedResponse.units.map((unit: any) => {
      if (typeof unit.title !== 'string' || !Array.isArray(unit.lessons)) {
        throw new Error('Invalid unit structure');
      }
  
      return {
        title: unit.title,
        lessons: unit.lessons.filter((lesson: any) => typeof lesson === 'string'), // Ensure lessons are strings
      };
    });
  
    return { units: normalizedUnits };
  }
  
  async getAllCourses(): Promise<Course[]> {
    return this.courseRepository.find({
      select: ['id', 'language', 'theme', 'targetAudience', 'learningObjectives', 'courseStructure'],
    });
  }

  async getCourseById(id: number): Promise<Course> {
    return this.courseRepository.findOne({
      where: { id },
      relations: ['units', 'units.lessons'],
    });
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
