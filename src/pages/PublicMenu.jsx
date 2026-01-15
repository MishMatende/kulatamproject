import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function PublicMenu() {
  const [data, setData] = useState([]);

  useEffect(() => {
    async function load() {
      const { data: categories } = await supabase
        .from("categories")
        .select("id, name, sort_order, menu_items(name, price, description)")
        .order("sort_order", { ascending: true });

      setData(categories || []);
    }

    load();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Menu</h1>

      {data.map((cat) => (
        <div key={cat.id} className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">{cat.name}</h2>
          <ul className="space-y-1">
            {cat.menu_items?.map((item, i) => (
              <li key={i} className="flex justify-between border-b py-1">
                <span>{item.name}</span>
                <span className="text-gray-600">{item.price} KES</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
