import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  const navigate = useNavigate();

  // 🔑 Handle Supabase recovery session
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setSessionReady(true);
        }
      },
    );

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) setSessionReady(true);
    };

    checkSession();

    return () => listener.subscription.unsubscribe();
  }, []);

  // 🔐 Password rules
  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const strength = Object.values(rules).filter(Boolean).length;

  const allValid = strength === 4 && password === confirm;

  async function handleReset(e) {
    e.preventDefault();

    if (!allValid) {
      toast.error("Please meet all password requirements");
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
    navigate("/admin/login");
  }

  if (!sessionReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Preparing reset session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6"
      >
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2">
          <img src="/kulatam-logo.svg" alt="Kulatam" className="h-20 w-20" />
          <h1 className="text-2xl font-semibold">Reset Password</h1>
          <p className="text-sm text-gray-500 text-center">
            Choose a strong password to secure your account
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-5">
          {/* Password */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-12 text-sm
                           focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Strength bar */}
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  strength === 1
                    ? "w-1/4 bg-red-400"
                    : strength === 2
                      ? "w-2/4 bg-yellow-400"
                      : strength === 3
                        ? "w-3/4 bg-blue-400"
                        : strength === 4
                          ? "w-full bg-green-500"
                          : "w-0"
                }`}
              />
            </div>
          </div>

          {/* Confirm */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-12 text-sm
                         focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Rules */}
          <div className="text-xs space-y-2 bg-gray-50 p-3 rounded-lg border">
            {[
              { label: "At least 8 characters", valid: rules.length },
              { label: "One uppercase letter", valid: rules.upper },
              { label: "One lowercase letter", valid: rules.lower },
              { label: "One number", valid: rules.number },
              { label: "Passwords match", valid: password === confirm },
            ].map((rule, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check
                  size={14}
                  className={rule.valid ? "text-green-600" : "text-gray-300"}
                />
                <span
                  className={rule.valid ? "text-green-600" : "text-gray-400"}
                >
                  {rule.label}
                </span>
              </div>
            ))}
          </div>

          {/* Button */}
          <button
            disabled={loading || !allValid}
            className="w-full rounded-lg bg-black text-white py-2.5 text-sm font-semibold
                       hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>

          {/* Back */}
          <button
            type="button"
            onClick={() => navigate("/admin/login")}
            className="w-full text-sm text-gray-500 hover:text-black transition cursor-pointer"
          >
            Back to login
          </button>
        </form>
      </motion.div>
    </div>
  );
}
