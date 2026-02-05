"use client";

import { useRef, useState } from "react";

const drawTimestamp = (dataUrl) =>
  new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      const stamp = new Date().toLocaleString();
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
      ctx.fillStyle = "#ffffff";
      ctx.font = "24px Arial";
      ctx.fillText(stamp, 20, canvas.height - 18);
      resolve({ stampedUrl: canvas.toDataURL("image/jpeg"), timestamp: stamp });
    };
    image.src = dataUrl;
  });

export default function CameraCapture({ label, onCapture, required }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result?.toString() || "";
      const { stampedUrl, timestamp } = await drawTimestamp(result);
      setPreview(stampedUrl);
      onCapture({ dataUrl: stampedUrl, timestamp });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
        {label}
      </label>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="camera"
        required={required}
        onChange={handleChange}
        className="w-full rounded-lg border border-slate-700 bg-slate-950/60 p-2 text-sm text-slate-200"
      />
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
        Camera only. Gallery uploads are disabled.
      </p>
      {preview && (
        <img
          src={preview}
          alt="Captured"
          className="h-40 w-full rounded-lg object-cover"
        />
      )}
    </div>
  );
}
