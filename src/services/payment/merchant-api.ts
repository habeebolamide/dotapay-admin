import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/laravel-config';
import type {
  MerchantDashboard,
  MerchantSettings,
  ApiKey,
  CreateApiKeyRequest,
  Webhook,
  CreateWebhookRequest,
} from '@/services/types/payment.types';

export class MerchantApi {
  async getDashboard(): Promise<MerchantDashboard> {
    return apiClient.get<MerchantDashboard>(API_ENDPOINTS.MERCHANT.DASHBOARD);
  }

  async getSettings(): Promise<MerchantSettings> {
    return apiClient.get<MerchantSettings>(API_ENDPOINTS.MERCHANT.SETTINGS);
  }

  async updateSettings(
    data: Partial<MerchantSettings>
  ): Promise<MerchantSettings> {
    return apiClient.put<MerchantSettings>(
      API_ENDPOINTS.MERCHANT.UPDATE_SETTINGS,
      data
    );
  }

  async getApiKeys(): Promise<ApiKey[]> {
    return apiClient.get<ApiKey[]>(API_ENDPOINTS.MERCHANT.API_KEYS);
  }

  async createApiKey(data: CreateApiKeyRequest): Promise<ApiKey> {
    return apiClient.post<ApiKey>(API_ENDPOINTS.MERCHANT.API_KEYS, data);
  }

  async deleteApiKey(keyId: string): Promise<void> {
    return apiClient.delete(`${API_ENDPOINTS.MERCHANT.API_KEYS}/${keyId}`);
  }

  async regenerateApiKey(keyId: string): Promise<ApiKey> {
    return apiClient.post<ApiKey>(
      `${API_ENDPOINTS.MERCHANT.API_KEYS}/${keyId}/regenerate`
    );
  }

  async getWebhooks(): Promise<Webhook[]> {
    return apiClient.get<Webhook[]>(API_ENDPOINTS.MERCHANT.WEBHOOKS);
  }

  async createWebhook(data: CreateWebhookRequest): Promise<Webhook> {
    return apiClient.post<Webhook>(API_ENDPOINTS.MERCHANT.WEBHOOKS, data);
  }

  async updateWebhook(
    webhookId: string,
    data: Partial<CreateWebhookRequest>
  ): Promise<Webhook> {
    return apiClient.put<Webhook>(
      `${API_ENDPOINTS.MERCHANT.WEBHOOKS}/${webhookId}`,
      data
    );
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    return apiClient.delete(`${API_ENDPOINTS.MERCHANT.WEBHOOKS}/${webhookId}`);
  }

  async testWebhook(webhookId: string): Promise<{ success: boolean; response: any }> {
    return apiClient.post<{ success: boolean; response: any }>(
      `${API_ENDPOINTS.MERCHANT.WEBHOOKS}/${webhookId}/test`
    );
  }
}

export const merchantApi = new MerchantApi();