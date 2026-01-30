import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

function BackButton({ fallback }) {
  const navigate = useNavigate();
  const location = useLocation();

  // ❌ Hide on home page
  if (location.pathname === "/") return null;

  function getFallback() {
    if (fallback) return fallback;
    if (location.pathname.startsWith("/admin")) return "/admin/dashboard";
    return "/";
  }

  function haptic() {
    // Very short, subtle vibration
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }

  function handleBack() {
    haptic();

    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(getFallback());
    }
  }

  function getLabel() {
    if (location.pathname.includes("/subcategories")) {
      return "Back to Categories";
    }
    if (location.pathname.startsWith("/admin")) {
      return "Back to Dashboard";
    }
    return "Back";
  }

  return (
    <motion.button
      onClick={handleBack}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      whileHover={{ x: -4 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="
        inline-flex items-center gap-2
        rounded-full px-4 py-2
        text-sm font-semibold
        shadow-sm bg-white
        active:scale-95
      "
      style={{ color: "var(--brand-primary)" }}
    >
      <motion.span
        aria-hidden
        whileHover={{ x: -4 }}
        transition={{ duration: 0.2 }}
        className="text-lg leading-none"
      >
        ←
      </motion.span>

      <span className="whitespace-nowrap">{getLabel()}</span>
    </motion.button>
  );
}

export default BackButton;
