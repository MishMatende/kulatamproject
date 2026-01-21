import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function PublicHome() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const categoryIcons = {
    "Breakfast & Morning Plates": "🥞",
    Lunch: "🍝",
    Meat: "🥩",
    Drinks: "🥤",
  };

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      setCategories(data || []);
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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const icon = categoryIcons[cat.name] || "🍽️";
          return (
            <motion.div
              key={cat.id}
              onClick={() => navigate(`/menu/${cat.id}`)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="
              rounded-xl shadow-md p-6 flex flex-col items-center card justify-center
              text-center cursor-pointer bg-white border hover:bg-gray-50 transition
            "
            >
              <div className="text-4xl mb-2">{icon}</div>
              <div className="font-semibold text-lg">{cat.name}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// style={{
//   backgroundImage: `url(${cat.image_url})`,
//   backgroundSize: "cover",
//   backgroundPosition: "center"
// }}
