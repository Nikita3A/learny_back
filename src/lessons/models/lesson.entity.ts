import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Unit } from '../../units/models/unit.entity';
import { Test } from '../../tests/models/test.entity';


@Entity()
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  content: string;

  @ManyToOne(() => Unit, (unit) => unit.lessons, { onDelete: 'CASCADE' })
  unit: Unit;

  @OneToMany(() => Test, (test) => test.lesson, { cascade: true })
  tests: Test[];
}
