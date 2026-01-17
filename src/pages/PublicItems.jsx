import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useParams } from "react-router-dom";
import MenuItemRow from "../components/MenuItemRow";
import Breadcrumbs from "../components/Breadcrumbs";

export default function PublicItems() {
  const { subcategoryId } = useParams();
  const [subcategory, setSubcategory] = useState(null);
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState(null);

  useEffect(() => {
    async function load() {
      // Fetch subcategory
      const { data: sub } = await supabase
        .from("subcategories")
        .select("*")
        .eq("id", subcategoryId)
        .single();

      setSubcategory(sub);

      // Fetch category of that subcategory
      const { data: cat } = await supabase
        .from("categories")
        .select("*")
        .eq("id", sub.category_id)
        .single();

      setCategory(cat);

      // Fetch items in that subcategory
      const { data: its } = await supabase
        .from("menu_items")
        .select("*")
        .eq("subcategory_id", subcategoryId)
        .order("sort_order", { ascending: true });

      setItems(
        (its || []).sort(
          (a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999)
        )
      );
    }

    load();
  }, [subcategoryId]);

  const hasVariants = items.some(
    (i) => i.variants && Object.keys(i.variants).length > 0
  );
  const hasTriple = items.some((i) => i.variants?.Triple !== undefined);

  return (
    <div className="p-6 space-y-4">
      <Breadcrumbs
        categoryName={category?.name}
        subcategoryName={subcategory?.name}
      />

      <h1 className="text-2xl font-bold text-center">{subcategory?.name}</h1>

      {/* MAIN HEADER */}
      <div className="flex justify-between font-semibold text-sm border-b border-gray-300 pb-1 brand-border brand-dark">
        <span>Name</span>
        <span>Price</span>
      </div>

      {/* VARIANT HEADER ROW */}
      {hasVariants && (
        <div className="flex justify-end gap-6 text-xs text-gray-500 border-b border-gray-200 pb-1">
          <span>Single</span>
          <span>Double</span>
          {hasTriple && <span>Triple</span>}
        </div>
      )}

      {/* ITEMS */}
      <div>
        {items.map((item) => (
          <MenuItemRow key={item.id} item={item} hasTriple={hasTriple} />
        ))}
      </div>
    </div>
  );
}
