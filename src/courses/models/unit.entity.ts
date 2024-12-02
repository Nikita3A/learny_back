// src/courses/unit.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Course } from './course.entity';
import { Lesson } from './lesson.entity';

@Entity()
export class Unit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => Course, (course) => course.units)
  course: Course;

  @OneToMany(() => Lesson, (lesson) => lesson.unit, { cascade: true })
  lessons: Lesson[];
}
