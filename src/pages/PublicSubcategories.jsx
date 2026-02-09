import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BackButton from "../components/BackButton";
import LoadingScreen from "../components/LoadingScreen";

export default function PublicSubcategories() {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const CACHE_KEY = `public_category_${categoryId}`;
  const TTL_MINUTES = 15;

  /* ---------------- LOAD ---------------- */
  async function load(force = false) {
    console.log("🔄 load() public subcategories | force =", force);
    setLoading(true);

    if (!force) {
      try {
        const cachedRaw = localStorage.getItem(CACHE_KEY);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          const age = Date.now() - cached.timestamp;

          if (age < TTL_MINUTES * 60 * 1000) {
            console.log("🟢 Using cached public subcategories");
            setCategory(cached.category);
            setSubcategories(cached.subcategories);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("🟡 Cache read failed", err);
      }
    }

    console.log("🟡 Fetching fresh public subcategories");

    const { data: cat, error: catErr } = await supabase
      .from("categories")
      .select("id, name")
      .eq("id", categoryId)
      .single();

    if (catErr) {
      console.error("🔴 Category fetch failed:", catErr);
      setLoading(false);
      return;
    }

    const { data: subs, error: subErr } = await supabase
      .from("subcategories")
      .select("*")
      .eq("category_id", categoryId)
      .order("sort_order", { ascending: true });

    if (subErr) {
      console.error("🔴 Subcategories fetch failed:", subErr);
      setLoading(false);
      return;
    }

    setCategory(cat);
    setSubcategories(subs || []);

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        category: cat,
        subcategories: subs || [],
        timestamp: Date.now(),
      }),
    );

    console.log("🟢 Public subcategories cache updated");
    setLoading(false);
  }

  /* ---------------- REALTIME ---------------- */
  useEffect(() => {
    const channel = supabase
      .channel(`public-subcategory-changes-${categoryId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subcategories",
          filter: `category_id=eq.${categoryId}`,
        },
        (payload) => {
          console.log(
            "🟢 Realtime public subcategory change:",
            payload.eventType,
          );
          localStorage.removeItem(CACHE_KEY);
          load(true);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [categoryId]);

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    load();
  }, [categoryId]);

  /* ---------------- UI ---------------- */

  // Detect mobile
  const isMobile = window.innerWidth <= 768;

  const containerVariants = {
    show: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariantsDesktop = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const itemVariantsMobile = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="p-6 space-y-4">
      <BackButton />

      <h1
        className="text-2xl font-bold text-center"
        style={{ color: "var(--brand-primary)" }}
      >
        {category?.name}
      </h1>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {subcategories.map((sub) => {
          const normalizedName = sub.name.trim();

          const image = sub.image_url || "/subcategory-images/default.jpeg";

          return (
            <motion.div
              key={sub.id}
              variants={isMobile ? itemVariantsMobile : itemVariantsDesktop}
              onClick={() => navigate(`/menu/${categoryId}/${sub.id}`)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl shadow relative cursor-pointer bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${image})`,
                height: "140px",
              }}
            >
              <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg text-center px-2">
                  {sub.name}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
