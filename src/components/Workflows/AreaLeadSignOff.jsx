"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useApp } from "@/context/AppContext";
import FaceIdGate from "./FaceIdGate";
import LiveDateTime from "@/components/Layout/LiveDateTime";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AreaLeadSignOff({ lineName = "MACY Production" }) {
  const { state, completeLeadSignoff } = useApp();
  const sigRef = useRef(null);
  const [verifiedLead, setVerifiedLead] = useState(null);
  const [error, setError] = useState("");
  const [accessName, setAccessName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessAck, setAccessAck] = useState(false);

  if (!state.stages.postClean || state.stages.lead) return null;
  if (state.handoverRequired && !state.stages.handover) return null;

  const handleVerified = (user) => {
    if (!user.role.toLowerCase().includes("lead")) {
      setError("Lead role required for final verification.");
      return;
    }
    setError("");
    setVerifiedLead(user);
  };

  const generateReport = (leadName, signature) => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();

    doc.setFontSize(16);
    doc.text("SANIXPERT CLEANING VALIDATION REPORT", 105, 18, {
      align: "center",
    });
    doc.setFontSize(10);
    doc.text("Give & Go Facility - MACY Production", 105, 26, {
      align: "center",
    });
    doc.text(`Generated: ${timestamp}`, 105, 32, { align: "center" });

    autoTable(doc, {
      startY: 40,
      head: [["Phase", "Status", "Bag Count", "Submitted By", "Date/Time"]],
      body: [
        [
          "Pre-Cleaning",
          state.stages.preClean ? "Completed" : "Pending",
          state.bagCounts.covered || "0",
          state.lineStatus.macy.submittedBy || "-",
          state.stageTimes.preCleanAt
            ? new Date(state.stageTimes.preCleanAt).toLocaleString()
            : "-",
        ],
        [
          "Post-Cleaning",
          state.stages.postClean ? "Completed" : "Pending",
          state.bagCounts.retrieved || "0",
          state.lineStatus.macy.submittedBy || "-",
          state.stageTimes.postCleanAt
            ? new Date(state.stageTimes.postCleanAt).toLocaleString()
            : "-",
        ],
        [
          "Handover",
          state.stages.handover ? "Completed" : "Not Required",
          "-",
          state.lineStatus.macy.submittedBy || "-",
          state.stageTimes.handoverAt
            ? new Date(state.stageTimes.handoverAt).toLocaleString()
            : "-",
        ],
        [
          "Lead Release",
          "Released",
          "-",
          leadName,
          state.stageTimes.leadAt
            ? new Date(state.stageTimes.leadAt).toLocaleString()
            : timestamp,
        ],
      ],
    });

    const damageRows = state.damageReports.map((report) => [
      report.severity,
      report.equipmentArea || "-",
      report.description,
      report.status,
      report.createdAt ? new Date(report.createdAt).toLocaleString() : "-",
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Severity", "Area", "Description", "Status", "Date/Time"]],
      body:
        damageRows.length > 0
          ? damageRows
          : [["-", "-", "No damages reported", "-", "-"]],
    });

    const taskRows = state.handoverTasks.map((task) => [
      task.text,
      task.status,
    ]);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Handover Task", "Status"]],
      body: taskRows.length > 0 ? taskRows : [["-", "No tasks"]],
    });

    if (signature) {
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.text("Lead Signature:", 14, finalY);
      doc.addImage(signature, "PNG", 14, finalY + 4, 50, 18);
    }

    doc.save(`sanixpert_macy_report_${Date.now()}.pdf`);
  };

  const handleRelease = () => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      setError("Signature required for release.");
      return;
    }
    const signature = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
    generateReport(verifiedLead.name, signature);
    completeLeadSignoff({ name: verifiedLead.name, signature, lineName });
  };

  return (
    <section className="space-y-6 rounded-3xl border border-indigo-500/30 bg-slate-900/60 p-6 shadow-xl">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-indigo-200">
            Stage 5: Area Lead Verification
          </h2>
          <LiveDateTime />
        </div>
        <p className="text-xs text-slate-400">
          Final release requires Lead Face ID and signature.
        </p>
      </div>

      {!accessGranted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6">
          <div className="w-full max-w-md space-y-4 rounded-3xl border border-white/20 bg-white/10 p-6 text-sm text-slate-100 shadow-2xl backdrop-blur">
            <h3 className="text-lg font-semibold text-indigo-200">
              Area Verification Access
            </h3>
            <p className="text-xs text-slate-300">
              Enter your name and access code to continue to lead verification.
            </p>
            <input
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-slate-100"
              placeholder="Full Name"
              value={accessName}
              onChange={(event) => setAccessName(event.target.value)}
            />
            <input
              type="password"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-slate-100"
              placeholder="Access Code"
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
            />
            <label className="flex items-start gap-3 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={accessAck}
                onChange={(event) => setAccessAck(event.target.checked)}
                className="mt-1 h-4 w-4"
              />
              I acknowledge the handover details and confirm all sanitation
              tasks are complete or documented for follow-up.
            </label>
            <button
              onClick={() => {
                if (accessCode === "2451" && accessName && accessAck) {
                  setAccessGranted(true);
                }
              }}
              disabled={!accessName || !accessCode || !accessAck}
              className="w-full rounded-2xl bg-indigo-400 py-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-900"
            >
              Unlock Verification
            </button>
          </div>
        </div>
      )}

      {accessGranted && !verifiedLead ? (
        <FaceIdGate title="Lead Face Verification" onVerified={handleVerified} />
      ) : (
        accessGranted && (
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-sm text-indigo-100">
            Verified Lead: {verifiedLead?.name} • {verifiedLead?.role}
          </div>
        )
      )}

      <div className="rounded-2xl border border-slate-700/70 bg-slate-950/60 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Digital Signature
          </p>
          <button
            onClick={() => sigRef.current?.clear()}
            className="text-xs text-red-300 underline"
          >
            Clear
          </button>
        </div>
        <div className="mt-3 rounded-xl border border-slate-700 bg-slate-900">
          <SignatureCanvas
            ref={sigRef}
            penColor="#ffffff"
            canvasProps={{ width: 520, height: 180, className: "w-full" }}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <button
        onClick={handleRelease}
        disabled={!verifiedLead}
        className="w-full rounded-2xl bg-indigo-500 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-indigo-400"
      >
        Release Line for Production
      </button>
    </section>
  );
}
