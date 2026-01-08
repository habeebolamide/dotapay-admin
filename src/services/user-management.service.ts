import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/laravel-config';
import type {
  CreateTeamMemberRequest,
  TeamMembersResponse,
  UpdateTeamMemberRequest,
} from './types/user-management.types';

class UserManagementService {
  async listUsers(params?: Record<string, any>): Promise<TeamMembersResponse> {
    return apiClient.get<TeamMembersResponse>(API_ENDPOINTS.USER_MANAGEMENT.USERS, params);
  }

  async createUser(payload: CreateTeamMemberRequest): Promise<any> {
    return apiClient.post<any>(API_ENDPOINTS.USER_MANAGEMENT.STORE_USER, payload);
  }

  async updateUser(id: number | string, payload: UpdateTeamMemberRequest): Promise<any> {
    return apiClient.post<any>(API_ENDPOINTS.USER_MANAGEMENT.UPDATE_USER(id), payload);
  }

  async deleteUser(id: number | string): Promise<any> {
    return apiClient.delete<any>(API_ENDPOINTS.USER_MANAGEMENT.DELETE_USER(id));
  }
}

export const userManagementService = new UserManagementService();
