import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { AuditLogService } from '../audit/audit-log.service';
//import { User } from '../entities/user.entity';

interface JwtPayload {
  id: number;
  roleId: number;
  organizationId: number;
}

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async findAll(user: JwtPayload) {
    // Only fetch tasks in the user's organization
    return this.taskRepo.find({
      where: { organization: { id: user.organizationId } },
    });
  }

  async findOne(user: JwtPayload, id: number) {
    const task = await this.taskRepo.findOne({
      where: { id, organization: { id: user.organizationId } },
      relations: ['createdBy', 'organization'],
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }
  
  async create(user: JwtPayload, taskData: Partial<Task>) {
    const task = this.taskRepo.create({
      ...taskData,
      organization: { id: user.organizationId } as any,
      createdBy: { id: user.id } as any,
    });
    const saved: Task = await this.taskRepo.save(task);

    await this.auditLogService.logAction(user.id, `Created task: ${saved.title}`);
    return saved;
  }

  async update(user: JwtPayload, id: number, updateData: Partial<Task>) {
    const task = await this.findOne(user, id);

    // Enforce ownership check
    if (task.createdBy.id !== user.id && !this.isOwnerOrAdmin(user.roleId)) {
      throw new ForbiddenException('You cannot update this task');
    }

    Object.assign(task, updateData);
    const saved = await this.taskRepo.save(task);

    await this.auditLogService.logAction(user.id, `Updated task ID: ${id}`);
    return saved;
  }

  async delete(user: JwtPayload, id: number) {
    const task = await this.findOne(user, id);

    if (task.createdBy.id !== user.id && !this.isOwnerOrAdmin(user.roleId)) {
      throw new ForbiddenException('You cannot delete this task');
    }

    await this.taskRepo.remove(task);
    await this.auditLogService.logAction(user.id, `Deleted task ID: ${id}`);

    return { deleted: true };
  }
  
  private isOwnerOrAdmin(roleId: number) {
    return roleId === 1 || roleId === 2;
  }
}