import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useParams, Link } from "react-router-dom";
import BackButton from "../components/BackButton";

export default function AdminSubcategories() {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [newName, setNewName] = useState("");
  const [newSort, setNewSort] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const { data: cat } = await supabase
      .from("categories")
      .select("*")
      .eq("id", categoryId)
      .single();
    setCategory(cat);

    const { data: subs } = await supabase
      .from("subcategories")
      .select("*")
      .eq("category_id", categoryId)
      .order("sort_order", { ascending: true });

    setSubcategories(subs || []);
  }

  async function addSubcategory(e) {
    e.preventDefault();
    await supabase.from("subcategories").insert({
      name: newName,
      sort_order: newSort ? parseInt(newSort) : null,
      category_id: categoryId,
    });

    setNewName("");
    setNewSort("");
    load();
  }

  async function updateField(id, field, value) {
    await supabase
      .from("subcategories")
      .update({ [field]: value })
      .eq("id", id);

    load();
  }

  async function deleteSubcategory(id) {
    await supabase.from("subcategories").delete().eq("id", id);
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <BackButton />
      <h1 className="text-xl font-bold">Subcategories for: {category?.name}</h1>

      <Link to="/admin/categories" className="underline text-blue-600 text-sm">
        ← Back to Categories
      </Link>

      <form onSubmit={addSubcategory} className="flex gap-2">
        <input
          className="border p-2 flex-1"
          placeholder="Subcategory name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          className="border p-2 w-20"
          type="number"
          placeholder="Sort"
          value={newSort}
          onChange={(e) => setNewSort(e.target.value)}
        />
        <button className="bg-black text-white px-3">Add</button>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      <ul className="space-y-2">
        {subcategories.map((sub) => (
          <li key={sub.id} className="flex items-center gap-2">
            <input
              className="border p-2 flex-1"
              defaultValue={sub.name}
              onBlur={(e) => updateField(sub.id, "name", e.target.value)}
            />
            <input
              className="border p-2 w-20"
              type="number"
              defaultValue={sub.sort_order}
              onBlur={(e) =>
                updateField(sub.id, "sort_order", parseInt(e.target.value))
              }
            />
            <button
              className="text-red-600"
              onClick={() => deleteSubcategory(sub.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
