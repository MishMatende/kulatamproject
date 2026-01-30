import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import BackButton from "../components/BackButton";
import toast from "react-hot-toast";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState("");

  const CACHE_KEY = "admin_categories";
  const TTL_MINUTES = 10;

  async function load() {
    // 1️⃣ Cache first
    try {
      const cachedRaw = localStorage.getItem(CACHE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        const age = Date.now() - cached.timestamp;

        if (age < TTL_MINUTES * 60 * 1000) {
          setCategories(cached.categories);
          return;
        } else {
          localStorage.removeItem(CACHE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(CACHE_KEY);
    }

    // 2️⃣ Fetch
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      toast.error("Failed to load categories");
      return;
    }

    setCategories(data || []);

    // 3️⃣ Save cache
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        categories: data || [],
        timestamp: Date.now(),
      }),
    );
  }

  async function addCategory(e) {
    e.preventDefault();
    if (!newName.trim()) return;

    const { error } = await supabase
      .from("categories")
      .insert({ name: newName });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Category added");
    setNewName("");
    localStorage.removeItem(CACHE_KEY);
    load();
  }

  async function updateCategory(id, name) {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    const { error } = await supabase
      .from("categories")
      .update({ name })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update category");
      return;
    }

    toast.success("Category updated");
    localStorage.removeItem(CACHE_KEY);
    load();
  }

  async function deleteCategory(id) {
    if (!confirm("Delete this category?")) return;

    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete category");
      return;
    }

    toast.success("Category deleted");
    localStorage.removeItem(CACHE_KEY);
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <BackButton />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Categories</h1>
        <p className="text-sm text-gray-500">Manage your menu categories</p>
      </div>

      {/* Add Category Card */}
      <form
        onSubmit={addCategory}
        className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200 flex gap-2"
      >
        <input
          className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="New category name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button
          className="rounded-xl bg-black text-white px-4 py-2 text-sm font-medium
                     active:scale-95 transition"
        >
          Add
        </button>
      </form>

      {/* Category List */}
      <div className="space-y-3">
        {/* Info Note */}
        <div
          className="rounded-xl border border-blue-200 px-4 py-3"
          style={{
            borderColor: "var(--brand-primary)",
            color: "var(--brand-primary)",
          }}
        >
          <p className="text-sm">
            Tap <span className="font-semibold">Manage</span> to edit
            subcategories inside each category.
          </p>
        </div>

        {categories.map((cat) => (
          <div
            key={cat.id}
            className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200"
          >
            <div className="flex items-center gap-2">
              <input
                className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-black"
                defaultValue={cat.name}
                onBlur={(e) => updateCategory(cat.id, e.target.value)}
              />

              <Link
                to={`/admin/categories/${cat.id}/subcategories`}
                className="text-sm font-medium text-blue-600"
              >
                Manage
              </Link>

              <button
                onClick={() => deleteCategory(cat.id)}
                className="text-sm font-medium text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
