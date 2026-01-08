import { LARAVEL_CONFIG } from './laravel-config';
import { TokenStorage } from './token-storage';

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private handlingUnauthorized = false;

  constructor() {
    this.baseURL = LARAVEL_CONFIG.baseURL;
    this.timeout = LARAVEL_CONFIG.timeout;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = TokenStorage.getToken();

    const headers: Record<string, string> = {
      ...LARAVEL_CONFIG.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private handleUnauthorized() {
    if (this.handlingUnauthorized) return;
    this.handlingUnauthorized = true;
    TokenStorage.clearAll();
    if (typeof window !== 'undefined') {
      const logoutPath = '/';
      // Avoid redirect loops
      if (window.location.pathname !== logoutPath) {
        window.location.href = logoutPath;
      }
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        this.handleUnauthorized();
      }
      const error: ApiError = {
        message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        errors: errorData.errors,
        status: response.status,
      };
      throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();
    // Return the full response, let the service layer handle data extraction
    return data as T;
  }

  private createAbortController(): { controller: AbortController; timeoutId: NodeJS.Timeout } {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    return { controller, timeoutId };
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const { controller, timeoutId } = this.createAbortController();

    try {
      const headers = this.getAuthHeaders();
      const baseURL = this.baseURL.endsWith('/') ? this.baseURL : `${this.baseURL}/`;
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
      const url = new URL(cleanEndpoint, baseURL);

      if (params) {
        Object.keys(params).forEach(key => {
          // Skip internal parameters that start with underscore
          if (key.startsWith('_')) return;

          if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, String(params[key]));
          }
        });
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
        signal: controller.signal,
        credentials: LARAVEL_CONFIG.withCredentials ? 'include' : 'same-origin',
      });

      return this.handleResponse<T>(response);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const { controller, timeoutId } = this.createAbortController();

    try {
      const headers = this.getAuthHeaders();
      const baseURL = this.baseURL.endsWith('/') ? this.baseURL : `${this.baseURL}/`;
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
      const url = new URL(cleanEndpoint, baseURL);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
        credentials: LARAVEL_CONFIG.withCredentials ? 'include' : 'same-origin',
      });

      return this.handleResponse<T>(response);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const { controller, timeoutId } = this.createAbortController();

    try {
      const headers = this.getAuthHeaders();
      const baseURL = this.baseURL.endsWith('/') ? this.baseURL : `${this.baseURL}/`;
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
      const url = new URL(cleanEndpoint, baseURL);

      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
        credentials: LARAVEL_CONFIG.withCredentials ? 'include' : 'same-origin',
      });

      return this.handleResponse<T>(response);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const { controller, timeoutId } = this.createAbortController();

    try {
      const headers = this.getAuthHeaders();
      const baseURL = this.baseURL.endsWith('/') ? this.baseURL : `${this.baseURL}/`;
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
      const url = new URL(cleanEndpoint, baseURL);

      const response = await fetch(url.toString(), {
        method: 'PATCH',
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
        credentials: LARAVEL_CONFIG.withCredentials ? 'include' : 'same-origin',
      });

      return this.handleResponse<T>(response);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    const { controller, timeoutId } = this.createAbortController();

    try {
      const headers = this.getAuthHeaders();
      const baseURL = this.baseURL.endsWith('/') ? this.baseURL : `${this.baseURL}/`;
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
      const url = new URL(cleanEndpoint, baseURL);

      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers,
        signal: controller.signal,
        credentials: LARAVEL_CONFIG.withCredentials ? 'include' : 'same-origin',
      });

      return this.handleResponse<T>(response);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export const apiClient = new ApiClient();
