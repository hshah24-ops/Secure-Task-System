import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from '../entities/task.entity';
import { JwtAuthGuard, PermissionsGuard, Permissions } from '@secure-task-manager/auth';   
//import type { Request } from 'express';

interface JwtPayload {
  id: number;
  email: string;
  roleId: number;
  organizationId: number;
}

@Controller('tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard) 
export class TaskController {
  constructor(private readonly taskService: TaskService) {
  console.log('TaskController Loaded');
}


  @Get(':id')
  @Permissions('view_task')
  async getTask(@Req() req: any, @Param('id') id: string) {
    if (!req.user) {
      throw new UnauthorizedException('User not found in request');
    }
    console.log(`GET /tasks/${id} called by`, req.user);
    return this.taskService.findOne(req.user as JwtPayload, +id);
  }

  @Get()
  @Permissions('view_task')
  getAllTasks(@Req() req: any) {
    if (!req.user) {
    throw new UnauthorizedException('User not found in request');
  }
    console.log('GET /tasks called by', req.user);
    return this.taskService.findAll(req.user as JwtPayload);
  }

  @Post()
  @Permissions('create_task')
  createTask(@Req() req: any, @Body() data: Partial<Task>) {
   if (!req.user) {
    throw new UnauthorizedException('User not found in request');
  }
   
   console.log('POST /tasks called by', req.user as JwtPayload);  
   return this.taskService.create(req.user as JwtPayload, data);
  }

  @Put(':id')
  @Permissions('update_task')
  updateTask(@Req() req: any, @Param('id') id: string, @Body() data: Partial<Task>) {
   if (!req.user) {
    throw new UnauthorizedException('User not found in request');
  }
   
   console.log('PUT /tasks called by', req.user as JwtPayload);  
   return this.taskService.update(req.user as JwtPayload, +id, data);
  }

  @Delete(':id')
  @Permissions('delete_task')
  deleteTask(@Req() req: any, @Param('id') id: string) {
   if (!req.user) {
    throw new UnauthorizedException('User not found in request');
  }
   
   console.log('DELETE /tasks called by', req.user as JwtPayload);  
   return this.taskService.delete(req.user as JwtPayload, +id);
  }
}