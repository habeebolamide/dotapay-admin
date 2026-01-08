import { apiClient } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/laravel-config';
import type {
  AuditLog,
  AuditLogListResponse,
  AuditLogListParams,
} from '@/types/audit-log.types';

export class AuditLogApi {
  async listAuditLogs(params?: AuditLogListParams): Promise<AuditLogListResponse> {
    return apiClient.get<AuditLogListResponse>(API_ENDPOINTS.AUDIT_LOGS.LIST, params);
  }

  async getAuditLog(logId: string): Promise<AuditLog> {
    return apiClient.get<AuditLog>(API_ENDPOINTS.AUDIT_LOGS.SHOW(logId));
  }
}

export const auditLogApi = new AuditLogApi();
