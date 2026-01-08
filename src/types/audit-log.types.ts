export interface AuditLog {
  id: number;
  log_name: string;
  description: string;
  subject_type: string | null;
  event: string | null;
  subject_id: number | null;
  causer_type: string;
  causer_id: number;
  properties: {
    type?: string;
    [key: string]: any;
  };
  batch_uuid: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLogListResponse {
  success: boolean;
  data: {
    current_page: number;
    data: AuditLog[];
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

export interface AuditLogListParams {
  page?: number;
  per_page?: number;
  search?: string;
  log_name?: string;
  event?: string;
}
