import React, { useEffect, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuthStore } from '../components/Login/authStore';
import { ROUTES } from '../routes';
import { useNavigateStore } from '../Store/navigateStore';
import { parseEsiaHash } from '../utils/esiaAuth';

function AuthHashHandler() {
  const history = useHistory();
  const location = useLocation();
  const setUser = useAuthStore((state) => state.setUser);
  const handledRef = useRef('');

  useEffect(() => {
    const hash = location.hash || window.location.hash;
    if (!hash || handledRef.current === hash) return;

    const parsed = parseEsiaHash(hash);
    if (!parsed) return;

    handledRef.current = hash;

    if (parsed.kind === 'registr') {
      history.replace({ pathname: ROUTES.registr, hash: '' });
      return;
    }

    setUser(parsed.user);
    history.replace({ pathname: ROUTES.lics, hash: '' });
  }, [location.hash, history, setUser]);

  return null;
}

function NavigationSync() {
  const location = useLocation();
  const setCurrentPage = useNavigateStore((state) => state.setCurrentPage);

  useEffect(() => {
    if (!location.pathname.startsWith('/page/')) return;
    setCurrentPage(location.pathname);
  }, [location.pathname, setCurrentPage]);

  return null;
}

export function RouterSync() {
  return (
    <>
      <AuthHashHandler />
      <NavigationSync />
    </>
  );
}
