import { apiClient } from '@/lib/api-client';
import { ApiSuccessResponse } from '@/types/pagination.types';
import {
  Business,
  CreateBusinessRequest,
  SwitchBusinessRequest,
  UpdateBusinessRequest,
} from '@/types/business.types';

class BusinessService {
  async listBusinesses(params?: Record<string, any>): Promise<Business[]> {
    const response = await apiClient.get<ApiSuccessResponse<Business[]>>('businesses', params);
    return response.data;
  }

  async createBusiness(payload: CreateBusinessRequest): Promise<Business> {
    const response = await apiClient.post<ApiSuccessResponse<Business>>('businesses', payload);
    return response.data;
  }

  async getBusiness(identifier?: number | string): Promise<Business> {
    const endpoint = 'businesses/active';
    const response = await apiClient.get<ApiSuccessResponse<Business>>(endpoint);
    return response.data;
  }

  async updateBusiness(
    identifier: number | string,
    payload: UpdateBusinessRequest
  ): Promise<Business> {
    const response = await apiClient.patch<ApiSuccessResponse<Business>>(
      `businesses/${identifier}`,
      payload,
    );

    return response.data;
  }

  async switchBusiness(payload: SwitchBusinessRequest): Promise<void> {
    await apiClient.post('businesses/switch', payload);
  }

  async regenerateApiKeys(): Promise<Business> {
    const response = await apiClient.get<ApiSuccessResponse<Business>>('businesses/regenerate-api-keys');
    return response.data;
  }
}

export const businessService = new BusinessService();
