import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from '../entities/task.entity';
import { AuditLogService } from '../audit/audit-log.service';
import { Organization } from '../entities/organization.entity';

interface JwtPayload {
  id: number;
  roleId: number;
  organizationId: number;
}

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(Organization) private orgRepo: Repository<Organization>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async findAll(user: JwtPayload) {
    // Viewers (roleId: 3) see all tasks in their organization
    if (user.roleId === 3) {
      return this.taskRepo.find({
        where: { organization: { id: user.organizationId } },
        relations: ['createdBy', 'organization'],
      });
    }

    // Owners and Admins see tasks based on org hierarchy
    const orgIds = await this.resolveOrgScope(user.organizationId, user.roleId);
    return this.taskRepo.find({
      where: { organization: { id: In(orgIds) } },
      relations: ['createdBy', 'organization'],
    });
  }

  async findOne(user: JwtPayload, id: number) {
    // Viewers can see all tasks in their organization
    if (user.roleId === 3) {
      const task = await this.taskRepo.findOne({
        where: { id, organization: { id: user.organizationId } },
        relations: ['createdBy', 'organization'],
      });
      if (!task) throw new NotFoundException('Task not found');
      return task;
    }

    // Owners and Admins can access tasks in their org scope
    const orgIds = await this.resolveOrgScope(user.organizationId, user.roleId);
    const task = await this.taskRepo.findOne({
      where: { id, organization: { id: In(orgIds) } },
      relations: ['createdBy', 'organization'],
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }
  
  async create(user: JwtPayload, taskData: Partial<Task>) {
    // Permission guard already handles this, but keeping for extra safety
    if (!this.isOwnerOrAdmin(user.roleId)) {
      throw new ForbiddenException('You do not have permission to create tasks');
    }

    const task = this.taskRepo.create({
      ...taskData,
      organization: { id: user.organizationId } as any,
      createdBy: { id: user.id } as any,
    });
    const saved = await this.taskRepo.save(task);
    await this.auditLogService.logAction(user.id, `Created task: ${saved.title}`);
    return saved;
  }

  async update(user: JwtPayload, id: number, updateData: Partial<Task>) {
    const task = await this.findOne(user, id);
    
    // Enforce ownership check unless Owner/Admin
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

  /**
   * Resolve org scope based on role:
   * - Admins (roleId: 2) only see their own org
   * - Owners (roleId: 1) see org + all children recursively
   */
  private async resolveOrgScope(orgId: number, roleId: number): Promise<number[]> {
    // Admins only see their own org
    if (roleId === 2) {
      return [orgId];
    }

    // Owners see entire hierarchy
    return this.getOrgHierarchy(orgId);
  }

  /**
   * Recursively get organization and all its children
   */
  private async getOrgHierarchy(orgId: number): Promise<number[]> {
    const org = await this.orgRepo.findOne({
      where: { id: orgId },
      relations: ['children'],
    });
    
    if (!org) return [orgId];
    
    const ids = [org.id];
    
    // Recursively add all children
    if (org.children?.length) {
      for (const child of org.children) {
        const childIds = await this.getOrgHierarchy(child.id);
        ids.push(...childIds);
      }
    }
    
    return ids;
  }
}