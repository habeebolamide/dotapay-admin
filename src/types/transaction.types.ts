export interface Transaction {
  id: number;
  payable_type: string;
  payable_id: number;
  wallet_id: number;
  type: 'deposit' | 'withdrawal';
  amount: number;
  confirmed: boolean;
  meta: {
    sessionId?: string;
    sender_account_name?: string;
    sender_account_bank?: string;
    sender_bank_code?: string;
    action?: string;
    funding_ref?: string;
    customer_id?: number;
    sender_wallet_slug?: string;
    provider_credit_id?: number;
    [key: string]: any;
  };
  uuid: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CustomerTransactionsResponse {
  current_page: number;
  data: Transaction[];
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
}