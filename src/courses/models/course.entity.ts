import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/models/user.entity';
import { Unit } from '../../units/models/unit.entity';
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

  @Column('integer')
  createdBy: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToMany(() => User, (user) => user.courses)
  users: User[];

  @OneToMany(() => Unit, (unit) => unit.course, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  units: Unit[];
}
