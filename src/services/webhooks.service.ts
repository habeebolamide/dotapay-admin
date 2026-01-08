import { apiClient } from "@/lib/api-client";
import { ApiSuccessResponse, PaginatedResponse, PaginationParams } from "@/types/pagination.types";
import { WebHook, WebhookLog, WebHooks } from "@/types/webhooks.types";

export class WebHooksService {
    private endpoint = 'webhooks';
    private webhooklogs = 'webhook-logs'

    async getWebHooks(): Promise<WebHook[]> {
        const response = await apiClient.get<ApiSuccessResponse<WebHooks>>(
            this.endpoint
        );
        return response.data.webhooks;
    }

    async getWebhookLogs(id: string | number, params?: PaginationParams): Promise<PaginatedResponse<WebhookLog>> {
        const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<WebhookLog>>>(
            `${this.endpoint}/${id}/logs`,
            params
        );
        return response.data;
    }

    async retryWebhookLog(id: string | number): Promise<any> {
        const response = await apiClient.post<ApiSuccessResponse<any>>(
            `${this.webhooklogs}/${id}/retry`,
        );
        return response.data;
    }
}


export const webHooksService = new WebHooksService();