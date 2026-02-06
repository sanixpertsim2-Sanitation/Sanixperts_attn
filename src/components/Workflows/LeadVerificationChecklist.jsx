"use client";

import { useMemo, useState } from "react";
import CameraCapture from "./CameraCapture";
import { useApp } from "@/context/AppContext";

const defaultTasks = [
  "Verify all lines and conveyors are clean to sanitation standard.",
  "Inspect all coverings and confirm every cover is removed.",
  "Verify drain strainers near the line are clean and clear.",
  "Verify housekeeping and garbage removal is completed for the line.",
];

export default function LeadVerificationChecklist({ onComplete, tasks = [] }) {
  const [responses, setResponses] = useState({});
  const { setLeadChecklist } = useApp();
  const activeTasks = tasks.length > 0 ? tasks : defaultTasks;

  const ready = useMemo(
    () =>
      activeTasks.every((_, idx) => {
        const response = responses[idx];
        if (!response?.choice || !response.photo) return false;
        if (response.choice === "No" && !response.description) return false;
        return true;
      }),
    [responses, activeTasks]
  );

  return (
    <section className="space-y-4 rounded-3xl border border-indigo-500/30 bg-slate-900/60 p-6">
      <h2 className="text-lg font-semibold text-indigo-200">
        Stage 5: Lead Verification Checklist
      </h2>
      <p className="text-xs text-slate-400">
        Each item requires a camera verification. If No, add a description.
      </p>

      <div className="space-y-4">
        {activeTasks.map((task, idx) => (
          <div
            key={task}
            className="rounded-2xl border border-slate-700/70 bg-slate-950/60 p-4"
          >
            <p className="text-sm font-semibold text-slate-100">{task}</p>
            <div className="mt-3 flex gap-3">
              {["Yes", "No"].map((choice) => (
                <button
                  key={choice}
                  onClick={() =>
                    setResponses((prev) => ({
                      ...prev,
                      [idx]: { ...prev[idx], choice },
                    }))
                  }
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] ${
                    responses[idx]?.choice === choice
                      ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                      : "border-slate-600 text-slate-300"
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <CameraCapture
                label="Verification Photo (Camera Only)"
                required
                onCapture={(photo) =>
                  setResponses((prev) => ({
                    ...prev,
                    [idx]: { ...prev[idx], photo },
                  }))
                }
              />
            </div>
            {responses[idx]?.choice === "No" && (
              <textarea
                className="mt-3 min-h-[80px] w-full rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-100"
                placeholder="Describe the issue..."
                value={responses[idx]?.description || ""}
                onChange={(event) =>
                  setResponses((prev) => ({
                    ...prev,
                    [idx]: { ...prev[idx], description: event.target.value },
                  }))
                }
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          setLeadChecklist(
            activeTasks.map((task, idx) => ({
              task,
              response: responses[idx]?.choice || null,
              description: responses[idx]?.description || "",
              photo: responses[idx]?.photo || null,
            }))
          );
          onComplete();
        }}
        disabled={!ready}
        className="w-full rounded-2xl bg-indigo-500 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-indigo-400"
      >
        Complete Lead Checklist
      </button>
    </section>
  );
}
