"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  mobile?: string;
  image?: string;
  token?: string; // This MUST be saved here to avoid "Bearer null"
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, token: string) => void; // Added token parameter
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
    const loadSession = () => {
      try {
        const savedUser = localStorage.getItem("eprx_session");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.error("SESSION_CORRUPT:", e);
        localStorage.removeItem("eprx_session");
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  // Updated login to accept both user info and the JWT string
  const login = (userData: User, token: string) => {
    // Merge the token INTO the user object so it's saved in localStorage
    const sessionData = { ...userData, token };

    setUser(sessionData);
    localStorage.setItem("eprx_session", JSON.stringify(sessionData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("eprx_session");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
