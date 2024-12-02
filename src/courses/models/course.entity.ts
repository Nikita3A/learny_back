// src/courses/course.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Unit } from './unit.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  language: string;

  @Column()
  theme: string;

  @Column()
  targetAudience: string;

  @Column('text')
  learningObjectives: string;

  @Column('text')
  courseStructure: string;

  @OneToMany(() => Unit, (unit) => unit.course, { cascade: true })
  units: Unit[];
}
