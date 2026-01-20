import { apiClient } from '@/lib/api-client';
import { ApiSuccessResponse, PaginatedResponse, PaginationParams } from '@/types/pagination.types';

export class AdminStatsService {
  private endpoint = 'admin-stats';

  async getAnalyticsStats(params?: { start_date?: string; end_date?: string }): Promise<any> {
    const response = await apiClient.get<ApiSuccessResponse<any>>(
      `${this.endpoint}/analytics`,
      params 
    );
    return response.data;
  }

  async getTransactionStatuses(): Promise<any> {
    const response = await apiClient.get<ApiSuccessResponse<any>>(
      `${this.endpoint}/transaction-status-chart`
    );
    return response.data;
  }

  async getPaymentMethodBreakdown(): Promise<any> {
    const response = await apiClient.get<ApiSuccessResponse<any>>(
      `${this.endpoint}/payment-method-chart`
    );
    return response.data;
  }

  async getTopCustomers(): Promise<any> {
    const response = await apiClient.get<PaginatedResponse<any>>(
      `${this.endpoint}/top-customers`,
    );
    return response.data;
  }

  async getTransactionVolume(params?: { period?: string }): Promise<any> {
    const response = await apiClient.get<ApiSuccessResponse<any>>(
      `${this.endpoint}/transaction-volume-chart`,
      params
    );
    return response.data;
  }

  async WeeklyCustomerActivities(): Promise<any> {
    const response = await apiClient.get<ApiSuccessResponse<any>>(
      `${this.endpoint}/weekly-customer-activities`
    );
    return response.data;
  }

}

export const adminStatsService = new AdminStatsService();