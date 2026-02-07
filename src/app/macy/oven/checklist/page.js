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
  "Inside frame from top, bottom and sides are cleaned.",
  "Front cover, oven exit hood and doors are cleaned.",
  "Floor is clean and dry.",
  "No sanitation equipment is on the floor.",
];

export default function MacyOvenChecklistPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-700/70 bg-slate-900/60 p-6">
        <h1 className="text-2xl font-bold text-blue-200">
          MACY Oven Cleaning Checklist
        </h1>
        <p className="text-sm text-slate-400">
          Sequential stages. Completed stages vanish until unlocked.
        </p>
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
        showHandover={false}
      />

      <HelpUnlock />
    </div>
  );
}
