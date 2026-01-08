import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/laravel-config';
import type {
  CreateRoleRequest,
  PermissionsResponse,
  RolesResponse,
  UpdateRoleRequest,
} from '@/services/types/rbac.types';

class RbacService {
  async getRoles(): Promise<RolesResponse> {
    return apiClient.get<RolesResponse>(API_ENDPOINTS.RBAC.ROLES);
  }

  async getPermissions(): Promise<PermissionsResponse> {
    return apiClient.get<PermissionsResponse>(API_ENDPOINTS.RBAC.PERMISSIONS);
  }

  async createRole(payload: CreateRoleRequest): Promise<any> {
    return apiClient.post<any>(API_ENDPOINTS.RBAC.CREATE_ROLE, payload);
  }

  async updateRole(roleId: number | string, payload: UpdateRoleRequest): Promise<any> {
    return apiClient.patch<any>(API_ENDPOINTS.RBAC.UPDATE_ROLE(roleId), payload);
  }
}

export const rbacService = new RbacService();
