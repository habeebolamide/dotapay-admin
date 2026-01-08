import { apiClient } from '@/lib/api-client';
import { PaginatedResponse, ApiSuccessResponse, PaginationParams } from '@/types/pagination.types';
import {
  Wallet,
  SplitGroupSettingsRequest,
  CreateWalletRequest,
  UpdateWalletRequest,
  WalletTransactionsResponse,
  WalletWithdrawRequest,
} from '@/types/wallet.types';

class WalletService {
  async getBusinessWallets(params?: PaginationParams): Promise<PaginatedResponse<Wallet>> {
    return apiClient.get<PaginatedResponse<Wallet>>(
      `businesses/wallets`,
      params
    );
  }

  async getWalletTransactions(
    walletSlug: string,
    params?: PaginationParams
  ): Promise<WalletTransactionsResponse> {
    return apiClient.get<WalletTransactionsResponse>(
      `businesses/wallets/${walletSlug}/transactions`,
      params
    );
  }

  async createWallet(data: CreateWalletRequest): Promise<Wallet> {
    const response = await apiClient.post<ApiSuccessResponse<Wallet>>('businesses/wallets', data);
    return response.data;
  }

  async updateWallet(walletSlug: string, data: UpdateWalletRequest): Promise<Wallet> {
    const response = await apiClient.patch<ApiSuccessResponse<Wallet>>(
      `businesses/wallets/${walletSlug}`,
      data
    );
    return response.data;
  }

  async deleteWallet(walletSlug: string): Promise<void> {
    await apiClient.delete<ApiSuccessResponse<unknown>>(
      `businesses/wallets/${walletSlug}`
    );
  }

  async saveSplitGroupSettings(data: SplitGroupSettingsRequest): Promise<void> {
    await apiClient.post('split-group-settings', data);
  }

  async withdrawFromWallet(payload: WalletWithdrawRequest) {
    return apiClient.post<ApiSuccessResponse<unknown>>('settlements/withdraw', payload);
  }
}

export const walletService = new WalletService();
