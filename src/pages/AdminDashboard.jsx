import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        nav("/admin/login");
      } else {
        setUser(data.user);
      }
    }
    check();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>
      {user && <p>Welcome, {user.email}</p>}
      <nav className="space-x-4">
        <Link to="/admin/categories" className="text-blue-600 underline">
          Manage Categories
        </Link>
        <Link to="/admin/items" className="text-blue-600 underline">
          Manage Items
        </Link>
      </nav>
    </div>
  );
}
