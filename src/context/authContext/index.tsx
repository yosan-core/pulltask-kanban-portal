import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { AuthUser } from "@domain/task";
import { environment } from "@config/environment";
import { exchangeToken } from "@services/exchangeToken";

const TOKEN_KEY    = "pulltask_token";
const USER_KEY     = "pulltask_user";
const VERIFIER_KEY = "pulltask_pkce_verifier";

// Capture code+verifier at MODULE LOAD TIME — before React Router's <Navigate>
// useLayoutEffect strips the query params from window.location.
const _initial = new URLSearchParams(window.location.search);
let _pendingCode: string | null = _initial.get("code");
let _pendingVerifier: string | null = _pendingCode
  ? sessionStorage.getItem(VERIFIER_KEY)
  : null;
if (_pendingVerifier) sessionStorage.removeItem(VERIFIER_KEY);

let _exchangeInitiated = false;
let _redirectingToLogin = false;

interface AuthContextType {
  user:            AuthUser | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  signOut:         () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── PKCE helpers ────────────────────────────────────────────────────────────

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data   = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// ─── Stored session ───────────────────────────────────────────────────────────

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

function persistUser(user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, user.token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<AuthUser | null>(loadStoredUser);
  const [isLoading, setIsLoading] = useState(false);
  const exchangeStarted = useRef(false);

  useEffect(() => {
    const code     = _pendingCode;
    const verifier = _pendingVerifier;

    if (!code || !verifier) return;
    if (exchangeStarted.current) return;
    exchangeStarted.current = true;
    _exchangeInitiated = true;

    _pendingCode     = null;
    _pendingVerifier = null;

    setIsLoading(true);
    exchangeToken(code, verifier)
      .then((authUser) => {
        persistUser(authUser);
        setUser(authUser);
      })
      .catch(() => {
        _exchangeInitiated = false;
        redirectToLogin();
      })
      .finally(() => {
        window.history.replaceState({}, "", window.location.pathname);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!isLoading && !user && !_exchangeInitiated) {
      redirectToLogin();
    }
  }, [isLoading, user]);

  const signOut = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = environment.AUTH_PORTAL_URL + "/login";
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

// ─── Redirect helpers ─────────────────────────────────────────────────────────

async function redirectToLogin(): Promise<void> {
  if (_redirectingToLogin) return;
  _redirectingToLogin = true;

  const verifier    = generateCodeVerifier();
  const challenge   = await generateCodeChallenge(verifier);
  const state       = crypto.randomUUID();
  const callbackUrl = window.location.origin;

  sessionStorage.setItem(VERIFIER_KEY, verifier);

  const params = new URLSearchParams({
    codeChallenge: challenge,
    callbackUrl,
    state,
  });

  window.location.href = `${environment.AUTH_PORTAL_URL}/login?${params.toString()}`;
}
