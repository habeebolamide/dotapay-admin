import { LARAVEL_CONFIG, API_ENDPOINTS } from '@/lib/laravel-config';
import { TokenStorage, type StoredUser } from '@/lib/token-storage';
import { AuthModel, UserModel, LanguageCode } from '@/auth/lib/models';

export interface LaravelLoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    phone?: string;
    email: string;
    roles: string[];
    permissions?: string[];
    image?: string;
    disabled?: boolean;
    status: string;
    pusher_id?: string;
    created_at: string;
    tenant?: string;
  };
  message: string;
}

export interface LaravelRegisterResponse {
  success: boolean;
  data: {
    user: {
      id: number;
      name: string;
      phone?: string;
      email: string;
      roles: string[];
      permissions?: string[];
      image?: string;
      disabled?: boolean;
      status: string;
      pusher_id?: string;
      created_at: string;
      tenant?: string;
    };
    token: string;
  };
  message: string;
}

export interface LaravelErrorResponse {
  message: string;
  data?: string;
  errors?: Record<string, string[]>;
}

export interface LaravelForgotPasswordResponse {
  success: boolean;
  data: {
    email: string;
    message: string;
    secret: string;
  };
}

export const LaravelAdapter = {
  async login(email: string, password: string): Promise<AuthModel> {
    console.log('LaravelAdapter: Attempting login with email:', email);

    try {
      const response = await fetch(`${LARAVEL_CONFIG.baseURL}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: LARAVEL_CONFIG.headers,
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as LaravelErrorResponse;
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const loginData = data as LaravelLoginResponse;
      console.log('LaravelAdapter: Login successful for user:', loginData.user.email);

      // Store token and user data
      TokenStorage.setToken(loginData.token);
      TokenStorage.setUser(loginData.user as StoredUser);

      // Return in AuthModel format for compatibility
      return {
        access_token: loginData.token,
        refresh_token: '', // Laravel typically uses single token
      };
    } catch (error) {
      console.error('LaravelAdapter: Login error:', error);
      throw error;
    }
  },

  async register(
    email: string,
    password: string,
    password_confirmation: string,
    name?: string
  ): Promise<AuthModel> {
    if (password !== password_confirmation) {
      throw new Error('Passwords do not match');
    }

    try {
      const response = await fetch(`${LARAVEL_CONFIG.baseURL}${API_ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: LARAVEL_CONFIG.headers,
        body: JSON.stringify({
          name: name || email.split('@')[0],
          email,
          password,
          password_confirmation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as LaravelErrorResponse;
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const registerData = data as LaravelRegisterResponse;

      // Store token and user data from the nested structure
      TokenStorage.setToken(registerData.data.token);
      TokenStorage.setUser(registerData.data.user as StoredUser);

      return {
        access_token: registerData.data.token,
        refresh_token: '',
      };
    } catch (error) {
      console.error('LaravelAdapter: Registration error:', error);
      throw error;
    }
  },

  async requestPasswordReset(email: string): Promise<string> {
    console.log('LaravelAdapter: Requesting password reset for:', email);

    try {
      const response = await fetch(`${LARAVEL_CONFIG.baseURL}${API_ENDPOINTS.AUTH.FORGOT_PASSWORD}`, {
        method: 'POST',
        headers: LARAVEL_CONFIG.headers,
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as LaravelErrorResponse;
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const forgotPasswordData = data as LaravelForgotPasswordResponse;
      console.log('LaravelAdapter: Password reset OTP sent successfully');

      // Return the secret for potential use in the reset flow
      return forgotPasswordData.data.secret;
    } catch (error) {
      console.error('LaravelAdapter: Password reset error:', error);
      throw error;
    }
  },

  async resetPassword(
    email: string,
    otp: string,
    password: string,
    password_confirmation: string
  ): Promise<void> {
    if (password !== password_confirmation) {
      throw new Error('Passwords do not match');
    }

    try {
      const response = await fetch(`${LARAVEL_CONFIG.baseURL}${API_ENDPOINTS.AUTH.RESET_PASSWORD}`, {
        method: 'POST',
        headers: LARAVEL_CONFIG.headers,
        body: JSON.stringify({
          email,
          otp,
          password,
          password_confirmation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as LaravelErrorResponse;
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('LaravelAdapter: Password reset successful');
    } catch (error) {
      console.error('LaravelAdapter: Password reset error:', error);
      throw error;
    }
  },

  getCurrentUserFromStorage(): UserModel | null {
    const storedUser = TokenStorage.getUser();
    if (!storedUser) return null;
    return this.transformToUserModel(storedUser);
  },

  async getCurrentUser(): Promise<UserModel | null> {
    const token = TokenStorage.getToken();
    if (!token) return null;

    // First try to get from storage
    const cachedUser = this.getCurrentUserFromStorage();
    if (cachedUser) {
      return cachedUser;
    }

    // Only fetch from API if we don't have cached user data
    try {
      const response = await fetch(`${LARAVEL_CONFIG.baseURL}${API_ENDPOINTS.AUTH.PROFILE}`, {
        method: 'GET',
        headers: {
          ...LARAVEL_CONFIG.headers,
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, clear storage
          TokenStorage.clearAll();
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const user = data.user || data;

      // Update stored user data
      TokenStorage.setUser(user as StoredUser);

      // Convert to UserModel format for compatibility
      return this.transformToUserModel(user);
    } catch (error) {
      console.error('LaravelAdapter: Get current user error:', error);
      // Don't clear token on error if we have cached user data
      const fallbackUser = this.getCurrentUserFromStorage();
      if (fallbackUser) {
        return fallbackUser;
      }
      // Only clear if we have no cached data
      TokenStorage.clearAll();
      return null;
    }
  },

  async getUserProfile(): Promise<UserModel> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user;
  },

  async updateUserProfile(userData: Partial<UserModel>): Promise<UserModel> {
    const token = TokenStorage.getToken();
    if (!token) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`${LARAVEL_CONFIG.baseURL}${API_ENDPOINTS.AUTH.PROFILE}`, {
        method: 'PUT',
        headers: {
          ...LARAVEL_CONFIG.headers,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const user = data.user || data;

      // Update stored user data
      TokenStorage.setUser(user as StoredUser);

      return this.transformToUserModel(user);
    } catch (error) {
      console.error('LaravelAdapter: Update profile error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    const token = TokenStorage.getToken();

    try {
      if (token) {
        await fetch(`${LARAVEL_CONFIG.baseURL}${API_ENDPOINTS.AUTH.LOGOUT}`, {
          method: 'POST',
          headers: {
            ...LARAVEL_CONFIG.headers,
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('LaravelAdapter: Logout API error (continuing with local logout):', error);
    } finally {
      // Always clear local storage
      TokenStorage.clearAll();
    }
  },

  transformToUserModel(laravelUser: any): UserModel {
    return {
      email: laravelUser.email || '',
      email_verified: true, // Assume verified if user exists
      username: laravelUser.email?.split('@')[0] || '',
      first_name: laravelUser.name?.split(' ')[0] || '',
      last_name: laravelUser.name?.split(' ').slice(1).join(' ') || '',
      fullname: laravelUser.name || '',
      occupation: '',
      company_name: '',
      phone: laravelUser.phone || '',
      roles: [], // Convert string roles to numbers if needed
      permissions: laravelUser.permissions || [],
      pic: laravelUser.image || '',
      language: 'en' as LanguageCode,
      is_admin: laravelUser.roles?.includes('admin') || false,
    };
  },

  // OAuth methods (not implemented for Laravel backend)
  async signInWithOAuth(): Promise<void> {
    throw new Error('OAuth login not implemented for Laravel backend');
  },

  async resendVerificationEmail(): Promise<void> {
    throw new Error('Email verification not implemented');
  },
};
