import { PropsWithChildren, useEffect, useState } from 'react';
import { LaravelAdapter } from '@/auth/adapters/laravel-adapter';
import { AuthContext } from '@/auth/context/auth-context';
import { TokenStorage } from '@/lib/token-storage';
import { AuthModel, UserModel } from '@/auth/lib/models';

export function AuthProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<AuthModel | undefined>();
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    setIsAdmin(currentUser?.is_admin === true);
  }, [currentUser]);

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = TokenStorage.getToken();
        if (token) {
          // First try to get user from storage (faster)
          const storedUser = TokenStorage.getUser();
          if (storedUser) {
            setAuth({ access_token: token, refresh_token: '' });
            setCurrentUser(LaravelAdapter.transformToUserModel(storedUser));
          }

          // Then verify with server
          const user = await LaravelAdapter.getCurrentUser();
          if (user) {
            setAuth({ access_token: token, refresh_token: '' });
            setCurrentUser(user);
          } else {
            TokenStorage.clearAll();
            setAuth(undefined);
            setCurrentUser(undefined);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        TokenStorage.clearAll();
        setAuth(undefined);
        setCurrentUser(undefined);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const verify = async () => {
    if (auth) {
      try {
        const user = await getUser();
        setCurrentUser(user || undefined);
      } catch {
        saveAuth(undefined);
        setCurrentUser(undefined);
      }
    }
  };

  const saveAuth = (auth: AuthModel | undefined) => {
    setAuth(auth);
    if (!auth) {
      TokenStorage.clearAll();
    } else {
      // Ensure token is stored when auth state is set
      TokenStorage.setToken(auth.access_token);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const auth = await LaravelAdapter.login(email, password);
      saveAuth(auth);

      // Get user data from storage (login already stored it)
      const user = LaravelAdapter.getCurrentUserFromStorage();
      if (user) {
        setCurrentUser(user);
      } else {
        // If we can't get user data, clear auth
        saveAuth(undefined);
        throw new Error('Failed to retrieve user data after login');
      }
    } catch (error) {
      saveAuth(undefined);
      setCurrentUser(undefined);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    password_confirmation: string,
    firstName?: string,
    lastName?: string,
  ) => {
    try {
      setLoading(true);
      const fullName = firstName && lastName ? `${firstName} ${lastName}` : firstName;
      const auth = await LaravelAdapter.register(email, password, password_confirmation, fullName);
      saveAuth(auth);

      // Get user data from storage (register already stored it)
      const user = LaravelAdapter.getCurrentUserFromStorage();
      if (user) {
        setCurrentUser(user);
      } else {
        // If we can't get user data, clear auth
        saveAuth(undefined);
        throw new Error('Failed to retrieve user data after registration');
      }
    } catch (error) {
      saveAuth(undefined);
      setCurrentUser(undefined);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    const secret = await LaravelAdapter.requestPasswordReset(email);
    // You could store the secret in state if needed for the reset flow
    return secret;
  };

  const resetPassword = async (
    email: string,
    otp: string,
    password: string,
    password_confirmation: string,
  ) => {
    await LaravelAdapter.resetPassword(email, otp, password, password_confirmation);
  };

  const resendVerificationEmail = async (email: string) => {
    await LaravelAdapter.resendVerificationEmail();
  };

  const getUser = async () => {
    return await LaravelAdapter.getCurrentUser();
  };

  const updateProfile = async (userData: Partial<UserModel>) => {
    const updatedUser = await LaravelAdapter.updateUserProfile(userData);
    setCurrentUser(updatedUser);
    return updatedUser;
  };

  const logout = () => {
    LaravelAdapter.logout();
    saveAuth(undefined);
    setCurrentUser(undefined);
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        setLoading,
        auth,
        saveAuth,
        user: currentUser,
        setUser: setCurrentUser,
        login,
        register,
        requestPasswordReset,
        resetPassword,
        resendVerificationEmail,
        getUser,
        updateProfile,
        logout,
        verify,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}