import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BackButton from "../components/BackButton";

export default function PublicSubcategories() {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const navigate = useNavigate();

  // Subcategory image mapping
  const subcategoryImages = {
    Smoothies: "/subcategory-images/Smoothies.jpeg",
    Mocktails: "/subcategory-images/Mocktails.jpeg",
    "Bakery & Pastries": "/subcategory-images/Bakery.jpeg",
    Coffee: "/subcategory-images/Coffee.jpeg",
    "Fresh Juices": "/subcategory-images/Juices.jpeg",
    "Chicken Signatures": "/subcategory-images/Chicken.jpeg",
    Milkshakes: "/subcategory-images/Milkshakes.jpeg",
    "Tea & Infusions": "/subcategory-images/Tea.jpeg",
    Sandwiches: "/subcategory-images/Sandwiches.jpeg",
    "Loaded fries": "/subcategory-images/LoadedFries.jpeg",
    Breakfast: "/subcategory-images/Breakfast.jpeg",
    Wraps: "/subcategory-images/Wraps.jpeg",
    "Goat Specials": "/subcategory-images/Goat.jpeg",
    Pasta: "/subcategory-images/Pasta.jpeg",
    "Swahili & Local Favorites": "/subcategory-images/Swahili.jpeg",
    "Beef Classics": "/subcategory-images/Beef.jpeg",
  };

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

  useEffect(() => {
    async function load() {
      const { data: cat } = await supabase
        .from("categories")
        .select("id, name")
        .eq("id", categoryId)
        .single();

      const { data: subs } = await supabase
        .from("subcategories")
        .select("*")
        .eq("category_id", categoryId)
        .order("sort_order", { ascending: true });

      setCategory(cat);
      setSubcategories(subs || []);
    }

    load();
  }, [categoryId]);

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
          const image =
            subcategoryImages[normalizedName] ||
            "/subcategory-images/default.jpeg";

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
