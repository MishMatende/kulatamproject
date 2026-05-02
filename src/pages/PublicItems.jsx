import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useParams } from "react-router-dom";
import MenuItemRow from "../components/MenuItemRow";
import BackButton from "../components/BackButton";
import LoadingScreen from "../components/LoadingScreen";

const SIDE_DISHES = {
  // Example using subcategory IDs:
  "b8352788-f798-4235-a490-cdb4727d02a0": ["Fries", "Ugali", "Rice", "Chapati"], //Chicken Signature
  "f868bc9d-81eb-40a5-b623-f5ab93f20090": ["Fries", "Ugali", "Rice", "Chapati"], // Beef Classics
  "5482a32a-47f0-411e-bf2e-52a99a7200c5": [
    "Fries",
    "Ugali",
    "Rice",
    "Chapati",
    "Mashed Potatoes",
    "Potatoes Saute",
  ], //Fish Specials
};

export default function PublicItems() {
  const { subcategoryId } = useParams();

  const [subcategory, setSubcategory] = useState(null);
  const [category, setCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [children, setChildren] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);

  const VARIANT_ORDER = [
    "Single",
    "Double",
    "Triple",
    "Cup",
    "Teapot",
    "Small",
    "Large",
  ];

  const TTL_MINUTES = 10;

  /* ---------------- LOAD ---------------- */
  async function load(force = false, overrideTab = null) {
    const targetId = overrideTab || activeTab || subcategoryId;
    const CACHE_KEY = `public_items_${targetId}`;

    setLoading(true);

    // 1️⃣ CACHE CHECK
    if (!force) {
      try {
        const cachedRaw = localStorage.getItem(CACHE_KEY);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          const age = Date.now() - cached.timestamp;

          if (age < TTL_MINUTES * 60 * 1000) {
            setSubcategory(cached.subcategory);
            setCategory(cached.category);
            setItems(cached.items);
            setChildren(cached.children || []);
            setActiveTab(targetId);
            setLoading(false);
            return;
          } else {
            localStorage.removeItem(CACHE_KEY);
          }
        }
      } catch (err) {
        console.warn("🟡 Cache read failed", err);
      }
    }

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

    // 4️⃣ Fetch children (tabs)
    const { data: childSubs } = await supabase
      .from("subcategories")
      .select("*")
      .eq("parent_id", subcategoryId)
      .order("sort_order", { ascending: true, nullsFirst: false });

    const sortedChildren = (childSubs || []).sort(
      (a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999),
    );

    setChildren(sortedChildren);

    let resolvedTargetId = activeTab;

    // If user clicked a tab, use it
    if (overrideTab) {
      resolvedTargetId = overrideTab;
    }
    // If first load and no active tab yet
    else if (!activeTab && childSubs && childSubs.length > 0) {
      resolvedTargetId = childSubs[0].id;
    }
    // If no children
    else if (!activeTab) {
      resolvedTargetId = subcategoryId;
    }

    setActiveTab(resolvedTargetId);

    // 5️⃣ Fetch items
    const { data: its, error: itemErr } = await supabase
      .from("menu_items")
      .select("*")
      .eq("subcategory_id", resolvedTargetId)
      .order("sort_order", { ascending: true });

    if (itemErr) {
      console.error("🔴 Failed to load menu items:", itemErr);
      setLoading(false);
      return;
    }

    const sortedItems = (its || []).sort(
      (a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999),
    );

    const normalizedItems = sortedItems.map((item) => {
      let variantsObj = item.variants;

      // Parse if string
      if (typeof variantsObj === "string") {
        try {
          variantsObj = JSON.parse(variantsObj);
        } catch {
          variantsObj = null;
        }
      }

      // Normalize keys (Cup, Teapot, etc.)
      if (variantsObj && typeof variantsObj === "object") {
        const cleaned = {};
        Object.keys(variantsObj).forEach((k) => {
          const normalizedKey =
            k.charAt(0).toUpperCase() + k.slice(1).toLowerCase();
          cleaned[normalizedKey] = variantsObj[k];
        });
        variantsObj = cleaned;
      }

      return {
        ...item,
        variants: variantsObj,
      };
    });

    setItems(normalizedItems);

    // 6️⃣ Save to cache
    localStorage.setItem(
      `public_items_${resolvedTargetId}`,
      JSON.stringify({
        subcategory: sub,
        category: cat,
        items: normalizedItems,
        children: childSubs || [],
        timestamp: Date.now(),
      }),
    );

    setLoading(false);
  }

  /* ---------------- REALTIME ---------------- */
  useEffect(() => {
    const targetId = activeTab || subcategoryId;
    const CACHE_KEY = `public_items_${targetId}`;

    const channel = supabase
      .channel(`public-items-changes-${targetId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "menu_items",
          filter: `subcategory_id=eq.${targetId}`,
        },
        () => {
          localStorage.removeItem(CACHE_KEY);
          load(true, targetId);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [subcategoryId, activeTab]);

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    load();
  }, [subcategoryId]);

  /* ---------------- UI ---------------- */
  if (loading) return <LoadingScreen />;

  const variantKeys = VARIANT_ORDER.filter((key) =>
    items.some((item) => item.variants && item.variants[key] !== undefined),
  );

  const currentSideDishes = SIDE_DISHES[activeTab || subcategoryId] || null;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto min-h-[85vh]">
      <BackButton />

      {/* Heading */}
      <h1
        className="text-2xl font-semibold text-center mt-2 mb-3"
        style={{ color: "var(--brand-primary)" }}
      >
        {subcategory?.name}
      </h1>

      {/* Side Dish Banner */}
      {currentSideDishes && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <p className="text-xs font-semibold text-amber-700 mb-1">
            Served With:
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {currentSideDishes.map((dish) => (
              <span
                key={dish}
                className="text-xs px-3 py-1 rounded-full bg-white border border-amber-200 text-amber-700"
              >
                {dish}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* TABS */}
      {children.length > 0 && (
        <div className="flex justify-start gap-3 mb-4">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => {
                setActiveTab(child.id);
                load(false, child.id);
              }}
              className={`px-4 py-1 rounded-full text-sm font-medium transition ${
                activeTab === child.id
                  ? "bg-(--brand-primary) text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {child.name}
            </button>
          ))}
        </div>
      )}

      {/* CARD */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        {/* HEADER */}
        <div className="flex justify-between text-sm font-semibold pb-2 border-b border-gray-200">
          <span>Name</span>
          <span>Price</span>
        </div>

        {/* VARIANT LABEL ROW */}
        {variantKeys.length > 0 && (
          <div className="flex justify-end gap-6 text-xs text-gray-500 py-1 border-b border-gray-100 font-bold">
            {variantKeys.map((key) => (
              <span key={key}>{key}</span>
            ))}
          </div>
        )}

        {/* ITEMS */}
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
