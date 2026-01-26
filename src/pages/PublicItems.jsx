import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useParams } from "react-router-dom";
import MenuItemRow from "../components/MenuItemRow";
import BackButton from "../components/BackButton";

export default function PublicItems() {
  const { subcategoryId } = useParams();
  const [subcategory, setSubcategory] = useState(null);
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: sub } = await supabase
        .from("subcategories")
        .select("*")
        .eq("id", subcategoryId)
        .single();

      setSubcategory(sub);

      const { data: cat } = await supabase
        .from("categories")
        .select("*")
        .eq("id", sub.category_id)
        .single();

      setCategory(cat);

      const { data: its } = await supabase
        .from("menu_items")
        .select("*")
        .eq("subcategory_id", subcategoryId)
        .order("sort_order", { ascending: true });

      setItems(
        (its || []).sort(
          (a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999),
        ),
      );
    }

    load();
  }, [subcategoryId]);

  const hasVariants = items.some(
    (i) => i.variants && Object.keys(i.variants).length > 0,
  );
  const hasTriple = items.some((i) => i.variants?.Triple !== undefined);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <BackButton />

      {/* Heading */}
      <h1
        className="text-2xl font-semibold text-center mt-2 mb-4"
        style={{ color: "var(--brand-primary)" }}
      >
        {subcategory?.name}
      </h1>

      {/* CARD */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        {/* HEADER */}
        <div className="flex justify-between text-sm font-semibold pb-2 border-b border-gray-200">
          <span>Name</span>
          <span>Price</span>
        </div>

        {/* VARIANT LABEL ROW */}
        {hasVariants && (
          <div className="flex justify-end gap-6 text-xs text-gray-500 py-1 border-b border-gray-100">
            <span>Single</span>
            <span>Double</span>
            {hasTriple && <span>Triple</span>}
          </div>
        )}

        {/* ITEMS */}
        <div className="divide-y divide-gray-200">
          {items.length > 0 ? (
            items.map((item) => (
              <MenuItemRow key={item.id} item={item} hasTriple={hasTriple} />
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
