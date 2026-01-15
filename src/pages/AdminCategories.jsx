import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) console.error(error);
    setCategories(data || []);
  }

  async function addCategory(e) {
    e.preventDefault();
    if (!newName.trim()) return;

    const { error } = await supabase
      .from("categories")
      .insert({ name: newName });

    if (error) setError(error.message);
    setNewName("");
    load();
  }

  async function updateCategory(id, name) {
    const { error } = await supabase
      .from("categories")
      .update({ name })
      .eq("id", id);

    if (error) setError(error.message);
    load();
  }

  async function deleteCategory(id) {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) setError(error.message);
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <h1 className="text-xl font-bold">Categories</h1>

      {/* Add form */}
      <form onSubmit={addCategory} className="flex gap-2">
        <input
          className="border p-2 flex-1"
          placeholder="New Category Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button className="bg-black text-white px-4">Add</button>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      {/* List */}
      <ul className="space-y-2">
        {categories.map((cat) => (
          <li key={cat.id} className="flex items-center gap-2">
            <input
              className="border p-2 flex-1"
              defaultValue={cat.name}
              onBlur={(e) => updateCategory(cat.id, e.target.value)}
            />
            <button
              className="text-red-600"
              onClick={() => deleteCategory(cat.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
