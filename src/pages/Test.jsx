import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useParams } from "react-router-dom";
import MenuItemRow from "../components/MenuItemRow";
import BackButton from "../components/BackButton";
import LoadingScreen from "../components/LoadingScreen";

export default function PublicItems() {
  const { subcategoryId } = useParams();

  const [subcategory, setSubcategory] = useState(null);
  const [category, setCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const VARIANT_ORDER = ["Single", "Double", "Triple", "Cup", "Teapot"];

  const CACHE_KEY = `public_items_${subcategoryId}`;
  const TTL_MINUTES = 15;

  /* ---------------- LOAD ---------------- */
  async function load(force = false) {
    console.log("🔄 load() public items | force =", force);
    setLoading(true);

    // 1️⃣ Try cache first (unless forced)
    if (!force) {
      try {
        const cachedRaw = localStorage.getItem(CACHE_KEY);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          const age = Date.now() - cached.timestamp;

          if (age < TTL_MINUTES * 60 * 1000) {
            console.log("🟢 Using cached public items");

            setSubcategory(cached.subcategory);
            setCategory(cached.category);
            setItems(cached.items);

            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("🟡 Cache read failed", err);
      }
    }

    console.log("🟡 Fetching fresh items from Supabase");

    // 2️⃣ Fetch subcategory
    const { data: sub, error: subErr } = await supabase
      .from("subcategories")
      .select("*")
      .eq("id", subcategoryId)
      .single();

    if (subErr) {
      console.error("🔴 Failed to load subcategory:", subErr);
      setLoading(false);
      return;
    }

    setSubcategory(sub);

    // 3️⃣ Fetch category
    const { data: cat, error: catErr } = await supabase
      .from("categories")
      .select("*")
      .eq("id", sub.category_id)
      .single();

    if (catErr) {
      console.error("🔴 Failed to load category:", catErr);
      setLoading(false);
      return;
    }

    setCategory(cat);

    // 4️⃣ Fetch items
    const { data: its, error: itemErr } = await supabase
      .from("menu_items")
      .select("*")
      .eq("subcategory_id", subcategoryId)
      .order("sort_order", { ascending: true });

    if (itemErr) {
      console.error("🔴 Failed to load menu items:", itemErr);
      setLoading(false);
      return;
    }

    const sortedItems = (its || []).sort(
      (a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999),
    );

    const normalizedItems = sortedItems.map((item) => ({
      ...item,
      variants:
        typeof item.variants === "string"
          ? JSON.parse(item.variants)
          : item.variants,
    }));

    setItems(normalizedItems);

    // 5️⃣ Save to cache
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        subcategory: sub,
        category: cat,
        items: normalizedItems,
        timestamp: Date.now(),
      }),
    );

    console.log("🟢 Public items cache updated");
    setLoading(false);
  }

  /* ---------------- REALTIME ---------------- */
  useEffect(() => {
    const channel = supabase
      .channel(`public-items-changes-${subcategoryId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "menu_items",
          filter: `subcategory_id=eq.${subcategoryId}`,
        },
        (payload) => {
          console.log("🟢 Realtime menu_items change:", payload.eventType);

          localStorage.removeItem(CACHE_KEY);
          load(true); // 👈 force refresh
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [subcategoryId]);

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    load();
  }, [subcategoryId]);

  /* ---------------- UI ---------------- */
  if (loading) return <LoadingScreen />;

  const variantKeys = VARIANT_ORDER.filter((key) =>
    items.some((item) => item.variants && item.variants[key] !== undefined),
  );

  console.log("📊 VARIANT KEYS:", variantKeys);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <BackButton />

      <h1
        className="text-2xl font-semibold text-center mt-2 mb-4"
        style={{ color: "var(--brand-primary)" }}
      >
        {subcategory?.name}
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex justify-between text-sm font-semibold pb-2 border-b border-gray-200">
          <span>Name</span>
          <span>Price</span>
        </div>

        {variantKeys.length > 0 && (
          <div className="flex justify-end gap-6 text-xs text-gray-500 py-1 border-b border-gray-100">
            {variantKeys.map((key) => (
              <span key={key}>{key}</span>
            ))}
          </div>
        )}

        <div className="divide-y divide-gray-200">
          {items.length > 0 ? (
            items.map((item) => (
              <MenuItemRow
                key={item.id}
                item={item}
                variantKeys={variantKeys}
              />
            ))
          ) : (
            <p className="text-center text-gray-400 py-6 text-sm">
              No items added yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
