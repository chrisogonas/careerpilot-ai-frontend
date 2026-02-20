"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, AuthContextType, AuthResponse } from "@/lib/types";
import { apiClient } from "@/lib/utils/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to convert AuthResponse to User
function authResponseToUser(response: AuthResponse): User {
  return {
    id: response.user_id,
    email: response.email,
    full_name: response.full_name,
    is_verified: "verified",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresTwoFA, setRequiresTwoFA] = useState(false);
  const [tempAuthData, setTempAuthData] = useState<AuthResponse | null>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("careerpilot_token");
        if (token) {
          // Verify token is still valid by trying to refresh
          try {
            const response = await apiClient.refreshToken();
            setUser(authResponseToUser(response));
          } catch (err) {
            // Token is invalid, clear it
            localStorage.removeItem("careerpilot_token");
            setUser(null);
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.login(email, password);
      
      // If 2FA is required, store auth data temporarily and wait for 2FA verification
      if (response.requires_2fa) {
        setRequiresTwoFA(true);
        setTempAuthData(response);
      } else {
        // 2FA not enabled, log in directly
        setUser(authResponseToUser(response));
        setRequiresTwoFA(false);
        setTempAuthData(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, full_name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.register(email, password, full_name);
      setUser(authResponseToUser(response));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyTwoFA = async (code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!tempAuthData) {
        throw new Error("No pending 2FA verification");
      }

      const response = await apiClient.verifyTwoFALogin({
        user_id: tempAuthData.user_id,
        code,
      });

      setUser(authResponseToUser(response));
      setRequiresTwoFA(false);
      setTempAuthData(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "2FA verification failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.logout();
      setUser(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Logout failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await apiClient.refreshToken();
      setUser(authResponseToUser(response));
    } catch (err) {
      setUser(null);
      localStorage.removeItem("careerpilot_token");
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    requiresTwoFA,
    login,
    register,
    logout,
    refreshToken,
    verifyTwoFA,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
