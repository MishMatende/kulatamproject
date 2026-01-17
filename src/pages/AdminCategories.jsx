import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import BackButton from "../components/BackButton";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

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
    await supabase.from("categories").update({ name }).eq("id", id);
    load();
  }

  async function deleteCategory(id) {
    await supabase.from("categories").delete().eq("id", id);
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      <BackButton />
      <h1 className="text-xl font-bold">Categories</h1>

      <form onSubmit={addCategory} className="flex gap-2">
        <input
          className="border p-2 flex-1"
          placeholder="New category name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button className="bg-black text-white px-4">Add</button>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      <ul className="space-y-2">
        {categories.map((cat) => (
          <li key={cat.id} className="flex items-center gap-2">
            <input
              className="border p-2 flex-1"
              defaultValue={cat.name}
              onBlur={(e) => updateCategory(cat.id, e.target.value)}
            />
            <Link
              to={`/admin/categories/${cat.id}/subcategories`}
              className="underline text-blue-600 text-sm"
            >
              Manage Subcategories
            </Link>
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
