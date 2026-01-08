export interface SubAccount {
  id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  accountAlias: string;
  percentage: number;
}

export interface TransactionSplit {
  id: string;
  name: string;
  splitType: 'percentage' | 'flat';
  currency: string;
  code: string;
  created: string;
  status: 'active' | 'inactive';
  subAccounts: SubAccount[];
  transactionFee: {
    amount: number;
    deductFrom: 'all-accounts' | 'all-proportional' | 'your-account' | string; // string for specific subaccount ID
  };
}

export interface CreateSplitGroupRequest {
  name: string;
  splitType: 'percentage';
}

export interface CreateSubAccountRequest {
  bankName: string;
  accountNumber: string;
  accountAlias: string;
}

export interface SplitFilterState {
  search: string;
  subAccount?: string;
  status?: string[];
  splitType?: string[];
  category?: string[];
}