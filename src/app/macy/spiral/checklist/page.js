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
  "Spiral belt and merging conveyors are clean.",
  "Floor is clean and dry.",
  "No sanitation equipment is on the floor.",
  "Strainer and drains are clean.",
];

export default function MacySpiralChecklistPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-700/70 bg-slate-900/60 p-6">
        <h1 className="text-2xl font-bold text-blue-200">
          MACY Spiral Cleaning Checklist
        </h1>
        <p className="text-sm text-slate-400">
          Sequential stages. Completed stages vanish until unlocked.
        </p>
      </div>

      <PreClean
        title="Stage 1: Pre-Cleaning (Spiral)"
        questions={preCleanQuestions}
        lineName="MACY Spiral"
        sectionId="pre-clean-stage"
      />

      <PostClean
        questions={postCleanQuestions}
        lineName="MACY Spiral"
        sectionId="post-clean-stage"
        showHandover={false}
      />

      <HelpUnlock />
    </div>
  );
}
