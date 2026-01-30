import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";

function BackButton({ fallback }) {
  const navigate = useNavigate();
  const location = useLocation();

  // ❌ Hide on home page
  if (location.pathname === "/") return null;

  // Auto fallback
  function getFallback() {
    if (fallback) return fallback;
    if (location.pathname.startsWith("/admin")) return "/admin/dashboard";
    return "/";
  }

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(getFallback());
    }
  }

  // 🧠 Smart label
  function getLabel() {
    if (location.pathname.includes("/subcategories")) {
      return "Back to Categories";
    }
    if (location.pathname.startsWith("/admin")) {
      return "Back to Dashboard";
    }
    return "Back";
  }

  // 👆 Swipe-back gesture (mobile)
  useEffect(() => {
    let startX = null;

    function onTouchStart(e) {
      startX = e.touches[0].clientX;
    }

    function onTouchEnd(e) {
      if (startX === null) return;

      const endX = e.changedTouches[0].clientX;
      const diff = endX - startX;

      // Swipe right threshold
      if (diff > 80) {
        handleBack();
      }

      startX = null;
    }

    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <motion.button
      onClick={handleBack}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      whileHover={{ x: -4 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="
        inline-flex items-center gap-2
        rounded-full px-4 py-2
        text-sm font-semibold
        shadow-sm border bg-white
        active:scale-95
      "
      style={{
        borderColor: "var(--brand-primary)",
        color: "var(--brand-primary)",
      }}
    >
      {/* Animated Arrow */}
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
