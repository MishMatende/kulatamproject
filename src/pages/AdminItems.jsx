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
  const [isSaving, setIsSaving] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [variantRows, setVariantRows] = useState([{ name: "", price: "" }]);

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

  const isBuildYourOwn = useMemo(() => {
    const sub = subcategories.find((s) => s.id === subcategoryId);
    return sub?.name?.toLowerCase() === "build your own";
  }, [subcategoryId, subcategories]);

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

    const { data: cats } = await supabase.from("categories").select("id,name");

    const { data: subs } = await supabase
      .from("subcategories")
      .select("id,name,category_id,parent_id");

    const { data: menu } = await supabase.from("menu_items").select("*");

    const { data: breakfast } = await supabase
      .from("breakfast_items")
      .select("*");

    const taggedMenu = (menu || []).map((i) => ({
      ...i,
      type: "menu",
    }));

    const taggedBreakfast = (breakfast || []).map((i) => ({
      ...i,
      type: "breakfast",
    }));

    const combined = [...taggedMenu, ...taggedBreakfast];

    setCategories(cats || []);
    setSubcategories(subs || []);
    setItems(combined);

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        categories: cats || [],
        subcategories: subs || [],
        items: combined,
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

    // ✅ Build Your Own filter
    if (activeCategoryFilter === "build-your-own") {
      filtered = filtered.filter((item) => item.type === "breakfast");
    }
    // ✅ Normal category filter
    else if (activeCategoryFilter !== "all") {
      filtered = filtered.filter((item) => {
        if (item.type === "menu") {
          return item.category_id === activeCategoryFilter;
        }

        return false; // hide breakfast items in normal categories
      });
    }

    // ✅ Search
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
    setName(item.name || "");
    setDesc(item.description || "");
    setPrice(item.price ?? "");
    setPreview(item.image_url || null);
    setFile(null);

    if (item.type === "breakfast") {
      // 🔒 Safe lookup
      const byoSub = subcategories.find(
        (s) => s?.name?.toLowerCase?.() === "build your own",
      );

      if (!byoSub) {
        console.warn("⚠️ Build Your Own subcategory not found");
        toast.error("Build Your Own subcategory missing");
        return;
      }

      // ✅ Set safely
      setCategoryId(byoSub.category_id || "");
      setSubcategoryId(byoSub.id || "");

      try {
        const chain = buildChain(byoSub.id);
        setSelectedChain(chain || []);
      } catch (err) {
        console.warn("⚠️ buildChain failed:", err);
        setSelectedChain([]);
      }

      setShowVariants(false);
      setVariantRows([{ name: "", price: "" }]); // reset
    } else {
      if (item.variants) {
        setShowVariants(true);

        const rows = Object.entries(item.variants || {}).map(
          ([key, value]) => ({
            name: key,
            price: value,
          }),
        );

        setVariantRows(rows.length ? rows : [{ name: "", price: "" }]);
        setPrice("");
      } else {
        setShowVariants(false);
        setVariantRows([{ name: "", price: "" }]);
      }

      setCategoryId(item.category_id || "");
      setSubcategoryId(item.subcategory_id || "");

      try {
        const chain = buildChain(item.subcategory_id);
        setSelectedChain(chain || []);
      } catch {
        setSelectedChain([]);
      }
    }

    setOpen(true);
  }

  /* ---------------- SAVE ---------------- */

  async function handleSave(e) {
    e.preventDefault();

    if (isSaving) return;

    setIsSaving(true);

    try {
      haptic("medium");

      if (!name || !categoryId || !subcategoryId) {
        toast.error("Name, category & subcategory required");
        return;
      }

      if (!showVariants && !price) {
        toast.error("Price required");
        return;
      }

      if (showVariants && variantRows.some((v) => !v.name || !v.price)) {
        toast.error("All variants must have name & price");
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
      /* ---------- PAYLOAD ---------- */
      let payload;

      if (isBuildYourOwn) {
        payload = {
          name,
          price: Number(price),
          image_url: imageUrl,
        };
      } else {
        let variantsObject = null;
        let finalPrice = null;

        if (showVariants) {
          variantsObject = {};
          variantRows.forEach((v) => {
            variantsObject[v.name] = Number(v.price);
          });
        } else {
          finalPrice = Number(price);
        }

        payload = {
          name,
          description: desc,
          price: finalPrice,
          variants: variantsObject,
          category_id: categoryId,
          subcategory_id: subcategoryId,
          image_url: imageUrl,
        };
      }

      /* ---------- UPDATE ---------- */
      const table = isBuildYourOwn ? "breakfast_items" : "menu_items";

      if (editingItem) {
        await supabase.from(table).update(payload).eq("id", editingItem.id);
        toast.success("Item updated");
      } else {
        await supabase.from(table).insert(payload);
        toast.success("Item added");
      }

      setOpen(false);
      localStorage.removeItem(CACHE_KEY);
      await load(true);
    } finally {
      setIsSaving(false);
    }
  }

  /* ---------------- DELETE ---------------- */

  async function confirmDelete() {
    if (!deleteItem) return;

    haptic("heavy");

    const table =
      deleteItem.type === "breakfast" ? "breakfast_items" : "menu_items";

    await supabase.from(table).delete().eq("id", deleteItem.id);

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

  function getChildSubcategoryName(id) {
    const sub = subcategories.find((s) => s.id === id);

    // Only return name if it has a parent_id (meaning it's a child)
    if (sub && sub.parent_id) {
      return sub.name;
    }

    return null;
  }

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
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
              activeCategoryFilter === "all"
                ? "bg-(--brand-primary) text-white shadow-md"
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
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                activeCategoryFilter === cat.id
                  ? "bg-(--brand-primary) text-white shadow-md"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {cat.name}
            </button>
          ))}
          <button
            onClick={() => {
              haptic("light");
              setActiveCategoryFilter("build-your-own");
            }}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
              activeCategoryFilter === "build-your-own"
                ? "bg-(--brand-primary) text-white shadow-md"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Build Your Own
          </button>
        </div>

        {/* Subtle bottom fade for scroll hint */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-linear-to-l from-white to-transparent" />
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
                <h3 className="font-semibold flex items-center gap-2">
                  {item.name}

                  {getChildSubcategoryName(item.subcategory_id) && (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                      {getChildSubcategoryName(item.subcategory_id)}
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-500">{item.description}</p>
                {item.type === "breakfast" ? (
                  <p
                    className="text-sm font-bold"
                    style={{ color: "var(--brand-primary)" }}
                  >
                    KES {item.price?.toLocaleString()}
                  </p>
                ) : item.variants ? (
                  <div className="text-sm space-y-1">
                    {Object.entries(item.variants).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex gap-2 text-sm font-bold"
                        style={{ color: "var(--brand-primary)" }}
                      >
                        <span>{key}</span>
                        <span>KES {Number(value).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p
                    className="text-sm font-bold"
                    style={{ color: "var(--brand-primary)" }}
                  >
                    KES {item.price?.toLocaleString()}
                  </p>
                )}
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

              {/* Price / Variants Toggle */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-600">
                    {showVariants ? "Variants" : "Price"}
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setShowVariants(!showVariants);
                      setPrice("");
                    }}
                    className="text-xs font-semibold"
                    style={{ color: "var(--brand-primary)" }}
                  >
                    {showVariants ? "Price" : "Variants"}
                  </button>
                </div>

                {/* ---------------- PRICE MODE ---------------- */}
                {!showVariants ? (
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-full rounded-xl bg-gray-100 px-4 py-2"
                    placeholder="Price (KES)"
                    value={price}
                    onChange={(e) => {
                      const formatted = e.target.value;
                      setPrice(formatted);
                    }}
                  />
                ) : (
                  /* ---------------- VARIANTS MODE ---------------- */
                  <div className="space-y-2">
                    {variantRows.map((row, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          className="flex-1 rounded-xl bg-gray-100 px-3 py-2"
                          placeholder="Variant name (e.g. Large)"
                          value={row.name}
                          onChange={(e) => {
                            const updated = [...variantRows];
                            updated[index].name = e.target.value;
                            setVariantRows(updated);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              document
                                .getElementById(`variant-price-${index}`)
                                ?.focus();
                            }
                          }}
                        />

                        <input
                          id={`variant-price-${index}`}
                          type="text"
                          inputMode="numeric"
                          className="w-28 rounded-xl bg-gray-100 px-3 py-2"
                          placeholder="Price"
                          value={row.price}
                          onChange={(e) => {
                            const formatted = e.target.value;
                            const updated = [...variantRows];
                            updated[index].price = formatted;
                            setVariantRows(updated);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (index === variantRows.length - 1) {
                                setVariantRows([
                                  ...variantRows,
                                  { name: "", price: "" },
                                ]);
                              }
                              setTimeout(() => {
                                document
                                  .getElementById(`variant-name-${index + 1}`)
                                  ?.focus();
                              }, 50);
                            }
                          }}
                        />

                        <button
                          type="button"
                          onClick={() => {
                            const updated = variantRows.filter(
                              (_, i) => i !== index,
                            );
                            setVariantRows(
                              updated.length
                                ? updated
                                : [{ name: "", price: "" }],
                            );
                          }}
                          className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        setVariantRows([
                          ...variantRows,
                          { name: "", price: "" },
                        ])
                      }
                      className="text-sm font-medium"
                      style={{ color: "var(--brand-primary)" }}
                    >
                      + Add Variant
                    </button>
                  </div>
                )}
              </div>

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
                type="submit"
                disabled={isSaving}
                className="w-full border rounded-xl py-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  borderColor: "var(--brand-primary)",
                  color: "var(--brand-primary)",
                }}
              >
                {isSaving && (
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}

                {isSaving
                  ? editingItem
                    ? "Updating..."
                    : "Saving..."
                  : "Save"}
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
