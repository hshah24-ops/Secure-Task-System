import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  // Recursively get all parent roles (including current)
  async getRoleWithInheritedRoles(roleId: number): Promise<Role[]> {
    const roles: Role[] = [];

    const getRoleChain = async (id: number): Promise<void> => {
      const role = await this.roleRepository.findOne({
        where: { id },
        relations: ['parentRole'],
      });
      if (role) {
        roles.push(role);
        if (role.parentRole) {
          await getRoleChain(role.parentRole.id);
        }
      }
    };

    await getRoleChain(roleId);
    return roles;
  }

  // Recursively get all children roles (descendants) including current
  async getRoleWithChildren(roleId: number): Promise<Role[]> {
    const roles: Role[] = [];

    const getChildren = async (id: number): Promise<void> => {
      const role = await this.roleRepository.findOne({
        where: { id },
        relations: ['childRoles'],
      });
      if (role) {
        roles.push(role);
        if (role.childRoles?.length) {
          for (const child of role.childRoles) {
            await getChildren(child.id);
          }
        }
      }
    };

    await getChildren(roleId);
    return roles;
  }

  // Check if the role or any inherited role has the given permission
  async hasPermission(roleId: number, permissionName: string): Promise<boolean> {
    const roles = await this.getRoleWithInheritedRoles(roleId);

    for (const role of roles) {
      if (role.permissions?.some(p => p.name === permissionName)) {
        return true;
      }
    }

    return false;
  }
}
