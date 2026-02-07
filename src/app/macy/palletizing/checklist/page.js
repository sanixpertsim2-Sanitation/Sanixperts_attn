"use client";

import PreClean from "@/components/Workflows/PreClean";
import PostClean from "@/components/Workflows/PostClean";
import HelpUnlock from "@/components/Workflows/HelpUnlock";

const preCleanQuestions = [
  "Verify the equipment for any inadequate condition and safety issues.",
  "Check sensors and motor.",
  "Verify damage on frame, conveyor, panels, plugs, and emergency button.",
];

const postCleanQuestions = [
  "Motors, sensors, air regulators and electric panels are covered.",
  "Metal detector and belt are clean and sanitized.",
  "Case packer unit (JLS): conveyor, robots and frame are clean and sanitized.",
  "Case sealing machine is air cleaned and sanitized.",
  "Box making machine is air cleaned and sanitized.",
  "Palletizer is air cleaned and sanitized.",
  "Floor is clean and dry.",
  "No sanitation equipment is on the floor.",
];

export default function MacyPalletizingChecklistPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-700/70 bg-slate-900/60 p-6">
        <h1 className="text-2xl font-bold text-blue-200">
          MACY Palletizing Cleaning Checklist
        </h1>
        <p className="text-sm text-slate-400">
          Sequential stages. Completed stages vanish until unlocked.
        </p>
      </div>

      <PreClean
        title="Stage 1: Pre-Cleaning (Palletizing)"
        questions={preCleanQuestions}
        lineName="MACY Palletizing"
        sectionId="pre-clean-stage"
      />

      <PostClean
        questions={postCleanQuestions}
        lineName="MACY Palletizing"
        sectionId="post-clean-stage"
        showHandover={false}
      />

      <HelpUnlock />
    </div>
  );
}
