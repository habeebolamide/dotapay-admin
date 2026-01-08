import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/laravel-config';

export interface DashboardStatistics {
  paymentRevenue: number;
  walletBalance: number;
  customers: number;
  totalTransactions: number;
}

export interface RevenueChartPoint {
  [month: string]: number;
}

export interface WalletChartSeries {
  label: string;
  total: number;
}

export interface WalletChartData {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start: string;
  end: string;
  series: WalletChartSeries[];
}

class DashboardService {
  async getStatistics(params?: { start_date?: string; end_date?: string }): Promise<DashboardStatistics> {
    const response = await apiClient.get<{ success: boolean; data: DashboardStatistics }>(
      API_ENDPOINTS.DASHBOARD.STATISTICS,
      params,
    );

    return response.data;
  }

  async getRevenueChart(params: { year: string | number }): Promise<RevenueChartPoint[]> {
    const response = await apiClient.get<{ success: boolean; data: RevenueChartPoint[] }>(
      API_ENDPOINTS.DASHBOARD.REVENUE_CHART,
      params,
    );

    return response.data;
  }

  async getWalletChart(params: { period: 'daily' | 'weekly' | 'monthly' | 'yearly' }): Promise<WalletChartData> {
    const response = await apiClient.get<{ success: boolean; data: WalletChartData }>(
      API_ENDPOINTS.DASHBOARD.WALLET_CHART,
      params,
    );

    return response.data;
  }
}

export const dashboardService = new DashboardService();
