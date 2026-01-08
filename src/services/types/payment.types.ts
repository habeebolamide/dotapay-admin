export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded'
  | 'expired';

export type PaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'bank_transfer'
  | 'digital_wallet'
  | 'cryptocurrency'
  | 'paypal'
  | 'stripe'
  | 'razorpay';

export type TransactionType =
  | 'payment'
  | 'refund'
  | 'chargeback'
  | 'adjustment'
  | 'fee';

export type Currency =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'INR'
  | 'BTC'
  | 'ETH';

export interface PaymentAmount {
  amount: number;
  currency: Currency;
  formatted: string;
}

export interface PaymentCustomer {
  id?: string;
  email: string;
  name?: string;
  phone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export interface PaymentMetadata {
  order_id?: string;
  customer_id?: string;
  product_ids?: string[];
  notes?: string;
  [key: string]: any;
}

export interface CreatePaymentRequest {
  amount: number;
  currency: Currency;
  payment_method: PaymentMethod;
  customer: PaymentCustomer;
  description?: string;
  metadata?: PaymentMetadata;
  return_url?: string;
  cancel_url?: string;
  webhook_url?: string;
}

export interface Payment {
  id: string;
  amount: PaymentAmount;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  customer: PaymentCustomer;
  description?: string;
  metadata?: PaymentMetadata;
  gateway_transaction_id?: string;
  gateway_response?: Record<string, any>;
  failure_reason?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  captured_at?: string;
  refunded_at?: string;
}

export interface CapturePaymentRequest {
  amount?: number;
  description?: string;
}

export interface RefundPaymentRequest {
  amount?: number;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface PaymentRefund {
  id: string;
  payment_id: string;
  amount: PaymentAmount;
  reason?: string;
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  payment_id?: string;
  type: TransactionType;
  amount: PaymentAmount;
  status: PaymentStatus;
  description?: string;
  gateway_transaction_id?: string;
  gateway_response?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MerchantDashboard {
  total_payments: {
    count: number;
    amount: PaymentAmount;
  };
  pending_payments: {
    count: number;
    amount: PaymentAmount;
  };
  completed_payments: {
    count: number;
    amount: PaymentAmount;
  };
  failed_payments: {
    count: number;
    amount: PaymentAmount;
  };
  recent_transactions: Transaction[];
  payment_trends: {
    date: string;
    amount: number;
    count: number;
  }[];
}

export interface MerchantSettings {
  id: string;
  business_name: string;
  business_email: string;
  business_phone?: string;
  business_address?: PaymentCustomer['address'];
  website_url?: string;
  webhook_url?: string;
  webhook_secret?: string;
  payment_methods: PaymentMethod[];
  currencies: Currency[];
  auto_capture: boolean;
  payment_timeout: number;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  permissions: string[];
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
  is_active: boolean;
}

export interface CreateApiKeyRequest {
  name: string;
  permissions: string[];
  expires_at?: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_triggered_at?: string;
  failure_count: number;
}

export interface CreateWebhookRequest {
  url: string;
  events: string[];
  is_active?: boolean;
}

export interface PaymentGatewayProvider {
  id: string;
  name: string;
  slug: string;
  description: string;
  supported_methods: PaymentMethod[];
  supported_currencies: Currency[];
  is_enabled: boolean;
  configuration_fields: {
    field: string;
    label: string;
    type: 'text' | 'password' | 'select';
    required: boolean;
    options?: string[];
  }[];
}

// Payment List Types
export interface PaymentItem {
  unit_cost: number;
  quantity: number;
  split_group_id: string | null;
}

export interface AccountMetadata {
  code: string;
  mode: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  bank_code: string;
  service_provider: string;
  status: string;
  wallet_id: string | null;
  email: string;
  reference: string;
  customer_id: string | null;
  transaction_id: number;
  updated_at: string;
  created_at: string;
  id: number;
}

export interface PaymentTransaction {
  id: number;
  code: string;
  business_code: string;
  order_id: string;
  commercial_id: number;
  total_amount: number;
  total_amount_without_charges: number;
  amount_paid: number;
  amount_remaining: number;
  charge_amount: number;
  payment_date: string | null;
  items: PaymentItem[];
  reference: string;
  virtual_account_number: string;
  virtual_account_provider: string;
  split_config_id: string | null;
  ip_address: string;
  request_data: {
    public_key: string;
    items: PaymentItem[];
    customer_email: string;
    customer_name: string;
    order_id: string;
    fee_bearer: string;
  };
  fee_bearer: string;
  mode: string;
  is_reversed: boolean;
  account_metadata: AccountMetadata;
  success_url: string | null;
  failure_url: string | null;
  callback_url: string | null;
  transaction_type: string;
  link_id: string | null;
  status: 'PENDING' | 'APPROVED' | 'FAILED' | 'CANCELLED';
  charges_data: any;
  user_agent: string | null;
  device_id: string | null;
  client_os: string | null;
  client_browser: string | null;
  created_at: string;
  updated_at: string;
  meta: string | null;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaymentListResponse {
  success: boolean;
  data: {
    current_page: number;
    data: PaymentTransaction[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}