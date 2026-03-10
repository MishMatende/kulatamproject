import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

export default function PosterModal() {
  const [posterUrl, setPosterUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  async function loadPoster() {
    try {
      const { data, error } = await supabase
        .from("posters")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        setPosterUrl(null);
        setLoading(false);
        return;
      }

      setPosterUrl(data.image_url);
      setLoading(false);

      // Show modal every reload
      setOpen(true);
    } catch (err) {
      console.error("🔴 Poster load crashed:", err);
      setPosterUrl(null);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPoster();
  }, []);

  // ESC close
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  if (loading) return null;
  if (!posterUrl) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-md sm:max-w-xl rounded-2xl overflow-hidden shadow-2xl bg-white"
          >
            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-50 bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg hover:bg-black transition"
            >
              ✕
            </button>

            {/* Poster Image */}
            <img
              src={posterUrl}
              alt="Poster"
              className="w-full h-auto object-cover"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
