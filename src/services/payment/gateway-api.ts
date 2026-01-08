import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/laravel-config';
import type { PaymentGatewayProvider } from '@/services/types/payment.types';

export interface GatewayConfiguration {
  provider_id: string;
  configuration: Record<string, any>;
  is_enabled: boolean;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  error_details?: string;
}

export class GatewayApi {
  async getProviders(): Promise<PaymentGatewayProvider[]> {
    return apiClient.get<PaymentGatewayProvider[]>(API_ENDPOINTS.GATEWAY.PROVIDERS);
  }

  async configureGateway(data: GatewayConfiguration): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>(
      API_ENDPOINTS.GATEWAY.CONFIGURE,
      data
    );
  }

  async testConnection(providerId: string): Promise<TestConnectionResponse> {
    return apiClient.post<TestConnectionResponse>(
      API_ENDPOINTS.GATEWAY.TEST_CONNECTION,
      { provider_id: providerId }
    );
  }

  async getGatewayConfiguration(providerId: string): Promise<GatewayConfiguration> {
    return apiClient.get<GatewayConfiguration>(
      `${API_ENDPOINTS.GATEWAY.CONFIGURE}/${providerId}`
    );
  }

  async updateGatewayConfiguration(
    providerId: string,
    data: Partial<GatewayConfiguration>
  ): Promise<GatewayConfiguration> {
    return apiClient.put<GatewayConfiguration>(
      `${API_ENDPOINTS.GATEWAY.CONFIGURE}/${providerId}`,
      data
    );
  }

  async disableGateway(providerId: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(
      `${API_ENDPOINTS.GATEWAY.CONFIGURE}/${providerId}`
    );
  }
}

export const gatewayApi = new GatewayApi();