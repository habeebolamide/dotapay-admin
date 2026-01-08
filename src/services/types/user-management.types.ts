import type { PaginationLink } from '@/types/pagination.types';

export interface TeamMember {
  id: number;
  name: string;
  phone?: string | null;
  email: string;
  roles: string[];
  permissions: string[];
  image?: string | null;
  disabled?: boolean | null;
  status?: string;
  pusher_id?: string;
  created_at?: string;
  active_business_id?: string | number | null;
  tenant?: string;
  single_login?: number | boolean | null;
}

interface TeamMemberPayloadBase {
  name: string;
  email: string;
  role: string;
  password?: string;
  password_confirmation?: string;
}

export interface CreateTeamMemberRequest extends TeamMemberPayloadBase {
  password: string;
  password_confirmation: string;
}

export interface UpdateTeamMemberRequest extends TeamMemberPayloadBase {}

export interface TeamMembersResponse {
  success: boolean;
  data: {
    data: TeamMember[];
    links?: {
      first: string;
      last: string;
      prev: string | null;
      next: string | null;
    };
    meta?: {
      current_page: number;
      from: number;
      last_page: number;
      path: string;
      per_page: number;
      to: number;
      total: number;
      links?: PaginationLink[];
    };
  };
  message?: string;
}
