import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesService } from './roles.service';
import { PERMISSION_KEY } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private roleService: RolesService,
  ) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSION_KEY, [context.getHandler(), context.getClass()]) ?? [];

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('PermissionsGuard required:', requiredPermissions);
    console.log('PermissionsGuard req.user:', request.user);

    if (!requiredPermissions.length) return true;

    if (!user) throw new UnauthorizedException('User not authenticated');

    const roleId = user.roleId ?? user.role?.id ?? user?.roleId;
    if (!roleId) throw new ForbiddenException('User has no role assigned');

    for (const permission of requiredPermissions) {
      const hasPerm = await Promise.resolve(this.roleService.hasPermission(roleId, permission));
      if (hasPerm) return true;
    }

    throw new ForbiddenException('You do not have permission (guard)');
  }
}