export const LARAVEL_CONFIG = {
  baseURL: import.meta.env.VITE_LARAVEL_API_URL,
  timeout: 10000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
} as const;

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    PROFILE: '/auth/profile',
  },

  // Payment endpoints
  PAYMENTS: {
    LIST: '/payment/list',
    CREATE: '/payments',
    SHOW: (id: string) => `/payments/${id}`,
    CAPTURE: (id: string) => `/payments/${id}/capture`,
    REFUND: (id: string) => `/payments/${id}/refund`,
    CANCEL: (id: string) => `/payments/${id}/cancel`,
  },

  // Transaction endpoints
  TRANSACTIONS: {
    LIST: '/transactions',
    SHOW: (id: string) => `/transactions/${id}`,
    MERCHANT_TRANSACTIONS: '/transactions/merchant',
  },

  // Merchant endpoints
  MERCHANT: {
    DASHBOARD: '/merchants/dashboard',
    SETTINGS: '/merchants/settings',
    UPDATE_SETTINGS: '/merchants/settings',
    API_KEYS: '/merchants/api-keys',
    WEBHOOKS: '/merchants/webhooks',
  },

  // Gateway endpoints
  GATEWAY: {
    PROVIDERS: '/gateway/providers',
    CONFIGURE: '/gateway/configure',
    TEST_CONNECTION: '/gateway/test',
  },

  // Audit log endpoints
  AUDIT_LOGS: {
    LIST: '/audit-logs',
    SHOW: (id: string) => `/audit-logs/${id}`,
  },

  // Settlement/Withdrawal endpoints
  SETTLEMENTS: {
    LIST: '/settlements',
    CREATE: '/settlements',
    SHOW: (id: string) => `/settlements/${id}`,
    APPROVE: (id: string) => `/settlements/${id}/approve`,
    CANCEL: (id: string) => `/settlements/${id}/cancel`,
  },

  // Compliance endpoints
  COMPLIANCE: {
    GET_DETAILS: '/compliance',
    STORE_BUSINESS_INFO: '/compliance/business-information',
    STORE_KYC_DOCUMENTS: '/compliance/kyc-documents',
    STORE_SHAREHOLDER_INFO: (id: string | number) => `/compliance/personnel-information`,
    STORE_COMPLIANCE_DOCS: (id: string | number) => `/compliance/compliance-information`,
  },
  UPLOAD: {
    IMAGE: '/upload-image',
  },

  DASHBOARD: {
    STATISTICS: '/dashboard/statistics',
    REVENUE_CHART: '/admin-stats/revenue-chart',
    WALLET_CHART: '/dashboard/wallet-chart',
  },

  // RBAC endpoints
  RBAC: {
    ROLES: '/rbac/roles',
    PERMISSIONS: '/rbac/permissions',
    CREATE_ROLE: '/rbac/role',
    UPDATE_ROLE: (id: string | number) => `/rbac/update-role/${id}`,
  },

  USER_MANAGEMENT: {
    USERS: '/user-management/users',
    STORE_USER: '/user-management/store-user',
    UPDATE_USER: (id: string | number) => `/user-management/update-user/${id}`,
    DELETE_USER: (id: string | number) => `/user-management/delete-user/${id}`,
  },

  // Bank endpoints
  BANKS: {
    LIST: '/banks',
    FETCH_ACCOUNT: '/fetch-account',
  },
} as const;
