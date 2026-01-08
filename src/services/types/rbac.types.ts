export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  permissions: Permission[];
}

export interface CreateRoleRequest {
  name: string;
  description?: string | null;
  permissions: string[];
}

export interface UpdateRoleRequest extends CreateRoleRequest {}

export interface RolesResponse {
  success: boolean;
  data: Role[];
}

export interface PermissionsResponse {
  success: boolean;
  data: Permission[];
}
