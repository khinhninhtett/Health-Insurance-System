import { createContext, useContext, useState, ReactNode } from "react";
import { mockUsers } from "../data/mockData";
import { useTheme } from "./ThemeContext";
import toast from "react-hot-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "hospital" | "admin";
  avatar: string;
  verificationStatus?: "unverified" | "pending" | "verified" | "rejected";
  dateOfBirth?: string | null;
  address?: string | null;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: RegisterData) => Promise<boolean>;
  setSession: (user: User, token: string) => void;
  updateUser: (patch: Partial<User>) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "customer" | "hospital" | "admin";
  phone?: string;
  nrc?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setDarkMode } = useTheme();
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("him_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 800));
    const found = Object.values(mockUsers).find(
      (u) => u.email === email && u.password === password
    );
    if (found) {
      const { password: _, ...safeUser } = found as typeof found & { password: string };
      setUser(safeUser as User);
      localStorage.setItem("him_user", JSON.stringify(safeUser));
      toast.success(`Welcome back, ${safeUser.name}!`);
      return true;
    }
    toast.error("Invalid email or password");
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("him_user");
    localStorage.removeItem("him_token");
    toast.success("Logged out successfully");
  };

  const setSession = (sessionUser: User, token: string) => {
    setUser(sessionUser);
    localStorage.setItem("him_user", JSON.stringify(sessionUser));
    localStorage.setItem("him_token", token);
    // Logged-in experience defaults to dark mode; users can still toggle after.
    setDarkMode(true);
  };

  const updateUser = (patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const merged = { ...prev, ...patch };
      localStorage.setItem("him_user", JSON.stringify(merged));
      return merged;
    });
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Account created! Please login.");
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, register, setSession, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
