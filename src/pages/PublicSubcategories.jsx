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
      <h1 className="text-2xl font-bold text-center">{category?.name}</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {subcategories.map((sub) => (
          <motion.div
            key={sub.id}
            onClick={() => navigate(`/menu/${categoryId}/${sub.id}`)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="
            rounded-xl shadow p-6 text-center
            cursor-pointer bg-white border hover:bg-gray-50 transition
          "
          >
            <div className="font-medium text-lg">{sub.name}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
