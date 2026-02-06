"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import LiveDateTime from "@/components/Layout/LiveDateTime";
import DamageAcknowledgement from "./DamageAcknowledgement";
import CameraCapture from "./CameraCapture";

export default function HandoverSection() {
  const { state, updateHandoverTasks, completeHandover } = useApp();
  const [newFinding, setNewFinding] = useState("");
  const openReportsCount = state.damageReports.filter(
    (report) => report.status === "Open"
  ).length;
  const [responses, setResponses] = useState({});
  const pendingTasks = state.handoverTasks;

  if (!state.stages.postClean || state.stages.handover) return null;
  if (state.handoverRequired === false) return null;


  const handleAddFinding = () => {
    if (!newFinding.trim()) return;
    const updated = [
      ...state.handoverTasks,
      {
        id: `finding-${Date.now()}`,
        text: newFinding.trim(),
        status: "pending",
        isFinding: true,
      },
    ];
    updateHandoverTasks(updated);
    setNewFinding("");
  };

  const handleSubmit = () => {
    const name = state.currentUser?.name || "Unknown";
    completeHandover({ name });
  };

  return (
    <section className="space-y-6 rounded-3xl border border-amber-500/30 bg-slate-900/60 p-6 shadow-xl">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-amber-200">
            Stage 4: Handover & Verification
          </h2>
          <LiveDateTime />
        </div>
        <p className="text-xs text-slate-400">
          Confirm tasks and add findings before handing over.
        </p>
      </div>

      <DamageAcknowledgement lineName="MACY Production" />

      <div className="space-y-4">
        {pendingTasks.length === 0 && (
          <div className="rounded-2xl border border-slate-700/70 bg-slate-950/60 p-4 text-xs text-slate-300">
            No pending handover tasks. Add findings if needed.
          </div>
        )}
        {pendingTasks.map((task) => (
          <div
            key={task.id}
            className={`rounded-2xl border p-4 ${
              responses[task.id]?.response === "Yes"
                ? "border-emerald-500/40 bg-emerald-500/10"
                : "border-amber-500/40 bg-amber-500/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-100">{task.text}</p>
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                  responses[task.id]?.response === "Yes"
                    ? "bg-emerald-500/20 text-emerald-200"
                    : "bg-amber-500/30 text-amber-200"
                }`}
              >
                {responses[task.id]?.response || "pending"}
              </span>
            </div>
            <div className="mt-3 flex gap-3">
              {["Verified", "Requires Reclean", "Findings"].map((choice) => (
                <button
                  key={choice}
                  onClick={() =>
                    setResponses((prev) => ({
                      ...prev,
                      [task.id]: {
                        ...prev[task.id],
                        response: choice,
                      },
                    }))
                  }
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] ${
                    responses[task.id]?.response === choice
                      ? choice === "Verified"
                        ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                        : choice === "Requires Reclean"
                        ? "border-red-400 bg-red-400/20 text-red-200"
                        : "border-amber-400 bg-amber-400/20 text-amber-200"
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
                    [task.id]: { ...prev[task.id], photo },
                  }))
                }
              />
            </div>
            {responses[task.id]?.response &&
              responses[task.id]?.response !== "Verified" && (
              <textarea
                className="mt-3 min-h-[80px] w-full rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-100"
                placeholder="Describe the issue or reclean needed..."
                value={responses[task.id]?.description || ""}
                onChange={(event) =>
                  setResponses((prev) => ({
                    ...prev,
                    [task.id]: {
                      ...prev[task.id],
                      description: event.target.value,
                    },
                  }))
                }
              />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-700/70 bg-slate-950/60 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Findings
        </p>
        <div className="mt-3 flex gap-3">
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
            placeholder="Add new observation..."
            value={newFinding}
            onChange={(event) => setNewFinding(event.target.value)}
          />
          <button
            onClick={handleAddFinding}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={() => {
          const updated = state.handoverTasks.map((task) => ({
            ...task,
            status:
              responses[task.id]?.response === "Verified"
                ? "completed"
                : "pending",
            response: responses[task.id]?.response || task.response || null,
            photo: responses[task.id]?.photo || task.photo || null,
            description:
              responses[task.id]?.description || task.description || "",
            timestamp: new Date().toISOString(),
          }));
          updateHandoverTasks(updated, true);
          handleSubmit();
        }}
        disabled={
          openReportsCount > 0 ||
          pendingTasks.some((task) => {
            const response = responses[task.id];
            if (!response?.response || !response.photo) return true;
            if (response.response !== "Verified" && !response.description)
              return true;
            return false;
          })
        }
        className="w-full rounded-2xl bg-amber-500 py-3 text-sm font-bold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-amber-400"
      >
        Submit Handover
      </button>
    </section>
  );
}
