const TOKEN_KEY = 'dotapay_auth_token';
const USER_KEY = 'dotapay_user_data';

export interface TokenData {
  token: string;
  expiresAt?: string;
}

export interface StoredUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  roles: string[];
  permissions?: string[];
  image?: string;
  disabled?: boolean;
  status: string;
  pusher_id?: string;
  created_at: string;
  tenant?: string;
  active_business_id?: number | null;
}

export class TokenStorage {
  static setToken(token: string, expiresAt?: string): void {
    try {
      const tokenData: TokenData = { token, expiresAt };
      localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData));
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }

  static getToken(): string | null {
    try {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (!stored) return null;

      const tokenData: TokenData = JSON.parse(stored);

      // Check if token is expired
      if (tokenData.expiresAt) {
        const expiryDate = new Date(tokenData.expiresAt);
        if (expiryDate <= new Date()) {
          this.clearToken();
          return null;
        }
      }

      return tokenData.token;
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      this.clearToken();
      return null;
    }
  }

  static clearToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to clear token:', error);
    }
  }

  static setUser(user: StoredUser): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }

  static getUser(): StoredUser | null {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      this.clearUser();
      return null;
    }
  }

  static clearUser(): void {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Failed to clear user data:', error);
    }
  }

  static updateUser(updates: Partial<StoredUser>): StoredUser | null {
    try {
      const currentUser = this.getUser();
      if (!currentUser) {
        return null;
      }

      const updatedUser: StoredUser = {
        ...currentUser,
        ...updates,
      };

      this.setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Failed to update user data:', error);
      return null;
    }
  }

  static clearAll(): void {
    this.clearToken();
    this.clearUser();
  }

  static isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }
}
