"use client";

import { useEffect, useState } from "react";

export default function LiveDateTime() {
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    const update = () => {
      setTimestamp(new Date().toLocaleString());
    };
    update();
    const interval = setInterval(update, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  if (!timestamp) return null;

  return (
    <div className="rounded-full border border-slate-700/70 bg-slate-900/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300">
      {timestamp}
    </div>
  );
}
