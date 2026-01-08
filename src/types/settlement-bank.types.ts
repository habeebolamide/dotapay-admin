export interface SettlementBank {
  id: number;
  code: string;
  business_id: number;
  name: string;
  account_no: string;
  account_name: string;
  bank_code: string;
  bank_slug: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSettlementBankRequest {
  name: string;
  account_no: string;
  account_name: string;
  bank_code: string;
  bank_slug: string;
}

export interface SettlementBanksResponse {
  success: boolean;
  data: {
    current_page: number;
    data: SettlementBank[];
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