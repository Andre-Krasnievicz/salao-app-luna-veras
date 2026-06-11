"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { authApi } from "@/lib/api";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await authApi.me();
      setUser(res.data);
      Cookies.set("session_role", res.data.role, { expires: 1, sameSite: "lax" });
    } catch {
      setUser(null);
      Cookies.remove("session_role");
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await authApi.login(email, password);
    const userData: User = res.data.user;
    setUser(userData);
    Cookies.set("session_role", userData.role, { expires: 1, sameSite: "lax" });
    return userData;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      Cookies.remove("session_role");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
