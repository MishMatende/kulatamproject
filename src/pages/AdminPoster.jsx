import { useState } from "react";
import { supabase } from "../lib/supabase";
import BackButton from "../components/BackButton";
import toast from "react-hot-toast";

export default function AdminPoster() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  function handleFileChange(f) {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function uploadPoster(e) {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a poster image");
      return;
    }

    setUploading(true);

    try {
      // Disable all old posters
      await supabase
        .from("posters")
        .update({ is_active: false })
        .eq("is_active", true);

      const path = `poster-${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("poster-images")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        toast.error("Upload failed");
        console.log(uploadError);
        setUploading(false);
        return;
      }

      const { data } = supabase.storage
        .from("poster-images")
        .getPublicUrl(path);

      const imageUrl = data.publicUrl;

      const { error: insertError } = await supabase.from("posters").insert({
        image_url: imageUrl,
        is_active: true,
      });

      if (insertError) {
        toast.error("Failed to save poster");
        console.log(insertError);
        setUploading(false);
        return;
      }

      toast.success("Poster uploaded successfully!");
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    }

    setUploading(false);
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <BackButton />

      <div>
        <h1 className="text-2xl font-semibold">Poster Manager</h1>
        <p className="text-sm text-gray-500">
          Upload a poster to show on every client page refresh.
        </p>
      </div>

      <form
        onSubmit={uploadPoster}
        className="bg-white p-4 rounded-2xl shadow-sm border space-y-4"
      >
        <div className="rounded-xl bg-gray-100 h-60 flex items-center justify-center overflow-hidden">
          {preview ? (
            <img src={preview} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-500 text-sm">No poster selected</span>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files[0])}
        />

        <button
          disabled={uploading}
          className="w-full rounded-xl py-2 text-white font-medium bg-black disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload Poster"}
        </button>
      </form>
    </div>
  );
}
