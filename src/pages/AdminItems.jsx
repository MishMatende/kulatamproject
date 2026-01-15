import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminItems() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);

  // New item form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const { data: cats } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    const { data: menu } = await supabase
      .from("menu_items")
      .select("*")
      .order("sort_order", { ascending: true });

    setCategories(cats || []);
    setItems(menu || []);
  }

  async function addItem(e) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !price.trim() || !categoryId) {
      setError("Name, Price and Category are required.");
      return;
    }

    const { error } = await supabase
      .from("menu_items")
      .insert({ name, price, category_id: categoryId, description });

    if (error) setError(error.message);

    setName("");
    setPrice("");
    setCategoryId("");
    setDescription("");

    load();
  }

  async function updateItem(id, field, value) {
    const { error } = await supabase
      .from("menu_items")
      .update({ [field]: value })
      .eq("id", id);

    if (error) setError(error.message);
    load();
  }

  async function deleteItem(id) {
    const { error } = await supabase.from("menu_items").delete().eq("id", id);

    if (error) setError(error.message);
    load();
  }

  async function handleImageUpload(itemId, file) {
    if (!file) return;

    const fileName = `${itemId}-${Date.now()}`;

    // Upload to bucket
    const { data, error } = await supabase.storage
      .from("menu-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      setError(error.message);
      return;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("menu-images").getPublicUrl(fileName);

    // Save URL in DB
    const { error: dbError } = await supabase
      .from("menu_items")
      .update({ image_url: publicUrl })
      .eq("id", itemId);

    if (dbError) setError(dbError.message);

    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">Menu Items</h1>

      {/* Add Item Form */}
      <form onSubmit={addItem} className="grid grid-cols-4 gap-2">
        <input
          className="border p-2 col-span-1"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-2 col-span-1"
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <select
          className="border p-2 col-span-1"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <button className="bg-black text-white col-span-1 p-2">Add</button>

        <textarea
          className="border p-2 col-span-4"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </form>

      {error && <p className="text-red-600">{error}</p>}

      {/* Items List */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.id}>
            <h2 className="font-semibold mb-2">{cat.name}</h2>

            <ul className="space-y-2">
              {items
                .filter((i) => i.category_id === cat.id)
                .map((item) => (
                  <li key={item.id} className="border p-2 rounded">
                    <div className="flex gap-2 mb-2">
                      <input
                        className="border p-1 flex-1"
                        defaultValue={item.name}
                        onBlur={(e) =>
                          updateItem(item.id, "name", e.target.value)
                        }
                      />
                      <input
                        className="border p-1 w-24"
                        type="number"
                        defaultValue={item.price}
                        onBlur={(e) =>
                          updateItem(item.id, "price", e.target.value)
                        }
                      />
                      <button
                        className="text-red-600"
                        onClick={() => deleteItem(item.id)}
                      >
                        Delete
                      </button>
                    </div>

                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded mb-2"
                      />
                    )}

                    <textarea
                      className="border p-1 w-full"
                      defaultValue={item.description || ""}
                      onBlur={(e) =>
                        updateItem(item.id, "description", e.target.value)
                      }
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpload(item.id, e.target.files[0])
                      }
                    />
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
