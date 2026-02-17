import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import JoinUsPage from "./pages/JoinUsPage";
import EntrepreneurDashboard from "./pages/EntrepreneurDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import BusinessSupportDashboard from "./pages/BusinessSupportDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Layout from "./components/Layout";
import Home from "./components/Home";
import ToolsPage from "./pages/ToolsPage";
import ToolQuestionnairePage from "./pages/ToolQuestionnairePage";
import ProductsPage from "./pages/ProductsPage";

function DashboardRouter() {
  const { profile } = useAuth();

  if (!profile) return <div className="centered">Loading profile...</div>;
  if (profile.role === "mentor") return <MentorDashboard />;
  if (profile.role === "business_support") return <BusinessSupportDashboard />;
  if (profile.role === "admin") return <AdminDashboard />;
  return <EntrepreneurDashboard />;
}

export default function App() {
  const withAppLayout = (element) => (
    <ProtectedRoute>
      <Layout>{element}</Layout>
    </ProtectedRoute>
  );

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/join-us" element={<JoinUsPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/dashboard" element={withAppLayout(<DashboardRouter />)} />
      <Route path="/app/tools" element={withAppLayout(<ToolsPage />)} />
      <Route path="/app/tools/:toolKey" element={withAppLayout(<ToolQuestionnairePage />)} />
      <Route path="/app/products" element={withAppLayout(<ProductsPage />)} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
