"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  loginWithToken: (token: string, user: AuthUser) => void;
  updateLocalUser: (updates: Partial<AuthUser>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  loginWithToken: () => {},
  updateLocalUser: () => {},
  logout: () => {},
});

const TOKEN_KEY = "rc_auth_token";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  }, []);

  const saveAuth = useCallback((t: string, u: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    setUser(u);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setIsLoading(false);
      return;
    }

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${stored}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Invalid token");
        return r.json();
      })
      .then(({ user: u }: { user: AuthUser }) => {
        setToken(stored);
        setUser(u);
      })
      .catch(() => {
        // /api/auth/me failed — try to decode the JWT locally as a fallback
        // This allows local-admin to work even when Firebase/network is unavailable
        try {
          const parts = stored.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const nowSec = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp > nowSec && payload.id && payload.email && payload.role) {
              // Token is still valid — restore user from JWT payload
              setToken(stored);
              setUser({
                id: payload.id,
                name: payload.name ?? (payload.role === "admin" ? "Admin" : "User"),
                email: payload.email,
                role: payload.role,
                phone: null,
                avatarUrl: null,
              });
              return; // Don't clear token
            }
          }
        } catch {
          // JWT decode failed — token is corrupt, clear it
        }
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setIsLoading(false));
  }, []);


  useEffect(() => {
    const handleForceLogout = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener("auth:logout", handleForceLogout);
    return () => window.removeEventListener("auth:logout", handleForceLogout);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const r = await fetch("/api/auth/smart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Login failed");
      if (data.status === "new_user") throw new Error("No account found with this email. Please register.");
      saveAuth(data.token, data.user);
    },
    [saveAuth]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string, phone?: string) => {
      const r = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Signup failed");
      saveAuth(data.token, data.user);
    },
    [saveAuth]
  );

  const loginWithToken = useCallback(
    (t: string, u: AuthUser) => {
      saveAuth(t, u);
    },
    [saveAuth]
  );

  const updateLocalUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, loginWithToken, updateLocalUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
