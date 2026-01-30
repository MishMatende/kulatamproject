import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import LoadingScreen from "../components/LoadingScreen";
import toast from "react-hot-toast";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        toast.error("Session expired. Please log in again.");
        navigate("/admin/login", { replace: true });
        return;
      }

      setUser(session.user);
      setCheckingAuth(false);
    }

    checkAuth();
  }, [navigate]);

  async function handleLogout() {
    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    setLoggingOut(false);

    if (error) {
      toast.error("Failed to log out. Try again.");
      return;
    }

    toast.success("Logged out");
    navigate("/admin/login", { replace: true });
  }

  if (checkingAuth) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen w-full flex justify-center bg-gray-50">
      <div className="w-full max-w-6xl flex flex-col relative">
        {/* 🔝 Admin Header – brand aligned */}
        <header className="w-full shadow-lg bg-white">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
            {/* Logo + Title */}
            <div className="flex items-center gap-3">
              <img
                src="/kulatam-logo.svg"
                alt="Kulatam"
                className="h-16 w-16 object-contain"
              />
              <div>
                <h1
                  className="text-2xl font-semibold leading-tight"
                  style={{ color: "var(--brand-bg-dark)" }}
                >
                  KT CAFE
                </h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-full px-4 py-2 text-sm font-medium border
                         transition active:scale-95 disabled:opacity-50"
              style={{
                borderColor: "var(--brand-primary)",
                color: "var(--brand-primary)",
              }}
            >
              {loggingOut ? "Logging out…" : "Logout"}
            </button>
          </div>
        </header>

        {/* 📦 Page Content */}
        <main className="flex-1 p-4">
          <Outlet />
        </main>

        {/* 👤 Signed-in info (bottom-left) */}
        {user && (
          <div
            className="fixed bottom-3 left-3 rounded-xl px-3 py-2 shadow-sm border bg-white"
            style={{ borderColor: "var(--brand-primary)" }}
          >
            <p className="text-[11px] text-gray-500">Signed in as</p>
            <p className="text-xs font-medium truncate max-w-[220px]">
              {user.email}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
