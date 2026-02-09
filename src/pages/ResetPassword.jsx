import { useState } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleReset(e) {
    e.preventDefault();

    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password updated successfully!");
    navigate("/login");
  }

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
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full rounded-xl bg-gray-100 px-4 py-3 focus:outline-none"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
