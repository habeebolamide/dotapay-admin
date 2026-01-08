import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/laravel-config';
import type {
  Settlement,
  SettlementListResponse,
  SettlementListParams,
  CreateSettlementRequest,
} from '@/types/settlement.types';

export class SettlementApi {
  async listSettlements(params?: SettlementListParams): Promise<SettlementListResponse> {
    return apiClient.get<SettlementListResponse>(API_ENDPOINTS.SETTLEMENTS.LIST, params);
  }

  async createSettlement(data: CreateSettlementRequest): Promise<Settlement> {
    return apiClient.post<Settlement>(API_ENDPOINTS.SETTLEMENTS.CREATE, data);
  }

  async getSettlement(settlementId: string): Promise<Settlement> {
    return apiClient.get<Settlement>(API_ENDPOINTS.SETTLEMENTS.SHOW(settlementId));
  }

  async approveSettlement(settlementId: string): Promise<Settlement> {
    return apiClient.post<Settlement>(API_ENDPOINTS.SETTLEMENTS.APPROVE(settlementId));
  }

  async cancelSettlement(settlementId: string): Promise<Settlement> {
    return apiClient.post<Settlement>(API_ENDPOINTS.SETTLEMENTS.CANCEL(settlementId));
  }
}

export const settlementApi = new SettlementApi();
