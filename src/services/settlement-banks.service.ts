import { apiClient } from '@/lib/api-client';
import { SettlementBank, CreateSettlementBankRequest } from '@/types/settlement-bank.types';
import { ApiSuccessResponse, PaginatedResponse, PaginationParams } from '@/types/pagination.types';

export class SettlementBanksService {
  private endpoint = 'settlement-banks';

  async getSettlementBanks(params?: PaginationParams): Promise<PaginatedResponse<SettlementBank>> {
    const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<SettlementBank>>>(
      this.endpoint,
      params
    );
    return response.data;
  }

  async getSettlementBank(id: string | number): Promise<SettlementBank> {
    const response = await apiClient.get<ApiSuccessResponse<SettlementBank>>(
      `${this.endpoint}/${id}`
    );
    return response.data;
  }

  async createSettlementBank(data: CreateSettlementBankRequest): Promise<SettlementBank> {
    const response = await apiClient.post<ApiSuccessResponse<SettlementBank>>(
      this.endpoint,
      data
    );
    return response.data;
  }

  async updateSettlementBank(id: string | number, data: Partial<CreateSettlementBankRequest>): Promise<SettlementBank> {
    const response = await apiClient.put<ApiSuccessResponse<SettlementBank>>(
      `${this.endpoint}/${id}`,
      data
    );
    return response.data;
  }

  async deleteSettlementBank(id: string | number): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }

  async setDefaultSettlementBank(id: string | number): Promise<SettlementBank> {
    const response = await apiClient.patch<ApiSuccessResponse<SettlementBank>>(
      `${this.endpoint}/${id}/set-default`
    );
    return response.data;
  }
}

export const settlementBanksService = new SettlementBanksService();