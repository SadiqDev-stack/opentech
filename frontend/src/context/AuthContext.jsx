import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authService from "@/services/auth";

const AuthContext = createContext(null);
const STORAGE_KEY = "opentech_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore unreadable storage
    }
    setLoading(false);
  }, []);

  function persist(nextUser) {
    setUser(nextUser);
    if (nextUser) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    else window.localStorage.removeItem(STORAGE_KEY);
  }

  const value = useMemo(() => {
    const role = user?.role || "GUEST";
    return {
      user,
      loading,
      isAuthenticated: Boolean(user),
      role,
      isAdmin: role === "ADMIN" || role === "SUPER_ADMIN",
      isSuperAdmin: role === "SUPER_ADMIN",
      async login(credentials) {
        const response = await authService.login(credentials);
        persist(response.data.user);
        return response.data.user;
      },
      async register(payload) {
        const response = await authService.register(payload);
        persist(response.data.user);
        return response.data.user;
      },
      async logout() {
        await authService.logout();
        persist(null);
      },
      updateUser(patch) {
        persist({ ...user, ...patch });
      },
    };
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
