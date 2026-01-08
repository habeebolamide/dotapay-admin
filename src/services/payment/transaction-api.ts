import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/laravel-config';
import type {
  Transaction,
  PaginatedResponse,
  PaginationParams,
} from '@/services/types';

export interface TransactionFilters extends PaginationParams {
  status?: string;
  type?: string;
  payment_method?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  customer_email?: string;
}

export class TransactionApi {
  async getTransactions(
    filters?: TransactionFilters
  ): Promise<PaginatedResponse<Transaction>> {
    return apiClient.get<PaginatedResponse<Transaction>>(
      API_ENDPOINTS.TRANSACTIONS.LIST,
      filters
    );
  }

  async getTransaction(transactionId: string): Promise<Transaction> {
    return apiClient.get<Transaction>(
      API_ENDPOINTS.TRANSACTIONS.SHOW(transactionId)
    );
  }

  async getMerchantTransactions(
    filters?: TransactionFilters
  ): Promise<PaginatedResponse<Transaction>> {
    return apiClient.get<PaginatedResponse<Transaction>>(
      API_ENDPOINTS.TRANSACTIONS.MERCHANT_TRANSACTIONS,
      filters
    );
  }
}

export const transactionApi = new TransactionApi();