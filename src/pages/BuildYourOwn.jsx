import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";
import BackButton from "../components/BackButton";
import LoadingScreen from "../components/LoadingScreen";
import { useNavigate } from "react-router-dom";

export default function BuildYourOwn() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const navigate = useNavigate();

  const STORAGE_KEY = "build_your_own_selection";

  async function loadItems() {
    setLoading(true);

    const { data, error } = await supabase
      .from("breakfast_items") // ✅ NEW TABLE
      .select("id, name, price, image_url")
      .order("name", { ascending: true });

    if (error) {
      console.error("🔴 Failed to fetch breakfast items:", error);
      setLoading(false);
      return;
    }

    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadItems();

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSelectedItems(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedItems));
  }, [selectedItems]);

  function toggleItem(item) {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);

      if (exists) {
        return prev.filter((i) => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  }

  const total = selectedItems.reduce(
    (sum, item) => sum + Number(item.price),
    0,
  );

  if (loading) return <LoadingScreen />;

  return (
    <div className="p-6 space-y-4 pb-24 min-h-[85vh]">
      <BackButton />

      <h1
        className="text-2xl font-bold text-center"
        style={{ color: "var(--brand-primary)" }}
      >
        Build Your Own Breakfast
      </h1>
      <div
        className="rounded-xl px-4 py-3 text-sm"
        style={{
          background: "rgba(156, 94, 0, 0.08)",
          border: "1px solid rgba(156, 94, 0, 0.2)",
          color: "var(--brand-primary)",
        }}
      >
        <p className="font-medium">Build your perfect breakfast 🍳</p>
        <p className="text-xs opacity-80">
          Tap items to add them. When you're done, tap on View Breafast and show
          your breakfast to the waiter.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-gray-500">No breakfast items found.</p>
      ) : (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 gap-5"
          initial="hidden"
          animate="show"
        >
          {items.map((item) => {
            const image = item.image_url || "/subcategory-images/default.jpeg";

            return (
              <motion.div
                key={item.id}
                onClick={() => toggleItem(item)}
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.03 }}
                className={`rounded-2xl overflow-hidden cursor-pointer transition-all duration-200
    ${selectedItems.find((i) => i.id === item.id) ? "ring-2" : "ring-1"}
  `}
                style={{
                  background: "white",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                  ringColor: selectedItems.find((i) => i.id === item.id)
                    ? "var(--brand-primary)"
                    : "rgba(0,0,0,0.06)",
                }}
              >
                {/* Image */}
                <div
                  className="h-28 bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${image})` }}
                >
                  {/* Selected overlay */}
                  {selectedItems.find((i) => i.id === item.id) && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        ✓ Added
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3 flex justify-between items-center">
                  <h2 className="font-semibold text-sm leading-tight">
                    {item.name}
                  </h2>

                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--brand-primary)" }}
                  >
                    KES {item.price}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 backdrop-blur bg-white/90 border-t shadow-lg px-5 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">
              {selectedItems.length} item(s)
            </p>
            <p
              className="font-bold text-lg"
              style={{ color: "var(--brand-primary)" }}
            >
              KES {total.toLocaleString()}
            </p>
          </div>

          <button
            onClick={() => navigate("/your-breakfast")}
            className="px-5 py-2.5 rounded-xl text-white font-semibold shadow-md active:scale-95 transition"
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            View Breakfast →
          </button>
        </div>
      )}
    </div>
  );
}
