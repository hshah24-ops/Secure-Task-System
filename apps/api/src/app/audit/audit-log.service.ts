import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

interface JwtPayload {
  id: number;
  roleId: number;
  organizationId: number;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async logAction(userId:number, action: string) {
    console.log(`AuditLog → User ${userId} performed ${action}`);
    const log = this.auditRepo.create({ userId, action, timestamp: new Date(), });
    return this.auditRepo.save(log);
  }

  async findAll(user: JwtPayload) {
    if (!this.isOwnerOrAdmin(user.roleId)) {
      throw new ForbiddenException('Only Owner/Admin can view audit logs');
    }

    return this.auditRepo.find({
      order: { timestamp: 'DESC' },
     });
  }

  private isOwnerOrAdmin(roleId: number) {
    return roleId === 1 || roleId === 2;
  }
}