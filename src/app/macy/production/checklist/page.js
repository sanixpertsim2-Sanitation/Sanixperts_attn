"use client";

import PreClean from "@/components/Workflows/PreClean";
import PostClean from "@/components/Workflows/PostClean";
import HelpUnlock from "@/components/Workflows/HelpUnlock";
import { useApp } from "@/context/AppContext";
import Link from "next/link";

export default function MacyProductionChecklistPage() {
  const { state } = useApp();

  const stageButtons = [
    { key: "preClean", label: "Pre-Cleaning", done: state.stages.preClean },
    { key: "postClean", label: "Post-Cleaning", done: state.stages.postClean },
  ];

  const progressLabel = state.stages.postClean
    ? state.handoverRequired
      ? state.stages.handover
        ? "Handover complete"
        : "Handover pending"
      : "Post-clean complete"
    : state.stageInProgress.postCleanBy
    ? "Post-clean in progress"
    : state.stages.preClean
    ? "Pre-clean complete"
    : state.stageInProgress.preCleanBy
    ? "Pre-clean in progress"
    : "Cleaning checklist ready";

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-700/70 bg-slate-900/60 p-6">
        <h1 className="text-2xl font-bold text-blue-200">
          MACY Cleaning Checklist
        </h1>
        <p className="text-sm text-slate-400">
          Sequential stages. Completed stages vanish until unlocked.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
          {progressLabel}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {stageButtons
            .filter((stage) => !stage.done)
            .map((stage) => (
              <span
                key={stage.key}
                className="rounded-full border border-slate-600 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300"
              >
                {stage.label}
              </span>
            ))}
        </div>
      </div>

      <PreClean />
      <PostClean />

      {state.stages.postClean && state.handoverRequired && (
        <Link
          href="/macy/production/handover"
          className="inline-flex items-center rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200"
        >
          Handover Task Review
        </Link>
      )}
      {state.stages.postClean && !state.handoverRequired && (
        <div className="inline-flex items-center rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
          Line released for production
        </div>
      )}

      {state.stages.lead && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-sm text-emerald-100">
          Line released for production. Report generated at{" "}
          {state.stageTimes.leadAt
            ? new Date(state.stageTimes.leadAt).toLocaleString()
            : "just now"}
          .
        </div>
      )}

      <HelpUnlock />
    </div>
  );
}
