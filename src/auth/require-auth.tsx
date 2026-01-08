import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ScreenLoader } from '@/components/common/screen-loader';
import { useAuth } from './context/auth-context';
import { TokenStorage } from '@/lib/token-storage';

/**
 * Component to protect routes that require authentication.
 * If user is not authenticated, redirects to the login page.
 */
export const RequireAuth = () => {
  const { auth, loading: globalLoading, user } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Check if we have a token in storage
      const token = TokenStorage.getToken();

      // If we have a token but no auth state yet, wait for provider to initialize
      if (token && !auth?.access_token && globalLoading) {
        return; // Keep checking true, let provider finish initialization
      }

      // If provider finished loading, we can make the decision
      if (!globalLoading) {
        setChecking(false);
      }
    };

    checkAuth();
  }, [auth, globalLoading]);

  // Show screen loader while checking authentication or provider is loading
  if (checking || globalLoading) {
    return <ScreenLoader />;
  }

  // Check both auth state and token storage for authentication
  const isAuthenticated = auth?.access_token || TokenStorage.getToken();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/auth/signin?next=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // If authenticated, render child routes
  return <Outlet />;
};
