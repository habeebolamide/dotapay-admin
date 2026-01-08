import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/laravel-config';
import type {
  ComplianceDetailsResponse,
  BusinessInformationRequest,
  KYCDocumentsRequest,
  ShareholderInformationRequest,
  ComplianceDocumentRequest,
  ApiResponse,
} from '@/services/types/compliance.types';

export class ComplianceApi {
  /**
   * Get compliance details
   */
  async getComplianceDetails(): Promise<ComplianceDetailsResponse> {
    return apiClient.get<ComplianceDetailsResponse>(
      API_ENDPOINTS.COMPLIANCE.GET_DETAILS
    );
  }

  /**
   * Store business information
   */
  async storeBusinessInformation(
    data: BusinessInformationRequest
  ): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(
      API_ENDPOINTS.COMPLIANCE.STORE_BUSINESS_INFO,
      data
    );
  }

  /**
   * Store KYC documents
   * Note: This requires FormData for file uploads
   */
  async storeKYCDocuments(
    data: KYCDocumentsRequest | FormData
  ): Promise<ApiResponse<any>> {
    // If data is already FormData, send it directly
    if (data instanceof FormData) {
      return this.postFormData(
        API_ENDPOINTS.COMPLIANCE.STORE_KYC_DOCUMENTS,
        data
      );
    }

    // Otherwise, convert to FormData
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    return this.postFormData(
      API_ENDPOINTS.COMPLIANCE.STORE_KYC_DOCUMENTS,
      formData
    );
  }

  /**
   * Store shareholder and director information
   */
  async storeShareholderInformation(
    complianceId: number | string,
    data: ShareholderInformationRequest
  ): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(
      API_ENDPOINTS.COMPLIANCE.STORE_SHAREHOLDER_INFO(complianceId),
      data
    );
  }

  /**
   * Store compliance documents
   */
  async storeComplianceDocuments(
    complianceId: number | string,
    data: ComplianceDocumentRequest
  ): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(
      API_ENDPOINTS.COMPLIANCE.STORE_COMPLIANCE_DOCS(complianceId),
      data
    );
  }

  /**
   * Helper method to post FormData
   * This uses fetch directly because we need to send multipart/form-data
   */
  private async postFormData(
    endpoint: string,
    formData: FormData
  ): Promise<any> {
    const baseURL = import.meta.env.VITE_LARAVEL_API_URL;
    const url = `${baseURL}${endpoint}`;

    // Get token from storage
    const token = JSON.parse(localStorage.getItem('dotapay_auth_token') || 'null');
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    if (token) {
      headers.Authorization = `Bearer ${token.token}`;
    }

    // Don't set Content-Type header - browser will set it with boundary
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }
}

export const complianceApi = new ComplianceApi();
