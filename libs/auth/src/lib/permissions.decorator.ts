import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';
export const Permissions = (permission: string | string[]) =>
  SetMetadata(PERMISSION_KEY, Array.isArray(permission) ? permission : [permission]);