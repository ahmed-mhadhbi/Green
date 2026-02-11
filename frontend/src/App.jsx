import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EntrepreneurDashboard from "./pages/EntrepreneurDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Layout from "./components/Layout";

function DashboardRouter() {
  const { profile } = useAuth();

  if (!profile) return <div className="centered">Loading profile...</div>;
  if (profile.role === "mentor") return <MentorDashboard />;
  if (profile.role === "admin") return <AdminDashboard />;
  return <EntrepreneurDashboard />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={(
          <ProtectedRoute>
            <Layout>
              <DashboardRouter />
            </Layout>
          </ProtectedRoute>
        )}
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
