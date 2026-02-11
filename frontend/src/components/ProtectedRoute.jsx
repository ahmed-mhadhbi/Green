import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { firebaseUser, loading } = useAuth();

  if (loading) return <div className="centered">Loading...</div>;
  if (!firebaseUser) return <Navigate to="/login" replace />;

  return children;
}
