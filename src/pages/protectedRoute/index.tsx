import { ReactNode } from "react";
import { useAuthContext } from "@context/authContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gh-surface text-gh-muted text-sm">
        Autenticando…
      </div>
    );
  }

  // Redirect is handled inside AuthContext when not authenticated.
  return isAuthenticated ? <>{children}</> : null;
}
