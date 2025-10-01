import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard, PermissionsGuard, Permissions } from '@secure-task-manager/auth';
import type { Request } from 'express';

@Controller('audit-log')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Permissions('view_audit_log')
  getLogs(@Req() req: Request) {
    const currentUser = req.user as any;
    return this.auditLogService.findAll(currentUser);
  }
}