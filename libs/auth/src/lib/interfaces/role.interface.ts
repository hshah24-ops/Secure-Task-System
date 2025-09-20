export interface RoleDTO {
  id: number;
  name: string;
  permissions: string[];
  parentRole?: RoleDTO;
}