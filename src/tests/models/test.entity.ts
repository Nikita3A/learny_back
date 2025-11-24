import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Lesson } from '../../lessons/models/lesson.entity';
import { Question } from './question.entity';

export enum TestStatus {
  NONE = 'none',
  PENDING = 'pending',
  READY = 'ready',
  FAILED = 'failed',
}

@Entity()
export class Test {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Lesson, (lesson) => lesson.tests, { onDelete: 'CASCADE' })
  lesson: Lesson;

  @OneToMany(() => Question, (question) => question.test, { cascade: true })
  questions: Question[];

  // status for background generation workflow
  @Column({ type: 'enum', enum: TestStatus, default: TestStatus.NONE })
  status: TestStatus;

  // when generation finished (optional)
  @Column({ type: 'timestamptz', nullable: true })
  generatedAt?: Date;

  // optional server error / AI response log for debugging
  @Column('text', { nullable: true })
  errorLog?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
