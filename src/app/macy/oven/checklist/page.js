"use client";

import PreClean from "@/components/Workflows/PreClean";
import PostClean from "@/components/Workflows/PostClean";
import ProductionManager from "@/components/Admin/ProductionManager";
import AnnouncementBanner from "@/components/Layout/AnnouncementBanner";
import LineReportSummary from "@/components/Reports/LineReportSummary";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import { useCallback } from "react";

const preCleanQuestions = [
  "Verify the equipment for any inadequate condition and safety issues.",
  "Check sensors and motor.",
  "Verify damage on frame, conveyor, panels, plugs, and emergency button.",
];

const postCleanQuestions = [
  "Inside frame from top, bottom and sides are cleaned.",
  "Front cover, oven exit hood and doors are cleaned.",
  "Floor is clean and dry.",
  "No sanitation equipment is on the floor.",
];

export default function MacyOvenChecklistPage() {
  const { state } = useApp();
  const scrollToSection = useCallback((id) => {
    if (typeof document === "undefined") return;
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);
  
  const handoverNeeded = state.handoverRequired === true;
  const handoverEnabled = state.stages.postClean && handoverNeeded;
  const leadEnabled = state.stages.postClean && (!handoverNeeded || state.stages.handover);

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

  const stageCards = [
    {
      key: "pre",
      label: "Pre-Cleaning",
      status: state.stages.preClean
        ? "Completed"
        : state.stageInProgress.preCleanBy
        ? `In progress: ${state.stageInProgress.preCleanBy}`
        : state.stageLockedBy.preClean
        ? `🔒 Locked by ${state.stageLockedBy.preClean}`
        : "Ready",
      action: () => scrollToSection("pre-clean-stage"),
      disabled: state.stages.preClean,
    },
    {
      key: "post",
      label: "Post-Cleaning",
      status: state.stages.postClean
        ? "Completed"
        : state.stageInProgress.postCleanBy
        ? `In progress: ${state.stageInProgress.postCleanBy}`
        : state.stageLockedBy.postClean
        ? `🔒 Locked by ${state.stageLockedBy.postClean}`
        : state.stages.preClean
        ? "Ready"
        : "Locked",
      action: () => scrollToSection("post-clean-stage"),
      disabled: !state.stages.preClean || state.stages.postClean,
    },
    {
      key: "handover",
      label: "Handover",
      status: handoverNeeded
        ? state.stages.handover
          ? "Completed"
          : handoverEnabled
          ? "Ready"
          : "Locked"
        : "Not Required",
      href: handoverEnabled ? "/macy/oven/handover" : null,
      disabled: !handoverEnabled || state.stages.handover || !handoverNeeded,
    },
    {
      key: "lead",
      label: "Area Verification",
      status: state.stages.lead
        ? "Released"
        : leadEnabled
        ? "Ready"
        : "Locked",
      href: leadEnabled ? "/macy/oven/lead" : null,
      disabled: !leadEnabled || state.stages.lead,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Line Announcements */}
      <AnnouncementBanner lineName="MACY Oven" />
      
      <div className="rounded-3xl border border-slate-700/70 bg-slate-900/60 p-6">
        <h1 className="text-2xl font-bold text-blue-200">
          MACY Oven Cleaning Checklist
        </h1>
        <p className="text-sm text-slate-400">
          Sequential stages. Completed stages vanish until unlocked.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
          {progressLabel}
        </div>
        <div className="mt-5 grid-responsive-mobile sm:grid-cols-2 xl:grid-cols-4 grid gap-3">
          {stageCards.map((stage) => {
            const card = (
              <div
                className={`rounded-2xl border p-4 text-left transition ${
                  stage.disabled
                    ? "cursor-not-allowed border-slate-700/70 bg-slate-950/40 text-slate-500"
                    : "border-slate-600/70 bg-slate-950/70 text-slate-100 hover:-translate-y-0.5 hover:border-orange-500/70"
                }`}
              >
                <p className="text-sm font-semibold">{stage.label}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                  {stage.status}
                </p>
              </div>
            );

            if (stage.href && !stage.disabled) {
              return (
                <Link key={stage.key} href={stage.href}>
                  {card}
                </Link>
              );
            }

            return (
              <button
                key={stage.key}
                type="button"
                onClick={stage.action}
                disabled={stage.disabled}
                className="text-left"
              >
                {card}
              </button>
            );
          })}
        </div>
      </div>

      <PreClean
        title="Stage 1: Pre-Cleaning (Oven)"
        questions={preCleanQuestions}
        lineName="MACY Oven"
        sectionId="pre-clean-stage"
      />

      <PostClean
        questions={postCleanQuestions}
        lineName="MACY Oven"
        sectionId="post-clean-stage"
        showHandover={true}
      />

      {/* Comprehensive Report Summary */}
      <LineReportSummary lineName="MACY Oven" />

      <ProductionManager />
    </div>
  );
}
