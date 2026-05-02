import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16 min-h-[80vh] space-y-6">
      {/* Big 404 */}
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-6xl font-extrabold"
        style={{ color: "var(--brand-primary)" }}
      >
        404
      </motion.h1>

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h2 className="text-xl font-semibold text-gray-800">
          This page is off the menu{" "}
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            🍳
          </motion.span>
        </h2>
        <p className="text-gray-500 text-sm max-w-md">
          Looks like what you're looking for isn’t available. Maybe try
          something else from our menu?
        </p>
      </motion.div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap justify-center mt-4">
        <button
          onClick={() => navigate("/")}
          className="px-5 py-2.5 rounded-xl text-white font-medium shadow-md active:scale-95 transition"
          style={{ backgroundColor: "var(--brand-primary)" }}
        >
          Go Home
        </button>

        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium active:scale-95 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
