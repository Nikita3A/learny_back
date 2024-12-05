import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './models/lesson.entity';
import { Unit } from '../units/models/unit.entity';
import { CreateLessonDto } from './dtos/create-lesson.dto';
// import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson) private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Unit) private readonly unitRepository: Repository<Unit>,
  ) {}

  async createLesson(unitId: number, createLessonDto: CreateLessonDto): Promise<Lesson> {
    const unit = await this.unitRepository.findOneBy({ id: unitId });
    if (!unit) {
      throw new Error('Unit not found');
    }

    const lesson = this.lessonRepository.create({ ...createLessonDto, unit });
    return this.lessonRepository.save(lesson);
  }

  async getLessonsByUnit(unitId: number): Promise<Lesson[]> {
    return this.lessonRepository.find({
      where: { unit: { id: unitId } },
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

  async deleteLesson(id: number): Promise<void> {
    await this.lessonRepository.delete(id);
  }
}
