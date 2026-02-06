"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function MacyProductionPage() {
  const { state } = useApp();
  const checklistStatus = state.stages.postClean
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

  const checklistPulse =
    state.stageInProgress.preCleanBy || state.stageInProgress.postCleanBy;

  const cards = [
    {
      title: "Cleaning Stages",
      description: `Pre-clean, post-clean, handover, and area verification • ${checklistStatus}`,
      href: "/macy/production/checklist",
      highlight: checklistPulse,
    },
    {
      title: "Damage Report",
      description: "Separate damage entry with camera-only evidence.",
      href: "/macy/production/damage",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-blue-200">MACY Production</h1>
        <p className="text-sm text-slate-400">
          Choose a workflow entry point.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <div
              className={`rounded-2xl border bg-slate-900/60 p-6 shadow-lg transition hover:-translate-y-1 hover:border-orange-500/70 ${
                card.highlight
                  ? "border-emerald-400/60 ring-2 ring-emerald-400/40"
                  : "border-slate-700/70"
              }`}
            >
              <h2 className="text-lg font-semibold text-slate-100">
                {card.title}
              </h2>
              <p
                className={`mt-2 text-sm ${
                  card.highlight ? "text-emerald-200" : "text-slate-400"
                }`}
              >
                {card.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
