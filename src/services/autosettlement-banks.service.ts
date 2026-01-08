import { apiClient } from "@/lib/api-client";
import { AutoSettlement, CreateAutoSettlementConfigurationRequest } from "@/types/autosettlement-bank.types";
import { ApiSuccessResponse, PaginatedResponse, PaginationParams } from "@/types/pagination.types";

export class AutoSettlementBanksService {
    private endpoint = 'auto-settlements';

    async createAutoSettlementConfig(data: CreateAutoSettlementConfigurationRequest): Promise<AutoSettlement> {
        const response = await apiClient.post<ApiSuccessResponse<AutoSettlement>>(
            this.endpoint,
            data
        );
        return response.data;
    }


    async getAutoSettlements(params?: PaginationParams): Promise<PaginatedResponse<AutoSettlement>> {
        const response = await apiClient.get<ApiSuccessResponse<PaginatedResponse<AutoSettlement>>>(
            this.endpoint,
            params
        );
        return response.data;
    }


    async deleteAutoSettlement(id: string | number): Promise<void> {
        await apiClient.delete(`${this.endpoint}/${id}`);
    }

    async updateAutoSettlement(id: string | number, data: CreateAutoSettlementConfigurationRequest): Promise<AutoSettlement> {
        const response = await apiClient.put<ApiSuccessResponse<AutoSettlement>>(
            `${this.endpoint}/${id}`,
            data
        );
        return response.data;
    }   

    async getAutoSettlementBank(id: string | number): Promise<AutoSettlement> {
        const response = await apiClient.get<ApiSuccessResponse<AutoSettlement>>(
            `${this.endpoint}/${id}`
        );
        return response.data;   
    }
}


export const autoSettlementBanksService = new AutoSettlementBanksService();