import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ScreenLoader } from '@/components/common/screen-loader';
import { TokenStorage } from '@/lib/token-storage';

const BUSINESS_CREATION_PATH = '/businesses';

export function RequireActiveBusiness() {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [hasActiveBusiness, setHasActiveBusiness] = useState(false);

  useEffect(() => {
    const storedUser = TokenStorage.getUser();
    setHasActiveBusiness(Boolean(storedUser?.active_business_id));
    setChecking(false);
  }, [location.key]);

  if (checking) {
    return <ScreenLoader />;
  }

  if (!hasActiveBusiness && !location.pathname.startsWith(BUSINESS_CREATION_PATH)) {
    return (
      <Navigate
        to={`${BUSINESS_CREATION_PATH}?next=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return <Outlet />;
}
