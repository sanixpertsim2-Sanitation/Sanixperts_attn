"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import FaceIdGate from "./FaceIdGate";
import CameraCapture from "./CameraCapture";
import LiveDateTime from "@/components/Layout/LiveDateTime";
import DamageAcknowledgement from "./DamageAcknowledgement";

export default function PostClean() {
  const {
    state,
    completePostClean,
    setHandoverRequired,
    updateHandoverTasks,
    markStageInProgress,
  } = useApp();
  const router = useRouter();
  const [verifiedUser, setVerifiedUser] = useState(state.currentUser);
  const [bagsRetrieved, setBagsRetrieved] = useState("");
  const [showMismatch, setShowMismatch] = useState(false);
  const [handoverChoice, setHandoverChoice] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [handoverNotes, setHandoverNotes] = useState("");
  const [taskState, setTaskState] = useState(
    state.handoverTasks.map((task) => ({
      ...task,
      checked: false,
    }))
  );
  const [noteTasks, setNoteTasks] = useState(["", "", ""]);
  const openReportsCount = state.damageReports.filter(
    (report) => report.status === "Open"
  ).length;

  if (!state.stages.preClean || state.stages.postClean) {
    return null;
  }

  const handleSubmit = () => {
    const covered = Number(state.bagCounts.covered || 0);
    const retrieved = Number(bagsRetrieved || 0);
    if (retrieved !== covered) {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      setShowMismatch(true);
      return;
    }
    if (!verifiedUser) return;
    if (openReportsCount > 0) return;
    if (handoverChoice === "yes" && !state.stages.handover) {
      setShowHandoverModal(true);
      return;
    }
    completePostClean({ bagsRetrieved, name: verifiedUser.name });
  };

  const handleHandover = (value) => {
    setHandoverChoice(value);
    setHandoverRequired(value === "yes");
    if (value === "yes") {
      setShowHandoverModal(true);
    }
  };

  return (
    <section className="space-y-6 rounded-3xl border border-emerald-500/30 bg-slate-900/60 p-6 shadow-xl">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-emerald-200">
            Stage 3: Post-Cleaning
          </h2>
          <LiveDateTime />
        </div>
        <p className="text-xs text-slate-400">
          Unlocks only after Pre-Cleaning is submitted.
        </p>
      </div>

      <FaceIdGate
        title="Post-Clean Face Verification"
        onVerified={(user) => {
          setVerifiedUser(user);
          markStageInProgress("postClean", user.name);
        }}
      />

      <div className="rounded-2xl border border-slate-700/70 bg-slate-950/60 p-4">
        <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Bags Retrieved
        </label>
        <input
          type="number"
          min="0"
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
          value={bagsRetrieved}
          onChange={(event) => setBagsRetrieved(event.target.value)}
        />
        <p className="mt-2 text-xs text-slate-500">
          All bags covered must be removed before submission.
        </p>
      </div>

      <CameraCapture
        label="Post-Clean Photo Evidence"
        required
        onCapture={setPhoto}
      />

      <DamageAcknowledgement lineName="MACY Production" />

      <div className="rounded-2xl border border-slate-700/70 bg-slate-950/60 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Handover Required?
        </p>
        <div className="mt-3 flex gap-3">
          {[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleHandover(option.value)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] ${
                handoverChoice === option.value
                  ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                  : "border-slate-600 text-slate-300"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {bagsRetrieved && photo && handoverChoice ? (
        <button
          onClick={handleSubmit}
          disabled={openReportsCount > 0}
          className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-emerald-500"
        >
          Submit Post-Clean
        </button>
      ) : (
        <div className="rounded-2xl border border-slate-700/70 bg-slate-950/60 p-3 text-xs text-slate-300">
          Complete all fields and select handover requirement to enable submit.
        </div>
      )}

      {showMismatch && (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-200">
          <p className="font-semibold">Bag mismatch detected.</p>
          <p>
            Verify thoroughly and remove every covered bag before continuing.
          </p>
          <button
            onClick={() => setShowMismatch(false)}
            className="mt-3 rounded-full border border-red-300 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-red-200"
          >
            Acknowledge
          </button>
        </div>
      )}

      {showHandoverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-6">
          <div className="w-full max-w-2xl space-y-4 rounded-3xl border border-white/20 bg-white/10 p-6 text-sm text-slate-100 shadow-2xl backdrop-blur max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-amber-200">
                Handover Required
              </h3>
              <button
                onClick={() => setShowHandoverModal(false)}
                className="text-xs uppercase tracking-[0.2em] text-slate-300"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Confirm each task below before submitting handover.
            </p>

            <div className="grid gap-3 md:grid-cols-2">
              {taskState.map((task) => (
                <label
                  key={task.id}
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={task.checked}
                      onChange={(event) =>
                        setTaskState((prev) =>
                          prev.map((item) =>
                            item.id === task.id
                              ? { ...item, checked: event.target.checked }
                              : item
                          )
                        )
                      }
                      className="mt-1 h-4 w-4"
                    />
                    <div>
                      <p className="font-semibold text-slate-100">
                        {task.text}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                        Task confirmation
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <textarea
              className="min-h-[90px] w-full rounded-2xl border border-white/20 bg-white/5 p-3 text-xs text-slate-100"
              placeholder="Reason for handover / follow-up needed..."
              value={handoverNotes}
              onChange={(event) => setHandoverNotes(event.target.value)}
            />

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-300">
                Handover Tasks (Task 1, Task 2, Task 3)
              </p>
              <div className="mt-3 space-y-2">
                {noteTasks.map((value, index) => (
                  <input
                    key={`note-${index}`}
                    className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs text-slate-100"
                    placeholder={`Task ${index + 1}...`}
                    value={value}
                    onChange={(event) =>
                      setNoteTasks((prev) =>
                        prev.map((item, idx) =>
                          idx === index ? event.target.value : item
                        )
                      )
                    }
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (openReportsCount > 0) return;
                const updated = taskState.map((task) => ({
                  ...task,
                  status: task.checked ? "completed" : "pending",
                  notes: handoverNotes,
                }));
                const noteItems = noteTasks
                  .map((text, index) => ({
                    id: `handover-note-${Date.now()}-${index}`,
                    text: text.trim(),
                    status: "pending",
                    isFinding: true,
                  }))
                  .filter((item) => item.text);
                updateHandoverTasks([...updated, ...noteItems], true);
                completePostClean({
                  bagsRetrieved,
                  name: state.currentUser?.name || "Unknown",
                });
                setShowHandoverModal(false);
                router.push("/macy/production/handover");
              }}
              disabled={openReportsCount > 0}
              className="w-full rounded-2xl bg-amber-400 py-3 text-sm font-bold uppercase tracking-[0.2em] text-slate-900"
            >
              Submit Handover
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
