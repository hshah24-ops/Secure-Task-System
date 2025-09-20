export interface User {
  id: number;
  email: string;
  roleId: number;
  organizationId: number;
  createdAt?: string;
}