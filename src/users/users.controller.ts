import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Headers,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersService } from './users.service';
import { IUser, UserRole } from './models/user.interface';
import { UpdateUserDTO } from './dtos/update.dto';
import { DeleteResult } from 'typeorm';

import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @Get('/:username')
  async getUserByUserName(@Param('username') username: string) {
    return this.usersService.findOneByUserName(username);
  }

  @Get('/')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  // @UseGuards(AuthGuard('jwt'))
  getUsers(): Observable<IUser[]> {
    return this.usersService.findAll();
  }

  @Get(':id/chats')
  async getUsersChats(@Param('id') id: string) {
    return await this.usersService.getUsersChat(id);
  }

  @ApiParam({
    name: 'id',
    required: true,
    description: 'id of user',
    schema: { oneOf: [{ type: 'string' }, { type: 'integer' }] },
  })
  @Get('/:id')
  async getUserById(@Param('id') id): Promise<IUser> {
    return await this.usersService.findOne(id);
  }

  @Put('/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDTO: UpdateUserDTO,
  ): Promise<IUser> {
    const userId = parseInt(id, 10); // Convert `id` to a number
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
  
    const existingUser = await this.usersService.findOne(userId);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }
  
    if (updateUserDTO.username) {
      const usernameExists = await this.usersService.findOneByUserName(updateUserDTO.username);
      if (usernameExists && usernameExists.id !== userId) {
        throw new BadRequestException('Username already taken');
      }
    }
  
    return this.usersService.update(userId, updateUserDTO);
  }
  


  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    required: true,
    description: 'id of user',
    schema: { oneOf: [{ type: 'string' }, { type: 'integer' }] },
  })
  @Delete('/:id')
  deleteUserById(@Param() params): Observable<DeleteResult> {
    return this.usersService.remove(params.id);
  }
}
