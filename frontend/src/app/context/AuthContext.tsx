import { createContext, useContext, useState, ReactNode } from "react";
import { mockUsers } from "../data/mockData";
import toast from "react-hot-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "hospital" | "admin";
  avatar: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (data: RegisterData) => Promise<boolean>;
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
    toast.success("Logged out successfully");
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Account created! Please login.");
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
