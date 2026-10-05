"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Logout handler
  const logout = useCallback(() => {
    localStorage.removeItem("restaurant_token");
    localStorage.removeItem("restaurant_user");
    setToken(null);
    setUser(null);
    setAuthError(null);
  }, []);

  // Fetch current user from server on boot
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem("restaurant_token");
        const storedUser = localStorage.getItem("restaurant_user");

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch {
              // Ignore corrupted local user cache
            }
          }

          // Verify token validity with backend
          try {
            const data = await authAPI.getMe();
            if (data?.user) {
              setUser(data.user);
              localStorage.setItem("restaurant_user", JSON.stringify(data.user));
            }
          } catch {
            // Token is expired or invalid
            logout();
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen to unauthorized event dispatched by axios interceptor
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [logout]);

  // Login handler
  const login = async ({ email, password }) => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await authAPI.login({ email, password });
      if (data?.token && data?.user) {
        localStorage.setItem("restaurant_token", data.token);
        localStorage.setItem("restaurant_user", JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
      throw new Error(data.message || "Login failed");
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Register handler - creates customer account WITHOUT logging in automatically
  const register = async ({ name, email, phone, password }) => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await authAPI.register({ name, email, phone, password });
      if (data?.user) {
        // User is not logged in immediately; must log in via login form
        return { success: true, user: data.user, message: data.message };
      }
      throw new Error(data.message || "Registration failed");
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const isStaffOrAdmin = user?.role === "staff" || user?.role === "admin";
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        isAuthenticated: !!token && !!user,
        isStaffOrAdmin,
        isAdmin,
        login,
        register,
        logout,
        setAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
