

export interface CreateAutoSettlementConfigurationRequest {
  wallet_id: string;
  settlement_bank_id: string;
  minimum: string;
  frequency: string;
}


export interface AutoSettlement {
  id: number;
  code: string;
  settlement_bank_id: number;
  wallet_slug: string;
  wallet:{
    name: string;
    slug: string;
  },
  settlement_bank: {
    name: string;
    code: string;
    account_no: string;
  },
  frequency_label: string;
  minimum: number;
  created_at: string;
  updated_at: string;
  minimum_kobo: number;
}