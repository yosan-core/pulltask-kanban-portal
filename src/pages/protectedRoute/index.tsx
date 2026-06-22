import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "@context/authContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated ? <>{children}</> : <Navigate to="/no-auth" replace />;
}
