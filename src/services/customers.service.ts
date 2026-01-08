import { apiClient } from '@/lib/api-client';
import { Customer, CreateCustomerRequest, VirtualAccount } from '@/types/customer.types';
import { ApiSuccessResponse, PaginatedResponse, PaginationParams } from '@/types/pagination.types';
import { CustomerTransactionsResponse } from '@/types/transaction.types';

export class CustomersService {
  private endpoint = '/customers';

  async getCustomers(params?: PaginationParams): Promise<PaginatedResponse<Customer>> {
    const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<Customer>>>(
      this.endpoint,
      params
    );
    return response.data;
  }

  async getCustomer(id: string | number): Promise<Customer> {
    const response = await apiClient.get<ApiSuccessResponse<Customer>>(
      `${this.endpoint}/${id}`
    );
    return response.data;
  }

  async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
    const response = await apiClient.post<ApiSuccessResponse<Customer>>(
      this.endpoint,
      data
    );
    return response.data;
  }

  async updateCustomer(id: string | number, data: Partial<CreateCustomerRequest>): Promise<Customer> {
    const response = await apiClient.put<ApiSuccessResponse<Customer>>(
      `${this.endpoint}/${id}`,
      data
    );
    return response.data;
  }

  async deleteCustomer(id: string | number): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }

  async getCustomerTransactions(id: string | number, params?: PaginationParams): Promise<CustomerTransactionsResponse> {
    const response = await apiClient.get<ApiSuccessResponse<CustomerTransactionsResponse>>(
      `${this.endpoint}/${id}/transactions`,
      params
    );
    return response.data;
  }

  async createVirtualAccount(id: string | number): Promise<VirtualAccount> {
    const response = await apiClient.post<ApiSuccessResponse<VirtualAccount>>(
      `${this.endpoint}/${id}/virtual-accounts`
    );

    return response.data;
  }
}

export const customersService = new CustomersService();
