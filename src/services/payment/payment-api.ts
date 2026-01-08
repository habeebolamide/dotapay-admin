import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/laravel-config';
import type {
  Payment,
  CreatePaymentRequest,
  CapturePaymentRequest,
  RefundPaymentRequest,
  PaymentRefund,
  PaymentListResponse,
} from '@/services/types/payment.types';

export interface PaymentListParams {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
}

export class PaymentApi {
  async listPayments(params?: PaymentListParams): Promise<PaymentListResponse> {
    return apiClient.get<PaymentListResponse>(API_ENDPOINTS.PAYMENTS.LIST, params);
  }

  async createPayment(data: CreatePaymentRequest): Promise<Payment> {
    return apiClient.post<Payment>(API_ENDPOINTS.PAYMENTS.CREATE, data);
  }

  async getPayment(paymentId: string): Promise<Payment> {
    return apiClient.get<Payment>(API_ENDPOINTS.PAYMENTS.SHOW(paymentId));
  }

  async capturePayment(
    paymentId: string,
    data?: CapturePaymentRequest
  ): Promise<Payment> {
    return apiClient.post<Payment>(
      API_ENDPOINTS.PAYMENTS.CAPTURE(paymentId),
      data
    );
  }

  async refundPayment(
    paymentId: string,
    data: RefundPaymentRequest
  ): Promise<PaymentRefund> {
    return apiClient.post<PaymentRefund>(
      API_ENDPOINTS.PAYMENTS.REFUND(paymentId),
      data
    );
  }

  async cancelPayment(paymentId: string): Promise<Payment> {
    return apiClient.post<Payment>(API_ENDPOINTS.PAYMENTS.CANCEL(paymentId));
  }
}

export const paymentApi = new PaymentApi();