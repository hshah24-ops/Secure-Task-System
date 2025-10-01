import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard, PermissionsGuard, Permissions } from '@secure-task-manager/auth';
import type { Request } from 'express';
//import { User } from '../entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // List all users in the same organization
  @Get()
  @Permissions('view_user')
  async getUsers(@Req() req: Request) {
    const currentUser = req.user as any;
    
    return this.userService.findAll(currentUser);
  }

  // Add new user
  @Post()
  @Permissions('create_user')
  async createUser(
    @Req() req: Request,
    @Body()
    body: { email: string; password: string; roleId: number },
  ) {
    const currentUser = req.user as any;
    return this.userService.createUser(
      currentUser,
      body.email,
      body.password,
      body.roleId,
    );
  }
}