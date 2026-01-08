'use client';

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { usePermissions } from '@/providers/permission-provider';

type RequirePermissionProps = {
  permission?: string;
  anyOf?: string[];
  allOf?: string[];
  redirectTo?: string;
};

export function RequirePermission({
  permission,
  anyOf,
  allOf,
  redirectTo = '/error/404',
}: RequirePermissionProps) {
  const location = useLocation();
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  const allowed =
    (permission && hasPermission(permission)) ||
    (anyOf && anyOf.length > 0 && hasAnyPermission(anyOf)) ||
    (allOf && allOf.length > 0 && hasAllPermissions(allOf)) ||
    (!permission && !anyOf?.length && !allOf?.length);

  if (!allowed) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
