import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      // 🔔 Toast error (user-friendly)
      toast.error(error.message || "Failed to sign in. Please try again.");
      return;
    }

    toast.success("Welcome back 👋");
    nav("/admin/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.form
        onSubmit={handleLogin}
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-5"
      >
        {/* Logo + Brand */}
        <div className="flex flex-col items-center space-y-2 mb-5">
          <img src="/kulatam-logo.svg" alt="Kulatam" className="h-20 w-20" />
          <p className="text-sm text-black-500 font-bold mt-5">
            Admin Dashboard
          </p>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            placeholder="admin@kulatam.co.ke"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
          />
        </div>

        {/* Forgot Password */}
        <p
          onClick={() => nav("/forgot-password")}
          className="text-xs text-gray-500 hover:text-black cursor-pointer text-right"
        >
          Forgot password?
        </p>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black text-white py-2.5 text-sm font-semibold
                     hover:bg-gray-900 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="text-center text-xs text-gray-400">
          Authorized personnel only
        </p>
      </motion.form>
    </div>
  );
}
