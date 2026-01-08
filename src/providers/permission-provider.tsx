'use client';

import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { useAuth } from '@/auth/context/auth-context';
import { TokenStorage } from '@/lib/token-storage';

type PermissionContextValue = {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
};

const PermissionContext = createContext<PermissionContextValue>({
  permissions: [],
  hasPermission: () => false,
  hasAnyPermission: () => false,
  hasAllPermissions: () => false,
});

export function PermissionProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    const storedPermissions = TokenStorage.getUser()?.permissions ?? [];
    const userPermissions = user?.permissions ?? [];
    // Normalize and dedupe permissions
    return Array.from(new Set([...(storedPermissions || []), ...(userPermissions || [])]));
  }, [user]);

  const hasPermission = (permission: string) => permissions.includes(permission);

  const hasAnyPermission = (required: string[]) =>
    required.some((permission) => hasPermission(permission));

  const hasAllPermissions = (required: string[]) =>
    required.every((permission) => hasPermission(permission));

  const value = useMemo(
    () => ({
      permissions,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
    }),
    [permissions],
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermissions() {
  return useContext(PermissionContext);
}
