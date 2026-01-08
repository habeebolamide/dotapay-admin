export interface Settlement {
  id: number;
  code: string;
  type: 'WITHDRAWAL' | 'SETTLEMENT';
  status: 'PENDING' | 'APPROVED' | 'FAILED' | 'CANCELLED';
  user_id: number;
  business_id: number;
  wallet_id: string;
  amount: number;
  bank_name: string | null;
  bank_code: string;
  bank_account_number: string;
  raw_data: any | null;
  is_reversal: number;
  outward_provider_id: number | null;
  provider_transaction_ref: string | null;
  meta: {
    description: string;
    bank_name: string | null;
    account_no: string;
    account_name: string;
    amount: number;
    [key: string]: any;
  };
  wallet_transaction_id: number | null;
  session_id: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SettlementListResponse {
  success: boolean;
  data: {
    current_page: number;
    data: Settlement[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export interface SettlementListParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  type?: string;
}

export interface CreateSettlementRequest {
  amount: number;
  bank_code: string;
  bank_account_number: string;
  description?: string;
}
