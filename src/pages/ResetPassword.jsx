import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const navigate = useNavigate();

  // 🔑 Handle Supabase recovery session
  useEffect(() => {
    console.log("🔍 ResetPassword mounted");

    // 1. Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("📡 Auth event:", event);
        console.log("📦 Session from event:", session);

        if (event === "PASSWORD_RECOVERY") {
          console.log("✅ PASSWORD_RECOVERY detected");
          setSessionReady(true);
        }
      },
    );

    // 2. Check if session already exists
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      console.log("🔎 Checking existing session...");
      console.log("📦 Existing session:", data?.session);
      console.log("❌ Session error:", error);

      if (data?.session) {
        console.log("✅ Session already exists");
        setSessionReady(true);
      }
    };

    checkSession();

    return () => {
      console.log("🧹 Cleaning up auth listener");
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleReset(e) {
    e.preventDefault();

    console.log("🚀 Reset button clicked");

    if (!password || password.length < 6) {
      console.log("❌ Password too short");
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirm) {
      console.log("❌ Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    console.log("📤 Sending updateUser request...");

    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    console.log("📥 updateUser response:", data);
    console.log("❌ updateUser error:", error);

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    console.log("✅ Password updated successfully");

    toast.success("Password updated successfully!");
    navigate("/login");
  }

  // ⏳ Wait until session is ready
  if (!sessionReady) {
    console.log("⏳ Waiting for session...");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Preparing reset session...</p>
      </div>
    );
  }

  console.log("🎉 Session ready, showing form");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-6 space-y-5">
        <h1 className="text-2xl font-bold text-center">Reset Password</h1>

        <p className="text-sm text-gray-500 text-center">
          Enter a new password to regain access.
        </p>

        <form onSubmit={handleReset} className="space-y-3">
          <input
            type="password"
            placeholder="New Password"
            className="w-full rounded-xl bg-gray-100 px-4 py-3 focus:outline-none"
            value={password}
            onChange={(e) => {
              console.log("✏️ Password input:", e.target.value);
              setPassword(e.target.value);
            }}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full rounded-xl bg-gray-100 px-4 py-3 focus:outline-none"
            value={confirm}
            onChange={(e) => {
              console.log("✏️ Confirm input:", e.target.value);
              setConfirm(e.target.value);
            }}
          />

          <button
            disabled={loading}
            className="w-full rounded-xl bg-black text-white py-3 font-semibold disabled:opacity-50"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
