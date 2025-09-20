import { Injectable } from '@nestjs/common';
import { RoleDTO } from './interfaces/role.interface';

@Injectable()
export class RolesService {
  private rolesMap: RoleDTO[] = [
    {
      id: 1,
      name: 'Owner',
      permissions: ['view_task', 'create_task', 'update_task', 'delete_task'],
    },
    {
      id: 2,
      name: 'Admin',
      permissions: ['view_task', 'create_task', 'update_task', 'delete_task'],
    },
    {
      id: 3,
      name: 'Viewer',
      permissions: ['view_task'],
    },
  ];

  hasPermission(roleId: number, permission: string): boolean {
    const role = this.rolesMap.find(r => r.id === roleId);
    return !!role && role.permissions.includes(permission);
    console.log(`Checking role ${roleId} for permission ${permission}`);
  }
}