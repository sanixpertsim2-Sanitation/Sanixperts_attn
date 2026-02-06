"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import LiveDateTime from "@/components/Layout/LiveDateTime";
import DamageAcknowledgement from "./DamageAcknowledgement";

export default function HandoverSection({
  lineName = "MACY Production",
  redirectTo,
}) {
  const { state, updateHandoverTasks, completeHandover } = useApp();
  const router = useRouter();
  const [newTask, setNewTask] = useState("");
  const [responses, setResponses] = useState({});
  const openReportsCount = state.damageReports.filter(
    (report) => report.status === "Open"
  ).length;
  const pendingTasks = state.handoverTasks;

  useEffect(() => {
    const initial = {};
    pendingTasks.forEach((task) => {
      const normalizedStatus = task.status
        ? task.status.toLowerCase() === "completed"
          ? "Completed"
          : "Pending"
        : "";
      initial[task.id] = {
        status: normalizedStatus,
        description: task.description || "",
      };
    });
    setResponses(initial);
  }, [pendingTasks]);

  if (!state.stages.postClean || state.stages.handover) return null;
  if (state.handoverRequired === false) return null;

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    const item = {
      id: `handover-${Date.now()}`,
      text: newTask.trim(),
      status: "",
      description: "",
      isCustom: true,
    };
    updateHandoverTasks([...pendingTasks, item]);
    setResponses((prev) => ({
      ...prev,
      [item.id]: { status: "", description: "" },
    }));
    setNewTask("");
  };

  const handleSubmit = () => {
    const name = state.currentUser?.name || "Unknown";
    const updated = pendingTasks.map((task) => ({
      ...task,
      status:
        responses[task.id]?.status === "Completed" ? "completed" : "pending",
      description: responses[task.id]?.description || task.description || "",
      timestamp: new Date().toISOString(),
    }));
    updateHandoverTasks(updated, true);
    completeHandover({ name, lineName });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (redirectTo) {
      router.push(redirectTo);
    }
  };

  const readyToSubmit = pendingTasks.every(
    (task) => responses[task.id]?.status
  );

  return (
    <section className="space-y-6 rounded-3xl border border-amber-500/30 bg-slate-900/60 p-6 shadow-xl">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-amber-200">
            Stage 4: Handover
          </h2>
          <LiveDateTime />
        </div>
        <p className="text-xs text-slate-400">
          Record handover tasks and any follow-up notes.
        </p>
      </div>

      <DamageAcknowledgement lineName={lineName} />

      <div className="space-y-4">
        {pendingTasks.length === 0 && (
          <div className="rounded-2xl border border-slate-700/70 bg-slate-950/60 p-4 text-xs text-slate-300">
            No handover tasks yet. Add tasks below to continue.
          </div>
        )}
        {pendingTasks.map((task) => (
          <div
            key={task.id}
            className="rounded-2xl border border-slate-700/70 bg-slate-950/50 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-100">{task.text}</p>
              <div className="flex gap-2">
                {["Completed", "Pending"].map((choice) => (
                  <button
                    key={choice}
                    onClick={() =>
                      setResponses((prev) => ({
                        ...prev,
                        [task.id]: {
                          ...prev[task.id],
                          status: choice,
                        },
                      }))
                    }
                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] ${
                      responses[task.id]?.status === choice
                        ? choice === "Completed"
                          ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                          : "border-amber-400 bg-amber-400/20 text-amber-200"
                        : "border-slate-600 text-slate-300"
                    }`}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              className="mt-3 min-h-[70px] w-full rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-100"
              placeholder="Add handover notes or details (optional)..."
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
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-700/70 bg-slate-950/60 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Add Handover Task
        </p>
        <div className="mt-3 flex gap-3">
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
            placeholder="New handover task..."
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
          />
          <button
            onClick={handleAddTask}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={openReportsCount > 0 || !readyToSubmit}
        className="w-full rounded-2xl bg-amber-500 py-3 text-sm font-bold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-amber-400"
      >
        Submit Handover
      </button>
    </section>
  );
}
