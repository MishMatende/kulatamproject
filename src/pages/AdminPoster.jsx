import { useRef, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import BackButton from "../components/BackButton";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  Trash2,
  CheckCircle,
  Loader2,
  ImageIcon,
} from "lucide-react";

export default function AdminPoster() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [posters, setPosters] = useState([]);
  const [loadingPosters, setLoadingPosters] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const [selectedPoster, setSelectedPoster] = useState(null);

  const fileRef = useRef(null);

  /* ================= LOAD ================= */

  async function loadPosters() {
    setLoadingPosters(true);

    const { data, error } = await supabase
      .from("posters")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load posters");
      setLoadingPosters(false);
      return;
    }

    setPosters(data || []);
    setLoadingPosters(false);
  }

  useEffect(() => {
    loadPosters();
  }, []);

  /* ================= FILE ================= */

  function handleFileChange(f) {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function removePoster() {
    setFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  /* ================= UPLOAD ================= */

  async function uploadPoster(e) {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a poster");
      return;
    }

    setUploading(true);

    try {
      const path = `poster-${Date.now()}-${file.name}`;

      await supabase.storage
        .from("poster-images")
        .upload(path, file, { upsert: true });

      const { data } = supabase.storage
        .from("poster-images")
        .getPublicUrl(path);

      await supabase.from("posters").insert({
        image_url: data.publicUrl,
        is_active: false,
        starts_at: startDate || null,
        expires_at: expiryDate || null,
      });

      toast.success("Poster uploaded");

      removePoster();
      setStartDate("");
      setExpiryDate("");

      loadPosters();
    } catch {
      toast.error("Upload failed");
    }

    setUploading(false);
  }

  /* ================= ACTIONS ================= */

  async function setActive(poster) {
    await supabase.from("posters").update({ is_active: false });

    await supabase
      .from("posters")
      .update({ is_active: true })
      .eq("id", poster.id);

    toast.success("Poster activated");
    loadPosters();
    setSelectedPoster(null);
  }

  async function deactivatePoster(poster) {
    await supabase
      .from("posters")
      .update({ is_active: false })
      .eq("id", poster.id);

    toast.success("Poster deactivated");
    loadPosters();
    setSelectedPoster(null);
  }

  async function deletePoster(poster) {
    const path = poster.image_url.split("/poster-images/")[1];

    if (path) {
      await supabase.storage.from("poster-images").remove([path]);
    }

    await supabase.from("posters").delete().eq("id", poster.id);

    toast.success("Poster deleted");
    setSelectedPoster(null);
    loadPosters();
  }

  /* ================================================= */

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10 pb-16">
      <BackButton />

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Poster Manager</h1>
        <p className="text-sm text-gray-500">
          Upload a poster to show on every client page refresh.
        </p>
      </div>

      {/* ================= LIBRARY ================= */}

      <div className="space-y-4">
        <h2 className="text-base font-semibold">Poster Library</h2>

        {loadingPosters ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {posters.map((poster) => (
              <div
                key={poster.id}
                onClick={() => setSelectedPoster(poster)}
                className="relative cursor-pointer rounded-2xl overflow-hidden border hover:shadow-md transition"
              >
                <img
                  src={poster.image_url}
                  className="h-36 w-full object-cover"
                />

                {poster.is_active && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle size={12} />
                    Active
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= UPLOAD (YOUR DESIGN + DATES) ================= */}

      <form
        onSubmit={uploadPoster}
        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-4"
      >
        {/* Start Date */}
        <div>
          <label className="text-xs text-gray-500">Start Date</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full mt-1 border rounded-xl px-3 py-2 text-sm"
          />
        </div>

        {/* Expiry Date */}
        <div>
          <label className="text-xs text-gray-500">Expiry Date</label>
          <input
            type="datetime-local"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full mt-1 border rounded-xl px-3 py-2 text-sm"
          />
        </div>

        {/* Upload Area */}
        <div
          onClick={() => fileRef.current?.click()}
          className="relative rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition cursor-pointer overflow-hidden"
        >
          {preview ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <img
                src={preview}
                alt="Poster preview"
                className="w-full h-72 object-cover"
              />

              <div className="absolute inset-0 bg-black/30 flex items-end justify-between p-4">
                <div className="text-white">
                  <p className="text-sm font-semibold">Poster Preview</p>
                  <p className="text-xs opacity-80">{file?.name}</p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePoster();
                  }}
                  className="bg-white/90 hover:bg-white text-red-600 px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-medium"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-center px-4">
              <div
                className="h-14 w-14 rounded-2xl flex items-center justify-center mb-3"
                style={{
                  backgroundColor: "rgba(0,0,0,0.05)",
                  color: "var(--brand-primary)",
                }}
              >
                <UploadCloud size={28} />
              </div>

              <p className="font-semibold text-gray-800">Upload Poster Image</p>

              <p className="text-sm text-gray-500 mt-1">
                Tap to select an image (JPG / PNG)
              </p>

              <div className="mt-4 inline-flex items-center gap-2 text-xs text-gray-400">
                <ImageIcon size={14} />
                Recommended: 1080px wide poster
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFileChange(e.target.files[0])}
        />

        <button
          disabled={uploading}
          className="w-full rounded-xl py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition"
          style={{
            backgroundColor: "var(--brand-primary)",
            color: "white",
          }}
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Uploading...
            </>
          ) : (
            <>
              <UploadCloud size={18} />
              Upload Poster
            </>
          )}
        </button>

        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{
            borderColor: "var(--brand-primary)",
            color: "var(--brand-primary)",
          }}
        >
          The latest uploaded poster will automatically become active and show
          to customers on refresh.
        </div>
      </form>

      {/* ================= PREVIEW MODAL ================= */}

      <AnimatePresence>
        {selectedPoster && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPoster(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPoster.image_url}
                className="w-full h-[420px] object-cover"
              />

              <div className="p-6 flex gap-3">
                {!selectedPoster.is_active ? (
                  <button
                    onClick={() => setActive(selectedPoster)}
                    className="flex-1 bg-green-500 text-white py-2 rounded-xl text-sm"
                  >
                    Set Active
                  </button>
                ) : (
                  <button
                    onClick={() => deactivatePoster(selectedPoster)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl text-sm"
                  >
                    Deactivate
                  </button>
                )}

                <button
                  onClick={() => deletePoster(selectedPoster)}
                  className="flex-1 bg-red-600 text-white py-2 rounded-xl text-sm"
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
