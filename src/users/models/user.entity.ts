import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Chat } from 'src/chat/models/chat.entity';
import { Message } from 'src/chat/models/message.entity';
import { Course } from 'src/courses/models/course.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'date' })
  created_on: string;

  @Column({ type: 'date' })
  last_login: string;

  @Column()
  isEmailVerified: boolean;

  @ManyToMany(() => Chat, (chat) => chat.users)
  @JoinTable({
    name: 'user_chats_chat',
    joinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'chatId',
      referencedColumnName: 'id',
    },
  })
  chats: Chat[];

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];

  @ManyToMany(() => Course, (course) => course.users)
  @JoinTable({
    name: 'user_courses', // Name of the junction table
    joinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'courseId',
      referencedColumnName: 'id',
    },
  })
  courses: Course[];
}
