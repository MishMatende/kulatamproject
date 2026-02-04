import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function PublicMenu() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const CACHE_KEY = "public_menu";
  const TTL_MINUTES = 15;

  /* ---------------- LOAD ---------------- */
  async function load(force = false) {
    console.log("🔄 load() public menu | force =", force);
    setLoading(true);

    if (!force) {
      try {
        const cachedRaw = localStorage.getItem(CACHE_KEY);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          const age = Date.now() - cached.timestamp;

          if (age < TTL_MINUTES * 60 * 1000) {
            console.log("🟢 Using cached public menu");
            setData(cached.data);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("🟡 Cache read failed", err);
      }
    }

    console.log("🟡 Fetching fresh public menu");

    const { data: categories, error } = await supabase
      .from("categories")
      .select(
        `
          id,
          name,
          sort_order,
          menu_items (
            id,
            name,
            price,
            description
          )
        `,
      )
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("🔴 Public menu fetch failed:", error);
      setLoading(false);
      return;
    }

    setData(categories || []);

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        data: categories || [],
        timestamp: Date.now(),
      }),
    );

    console.log("🟢 Public menu cache updated");
    setLoading(false);
  }

  /* ---------------- REALTIME ---------------- */
  useEffect(() => {
    const channel = supabase
      .channel("public-menu-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        () => {
          console.log("🟢 Realtime category change (menu)");
          localStorage.removeItem(CACHE_KEY);
          load(true);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_items" },
        () => {
          console.log("🟢 Realtime menu item change");
          localStorage.removeItem(CACHE_KEY);
          load(true);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    load();
  }, []);

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1
        className="text-3xl font-bold mb-6"
        style={{ color: "var(--brand-primary)" }}
      >
        Menu
      </h1>

      {loading && <p className="text-sm text-gray-400 mb-4">Updating menu…</p>}

      {data.map((cat) => (
        <div key={cat.id} className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">{cat.name}</h2>

          <ul className="space-y-1">
            {cat.menu_items?.map((item) => (
              <li key={item.id} className="flex justify-between border-b py-1">
                <span>{item.name}</span>
                <span className="text-gray-600">
                  {item.price?.toLocaleString()} KES
                </span>
              </li>
            ))}

            {(!cat.menu_items || cat.menu_items.length === 0) && (
              <li className="text-sm text-gray-400">No items</li>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}
