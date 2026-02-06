"use client";

import { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import PreClean from "@/components/Workflows/PreClean";
import PostClean from "@/components/Workflows/PostClean";
import HandoverSection from "@/components/Workflows/HandoverSection";
import Link from "next/link";

const preCleanQuestions = [
  "Verify the equipment for any inadequate condition and safety issues.",
  "Check sensors and motor.",
  "Verify damage on all equipment, frame, conveyor, pipes, plugs, and emergency button.",
  "Remove die, icing pipes, icing pumps, transfer pipes, and catchpans.",
  "Dry clean frame, conveyors (under & top), scrappers, and floor.",
];

const postCleanQuestions = [
  "Cover motors, sensors, air regulators, and electric panels.",
  "Depositor Side A and B CIP is done and depositor is clean. Open both safety guards from top of decoration unit and inspect for leakage.",
  "Injection unit frame is clean.",
  "Icing hopper topper and icing pump are clean and assembled.",
  "Manifold A and B are clean and blue pipes are attached to the Depositor side A and B.",
  "Tray denester is clean and stand is fixed.",
  "Sprinkle depositor conveyor is clean and air dried. Sprinkle die is inserted.",
  "Tray puller extractor is clean.",
  "Filling belt conveyor and rollers are clean and belt is air dried.",
  "Lid denester is clean and air dried.",
  "No water on lid denester platform.",
  "Tray closer rollers and belts are clean and air dried.",
  "Clamshell conveyor is clean and air dried.",
  "Floor is clean and dry.",
  "No sanitation equipment is on the floor.",
  "Strainer and drains are clean.",
];

export default function MacyDecorationChecklistPage() {
  const { updateHandoverTasks } = useApp();

  useEffect(() => {
    updateHandoverTasks(
      postCleanQuestions.map((text, idx) => ({
        id: `decor-task-${idx + 1}`,
        text,
        status: "pending",
      }))
    );
  }, [updateHandoverTasks]);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-700/70 bg-slate-900/60 p-6">
        <h1 className="text-2xl font-bold text-blue-200">
          MACY Decoration Cleaning Checklist
        </h1>
        <p className="text-sm text-slate-400">
          Sequential stages. Completed stages vanish until unlocked.
        </p>
      </div>

      <PreClean
        title="Stage 1: Pre-Cleaning (Decoration)"
        questions={preCleanQuestions}
        lineName="MACY Decoration"
        sectionId="pre-clean-stage"
      />

      <PostClean
        questions={postCleanQuestions}
        lineName="MACY Decoration"
        sectionId="post-clean-stage"
      />

      <HandoverSection lineName="MACY Decoration" />

      <Link
        href="/macy/decoration/handover"
        className="inline-flex items-center rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200"
      >
        Handover Task Review
      </Link>
    </div>
  );
}
