import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e) {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://ktcafe.restaurant/reset-password", // 🔥 IMPORTANT
    });

    setLoading(false);

    if (error) {
      toast.error(error.message || "Failed to send reset email");
      return;
    }

    toast.success("Reset link sent! Check your email 📩");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.form
        onSubmit={handleReset}
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-5"
      >
        {/* Logo + Brand */}
        <div className="flex flex-col items-center mb-5">
          <img src="/kulatam-logo.svg" alt="Kulatam" className="h-20 w-20" />
          <p className="text-sm text-black-500 font-bold mt-5">
            Password Recovery
          </p>
        </div>

        {/* Instructions */}
        <p className="text-sm text-gray-500 text-center">
          Enter your email and we’ll send you a reset link.
        </p>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            placeholder="admin@kulatam.co.ke"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black text-white py-2.5 text-sm font-semibold
                     hover:bg-gray-900 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {/* Back to login */}
        <button
          type="button"
          onClick={() => nav("/admin/login")}
          className="w-full text-sm text-gray-500 hover:text-black transition cursor-pointer"
        >
          Back to login
        </button>

        <p className="text-center text-xs text-gray-400">
          Authorized personnel only
        </p>
      </motion.form>
    </div>
  );
}
