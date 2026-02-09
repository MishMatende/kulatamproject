import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function PublicHome() {
  const [categories, setCategories] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // 🖼️ HERO IMAGES (from public)
  const HERO_IMAGES = [
    "/hero-images/hero-1.jpeg",
    "/hero-images/hero-2.jpeg",
    "/hero-images/hero-3.jpeg",
  ];

  const categoryImages = {
    "Breakfast & Morning Plates": "/category-images/Breakfast.jpeg",
    Lunch: "/category-images/Lunch.jpeg",
    Meat: "/category-images/Meat.jpeg",
    Drinks: "/category-images/Drinks.jpeg",
  };

  const isMobile = window.innerWidth <= 768;

  const containerVariants = {
    show: { transition: { staggerChildren: 0.2 } },
  };

  const itemVariantsDesktop = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.4 } },
  };

  const itemVariantsMobile = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  /* ---------------- HERO IMAGE ROTATION ---------------- */
  useEffect(() => {
    const t = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, 3000);

    return () => clearInterval(t);
  }, []);

  /* ---------------- LOAD CATEGORIES ---------------- */
  useEffect(() => {
    async function load() {
      const CACHE_KEY = "public_categories";
      const TTL = 10 * 60 * 1000;

      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < TTL) {
          setCategories(parsed.data);
          return;
        }
      }

      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (data) {
        setCategories(data);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), data }),
        );
      }
    }

    load();
  }, []);

  function scrollToMenu() {
    const header = document.querySelector("header");
    const headerHeight = header?.offsetHeight || 0;

    const y =
      menuRef.current.getBoundingClientRect().top +
      window.pageYOffset -
      headerHeight;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });
  }

  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden -mt-20 pt-20">
        <AnimatePresence>
          <motion.div
            key={heroIndex}
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${HERO_IMAGES[heroIndex]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
          />
        </AnimatePresence>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 z-10" />

        {/* Content */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-white"
          >
            Welcome
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mt-3 text-sm md:text-base text-white/90 max-w-lg"
          >
            Step in, relax, and enjoy freshly prepared meals, handcrafted
            drinks, and a warm café atmosphere made just for you.
          </motion.p>
        </div>

        {/* ================= SCROLL INDICATOR ================= */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
          <div
            onClick={scrollToMenu}
            className="relative cursor-pointer flex items-center justify-center"
          >
            {/* Pulsing rings */}
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="absolute rounded-full border-2"
                style={{
                  borderColor: "var(--brand-primary)",
                  width: 40,
                  height: 40,
                }}
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}

            {/* Static Arrow */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "var(--brand-primary)" }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14" />
                <path d="M19 12l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MENU ================= */}
      <div ref={menuRef} className="p-6">
        <h2
          className="text-2xl font-bold mb-6 text-center"
          style={{ color: "var(--brand-primary)" }}
        >
          Our Menu
        </h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {categories.map((cat) => {
            const image = cat.image_url || "/category-images/default.jpeg";

            return (
              <motion.div
                key={cat.id}
                variants={isMobile ? itemVariantsMobile : itemVariantsDesktop}
                onClick={() => navigate(`/menu/${cat.id}`)}
                className="rounded-xl shadow relative cursor-pointer bg-cover bg-center"
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
    </div>
  );
}
