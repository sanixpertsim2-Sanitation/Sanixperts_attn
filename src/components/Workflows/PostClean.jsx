"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import FaceIdGate from "./FaceIdGate";
import CameraCapture from "./CameraCapture";
import LiveDateTime from "@/components/Layout/LiveDateTime";
import DamageAcknowledgement from "./DamageAcknowledgement";

export default function PostClean({
  questions = [],
  lineName = "MACY Production",
  sectionId = "post-clean-stage",
  showHandover = true,
}) {
  const {
    state,
    completePostClean,
    setHandoverRequired,
    markStageInProgress,
  } = useApp();
  const [verifiedUser, setVerifiedUser] = useState(state.currentUser);
  const [bagsRetrieved, setBagsRetrieved] = useState("");
  const [showMismatch, setShowMismatch] = useState(false);
  const [handoverChoice, setHandoverChoice] = useState(null);
  const openReportsCount = state.damageReports.filter(
    (report) => report.status === "Open"
  ).length;
  const [responses, setResponses] = useState({});

  const defaultQuestions = [
    "Cover motors, sensors, air regulators, and electric panels.",
    "Batter depositor frame is clean.",
    "Mixers are clean.",
    "Conveyors are cleaned and air dried (top and underneath).",
    "Up tower is clean and guards are fixed.",
    "Batter pump (A) and (B) are clean and fixed.",
    "Transfer pipes (A) and (B) side pipe are clean and fixed.",
    "Rubber pipes (A) and (B) pipe are clean and fixed.",
    "Filters (A) and (B) side filter are clean and fixed.",
    "Divider: both sides installed correctly.",
    "Hopper: inside/outside, underneath gasket and die secure and clean.",
    "Stirrer is clean.",
    "Rotary valves are in position and die is fixed.",
    "Depositor plate and gasket: plate and holes are clean.",
    "Egg cooler: egg wash done and egg room clean and sanitized.",
    "Floor is clean and dry.",
    "No sanitation equipment is on the floor.",
  ];
  const checklistQuestions = questions.length > 0 ? questions : defaultQuestions;

  const checklistComplete = useMemo(
    () =>
      checklistQuestions.every((_, index) => {
        const response = responses[index];
        if (!response?.response) return false;
        if (!response.photo) return false;
        if (response.response === "Yes") return true;
        return Boolean(response.description);
      }),
    [responses, checklistQuestions]
  );

  if (!state.stages.preClean || state.stages.postClean) {
    return null;
  }

  useEffect(() => {
    if (!showHandover) {
      setHandoverChoice("no");
      setHandoverRequired(false);
    }
  }, [showHandover, setHandoverRequired]);

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
    if (!verifiedUser || !checklistComplete) return;
    if (openReportsCount > 0) return;
    completePostClean({ bagsRetrieved, name: verifiedUser.name, lineName });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleHandover = (value) => {
    setHandoverChoice(value);
    setHandoverRequired(value === "yes");
  };

  return (
    <section
      id={sectionId}
      className="space-y-6 rounded-3xl border border-emerald-500/30 bg-slate-900/60 p-6 shadow-xl"
    >
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
        title="Post-Clean Face Verification *"
        onVerified={(user) => {
          setVerifiedUser(user);
          markStageInProgress("postClean", user.name);
        }}
      />

      <div className="rounded-2xl border border-slate-700/70 bg-slate-950/60 p-4">
        <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Bags Retrieved <span className="text-red-400">*</span>
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

      <div className="space-y-4">
        {checklistQuestions.map((question, index) => (
          <div
            key={question}
            className="rounded-2xl border border-slate-700/70 bg-slate-950/50 p-4"
          >
            <p className="text-sm font-semibold text-slate-200">
              {question} <span className="text-red-400">*</span>
            </p>
            <div className="mt-3 flex gap-3">
              {["Yes", "No", "N/A"].map((choice) => (
                <button
                  key={choice}
                  onClick={() =>
                    setResponses((prev) => ({
                      ...prev,
                      [index]: { ...prev[index], response: choice },
                    }))
                  }
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] ${
                    responses[index]?.response === choice
                      ? "border-amber-400 bg-amber-400/20 text-amber-300"
                      : "border-slate-600 text-slate-300"
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>
            {responses[index]?.response && (
              <div className="mt-4 space-y-3">
                <CameraCapture
                  label="Photo Evidence (Camera Only) *"
                  required
                  onCapture={(photo) =>
                    setResponses((prev) => ({
                      ...prev,
                      [index]: { ...prev[index], photo },
                    }))
                  }
                />
                <textarea
                  className="min-h-[80px] w-full rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-100"
                  placeholder={
                    responses[index]?.response === "Yes"
                      ? "Notes (optional)..."
                      : "Describe the issue..."
                  }
                  value={responses[index]?.description || ""}
                  onChange={(event) =>
                    setResponses((prev) => ({
                      ...prev,
                      [index]: {
                        ...prev[index],
                        description: event.target.value,
                      },
                    }))
                  }
                />
                {responses[index]?.response !== "Yes" && (
                  <p className="text-xs text-slate-400">
                    Description required for No or N/A responses.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <DamageAcknowledgement lineName={lineName} />

      {showHandover && (
        <div className="rounded-2xl border border-slate-700/70 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Handover Required? <span className="text-red-400">*</span>
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
      )}

      {bagsRetrieved && (showHandover ? handoverChoice : true) && checklistComplete ? (
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

    </section>
  );
}
