import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/laravel-config';
import { ApiSuccessResponse } from '@/types/pagination.types';
import {
  AccountLookupRequest,
  AccountLookupResult,
  Bank,
} from '@/types/bank.types';

class BankService {
  private unwrapResponse<T>(response: ApiSuccessResponse<T> | T): T {
    if (response && typeof response === 'object' && 'data' in (response as any)) {
      return (response as ApiSuccessResponse<T>).data;
    }
    return response as T;
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async getBanks(): Promise<Bank[]> {
    try {
      const response = await apiClient.get<ApiSuccessResponse<Bank[]> | Bank[]>(
        API_ENDPOINTS.BANKS.LIST
      );
      const banks = this.unwrapResponse(response);

      if (!Array.isArray(banks)) {
        throw new Error('Invalid bank list response');
      }

      return banks
        .map((bank: any) => {
          const name = bank?.name ?? bank?.bank_name ?? '';
          const code = bank?.code ?? bank?.bank_code ?? '';
          const slug = bank?.slug ?? bank?.bank_slug ?? this.slugify(name);

          return { name, code, slug } as Bank;
        })
        .filter((bank) => bank.name && bank.code);
    } catch (error) {
      console.error('Error fetching banks:', error);
      throw error;
    }
  }

  async fetchAccount(payload: AccountLookupRequest): Promise<AccountLookupResult> {
    try {
      const response = await apiClient.post<
        ApiSuccessResponse<AccountLookupResult | AccountLookupResult[]> | AccountLookupResult
      >(API_ENDPOINTS.BANKS.FETCH_ACCOUNT, payload);

      const data = this.unwrapResponse(response);
      const account = Array.isArray(data) ? data[0] : data;

      if (!account) {
        throw new Error((response as any)?.message ?? 'Unable to fetch account details');
      }

      return account as AccountLookupResult;
    } catch (error) {
      console.error('Error fetching account details:', error);
      throw error;
    }
  }
}

export const bankService = new BankService();
