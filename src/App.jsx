import { Routes, Route } from "react-router-dom";
import PublicMenu from "./pages/PublicMenu";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCategories from "./pages/AdminCategories";
import AdminItems from "./pages/AdminItems";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicMenu />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/categories" element={<AdminCategories />} />
      <Route path="/admin/items" element={<AdminItems />} />
    </Routes>
  );
}
