import { useQuery } from '@tanstack/react-query';
import { dashboardService, type DashboardStatistics, type RevenueChartPoint, type WalletChartData } from '@/services';

export const DASHBOARD_QUERY_KEYS = {
  statistics: (params?: { start_date?: string; end_date?: string }) => ['dashboard', 'statistics', params] as const,
  revenueChart: (params: { year: string | number }) => ['dashboard', 'revenue-chart', params.year] as const,
  walletChart: (params: { period: string }) => ['dashboard', 'wallet-chart', params.period] as const,
} as const;

export function useDashboardStatistics(params?: { start_date?: string; end_date?: string }) {
  return useQuery<DashboardStatistics>({
    queryKey: DASHBOARD_QUERY_KEYS.statistics(params),
    queryFn: () => dashboardService.getStatistics(params),
  });
}

export function useRevenueChart(params: { year: string | number }) {
  return useQuery<RevenueChartPoint[]>({
    queryKey: DASHBOARD_QUERY_KEYS.revenueChart(params),
    queryFn: () => dashboardService.getRevenueChart(params),
  });
}

export function useWalletChart(params: { period: 'daily' | 'weekly' | 'monthly' | 'yearly' }) {
  return useQuery<WalletChartData>({
    queryKey: DASHBOARD_QUERY_KEYS.walletChart(params),
    queryFn: () => dashboardService.getWalletChart(params),
  });
}
