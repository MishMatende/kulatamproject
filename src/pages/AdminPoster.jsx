import { useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import BackButton from "../components/BackButton";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Loader2, UploadCloud, Trash2, ImageIcon } from "lucide-react";

export default function AdminPoster() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fileRef = useRef(null);

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

  async function uploadPoster(e) {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a poster image");
      return;
    }

    setUploading(true);

    try {
      console.log("🟡 Uploading poster file:", file);

      // Disable all old posters
      const { error: disableErr } = await supabase
        .from("posters")
        .update({ is_active: false })
        .eq("is_active", true);

      if (disableErr) {
        console.error("🔴 Failed to disable old posters:", disableErr);
        toast.error("Failed to disable old posters");
        setUploading(false);
        return;
      }

      const path = `poster-${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("poster-images")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        console.error("🔴 Upload failed:", uploadError);
        toast.error("Upload failed");
        setUploading(false);
        return;
      }

      const { data } = supabase.storage
        .from("poster-images")
        .getPublicUrl(path);

      const imageUrl = data.publicUrl;

      console.log("🟢 Poster uploaded public URL:", imageUrl);

      const { error: insertError } = await supabase.from("posters").insert({
        image_url: imageUrl,
        is_active: true,
      });

      if (insertError) {
        console.error("🔴 Failed to save poster:", insertError);
        toast.error("Failed to save poster");
        setUploading(false);
        return;
      }

      toast.success("Poster uploaded successfully!");
      removePoster();
    } catch (err) {
      console.error("🔴 Upload crashed:", err);
      toast.error("Something went wrong");
    }

    setUploading(false);
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <BackButton />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Poster Manager</h1>
        <p className="text-sm text-gray-500">
          Upload a poster to show on every client page refresh.
        </p>
      </div>

      <form
        onSubmit={uploadPoster}
        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-4"
      >
        {/* Upload Area */}
        <div
          onClick={() => fileRef.current?.click()}
          className="relative rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition cursor-pointer overflow-hidden"
        >
          {preview ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative"
            >
              <img
                src={preview}
                alt="Poster preview"
                className="w-full h-72 object-cover"
              />

              {/* Overlay */}
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

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFileChange(e.target.files[0])}
        />

        {/* Upload Button */}
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

        {/* Info Note */}
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
    </div>
  );
}
