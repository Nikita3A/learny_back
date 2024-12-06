import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Unit } from '../../units/models/unit.entity';

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
}
