"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const buildOptimizedUrl = (url) => {
  if (!url) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
};

export default function CleaningForm() {
  const [taskName, setTaskName] = useState("");
  const [cleanerName, setCleanerName] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    if (!taskName || !photoFile) {
      setMessage("Task name and photo are required.");
      return;
    }
    if (!cloudName || !uploadPreset) {
      setMessage("Cloudinary configuration is missing.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", photoFile);
      formData.append("upload_preset", uploadPreset);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData?.error?.message || "Upload failed");
      }

      const imageUrl = buildOptimizedUrl(uploadData.secure_url);

      if (!supabase) {
        throw new Error("Supabase client is not configured.");
      }

      const { error } = await supabase.from("cleaning_logs").insert([
        {
          task_name: taskName,
          cleaner_name: cleanerName || null,
          image_url: imageUrl,
          is_completed: true,
        },
      ]);

      if (error) {
        throw new Error(error.message);
      }

      setTaskName("");
      setCleanerName("");
      setPhotoFile(null);
      setMessage("Saved successfully.");
    } catch (err) {
      setMessage(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-xl space-y-6 rounded-3xl border border-slate-700/70 bg-slate-900/60 p-6 shadow-xl">
      <div>
        <h2 className="text-xl font-semibold text-blue-200">
          Cleaning Checklist Upload
        </h2>
        <p className="text-xs text-slate-400">
          Capture a cleaned area, upload the photo, and store it in Supabase.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Task Name
          </label>
          <input
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
            placeholder="e.g., Conveyor belt sanitation"
            value={taskName}
            onChange={(event) => setTaskName(event.target.value)}
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Cleaner Name (optional)
          </label>
          <input
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
            placeholder="Employee name"
            value={cleanerName}
            onChange={(event) => setCleanerName(event.target.value)}
          />
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Photo (Camera Only)
          </label>
          <input
            type="file"
            accept="image/*"
            capture="camera"
            onChange={(event) => setPhotoFile(event.target.files?.[0] || null)}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 p-2 text-sm text-slate-200"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-blue-500"
        >
          {loading ? "Uploading..." : "Submit"}
        </button>

        {message && (
          <div className="rounded-xl border border-slate-700/70 bg-slate-950/60 p-3 text-xs text-slate-300">
            {message}
          </div>
        )}
      </form>
    </section>
  );
}
