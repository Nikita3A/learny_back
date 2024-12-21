import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, from, catchError, switchMap, map } from 'rxjs';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { User } from './models/user.entity';
import { IUser } from './models/user.interface';
import { AuthService } from '../auth/auth.service';
import { Course } from 'src/courses/models/course.entity';
// import { User } from '../users/models/user.entity';
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async signup(user): Promise<any> {
    const savedUser = await this.usersRepository.save(user);
    const { password, ...result } = savedUser;
    return result;
  }

  findAll(): Observable<User[]> {
    return from(this.usersRepository.find());
  }

  findOne(id): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  findOneById(id): Promise<User> {
    return this.usersRepository.findOneBy({ id: id });
  }
  async getUsersChat(id: string | number) {
    const user = await this.usersRepository.findOneOrFail({
      where: { id: Number(id) },
      relations: ['chats'],
    });
    return user.chats;
  }

  async findOneByEmail(email: string): Promise<User> {
    return this.usersRepository.findOneBy({ email });
  }

  async findOneByUserName(username: string): Promise<User> {
    return this.usersRepository.findOneBy({ username });
  }

  remove(id: string): Observable<DeleteResult> {
    return from(this.usersRepository.delete(id));
  }

  async addCourseToUser(userId: number, course: Course): Promise<void> {
    // Find the user by their ID
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['courses'], // Ensure courses are included in the response
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Add the new course to the user's courses
    user.courses = [...(user.courses || []), course];

    // Save the updated user back to the database
    await this.usersRepository.save(user);
  }
}
