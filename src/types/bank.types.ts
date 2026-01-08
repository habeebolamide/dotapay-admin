export interface Bank {
  name: string;
  code: string;
  slug?: string;
}

export interface AccountLookupRequest {
  bank_code: string;
  account_number: string;
}

export interface AccountLookupResult {
  bank_name: string;
  account_name: string;
  account_number: string;
  bank_code: string;
  requests?: string;
  execution_time?: string;
}
