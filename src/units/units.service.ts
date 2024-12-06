import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './models/unit.entity';
import { Course } from '../courses/models/course.entity';
import { CreateUnitDto } from './dtos/create-unit.dto';
// import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit) private readonly unitRepository: Repository<Unit>,
    @InjectRepository(Course) private readonly courseRepository: Repository<Course>,
  ) {}

  async createUnit(courseId: number, createUnitDto: CreateUnitDto): Promise<Unit> {
    const course = await this.courseRepository.findOneBy({ id: courseId });
    if (!course) {
      throw new Error('Course not found');
    }

    const unit = this.unitRepository.create({ ...createUnitDto, course });
    return this.unitRepository.save(unit);
  }

  async getUnitsByCourse(courseId: number): Promise<Unit[]> {
    return this.unitRepository.find({
      where: { course: { id: courseId } },
      relations: ['lessons'],
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
