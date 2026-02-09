import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import BackButton from "../components/BackButton";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FiImage, FiTrash2 } from "react-icons/fi";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState("");

  // Delete modal state
  const [deleteCat, setDeleteCat] = useState(null);

  // Image upload state
  const [uploadingId, setUploadingId] = useState(null);
  const fileInputRef = useRef(null);

  const CACHE_KEY = "admin_categories";
  const TTL_MINUTES = 10;

  /* ---------------- LOAD ---------------- */
  async function load(force = false) {
    console.log("🔄 load() categories | force =", force);

    if (!force) {
      try {
        const cachedRaw = localStorage.getItem(CACHE_KEY);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          const age = Date.now() - cached.timestamp;

          if (age < TTL_MINUTES * 60 * 1000) {
            console.log("🟢 Using cached categories");
            setCategories(cached.categories);
            return;
          }
        }
      } catch (err) {
        console.warn("🟡 Cache read failed", err);
      }
    }

    console.log("🟡 Fetching fresh categories from Supabase");

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("🔴 Categories load failed:", error);
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

    console.log("🟢 Categories cache updated");
  }

  /* ---------------- ADD ---------------- */
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
    load(true); // 👈 force refresh
  }

  /* ---------------- UPDATE ---------------- */
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
    load(true);
  }

  /* ---------------- IMAGE UPLOAD ---------------- */
  async function uploadCategoryImage(categoryId, file) {
    if (!file) return;

    setUploadingId(categoryId);

    try {
      const path = `${categoryId}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("category-images")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        console.error(uploadError);
        toast.error("Upload failed");
        setUploadingId(null);
        return;
      }

      const { data } = supabase.storage
        .from("category-images")
        .getPublicUrl(path);

      const imageUrl = data.publicUrl;

      const { error: updateErr } = await supabase
        .from("categories")
        .update({ image_url: imageUrl })
        .eq("id", categoryId);

      if (updateErr) {
        console.error(updateErr);
        toast.error("Failed to save image URL");
        setUploadingId(null);
        return;
      }

      toast.success("Category image updated");
      localStorage.removeItem(CACHE_KEY);
      load(true);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }

    setUploadingId(null);
  }

  /* ---------------- REMOVE IMAGE ---------------- */
  async function removeCategoryImage(categoryId) {
    const { error } = await supabase
      .from("categories")
      .update({ image_url: null })
      .eq("id", categoryId);

    if (error) {
      toast.error("Failed to remove image");
      return;
    }

    toast.success("Category image removed");
    localStorage.removeItem(CACHE_KEY);
    load(true);
  }

  /* ---------------- DELETE ---------------- */
  async function confirmDelete() {
    if (!deleteCat) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", deleteCat.id);

    if (error) {
      console.error("🔴 Delete failed:", error);
      toast.error("Failed to delete category");
      return;
    }

    toast.success("Category deleted");
    setDeleteCat(null);
    localStorage.removeItem(CACHE_KEY);
    load(true); // 👈 force refresh
  }

  /* ---------------- REALTIME ---------------- */
  useEffect(() => {
    const channel = supabase
      .channel("category-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        (payload) => {
          console.log("🟢 Realtime category change:", payload.eventType);
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
            className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200 space-y-3"
          >
            {/* IMAGE PREVIEW */}
            <div className="w-full h-28 rounded-xl bg-gray-100 overflow-hidden relative">
              {cat.image_url ? (
                <img
                  src={cat.image_url}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  No image uploaded
                </div>
              )}
            </div>

            {/* INPUT + ACTIONS */}
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
                onClick={() => setDeleteCat(cat)}
                className="text-sm font-medium text-red-600"
              >
                Delete
              </button>
            </div>

            {/* IMAGE BUTTONS */}
            <div className="flex gap-2">
              <label
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm cursor-pointer
                           hover:bg-gray-50 transition"
                style={{
                  borderColor: "var(--brand-primary)",
                  color: "var(--brand-primary)",
                }}
              >
                <FiImage size={16} />
                {uploadingId === cat.id ? "Uploading..." : "Upload Image"}

                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) =>
                    uploadCategoryImage(cat.id, e.target.files?.[0])
                  }
                />
              </label>

              {cat.image_url && (
                <button
                  onClick={() => removeCategoryImage(cat.id)}
                  className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
                >
                  <FiTrash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ---------------- DELETE CONFIRM MODAL ---------------- */}
      <AnimatePresence>
        {deleteCat && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteCat(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl p-5 w-full sm:max-w-md space-y-4"
            >
              <h2 className="text-lg font-semibold text-red-600">
                Delete Category
              </h2>

              <p className="text-sm text-gray-600">
                Are you sure you want to delete{" "}
                <strong>{deleteCat.name}</strong>? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteCat(null)}
                  className="flex-1 rounded-xl bg-gray-100 py-2"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmDelete}
                  className="flex-1 rounded-xl bg-red-600 text-white py-2"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
