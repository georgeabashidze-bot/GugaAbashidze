import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { adminApi, getToken, setToken } from '@/lib/adminApi';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'authed' | 'guest'

  const bootstrap = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setStatus('guest');
      return;
    }
    try {
      const me = await adminApi.me();
      setUser(me);
      setStatus('authed');
    } catch {
      setToken(null);
      setUser(null);
      setStatus('guest');
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = async (email, password) => {
    const data = await adminApi.login(email, password);
    setToken(data.access_token);
    setUser(data.user);
    setStatus('authed');
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setStatus('guest');
  };

  return (
    <AdminAuthContext.Provider value={{ user, status, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
