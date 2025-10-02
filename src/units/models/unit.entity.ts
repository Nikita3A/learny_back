import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from '../../courses/models/course.entity';
import { Lesson } from '../../lessons/models/lesson.entity';

@Entity()
export class Unit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // ordering for units inside a course
  @Column('integer', { default: 0 })
  position: number;

  @ManyToOne(() => Course, (course) => course.units, { onDelete: 'CASCADE' })
  course: Course;

  @OneToMany(() => Lesson, (lesson) => lesson.unit, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  lessons: Lesson[];
}
