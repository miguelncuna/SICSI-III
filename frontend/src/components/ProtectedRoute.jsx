import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setChecking(false);
  }, [location.pathname]);

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm text-slate-400">A carregar SICSI...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && user.role !== role) {
    return (
      <Navigate
        to={user.role === "admin" ? "/admin" : "/student"}
        replace
      />
    );
  }

  if (
    user.role === "student" &&
    !user.initial_assessment_completed &&
    location.pathname !== "/student/autoavaliacao"
  ) {
    return <Navigate to="/student/autoavaliacao" replace />;
  }

  return <Outlet />;
}
