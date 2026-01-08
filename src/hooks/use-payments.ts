import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  paymentApi,
  transactionApi,
  merchantApi,
  gatewayApi,
  auditLogApi,
  settlementApi,
  type CreatePaymentRequest,
  type CapturePaymentRequest,
  type RefundPaymentRequest,
  type TransactionFilters,
} from '@/services';
import type { AuditLogListParams } from '@/types/audit-log.types';
import type { SettlementListParams, CreateSettlementRequest } from '@/types/settlement.types';

export const PAYMENT_QUERY_KEYS = {
  payments: ['payments'] as const,
  paymentList: (params?: any) => ['payments', 'list', params] as const,
  payment: (id: string) => ['payments', id] as const,
  transactions: ['transactions'] as const,
  transaction: (id: string) => ['transactions', id] as const,
  merchantTransactions: (filters?: TransactionFilters) =>
    ['transactions', 'merchant', filters] as const,
  dashboard: ['merchant', 'dashboard'] as const,
  settings: ['merchant', 'settings'] as const,
  apiKeys: ['merchant', 'api-keys'] as const,
  webhooks: ['merchant', 'webhooks'] as const,
  gatewayProviders: ['gateway', 'providers'] as const,
  auditLogs: ['audit-logs'] as const,
  auditLogList: (params?: AuditLogListParams) => ['audit-logs', 'list', params] as const,
  auditLog: (id: string) => ['audit-logs', id] as const,
  settlements: ['settlements'] as const,
  settlementList: (params?: SettlementListParams) => ['settlements', 'list', params] as const,
  settlement: (id: string) => ['settlements', id] as const,
} as const;

export function usePaymentList(params?: any) {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.paymentList(params),
    queryFn: () => paymentApi.listPayments(params),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentRequest) => paymentApi.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.payments });
      toast.success('Payment created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create payment');
    },
  });
}

export function usePayment(paymentId: string) {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.payment(paymentId),
    queryFn: () => paymentApi.getPayment(paymentId),
    enabled: !!paymentId,
  });
}

export function useCapturePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, data }: { paymentId: string; data?: CapturePaymentRequest }) =>
      paymentApi.capturePayment(paymentId, data),
    onSuccess: (_, { paymentId }) => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.payment(paymentId) });
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.payments });
      toast.success('Payment captured successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to capture payment');
    },
  });
}

export function useRefundPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, data }: { paymentId: string; data: RefundPaymentRequest }) =>
      paymentApi.refundPayment(paymentId, data),
    onSuccess: (_, { paymentId }) => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.payment(paymentId) });
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.payments });
      toast.success('Payment refunded successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to refund payment');
    },
  });
}

export function useCancelPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: string) => paymentApi.cancelPayment(paymentId),
    onSuccess: (_, paymentId) => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.payment(paymentId) });
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.payments });
      toast.success('Payment cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel payment');
    },
  });
}

export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.merchantTransactions(filters),
    queryFn: () => transactionApi.getMerchantTransactions(filters),
  });
}

export function useTransaction(transactionId: string) {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.transaction(transactionId),
    queryFn: () => transactionApi.getTransaction(transactionId),
    enabled: !!transactionId,
  });
}

export function useMerchantDashboard() {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.dashboard,
    queryFn: () => merchantApi.getDashboard(),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useMerchantSettings() {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.settings,
    queryFn: () => merchantApi.getSettings(),
  });
}

export function useUpdateMerchantSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: merchantApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.settings });
      toast.success('Settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update settings');
    },
  });
}

export function useApiKeys() {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.apiKeys,
    queryFn: () => merchantApi.getApiKeys(),
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: merchantApi.createApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.apiKeys });
      toast.success('API key created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create API key');
    },
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (keyId: string) => merchantApi.deleteApiKey(keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.apiKeys });
      toast.success('API key deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete API key');
    },
  });
}

export function useWebhooks() {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.webhooks,
    queryFn: () => merchantApi.getWebhooks(),
  });
}

export function useCreateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: merchantApi.createWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.webhooks });
      toast.success('Webhook created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create webhook');
    },
  });
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ webhookId, data }: { webhookId: string; data: any }) =>
      merchantApi.updateWebhook(webhookId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.webhooks });
      toast.success('Webhook updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update webhook');
    },
  });
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (webhookId: string) => merchantApi.deleteWebhook(webhookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.webhooks });
      toast.success('Webhook deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete webhook');
    },
  });
}

export function useGatewayProviders() {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.gatewayProviders,
    queryFn: () => gatewayApi.getProviders(),
  });
}

export function useConfigureGateway() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: gatewayApi.configureGateway,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.gatewayProviders });
      toast.success('Gateway configured successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to configure gateway');
    },
  });
}

export function useTestGatewayConnection() {
  return useMutation({
    mutationFn: (providerId: string) => gatewayApi.testConnection(providerId),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Gateway connection test successful');
      } else {
        toast.error(data.message || 'Gateway connection test failed');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to test gateway connection');
    },
  });
}

export function useAuditLogList(params?: AuditLogListParams) {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.auditLogList(params),
    queryFn: () => auditLogApi.listAuditLogs(params),
  });
}

export function useAuditLog(logId: string) {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.auditLog(logId),
    queryFn: () => auditLogApi.getAuditLog(logId),
    enabled: !!logId,
  });
}

export function useSettlementList(params?: SettlementListParams) {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.settlementList(params),
    queryFn: () => settlementApi.listSettlements(params),
  });
}

export function useSettlement(settlementId: string) {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.settlement(settlementId),
    queryFn: () => settlementApi.getSettlement(settlementId),
    enabled: !!settlementId,
  });
}

export function useCreateSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSettlementRequest) => settlementApi.createSettlement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.settlements });
      toast.success('Withdrawal request created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create withdrawal request');
    },
  });
}

export function useApproveSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settlementId: string) => settlementApi.approveSettlement(settlementId),
    onSuccess: (_, settlementId) => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.settlement(settlementId) });
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.settlements });
      toast.success('Settlement approved successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve settlement');
    },
  });
}

export function useCancelSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settlementId: string) => settlementApi.cancelSettlement(settlementId),
    onSuccess: (_, settlementId) => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.settlement(settlementId) });
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.settlements });
      toast.success('Settlement cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel settlement');
    },
  });
}