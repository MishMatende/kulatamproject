import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import BackButton from "../components/BackButton";

export default function AdminItems() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [items, setItems] = useState([]);

  // Form state
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  // Variants
  const [single, setSingle] = useState("");
  const [double, setDouble] = useState("");
  const [triple, setTriple] = useState("");
  const [small, setSmall] = useState("");
  const [medium, setMedium] = useState("");
  const [large, setLarge] = useState("");

  // Images
  const [file, setFile] = useState(null);

  const [error, setError] = useState("");

  async function load() {
    const { data: cats } = await supabase
      .from("categories")
      .select("id, name")
      .order("sort_order", { ascending: true });

    const { data: subs } = await supabase
      .from("subcategories")
      .select("id, name, category_id")
      .order("sort_order", { ascending: true });

    const { data: menu } = await supabase
      .from("menu_items")
      .select("*")
      .order("sort_order", { ascending: true });

    setCategories(cats || []);
    setSubcategories(subs || []);
    setItems(menu || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAddItem(e) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !categoryId || !subcategoryId) {
      setError("Name, Category and Subcategory are required.");
      return;
    }

    // Build variants JSON
    let variants = null;

    const categoryName = categories.find((c) => c.id === categoryId)?.name;

    if (categoryName === "Coffee") {
      variants = {
        Single: single ? Number(single) : null,
        Double: double ? Number(double) : null,
        Triple: triple ? Number(triple) : null,
      };
    } else if (categoryName === "Juice") {
      variants = {
        Small: small ? Number(small) : null,
        Medium: medium ? Number(medium) : null,
        Large: large ? Number(large) : null,
      };
    }

    // Insert item first (without image)
    const { data: inserted, error: insertError } = await supabase
      .from("menu_items")
      .insert({
        name,
        description: desc,
        category_id: categoryId,
        subcategory_id: subcategoryId,
        variants: variants,
        image_url: null,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      return;
    }

    const itemId = inserted.id;

    // If image selected, upload it
    if (file) {
      const fileName = `${itemId}-${Date.now()}`;
      const { data: img, error: uploadError } = await supabase.storage
        .from("menu-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("menu-images").getPublicUrl(fileName);

      // Update item with image URL
      await supabase
        .from("menu_items")
        .update({ image_url: publicUrl })
        .eq("id", itemId);
    }

    // Reset form
    setName("");
    setDesc("");
    setSingle("");
    setDouble("");
    setTriple("");
    setSmall("");
    setMedium("");
    setLarge("");
    setFile(null);

    load();
  }

  async function deleteItem(id) {
    await supabase.from("menu_items").delete().eq("id", id);
    load();
  }

  // Filter subcategories by selected category
  const filteredSubs = subcategories.filter(
    (s) => s.category_id === categoryId
  );

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <BackButton />
      <h1 className="text-xl font-bold">Menu Items</h1>

      <form onSubmit={handleAddItem} className="space-y-3">
        <input
          className="border p-2 w-full"
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          className="border p-2 w-full"
          placeholder="Description"
          rows={2}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <select
          className="border p-2 w-full"
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setSubcategoryId("");
          }}
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          className="border p-2 w-full"
          value={subcategoryId}
          onChange={(e) => setSubcategoryId(e.target.value)}
        >
          <option value="">Select Subcategory</option>
          {filteredSubs.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>

        {/* Variant fields */}
        {categoryId && (
          <div className="space-y-2">
            <p className="font-semibold">Variants:</p>

            {categories.find((c) => c.id === categoryId)?.name === "Coffee" && (
              <div className="grid grid-cols-3 gap-2">
                <input
                  className="border p-2"
                  type="number"
                  placeholder="Single"
                  value={single}
                  onChange={(e) => setSingle(e.target.value)}
                />
                <input
                  className="border p-2"
                  type="number"
                  placeholder="Double"
                  value={double}
                  onChange={(e) => setDouble(e.target.value)}
                />
                <input
                  className="border p-2"
                  type="number"
                  placeholder="Triple"
                  value={triple}
                  onChange={(e) => setTriple(e.target.value)}
                />
              </div>
            )}

            {categories.find((c) => c.id === categoryId)?.name === "Juice" && (
              <div className="grid grid-cols-3 gap-2">
                <input
                  className="border p-2"
                  type="number"
                  placeholder="Small"
                  value={small}
                  onChange={(e) => setSmall(e.target.value)}
                />
                <input
                  className="border p-2"
                  type="number"
                  placeholder="Medium"
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                />
                <input
                  className="border p-2"
                  type="number"
                  placeholder="Large"
                  value={large}
                  onChange={(e) => setLarge(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        <div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <button className="bg-black text-white px-4 py-2">Add Item</button>
      </form>

      {/* Items List */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="border p-3 rounded space-y-2">
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-24 h-24 rounded object-cover"
              />
            )}

            <div className="font-semibold">{item.name}</div>
            <div className="text-sm text-gray-600">{item.description}</div>

            {item.variants && (
              <pre className="text-xs bg-gray-100 p-2 rounded">
                {JSON.stringify(item.variants, null, 2)}
              </pre>
            )}

            <button
              className="text-red-600 text-sm"
              onClick={() => deleteItem(item.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
