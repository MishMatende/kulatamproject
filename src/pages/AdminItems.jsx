import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "../lib/supabase";
import BackButton from "../components/BackButton";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FiTrash2 } from "react-icons/fi";

const PAGE_SIZE = 5;

export default function AdminItems() {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [items, setItems] = useState([]);

  // 🔥 NEW — Active category filter
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");

  // Edit modal
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Delete modal
  const [deleteItem, setDeleteItem] = useState(null);

  // Form
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [selectedChain, setSelectedChain] = useState([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Search + pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fileInputRef = useRef(null);

  const CACHE_KEY = "admin_items";
  const TTL_MINUTES = 1;

  /* ---------------- HAPTIC ---------------- */
  function haptic(type = "light") {
    if (!navigator.vibrate) return;
    if (type === "light") navigator.vibrate(10);
    if (type === "medium") navigator.vibrate(20);
    if (type === "heavy") navigator.vibrate([20, 40, 20]);
  }

  /* ---------------- LOAD ---------------- */
  async function load(force = false) {
    if (!force) {
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (cached && Date.now() - cached.timestamp < TTL_MINUTES * 60000) {
          setCategories(cached.categories);
          setSubcategories(cached.subcategories);
          setItems(cached.items);
          return;
        }
      } catch (err) {
        console.warn("🟡 Cache read failed", err);
      }
    }

    const { data: cats, error: catErr } = await supabase
      .from("categories")
      .select("id,name");

    const { data: subs, error: subErr } = await supabase
      .from("subcategories")
      .select("id,name,category_id,parent_id"); // 🔥 parent_id added

    const { data: menu, error: menuErr } = await supabase
      .from("menu_items")
      .select("*");

    if (catErr || subErr || menuErr) {
      console.error("🔴 Load error:", { catErr, subErr, menuErr });
      return;
    }

    setCategories(cats || []);
    setSubcategories(subs || []);
    setItems(menu || []);

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        categories: cats || [],
        subcategories: subs || [],
        items: menu || [],
        timestamp: Date.now(),
      }),
    );
  }

  useEffect(() => {
    load();
  }, []);

  /* ---------------- HIERARCHY HELPERS ---------------- */

  const topLevelSubs = subcategories.filter(
    (s) => s.category_id === categoryId && !s.parent_id,
  );

  function getChildren(parentId) {
    return subcategories.filter((s) => s.parent_id === parentId);
  }

  function handleSubSelect(level, id) {
    const newChain = [...selectedChain.slice(0, level), id];
    setSelectedChain(newChain);
    setSubcategoryId(id); // always keep last selected
  }

  function buildChain(subId) {
    const chain = [];
    let current = subcategories.find((s) => s.id === subId);

    while (current) {
      chain.unshift(current.id);
      current = subcategories.find((s) => s.id === current.parent_id);
    }

    return chain;
  }

  /* ---------------- SEARCH + PAGINATION ---------------- */

  const filteredItems = useMemo(() => {
    let filtered = items;

    // 🔥 Category filter
    if (activeCategoryFilter !== "all") {
      filtered = filtered.filter(
        (item) => item.category_id === activeCategoryFilter,
      );
    }

    // 🔥 Search filter
    if (search) {
      filtered = filtered.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    return filtered;
  }, [items, search, activeCategoryFilter]);

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, page]);

  useEffect(() => {
    setPage(1);
  }, [search, activeCategoryFilter]);

  /* ---------------- IMAGE ---------------- */

  function handleFileChange(f) {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  /* ---------------- OPEN MODALS ---------------- */

  function openAddModal() {
    setEditingItem(null);
    setName("");
    setDesc("");
    setPrice("");
    setCategoryId("");
    setSubcategoryId("");
    setSelectedChain([]); // 🔥 reset chain
    setFile(null);
    setPreview(null);
    setOpen(true);
  }

  function openEditModal(item) {
    setEditingItem(item);
    setName(item.name);
    setDesc(item.description || "");
    setPrice(item.price ?? "");
    setCategoryId(item.category_id);
    setSubcategoryId(item.subcategory_id);
    setSelectedChain(buildChain(item.subcategory_id)); // 🔥 rebuild hierarchy
    setPreview(item.image_url || null);
    setFile(null);
    setOpen(true);
  }

  /* ---------------- SAVE ---------------- */

  async function handleSave(e) {
    e.preventDefault();
    haptic("medium");

    if (!name || !price || !categoryId || !subcategoryId) {
      toast.error("Name, price, category & subcategory required");
      return;
    }

    let imageUrl = editingItem?.image_url || null;

    /* ---------- IMAGE UPLOAD ---------- */
    if (file) {
      try {
        const path = `${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("menu-images")
          .upload(path, file);

        if (uploadError) {
          toast.error("Image upload failed");
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("menu-images").getPublicUrl(path);

        imageUrl = publicUrl;
      } catch {
        toast.error("Image upload crashed");
        return;
      }
    }

    /* ---------- PAYLOAD ---------- */
    const payload = {
      name,
      description: desc,
      price: Number(price),
      category_id: categoryId,
      subcategory_id: subcategoryId,
      image_url: imageUrl,
    };

    /* ---------- UPDATE ---------- */
    if (editingItem) {
      await supabase
        .from("menu_items")
        .update(payload)
        .eq("id", editingItem.id);
      toast.success("Item updated");
    } else {
      await supabase.from("menu_items").insert(payload);
      toast.success("Item added");
    }

    setOpen(false);
    localStorage.removeItem(CACHE_KEY);
    load(true);
  }

  /* ---------------- DELETE ---------------- */

  async function confirmDelete() {
    if (!deleteItem) return;

    haptic("heavy");

    await supabase.from("menu_items").delete().eq("id", deleteItem.id);
    toast.success("Item deleted");

    setDeleteItem(null);
    localStorage.removeItem(CACHE_KEY);
    load(true);
  }

  /* ---------------- REALTIME ---------------- */

  useEffect(() => {
    const channel = supabase
      .channel("menu-items-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_items" },
        () => {
          localStorage.removeItem(CACHE_KEY);
          load(true);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <BackButton />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Menu Items</h1>
          <p className="text-sm text-gray-500">Tap an item to edit</p>
        </div>

        <button
          onClick={() => {
            haptic("medium");
            openAddModal();
          }}
          className="rounded-full border px-4 py-2 text-sm shadow-md"
          style={{
            borderColor: "var(--brand-primary)",
            color: "var(--brand-primary)",
          }}
        >
          + Add Item
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
          {/* All Tab */}
          <button
            onClick={() => {
              haptic("light");
              setActiveCategoryFilter("all");
            }}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
              activeCategoryFilter === "all"
                ? "bg-[var(--brand-primary)] text-white shadow-md"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            All
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                haptic("light");
                setActiveCategoryFilter(cat.id);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                activeCategoryFilter === cat.id
                  ? "bg-[var(--brand-primary)] text-white shadow-md"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Subtle bottom fade for scroll hint */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent" />
      </div>

      <input
        className="w-full rounded-xl bg-white shadow-sm px-4 py-3 text-sm focus:outline-none"
        placeholder="Search items…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Items List unchanged */}
      <div className="space-y-3">
        {paginatedItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-sm p-4 flex gap-4 items-center"
          >
            <div
              onClick={() => openEditModal(item)}
              className="flex gap-4 flex-1 cursor-pointer"
            >
              {item.image_url && (
                <img
                  src={item.image_url}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              )}
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
                <p
                  className="text-sm font-bold"
                  style={{ color: "var(--brand-primary)" }}
                >
                  KES {item.price?.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteItem(item);
              }}
              className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* ---------------- DELETE CONFIRM MODAL ---------------- */}
      <AnimatePresence>
        {deleteItem && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteItem(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl p-5 w-full sm:max-w-md space-y-4"
            >
              <h2 className="text-lg font-semibold text-red-600">
                Delete Item
              </h2>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete{" "}
                <strong>{deleteItem.name}</strong>? This action cannot be
                undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteItem(null)}
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

      {/* ---------------- EDIT / ADD MODAL (unchanged) ---------------- */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.form
              onSubmit={handleSave}
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl p-5 w-full sm:max-w-lg space-y-4"
            >
              <h2 className="text-lg font-semibold">
                {editingItem ? "Edit Item" : "Add Item"}
              </h2>

              <div
                onClick={() => fileInputRef.current.click()}
                className="rounded-xl bg-gray-100 h-40 flex items-center justify-center cursor-pointer text-gray-500"
              >
                {preview ? (
                  <img
                    src={preview}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <span>📷 Tap to add image</span>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files[0])}
              />

              <input
                className="w-full rounded-xl bg-gray-100 px-4 py-2"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                type="number"
                className="w-full rounded-xl bg-gray-100 px-4 py-2"
                placeholder="Price (KES)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />

              <textarea
                className="w-full rounded-xl bg-gray-100 px-4 py-2"
                placeholder="Description"
                rows={2}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />

              <select
                className="w-full rounded-xl bg-gray-100 px-4 py-2"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubcategoryId("");
                  setSelectedChain([]);
                }}
              >
                <option value="">Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* 🔥 Dynamic Subcategories */}
              <select
                className="w-full rounded-xl bg-gray-100 px-4 py-2"
                value={selectedChain[0] || ""}
                onChange={(e) => handleSubSelect(0, e.target.value)}
              >
                <option value="">Subcategory</option>
                {topLevelSubs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              {selectedChain.map((parentId, index) => {
                const children = getChildren(parentId);
                if (!children.length) return null;

                return (
                  <select
                    key={parentId}
                    className="w-full rounded-xl bg-gray-100 px-4 py-2"
                    value={selectedChain[index + 1] || ""}
                    onChange={(e) => handleSubSelect(index + 1, e.target.value)}
                  >
                    <option value="">Select Subcategory</option>
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name}
                      </option>
                    ))}
                  </select>
                );
              })}

              <button
                className="w-full border rounded-xl py-2"
                style={{
                  borderColor: "var(--brand-primary)",
                  color: "var(--brand-primary)",
                }}
              >
                Save
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
