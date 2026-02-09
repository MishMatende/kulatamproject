import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useParams, Link } from "react-router-dom";
import BackButton from "../components/BackButton";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminSubcategories() {
  const { categoryId } = useParams();

  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [newName, setNewName] = useState("");
  const [newSort, setNewSort] = useState("");

  // Delete modal state
  const [deleteSub, setDeleteSub] = useState(null);

  // Uploading state
  const [uploadingId, setUploadingId] = useState(null);

  const fileInputRefs = useRef({});

  const CACHE_KEY = `admin_subcategories_${categoryId}`;
  const TTL_MINUTES = 1;

  /* ---------------- LOAD ---------------- */
  async function load(force = false) {
    console.log("🔄 load() subcategories | force =", force);

    if (!force) {
      try {
        const cachedRaw = localStorage.getItem(CACHE_KEY);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          const age = Date.now() - cached.timestamp;

          if (age < TTL_MINUTES * 60 * 1000) {
            console.log("🟢 Using cached subcategories");
            setCategory(cached.category);
            setSubcategories(cached.subcategories);
            return;
          }
        }
      } catch (err) {
        console.warn("🟡 Cache read failed", err);
      }
    }

    console.log("🟡 Fetching fresh subcategories from Supabase");

    const { data: cat, error: catErr } = await supabase
      .from("categories")
      .select("*")
      .eq("id", categoryId)
      .single();

    if (catErr) {
      console.error("🔴 Category load failed:", catErr);
      toast.error("Failed to load category");
      return;
    }

    const { data: subs, error: subErr } = await supabase
      .from("subcategories")
      .select("*")
      .eq("category_id", categoryId)
      .order("sort_order", { ascending: true });

    if (subErr) {
      console.error("🔴 Subcategories load failed:", subErr);
      toast.error("Failed to load subcategories");
      return;
    }

    setCategory(cat);
    setSubcategories(subs || []);

    // 3️⃣ Save cache
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        category: cat,
        subcategories: subs || [],
        timestamp: Date.now(),
      }),
    );

    console.log("🟢 Subcategories cache updated");
  }

  /* ---------------- ADD ---------------- */
  async function addSubcategory(e) {
    e.preventDefault();

    if (!newName.trim()) {
      toast.error("Subcategory name is required");
      return;
    }

    const { error } = await supabase.from("subcategories").insert({
      name: newName,
      sort_order: newSort ? parseInt(newSort) : null,
      category_id: categoryId,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Subcategory added");
    setNewName("");
    setNewSort("");
    localStorage.removeItem(CACHE_KEY);
    load(true); // 👈 force refresh
  }

  /* ---------------- UPDATE ---------------- */
  async function updateField(id, field, value) {
    const { error } = await supabase
      .from("subcategories")
      .update({ [field]: value })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update subcategory");
      return;
    }

    toast.success("Subcategory updated");
    localStorage.removeItem(CACHE_KEY);
    load(true);
  }

  /* ---------------- UPLOAD IMAGE ---------------- */
  async function uploadImage(sub, file) {
    if (!file) return;

    try {
      setUploadingId(sub.id);

      const fileExt = file.name.split(".").pop();
      const filePath = `subcategories/${sub.id}-${Date.now()}.${fileExt}`;

      console.log("🟡 Uploading subcategory image:", filePath);

      const { error: uploadErr } = await supabase.storage
        .from("subcategory-images")
        .upload(filePath, file, { upsert: true });

      if (uploadErr) {
        console.error("🔴 Upload failed:", uploadErr);
        toast.error("Image upload failed");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("subcategory-images").getPublicUrl(filePath);

      console.log("🟢 Uploaded image URL:", publicUrl);

      const { error: updateErr } = await supabase
        .from("subcategories")
        .update({ image_url: publicUrl })
        .eq("id", sub.id);

      if (updateErr) {
        console.error("🔴 DB update failed:", updateErr);
        toast.error("Failed to save image");
        return;
      }

      toast.success("Image updated");
      localStorage.removeItem(CACHE_KEY);
      load(true);
    } catch (err) {
      console.error("🔴 Upload crash:", err);
      toast.error("Upload crashed");
    } finally {
      setUploadingId(null);
    }
  }

  /* ---------------- DELETE ---------------- */
  async function confirmDelete() {
    if (!deleteSub) return;

    const { error } = await supabase
      .from("subcategories")
      .delete()
      .eq("id", deleteSub.id);

    if (error) {
      console.error("🔴 Delete failed:", error);
      toast.error("Failed to delete subcategory");
      return;
    }

    toast.success("Subcategory deleted");
    setDeleteSub(null);
    localStorage.removeItem(CACHE_KEY);
    load(true);
  }

  /* ---------------- REALTIME ---------------- */
  useEffect(() => {
    const channel = supabase
      .channel(`subcategory-changes-${categoryId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subcategories",
          filter: `category_id=eq.${categoryId}`,
        },
        (payload) => {
          console.log("🟢 Realtime subcategory change:", payload.eventType);
          localStorage.removeItem(CACHE_KEY);
          load(true);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [categoryId]);

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    load();
  }, [categoryId]);

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <BackButton />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Subcategories</h1>
        <p className="text-sm text-gray-500">
          Category: <span className="font-medium">{category?.name}</span>
        </p>
      </div>

      {/* Add Subcategory */}
      <form
        onSubmit={addSubcategory}
        className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200 flex gap-2"
      >
        <input
          className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Subcategory name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          className="w-20 rounded-xl border border-gray-300 px-2 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-black"
          type="number"
          placeholder="Sort"
          value={newSort}
          onChange={(e) => setNewSort(e.target.value)}
        />
        <button
          className="rounded-xl bg-black text-white px-4 py-2 text-sm font-medium
                     active:scale-95 transition"
        >
          Add
        </button>
      </form>

      {/* Info Note */}
      <div
        className="rounded-xl border border-blue-200 px-4 py-3"
        style={{
          borderColor: "var(--brand-primary)",
          color: "var(--brand-primary)",
        }}
      >
        <p className="text-sm">
          You can edit the name and sort order directly. Upload an image for
          each subcategory to replace the static background.
        </p>
      </div>

      {/* Subcategory List */}
      <div className="space-y-3">
        {subcategories.map((sub) => (
          <div
            key={sub.id}
            className="rounded-2xl bg-white p-4 shadow-sm border border-gray-200 space-y-3"
          >
            {/* Image Preview */}
            <div className="rounded-xl bg-gray-100 h-40 flex items-center justify-center overflow-hidden">
              {sub.image_url ? (
                <img
                  src={sub.image_url}
                  className="w-full h-full object-cover"
                  alt={sub.name}
                />
              ) : (
                <span className="text-sm text-gray-400">No image uploaded</span>
              )}
            </div>

            {/* Inputs Row */}
            <div className="flex items-center gap-2">
              <input
                className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-black"
                defaultValue={sub.name}
                onBlur={(e) => updateField(sub.id, "name", e.target.value)}
              />
              <input
                className="w-20 rounded-xl border border-gray-300 px-2 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-black"
                type="number"
                defaultValue={sub.sort_order}
                onBlur={(e) =>
                  updateField(
                    sub.id,
                    "sort_order",
                    e.target.value ? parseInt(e.target.value) : null,
                  )
                }
              />

              <button
                onClick={() => setDeleteSub(sub)}
                className="text-sm font-medium text-red-600"
              >
                Delete
              </button>
            </div>

            {/* Upload Button */}
            <div>
              <input
                type="file"
                accept="image/*"
                hidden
                ref={(el) => (fileInputRefs.current[sub.id] = el)}
                onChange={(e) => uploadImage(sub, e.target.files[0])}
              />

              <button
                onClick={() => fileInputRefs.current[sub.id]?.click()}
                disabled={uploadingId === sub.id}
                className="w-full rounded-xl border py-2 flex items-center justify-center gap-2 text-sm font-medium"
                style={{
                  borderColor: "var(--brand-primary)",
                  color: "var(--brand-primary)",
                }}
              >
                {uploadingId === sub.id ? "Uploading..." : "Upload Image"}
              </button>
            </div>
          </div>
        ))}

        {subcategories.length === 0 && (
          <p className="text-center text-sm text-gray-400">
            No subcategories yet.
          </p>
        )}
      </div>

      {/* ---------------- DELETE CONFIRM MODAL ---------------- */}
      <AnimatePresence>
        {deleteSub && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteSub(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl p-5 w-full sm:max-w-md space-y-4"
            >
              <h2 className="text-lg font-semibold text-red-600">
                Delete Subcategory
              </h2>

              <p className="text-sm text-gray-600">
                Are you sure you want to delete{" "}
                <strong>{deleteSub.name}</strong>? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteSub(null)}
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
