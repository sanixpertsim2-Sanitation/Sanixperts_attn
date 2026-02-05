"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import CameraCapture from "./CameraCapture";
import LiveDateTime from "@/components/Layout/LiveDateTime";

const severityOptions = ["Low", "Medium", "High"];
const statusOptions = ["Open", "Handover", "Closed"];

export default function DamageReport({ lineName = "MACY Production" }) {
  const { state, addDamageReport, updateDamageReport } = useApp();
  const [equipmentArea, setEquipmentArea] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [status, setStatus] = useState("Open");
  const [photo, setPhoto] = useState(null);
  const [activeReport, setActiveReport] = useState(null);
  const [reportFilter, setReportFilter] = useState("open");
  const [closeMode, setCloseMode] = useState(null);
  const [fixedBy, setFixedBy] = useState("");
  const [fixPhoto, setFixPhoto] = useState(null);

  const resetForm = () => {
    setEquipmentArea("");
    setDescription("");
    setSeverity("Medium");
    setStatus("Open");
    setPhoto(null);
  };

  const sendDamageAlert = async (reportData) => {
    if (!["High", "Medium"].includes(reportData.severity)) return;
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "adarsh@sanixeprts.ca",
        subject: `${reportData.severity} severity damage reported from ${reportData.lineName}`,
        description: reportData.description,
        photoUrl: reportData.photo?.dataUrl,
        timestamp: reportData.photo?.timestamp,
        equipmentArea: reportData.equipmentArea,
        reporter: reportData.reportedBy,
        severity: reportData.severity,
      }),
    });
  };

  const handleSubmit = async () => {
    if (!equipmentArea || !description || !photo) return;
    const reportData = {
      id: `damage-${Date.now()}`,
      lineName,
      equipmentArea,
      description,
      severity,
      status,
      photo,
      reportedBy: state.currentUser?.name || "Unknown",
      createdAt: new Date().toISOString(),
    };
    addDamageReport(reportData);
    await sendDamageAlert(reportData);
    resetForm();
  };

  const openReports = state.damageReports.filter(
    (report) => report.status === "Open"
  );
  const closedReports = state.damageReports.filter(
    (report) => report.status === "Closed"
  );

  return (
    <section className="space-y-4 rounded-3xl border border-red-500/40 bg-red-500/10 p-6 shadow-xl">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-red-300">
            Stage 2: Damage Report
          </h2>
          <LiveDateTime />
        </div>
        <p className="text-xs text-red-200/70">
          Report every minor damage immediately. Use clear, professional detail.
        </p>
      </div>

      <div className="rounded-xl border border-red-500/20 bg-slate-950/60 p-3">
        <label className="text-xs uppercase tracking-[0.2em] text-red-200/70">
          Equipment / Area
        </label>
        <input
          className="mt-2 w-full rounded-lg border border-red-500/20 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
          placeholder="e.g., Belt 4 Guard, Mixer Bay A"
          value={equipmentArea}
          onChange={(event) => setEquipmentArea(event.target.value)}
        />
      </div>

      <CameraCapture
        label="Damage Photo (Camera Only)"
        required
        onCapture={setPhoto}
      />

      <textarea
        className="min-h-[100px] w-full rounded-xl border border-red-500/30 bg-slate-950/60 p-3 text-sm text-slate-100"
        placeholder="Describe the damage or issue..."
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-red-500/20 bg-slate-950/60 p-3">
          <label className="text-xs uppercase tracking-[0.2em] text-red-200/70">
            Severity
          </label>
          <select
            className="mt-2 w-full rounded-lg border border-red-500/20 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
          >
            {severityOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-slate-950/60 p-3">
          <label className="text-xs uppercase tracking-[0.2em] text-red-200/70">
            Status
          </label>
          <select
            className="mt-2 w-full rounded-lg border border-red-500/20 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {statusOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!equipmentArea || !description || !photo}
        className="w-full rounded-2xl bg-red-600 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-red-500"
      >
        Submit Damage Report
      </button>

      {state.damageReports.length > 0 && (
        <div className="rounded-2xl border border-red-500/20 bg-slate-950/70 p-4 text-xs text-slate-200">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-red-200">Damage Report Log</p>
            <div className="flex gap-2">
              {[
                { id: "open", label: "Open Reports" },
                { id: "closed", label: "Closed Reports" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setReportFilter(tab.id)}
                  className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                    reportFilter === tab.id
                      ? "border-red-300 bg-red-500/20 text-red-200"
                      : "border-slate-600 text-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {(reportFilter === "open" ? openReports : closedReports)
              .slice(0, 8)
              .map((report) => (
                <button
                  key={report.id}
                  onClick={() => {
                    setActiveReport(report);
                    setCloseMode(null);
                    setFixedBy("");
                    setFixPhoto(null);
                  }}
                  className="w-full rounded-lg border border-red-500/20 bg-slate-950/60 px-3 py-2 text-left text-xs font-semibold text-slate-100 hover:border-red-400/60"
                >
                  <div className="flex items-center justify-between">
                    <span>{report.equipmentArea}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] ${
                        report.severity === "High"
                          ? "border-red-400 text-red-200"
                          : "border-slate-600 text-slate-300"
                      }`}
                    >
                      {report.severity}
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                    {report.status} • Tap for details
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6">
          <div className="max-w-lg space-y-3 rounded-2xl border border-red-500/30 bg-slate-900 p-5 text-sm text-slate-100 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-red-200">
                {activeReport.equipmentArea}
              </h3>
              <button
                onClick={() => setActiveReport(null)}
                className="text-xs uppercase tracking-[0.2em] text-slate-400"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-slate-400">
              {new Date(activeReport.createdAt).toLocaleString()}
            </p>
            <p className="text-sm">{activeReport.description}</p>
            <div className="flex gap-3 text-xs">
              <span className="rounded-full border border-red-400/40 px-3 py-1 text-red-200">
                {activeReport.severity}
              </span>
              <span className="rounded-full border border-slate-600 px-3 py-1 text-slate-300">
                {activeReport.status}
              </span>
            </div>
            {activeReport.status !== "Closed" && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    updateDamageReport(activeReport.id, {
                      status: "Handover",
                    });
                    setActiveReport((prev) =>
                      prev ? { ...prev, status: "Handover" } : prev
                    );
                  }}
                  className="rounded-full border border-amber-400/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200"
                >
                  Mark Handover
                </button>
                <button
                  onClick={() => setCloseMode("close")}
                  className="rounded-full border border-emerald-400/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200"
                >
                  Close Report
                </button>
              </div>
            )}

            {closeMode === "close" && (
              <div className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">
                  Closure Details
                </p>
                <input
                  className="w-full rounded-lg border border-emerald-500/30 bg-slate-950/60 px-3 py-2 text-xs text-slate-100"
                  placeholder="Fixed by (name / team)"
                  value={fixedBy}
                  onChange={(event) => setFixedBy(event.target.value)}
                />
                <CameraCapture
                  label="Closure Photo (Camera Only)"
                  required
                  onCapture={setFixPhoto}
                />
                <button
                  onClick={() => {
                    if (!fixedBy || !fixPhoto) return;
                    updateDamageReport(activeReport.id, {
                      status: "Closed",
                      fixedBy,
                      closePhoto: fixPhoto,
                      closedAt: new Date().toISOString(),
                    });
                    setActiveReport((prev) =>
                      prev
                        ? {
                            ...prev,
                            status: "Closed",
                            fixedBy,
                            closePhoto: fixPhoto,
                            closedAt: new Date().toISOString(),
                          }
                        : prev
                    );
                    setCloseMode(null);
                    setFixedBy("");
                    setFixPhoto(null);
                  }}
                  className="w-full rounded-xl bg-emerald-500 py-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-900"
                >
                  Submit Closure
                </button>
              </div>
            )}
            {activeReport.photo?.dataUrl && (
              <img
                src={activeReport.photo.dataUrl}
                alt="Damage evidence"
                className="h-48 w-full rounded-lg object-cover"
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
