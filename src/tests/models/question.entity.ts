import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Test } from './test.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  questionText: string;

  @Column('simple-array', { nullable: true })
  options: string[]; // For multiple-choice or single-choice questions

  @Column({ nullable: true })
  correctAnswer: string; // For single-answer or text-answer questions

  @Column({
    type: 'enum',
    enum: ['single', 'multiple', 'text'], // single: one answer; multiple: multiple answers; text: open-ended
    default: 'single',
  })
  type: 'single' | 'multiple' | 'text';

  @ManyToOne(() => Test, (test) => test.questions, { onDelete: 'CASCADE' })
  test: Test;
}
