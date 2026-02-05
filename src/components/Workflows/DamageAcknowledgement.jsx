"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import CameraCapture from "./CameraCapture";

export default function DamageAcknowledgement({ lineName = "MACY Production" }) {
  const { state, updateDamageReport } = useApp();
  const [closeStates, setCloseStates] = useState({});

  const openReports = useMemo(
    () => state.damageReports.filter((report) => report.status === "Open"),
    [state.damageReports]
  );

  const sendUpdateEmail = async (report, status, fixedBy) => {
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "adarsh@sanixeprts.ca",
        subject: `Damage update (${status}) - ${lineName}`,
        description: report.description,
        photoUrl: status === "Closed" ? report.closePhoto?.dataUrl : report.photo?.dataUrl,
        timestamp: new Date().toLocaleString(),
        equipmentArea: report.equipmentArea,
        reporter: report.reportedBy,
        severity: report.severity,
        status,
        fixedBy,
      }),
    });
  };

  if (openReports.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-100">
        All open damage reports are acknowledged or closed.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
      <p className="font-semibold">Damage Acknowledgement Required</p>
      <p className="mt-1 text-xs text-red-200/80">
        All open reports must be handed over or closed before submission.
      </p>

      <div className="mt-4 space-y-3">
        {openReports.map((report) => {
          const closeState = closeStates[report.id] || {
            fixedBy: "",
            closePhoto: null,
            showClose: false,
          };

          return (
            <div
              key={report.id}
              className="rounded-xl border border-red-500/30 bg-slate-950/60 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-100">
                    {report.equipmentArea}
                  </p>
                  <p className="text-xs text-slate-400">
                    {report.description}
                  </p>
                </div>
                <span className="rounded-full border border-red-400/40 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-red-200">
                  {report.severity}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    updateDamageReport(report.id, {
                      status: "Handover",
                      acknowledgedAt: new Date().toISOString(),
                    });
                    sendUpdateEmail(report, "Handover");
                  }}
                  className="rounded-full border border-amber-400/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200"
                >
                  Mark Handover
                </button>
                <button
                  onClick={() =>
                    setCloseStates((prev) => ({
                      ...prev,
                      [report.id]: { ...closeState, showClose: true },
                    }))
                  }
                  className="rounded-full border border-emerald-400/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200"
                >
                  Close Fixed
                </button>
              </div>

              {closeState.showClose && (
                <div className="mt-3 space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                  <input
                    className="w-full rounded-lg border border-emerald-500/30 bg-slate-950/60 px-3 py-2 text-xs text-slate-100"
                    placeholder="Fixed by (name / team)"
                    value={closeState.fixedBy}
                    onChange={(event) =>
                      setCloseStates((prev) => ({
                        ...prev,
                        [report.id]: {
                          ...closeState,
                          fixedBy: event.target.value,
                        },
                      }))
                    }
                  />
                  <CameraCapture
                    label="Closure Photo (Camera Only)"
                    required
                    onCapture={(photo) =>
                      setCloseStates((prev) => ({
                        ...prev,
                        [report.id]: { ...closeState, closePhoto: photo },
                      }))
                    }
                  />
                  <button
                    onClick={() => {
                      if (!closeState.fixedBy || !closeState.closePhoto) return;
                      updateDamageReport(report.id, {
                        status: "Closed",
                        fixedBy: closeState.fixedBy,
                        closePhoto: closeState.closePhoto,
                        closedAt: new Date().toISOString(),
                      });
                      sendUpdateEmail(report, "Closed", closeState.fixedBy);
                      setCloseStates((prev) => ({
                        ...prev,
                        [report.id]: {
                          fixedBy: "",
                          closePhoto: null,
                          showClose: false,
                        },
                      }));
                    }}
                    className="w-full rounded-xl bg-emerald-500 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-900"
                  >
                    Submit Closure
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
