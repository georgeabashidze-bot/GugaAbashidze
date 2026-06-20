import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, formatApiError } from "@/cabinet/lib/api";

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  exchangeGoogleSession: async () => {},
  logout: async () => {},
  refresh: async () => {},
  setUser: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
      return data;
    } catch (_e) {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    // CRITICAL: If returning from Google OAuth (session_id in URL fragment),
    // let AuthCallback exchange it FIRST. Skip /me here to avoid race.
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    if (typeof window !== "undefined" && window.location.hash?.includes("session_id=")) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      await refresh();
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [refresh]);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setUser(data);
      return { ok: true, user: data };
    } catch (e) {
      return { ok: false, error: formatApiError(e) };
    }
  }, []);

  const register = useCallback(async (payload) => {
    try {
      const { data } = await api.post("/auth/register", payload);
      setUser(data);
      return { ok: true, user: data };
    } catch (e) {
      return { ok: false, error: formatApiError(e) };
    }
  }, []);

  const exchangeGoogleSession = useCallback(async (session_id) => {
    try {
      const { data } = await api.post("/auth/google/session", { session_id });
      setUser(data);
      return { ok: true, user: data };
    } catch (e) {
      return { ok: false, error: formatApiError(e) };
    }
  }, []);

  const logout = useCallback(async () => {
    try { await api.post("/auth/logout"); } catch (_) {}
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, exchangeGoogleSession, logout, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
