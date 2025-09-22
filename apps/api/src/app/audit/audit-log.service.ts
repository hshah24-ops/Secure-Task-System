import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async logAction(userId:number, action: string) {
    console.log(`AuditLog → User ${userId} performed ${action}`);
    const log = this.auditRepo.create({ userId, action, timestamp: new Date() });
    return this.auditRepo.save(log);
  }

  async findAll() {
    return this.auditRepo.find({ order: { timestamp: 'DESC' } });
  }
}