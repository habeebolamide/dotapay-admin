'use client';

import { PropsWithChildren, ReactNode } from 'react';
import { usePermissions } from '@/providers/permission-provider';

type PermissionGateProps = PropsWithChildren<{
  permission?: string;
  anyOf?: string[];
  allOf?: string[];
  fallback?: ReactNode;
}>;

export function PermissionGate({
  permission,
  anyOf,
  allOf,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  const allowed =
    (permission && hasPermission(permission)) ||
    (anyOf && anyOf.length > 0 && hasAnyPermission(anyOf)) ||
    (allOf && allOf.length > 0 && hasAllPermissions(allOf));

  if (!permission && !anyOf?.length && !allOf?.length) {
    return <>{children}</>;
  }

  if (!allowed) return <>{fallback}</>;

  return <>{children}</>;
}
