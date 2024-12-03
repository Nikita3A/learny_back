// src/courses/courses.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './models/course.entity';
import { Unit } from './models/unit.entity';
import { Lesson } from './models/lesson.entity';
import { CreateCourseDto } from './models/course.interface';
import { AiService } from '../ai/ai.service';
import { UsersService } from 'src/users/users.service';
import { UpdateCourseDto } from './models/UpdateCourseDto.model';

@Injectable()
export class CoursesService {
  constructor(
    private aiService: AiService,
    private usersService: UsersService,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
  ) {}   
  
  async createCourse(createCourseDto: CreateCourseDto, userId: number): Promise<Course> {
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

    const aiResponse = await this.aiService.generateWithGroq(prompt);
    const coursePlan = this.parseCoursePlanResponse(aiResponse);
  
    const course = this.courseRepository.create({
      language,
      theme,
      targetAudience,
      learningObjectives,
      courseStructure,
      createdBy: userId,
      units: [],
    });
  
    for (const unitData of coursePlan.units) {
      const unit = new Unit();
      unit.title = unitData.title;
      unit.lessons = unitData.lessons.map((lessonTitle) => {
        const lesson = new Lesson();
        lesson.title = lessonTitle;
        return lesson;
      });
      course.units.push(unit);
    }

    const savedCourse = await this.courseRepository.save(course);
  
    await this.usersService.addCourseToUser(userId, savedCourse);
  
    return savedCourse;
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

  async getUserCourses(userId: number): Promise<Course[]> {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new Error('User not found');

    return this.courseRepository.find({
      where: { createdBy: userId },
      relations: ['units', 'units.lessons'],
    });
  }

  async deleteCourse(courseId: number, userId: number): Promise<boolean> {
    const course = await this.courseRepository.findOneBy({ id: courseId });
    if (!course || course.createdBy !== userId) {
      return false;
    }

    await this.courseRepository.remove(course);
    return true;
  }

  async updateCourse(courseId: number, updateCourseDto: UpdateCourseDto, userId: number): Promise<Course | null> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['units', 'units.lessons'],
    });

    if (!course || course.createdBy !== userId) {
      return null;
    }

    const { language, theme, targetAudience, learningObjectives, courseStructure, units } = updateCourseDto;

    course.language = language ?? course.language;
    course.theme = theme ?? course.theme;
    course.targetAudience = targetAudience ?? course.targetAudience;
    course.learningObjectives = learningObjectives ?? course.learningObjectives;
    course.courseStructure = courseStructure ?? course.courseStructure;

    if (units) {
      course.units = await Promise.all(
        units.map(async (unitDto) => {
          const unit = await this.unitRepository.findOne({ where: { id: unitDto.id } }) || new Unit();
          unit.title = unitDto.title;

          unit.lessons = await Promise.all(
            unitDto.lessons.map(async (lessonDto) => {
              const lesson = await this.lessonRepository.findOne({ where: { id: lessonDto.id } }) || new Lesson();
              lesson.title = lessonDto.title;
              return lesson;
            }),
          );

          return unit;
        }),
      );
    }

    return this.courseRepository.save(course);
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
