import { apiClient } from '@/lib/api-client';
import { ApiSuccessResponse, PaginatedResponse, PaginationParams } from '@/types/pagination.types';

export interface SplitGroupSetting {
  id: number;
  split_group_id: number;
  wallet_id: string;
  amount: string;
  created_at: string;
  updated_at: string;
}

export interface SplitGroup {
  id: number;
  code: string;
  name: string;
  business_id: number;
  split_type: 'percentage' | 'flat';
  created_at: string;
  updated_at: string;
  settings: SplitGroupSetting[];
}

export interface CreateSplitGroupRequest {
  name: string;
  split_type: 'percentage' | 'flat';
  currency?: string;
}

export interface SplitGroupsParams extends PaginationParams {
  search?: string;
  split_type?: string;
  status?: string;
}

class SplitGroupsService {
  private endpoint = 'split-groups';

  async getSplitGroups(params: SplitGroupsParams = {}): Promise<PaginatedResponse<SplitGroup>> {
    const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<SplitGroup>>>(
      this.endpoint,
      params
    );
    return response.data;
  }

  async getSplitGroup(id: number): Promise<SplitGroup> {
    const response = await apiClient.get<ApiSuccessResponse<SplitGroup>>(`${this.endpoint}/${id}`);
    return response.data;
  }

  async createSplitGroup(data: CreateSplitGroupRequest): Promise<SplitGroup> {
    const response = await apiClient.post<ApiSuccessResponse<SplitGroup>>(this.endpoint, data);
    return response.data;
  }

  async updateSplitGroup(id: number, data: Partial<CreateSplitGroupRequest>): Promise<SplitGroup> {
    const response = await apiClient.put<ApiSuccessResponse<SplitGroup>>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  async deleteSplitGroup(id: number): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }
}

export const splitGroupsService = new SplitGroupsService();