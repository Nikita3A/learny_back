import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Lesson } from '../../lessons/models/lesson.entity';
import { Question } from './question.entity';

@Entity()
export class Test {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  isPublished: boolean;

  @ManyToOne(() => Lesson, (lesson) => lesson.tests, { onDelete: 'CASCADE' })
  lesson: Lesson;

  @OneToMany(() => Question, (question) => question.test, { cascade: true })
  questions: Question[];
}
