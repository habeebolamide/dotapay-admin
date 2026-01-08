export interface Business {
  id: number;
  code: string;
  user_id: number;
  team_id?: number | null;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  logo?: string | null;
  public_key?: string | null;
  private_key?: string | null;
  demo_public_key?: string | null;
  demo_private_key?: string | null;
  is_sandbox?: boolean;
  webhook_url?: string | null;
  webhook_sandbox_url?: string | null;
  commercial_id?: string | null;
}

export interface CreateBusinessRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  logo?: string;
  is_sandbox?: boolean;
  webhook_url?: string;
  webhook_sandbox_url?: string;
}

export type UpdateBusinessRequest = Partial<{
  name: string;
  email: string;
  phone?: string;
  address?: string;
  logo?: string;
  is_sandbox?: boolean;
  webhook_url?: string;
  webhook_sandbox_url?: string;
}>;

export interface SwitchBusinessRequest {
  business_id: number;
}
