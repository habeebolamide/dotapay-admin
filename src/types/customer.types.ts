export interface VirtualAccount {
  id: number;
  code: string;
  customer_id: number;
  account_name: string;
  account_number: string;
  bank_name: string;
  bank_code: string;
  service_provider: string;
  status: string;
  reference: string;
  email: string;
  block_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  slug: string;
  balance: string;
  balanceKobo: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  code: string;
  business_id: number;
  reference: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  wallet_id: string;
  type: 'wallet' | 'collection';
  collection_wallet: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
  wallet?: Wallet;
  virtual_accounts?: VirtualAccount[];
}

export interface CreateCustomerRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  type: 'wallet' | 'collection';
  reference: string;
  collection_wallet?: string;
  wallet_id?: string;
}

export interface CustomerFilterState {
  search: string;
  status?: string[];
  dateRange: string;
}
