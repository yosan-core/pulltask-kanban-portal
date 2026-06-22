import { createContext, useContext, useState, ReactNode } from "react";
import { AuthUser } from "@types/task";
import { environment } from "@config/environment";

const TOKEN_KEY = "pulltask_token";
const USER_KEY  = "pulltask_user";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as AuthUser;
    if (new Date(user.expiresAt) <= new Date()) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user] = useState<AuthUser | null>(loadStoredUser);

  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = environment.AUTH_PORTAL_URL + "/login";
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
