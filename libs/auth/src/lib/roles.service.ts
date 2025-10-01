import { Injectable } from '@nestjs/common';
import { RoleDTO } from './interfaces/role.interface';

@Injectable()
export class RolesService {
  private rolesMap: RoleDTO[] = [
    {
      id: 1,
      name: 'Owner',
      permissions: ['view_task', 'create_task', 'update_task', 'delete_task', 'view_audit_log', 'view_user', 'create_user'],
    },
    {
      id: 2,
      name: 'Admin',
      permissions: ['view_task', 'create_task', 'update_task', 'delete_task', 'view_audit_log', 'view_user', 'create_user'],
    },
    {
      id: 3,
      name: 'Viewer',
      permissions: ['view_task'],
    },
  ];

  hasPermission(roleId: number, permission: string): boolean {
    const role = this.rolesMap.find(r => r.id === roleId);
    console.log(`Checking role ${roleId} for permission ${permission}`);
    return !!role && role.permissions.includes(permission);
  }
}