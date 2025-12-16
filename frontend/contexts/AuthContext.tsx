"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (login: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setIsLoading(false);
      
      if (!authenticated && typeof window !== "undefined") {
        const publicRoutes = ["/login", "/register", "/"];
        if (!publicRoutes.includes(window.location.pathname)) {
          router.push("/login");
        }
      }
    };

    checkAuth();

    const handleLogout = () => {
      setIsAuthenticated(false);
      router.push("/login");
    };

    window.addEventListener("auth:logout", handleLogout);

    const interval = setInterval(checkAuth, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, [router]);

  const login = async (login: string, password: string) => {
    try {
      await authService.login({ login, password });
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
