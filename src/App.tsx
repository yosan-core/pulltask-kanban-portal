import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@pages/protectedRoute";
import { BoardPage } from "@pages/board";
import { environment } from "@config/environment";
import { useAuthContext } from "@context/authContext";

function NoAuth() {
  const { isAuthenticated } = useAuthContext();

  if (isAuthenticated) {
    return <Navigate to="/board" replace />;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <div className="text-3xl font-black mb-2">
          <span className="text-slate-600">pull</span>
          <span className="text-brand-500">Task</span>
        </div>
        <p className="text-gray-500 mb-4 text-sm">Debes iniciar sesión para continuar</p>
        <a
          href={environment.AUTH_PORTAL_URL + "/login"}
          className="inline-block px-6 py-2 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
        >
          Ir al login
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route
        path="/board"
        element={
          <ProtectedRoute>
            <BoardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/no-auth" element={<NoAuth />} />
      <Route path="/" element={<Navigate to="/board" replace />} />
      <Route path="*" element={<Navigate to="/board" replace />} />
    </Routes>
  );
}

export default App;
