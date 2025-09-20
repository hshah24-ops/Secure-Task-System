import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { AuditLogService } from '../audit/audit-log.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    private readonly auditLogService: AuditLogService,
  ) {}

  findAll() {
    return this.taskRepo.find();
  }

  findOne(id: number) {
    return this.taskRepo.findOne({ where: { id } });
  }

  async create(taskData: Partial<Task>) {
    const task = this.taskRepo.create(taskData);
    const saved = await this.taskRepo.save(task);
    await this.auditLogService.logAction(1, `Created task: ${saved.title}`);
    return saved;
  }

  async update(id: number, updateData: Partial<Task>) {
    await this.taskRepo.update(id, updateData);
    await this.auditLogService.logAction(1, `Updated task ID: ${id}`);
    return this.findOne(id);
  }

  async delete(id: number) {
    await this.taskRepo.delete(id);
    await this.auditLogService.logAction(1, `Deleted task ID: ${id}`);
    return { deleted: true };
  }
}