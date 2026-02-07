"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import CameraCapture from "./CameraCapture";

export default function LeadAcknowledgements({ lineName, onStatusChange }) {
  const { state, updateHandoverTasks, updateDamageReport } = useApp();
  const [showHandover, setShowHandover] = useState(false);
  const [showDamage, setShowDamage] = useState(false);
  const [handoverDraft, setHandoverDraft] = useState({});
  const [damageDraft, setDamageDraft] = useState({});

  const activeHandover = useMemo(
    () => state.handoverTasks.filter((task) => !task.isFinding),
    [state.handoverTasks]
  );
  const openDamages = useMemo(
    () => state.damageReports.filter((report) => report.status !== "Closed"),
    [state.damageReports]
  );

  const handoverAcknowledged =
    activeHandover.length === 0 ||
    activeHandover.every((task) => task.ackStatus);
  const damageAcknowledged =
    openDamages.length === 0 ||
    openDamages.every((report) => report.ackStatus);

  useEffect(() => {
    onStatusChange?.(handoverAcknowledged && damageAcknowledged);
  }, [handoverAcknowledged, damageAcknowledged, onStatusChange]);

  const openHandoverModal = () => {
    const draft = {};
    activeHandover.forEach((task) => {
      draft[task.id] = {
        status: task.ackStatus || "",
        photo: task.ackPhoto || null,
      };
    });
    setHandoverDraft(draft);
    setShowHandover(true);
  };

  const openDamageModal = () => {
    const draft = {};
    openDamages.forEach((report) => {
      draft[report.id] = {
        status: report.ackStatus || "",
        photo: report.ackPhoto || null,
      };
    });
    setDamageDraft(draft);
    setShowDamage(true);
  };

  const saveHandover = () => {
    const updated = state.handoverTasks.map((task) => {
      const draft = handoverDraft[task.id];
      if (!draft?.status) return task;
      return {
        ...task,
        ackStatus: draft.status,
        ackPhoto: draft.status === "completed" ? draft.photo : null,
        ackedAt: new Date().toISOString(),
      };
    });
    updateHandoverTasks(updated);
    setShowHandover(false);
  };

  const saveDamage = () => {
    openDamages.forEach((report) => {
      const draft = damageDraft[report.id];
      if (!draft?.status) return;
      updateDamageReport(report.id, {
        ackStatus: draft.status,
        ackPhoto: draft.status === "completed" ? draft.photo : null,
        ackedAt: new Date().toISOString(),
        status: draft.status === "completed" ? "Closed" : report.status,
        closePhoto:
          draft.status === "completed" ? draft.photo : report.closePhoto,
        closedAt:
          draft.status === "completed"
            ? new Date().toISOString()
            : report.closedAt,
      });
    });
    setShowDamage(false);
  };

  const handoverReady = activeHandover.every((task) => {
    const draft = handoverDraft[task.id];
    if (!draft?.status) return false;
    if (draft.status === "completed" && !draft.photo) return false;
    return true;
  });

  const damageReady = openDamages.every((report) => {
    const draft = damageDraft[report.id];
    if (!draft?.status) return false;
    if (draft.status === "completed" && !draft.photo) return false;
    return true;
  });

  return (
    <section className="space-y-4 rounded-3xl border border-indigo-500/30 bg-slate-900/60 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
        Acknowledgements
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-slate-100">Handover Review</p>
          <p className="mt-1 text-xs text-slate-400">
            {handoverAcknowledged
              ? "All handover tasks acknowledged."
              : "Handover tasks require acknowledgement."}
          </p>
          <button
            onClick={openHandoverModal}
            className="mt-3 rounded-full border border-indigo-400/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200"
          >
            Acknowledge Handover
          </button>
        </div>
        <div className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-4">
          <p className="text-sm font-semibold text-slate-100">Damage Review</p>
          <p className="mt-1 text-xs text-slate-400">
            {damageAcknowledged
              ? "All damage reports acknowledged."
              : "Open damage reports require acknowledgement."}
          </p>
          <button
            onClick={openDamageModal}
            className="mt-3 rounded-full border border-indigo-400/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200"
          >
            Acknowledge Damage
          </button>
        </div>
      </div>

      {showHandover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6">
          <div className="max-h-[80vh] w-full max-w-3xl space-y-4 overflow-y-auto rounded-3xl border border-white/20 bg-white/10 p-6 text-sm text-slate-100 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-indigo-200">
                Handover Acknowledgement
              </h4>
              <button
                onClick={() => setShowHandover(false)}
                className="text-xs uppercase tracking-[0.2em] text-slate-300"
              >
                Close
              </button>
            </div>
            {activeHandover.length === 0 ? (
              <p className="text-xs text-slate-300">
                No handover tasks to acknowledge.
              </p>
            ) : (
              <div className="space-y-3">
                {activeHandover.map((task) => {
                  const draft = handoverDraft[task.id] || {};
                  return (
                    <div
                      key={task.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <p className="text-sm font-semibold">{task.text}</p>
                      <div className="mt-3 flex gap-3">
                        {[
                          { value: "pending", label: "Pending" },
                          { value: "completed", label: "Completed" },
                        ].map((choice) => (
                          <button
                            key={choice.value}
                            onClick={() =>
                              setHandoverDraft((prev) => ({
                                ...prev,
                                [task.id]: { ...draft, status: choice.value },
                              }))
                            }
                            className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] ${
                              draft.status === choice.value
                                ? choice.value === "completed"
                                  ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                                  : "border-amber-400 bg-amber-400/20 text-amber-200"
                                : "border-slate-600 text-slate-300"
                            }`}
                          >
                            {choice.label}
                          </button>
                        ))}
                      </div>
                      {draft.status === "completed" && (
                        <div className="mt-3">
                          <CameraCapture
                            label="Completion Photo (Camera Only) *"
                            required
                            onCapture={(photo) =>
                              setHandoverDraft((prev) => ({
                                ...prev,
                                [task.id]: { ...draft, photo },
                              }))
                            }
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <button
              onClick={saveHandover}
              disabled={!handoverReady}
              className="w-full rounded-2xl bg-indigo-500 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white"
            >
              Save Handover Acknowledgement
            </button>
          </div>
        </div>
      )}

      {showDamage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6">
          <div className="max-h-[80vh] w-full max-w-3xl space-y-4 overflow-y-auto rounded-3xl border border-white/20 bg-white/10 p-6 text-sm text-slate-100 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-indigo-200">
                Damage Acknowledgement
              </h4>
              <button
                onClick={() => setShowDamage(false)}
                className="text-xs uppercase tracking-[0.2em] text-slate-300"
              >
                Close
              </button>
            </div>
            {openDamages.length === 0 ? (
              <p className="text-xs text-slate-300">
                No open damage reports to acknowledge.
              </p>
            ) : (
              <div className="space-y-3">
                {openDamages.map((report) => {
                  const draft = damageDraft[report.id] || {};
                  return (
                    <div
                      key={report.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <p className="text-sm font-semibold">
                        {report.equipmentArea}
                      </p>
                      <p className="text-xs text-slate-400">
                        {report.description}
                      </p>
                      <div className="mt-3 flex gap-3">
                        {[
                          { value: "pending", label: "Pending" },
                          { value: "completed", label: "Completed" },
                        ].map((choice) => (
                          <button
                            key={choice.value}
                            onClick={() =>
                              setDamageDraft((prev) => ({
                                ...prev,
                                [report.id]: { ...draft, status: choice.value },
                              }))
                            }
                            className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] ${
                              draft.status === choice.value
                                ? choice.value === "completed"
                                  ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                                  : "border-amber-400 bg-amber-400/20 text-amber-200"
                                : "border-slate-600 text-slate-300"
                            }`}
                          >
                            {choice.label}
                          </button>
                        ))}
                      </div>
                      {draft.status === "completed" && (
                        <div className="mt-3">
                          <CameraCapture
                            label="Completion Photo (Camera Only) *"
                            required
                            onCapture={(photo) =>
                              setDamageDraft((prev) => ({
                                ...prev,
                                [report.id]: { ...draft, photo },
                              }))
                            }
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <button
              onClick={saveDamage}
              disabled={!damageReady}
              className="w-full rounded-2xl bg-indigo-500 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white"
            >
              Save Damage Acknowledgement
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
