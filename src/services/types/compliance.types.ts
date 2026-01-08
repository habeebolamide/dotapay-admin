// Compliance API Types
export interface Director {
  id?: number;
  business_compliance_id?: number;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  bvn?: string;
  nin?: string;
  id_type: string;
  id_number: string;
  percentage_shareholding?: string;
  residential_address: string;
  valid_id_document: string | File;
  proof_of_address: string | File;
  created_at?: string;
  updated_at?: string;
}

export interface Shareholder {
  id?: number;
  business_compliance_id?: number;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  bvn?: string;
  nin?: string;
  id_type: string;
  id_number: string;
  percentage_shareholding?: string;
  residential_address: string;
  valid_id_document: string | File;
  proof_of_address: string | File;
  created_at?: string;
  updated_at?: string;
}

export interface BankAccount {
  id?: number;
  business_compliance_id?: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  account_type: 'savings' | 'current';
  bvn: string;
  primary_settlement_account: number;
  verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ComplianceDocuments {
  id?: number;
  business_id?: number;
  business_name?: string;
  rc_number?: string;
  postal_code?: string;
  tin_number?: string;
  business_type?: string;
  incorporation_date?: string;
  business_nature?: string;
  business_address?: string;
  city?: string;
  state?: string;
  country?: string;
  business_email?: string;
  business_phone?: string;
  business_website?: string;
  estimated_annual_revenue?: string;
  number_of_employees?: string;
  cac1_document?: string;
  cac_form_2?: string;
  memorandom_and_articles_of_association?: string;
  tax_clearance_certificate?: string;
  business_permit?: string;
  proof_of_address?: string;
  aml_policy_description?: string;
  data_protection_measures?: string;
  expected_monthly_transaction_volume?: string;
  expected_monthly_transaction_value?: string;
  source_of_business_funds?: string;
  aml_cft_policy_document?: string;
  kyc_cdd_policy?: string;
  data_protection_policy_document?: string;
  business_plan_document?: string;
  audited_financial_statements_document?: string;
  no_money_laundering?: number;
  business_does_not_finance_terrorism?: number;
  accurate_data_provided?: number;
  cbn_and_nfiu_regulations_compliant?: number;
  ndpr_compliant?: number;
  created_at?: string;
  updated_at?: string;
  directors?: Director[];
  shareholders?: Shareholder[];
  bank_accounts?: BankAccount[];
}

export interface BusinessInformationRequest {
  business_name: string;
  business_type: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  business_website?: string;
  business_description?: string;
  city: string;
  rc_number: string;
  tin_number: string;
  incorporation_date: string;
  state: string;
  postal_code?: string;
  estimated_annual_revenue: string;
  number_of_employees: string;
  business_nature: string;
}

export interface KYCDocumentsRequest {
  business_name: string;
  business_type: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  business_website?: string;
  business_description?: string;
  cac1_document: File | string;
  cac_form_2: File | string;
  memorandom_and_articles_of_association: File | string;
  tax_clearance_certificate: File | string;
  business_permit?: File | string;
  proof_of_address: File | string;
}

export interface ShareholderInformationRequest {
  directors: Array<{
    full_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    bvn?: string;
    nin?: string;
    residential_address: string;
    id_type: string;
    id_number: string;
    percentage_shareholding?: string;
    valid_id_document: File | string;
    proof_of_address: File | string;
  }>;
  shareholders: Array<{
    full_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    bvn?: string;
    nin?: string;
    residential_address: string;
    id_type: string;
    id_number: string;
    percentage_shareholding?: string;
    valid_id_document: File | string;
    proof_of_address: File | string;
  }>;
}

export interface ComplianceDocumentRequest {
  aml_policy_description: string;
  data_protection_measures: string;
  expected_monthly_transaction_volume: string;
  expected_monthly_transaction_value: string;
  source_of_business_funds?: string;
  aml_cft_policy_document?: File | string;
  kyc_cdd_policy?: File | string;
  data_protection_policy_document?: File | string;
  business_plan_document?: File | string;
  audited_financial_statements_document?: File | string;
  no_money_laundering: boolean;
  business_does_not_finance_terrorism: boolean;
  accurate_data_provided: boolean;
  cbn_and_nfiu_regulations_compliant: boolean;
  ndpr_compliant: boolean;
}

export interface ComplianceDetailsResponse {
  success: boolean;
  data: {
    compliance_documents: ComplianceDocuments;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
