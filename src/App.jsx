import { Routes, Route } from "react-router-dom";
import PublicMenu from "./pages/PublicMenu";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCategories from "./pages/AdminCategories";
import AdminItems from "./pages/AdminItems";
import AdminSubcategories from "./pages/AdminSubcategories";
import PublicHome from "./pages/PublicHome";
import PublicSubcategories from "./pages/PublicSubcategories";
import PublicItems from "./pages/PublicItems";
import PublicLayout from "./layouts/PublicLayouts";
import { useEffect, useState } from "react";
import LoadingScreen from "./components/LoadingScreen";
import AdminLayout from "./layouts/AdminLayout";
import ResetPassword from "./pages/ResetPassword";
import AdminPoster from "./pages/AdminPoster";
import QrAnalytics from "./pages/QrAnalytics";

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = "/kulatam-logo.svg";
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<PublicHome />} />
        <Route path="/menu/:categoryId" element={<PublicSubcategories />} />
        <Route
          path="/menu/:categoryId/:subcategoryId"
          element={<PublicItems />}
        />
      </Route>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/items" element={<AdminItems />} />
        <Route path="/admin/posters" element={<AdminPoster />} />
        <Route path="/admin/qr-analytics" element={<QrAnalytics />} />

        <Route
          path="/admin/categories/:categoryId/subcategories"
          element={<AdminSubcategories />}
        />
      </Route>
    </Routes>
  );
}
