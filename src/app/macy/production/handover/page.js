"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import HandoverSection from "@/components/Workflows/HandoverSection";
import Link from "next/link";

export default function HandoverPage() {
  const { state } = useApp();
  const [showChecklist, setShowChecklist] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-amber-200">
        MACY Handover Review
      </h1>

      {!showChecklist && !state.stages.handover && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-slate-700/70 bg-slate-900/60 p-10 text-center">
          <p className="text-sm text-slate-300">
            Handover tasks are ready for review.
          </p>
          <button
            onClick={() => setShowChecklist(true)}
            className="rounded-full border border-amber-400/40 bg-amber-500/10 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200"
          >
            Open Handover Checklist
          </button>
        </div>
      )}

      {showChecklist && !state.stages.handover && (
        <HandoverSection redirectTo="/macy/production/checklist" />
      )}

      {state.stages.handover && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-indigo-400/40 bg-indigo-500/10 p-10 text-center">
          <p className="text-sm text-indigo-100">
            Handover submitted. Area lead verification is next.
          </p>
          <Link
            href="/macy/production/lead"
            className="rounded-full border border-indigo-400/40 bg-indigo-500/10 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200"
          >
            Proceed to Area Verification
          </Link>
        </div>
      )}
    </div>
  );
}
