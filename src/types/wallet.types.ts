export interface Wallet {
  name: string;
  slug: string;
  balance: string;
  balanceKobo: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWalletRequest {
  name: string;
}

export interface UpdateWalletRequest {
  name: string;
}

export interface WalletTransaction {
  id: number;
  payable_type: string;
  payable_id: number;
  wallet_id: number;
  type: string;
  amount: number;
  confirmed: boolean | number;
  meta: Record<string, any> | string | null;
  uuid: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WalletTransactionsResponse {
  data: WalletTransaction[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface WalletWithdrawRequest {
  wallet_id: string;
  amount: string | number;
  settlement_bank_id: string;
}

export interface WalletSetting {
  wallet_id: string;
  amount: number;
}

export interface SplitGroupSettingsRequest {
  split_group_id: number;
  settings: WalletSetting[];
}

export interface WalletSettingFormData {
  wallet_id: string;
  name: string;
  wallet_slug: string;
  percentage: number;
}
