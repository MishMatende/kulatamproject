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

export default function App() {
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
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/categories" element={<AdminCategories />} />
      <Route path="/admin/items" element={<AdminItems />} />
      <Route
        path="/admin/categories/:categoryId/subcategories"
        element={<AdminSubcategories />}
      />
    </Routes>
  );
}
