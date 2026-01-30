import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function PublicHome() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // MAPPINGS — remove trailing space!
  const categoryImages = {
    "Breakfast & Morning Plates": "/category-images/Breakfast.jpeg",
    Lunch: "/category-images/Lunch.jpeg",
    Meat: "/category-images/Meat.jpeg",
    Drinks: "/category-images/Drinks.jpeg",
  };

  // Detect mobile (simple width check)
  const isMobile = window.innerWidth <= 768;

  const containerVariants = {
    show: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // Desktop = fade
  const itemVariantsDesktop = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  // Mobile = slide up + fade
  const itemVariantsMobile = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  useEffect(() => {
    async function load() {
      const CACHE_KEY = "public_categories";
      const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

      const cached = localStorage.getItem(CACHE_KEY);

      if (cached) {
        const parsed = JSON.parse(cached);

        // If cache still valid
        if (Date.now() - parsed.timestamp < CACHE_TTL) {
          setCategories(parsed.data);
          return;
        }
      }

      // Fetch from Supabase if no cache or expired
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && data) {
        setCategories(data);

        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            timestamp: Date.now(),
            data,
          }),
        );
      }
    }

    load();
  }, []);

  return (
    <div className="p-6">
      <h1
        className="text-2xl font-bold mb-6 text-center"
        style={{ color: "var(--brand-primary)" }}
      >
        Our Menu
      </h1>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {categories.map((cat) => {
          // Handle bad names or missing images
          const normalizedName = cat.name.trim();
          const image =
            categoryImages[normalizedName] || "/category-images/default.jpeg";

          return (
            <motion.div
              key={cat.id}
              variants={isMobile ? itemVariantsMobile : itemVariantsDesktop}
              onClick={() => navigate(`/menu/${cat.id}`)}
              className="rounded-xl shadow relative cursor-pointer bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${image})`,
                height: "140px",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl text-center px-2">
                  {cat.name}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
