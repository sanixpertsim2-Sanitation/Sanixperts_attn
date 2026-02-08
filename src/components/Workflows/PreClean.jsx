"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import FaceIdGate from "./FaceIdGate";
import CameraCapture from "./CameraCapture";
import LiveDateTime from "@/components/Layout/LiveDateTime";

const defaultQuestions = [
  "Verify the equipment for any inadequate condition and safety issues.",
  "Check sensors and motor.",
  "Verify damage on all equipment, frame, conveyor, pipes, plugs, and emergency button.",
  "Remove die, batter pump, transfer pipes, divider (if applicable), catchpans, and hopper unit.",
  "Dry clean frame, conveyors (under & top), scrappers, and floor.",
];

export default function PreClean({
  title = "Stage 1: Pre-Cleaning",
  questions = [],
  lineName = "MACY Production",
  sectionId = "pre-clean-stage",
}) {
  const { state, completePreClean, markStageInProgress, setVerificationData } = useApp();
  const [verifiedUser, setVerifiedUser] = useState(state.currentUser);
  const [bagsCovered, setBagsCovered] = useState(state.bagCounts.covered);
  const [responses, setResponses] = useState({});
  const [showAck, setShowAck] = useState(true);
  const [ackChecked, setAckChecked] = useState(false);
  const activeQuestions = questions.length > 0 ? questions : defaultQuestions;

  const readyToSubmit = useMemo(() => {
    const allAnswered =
      activeQuestions.length > 0 &&
      activeQuestions.every((_, index) => {
        const response = responses[index];
        if (!response?.response) return false;
        if (response.response === "Yes") return true;
        return Boolean(response.photo && response.description);
      });
    return Boolean(verifiedUser && bagsCovered && allAnswered && !showAck);
  }, [verifiedUser, bagsCovered, responses, showAck, activeQuestions]);

  const handleResponse = (index, response) => {
    const updatedResponse = { ...responses[index], response };
    setResponses((prev) => ({
      ...prev,
      [index]: updatedResponse,
    }));
    
    // Store for comprehensive report
    setVerificationData("preClean", index, {
      question: activeQuestions[index],
      response,
      photo: updatedResponse.photo,
      description: updatedResponse.description,
    });
  };

  const handlePhoto = (index, photo) => {
    const updatedResponse = { ...responses[index], photo };
    setResponses((prev) => ({
      ...prev,
      [index]: updatedResponse,
    }));
    
    // Store for comprehensive report
    setVerificationData("preClean", index, {
      question: activeQuestions[index],
      response: updatedResponse.response,
      photo,
      description: updatedResponse.description,
    });
  };

  const handleDescription = (index, description) => {
    const updatedResponse = { ...responses[index], description };
    setResponses((prev) => ({
      ...prev,
      [index]: updatedResponse,
    }));
    
    // Store for comprehensive report
    setVerificationData("preClean", index, {
      question: activeQuestions[index],
      response: updatedResponse.response,
      photo: updatedResponse.photo,
      description,
    });
  };

  const handleSubmit = () => {
    if (!verifiedUser) return;
    completePreClean({ bagsCovered, name: verifiedUser.name, lineName });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (state.stages.preClean) {
    return null;
  }

  return (
    <section
      id={sectionId}
      className="relative space-y-6 rounded-3xl border border-blue-500/30 bg-slate-900/60 p-6 shadow-xl"
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-blue-200">{title}</h2>
          <LiveDateTime />
        </div>
        <p className="text-xs text-slate-400">
          Face ID + bag count required before cleaning begins.
        </p>
      </div>

      <FaceIdGate
        title="Pre-Clean Face Verification *"
        onVerified={(user) => {
          setVerifiedUser(user);
          markStageInProgress("preClean", user.name);
        }}
      />

      <div className="rounded-2xl border border-slate-700/70 bg-slate-950/60 p-4">
        <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Number of Bags Covered <span className="text-red-400">*</span>
        </label>
        <input
          type="number"
          min="0"
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
          value={bagsCovered}
          onChange={(event) => setBagsCovered(event.target.value)}
        />
      </div>

      <div className="space-y-4">
        {activeQuestions.map((question, index) => (
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
                  onClick={() => handleResponse(index, choice)}
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
            {responses[index]?.response &&
              responses[index]?.response !== "Yes" && (
              <div className="mt-4">
                <CameraCapture
                  label="Photo Evidence (Camera Only) *"
                  required
                  onCapture={(photo) => handlePhoto(index, photo)}
                />
                <textarea
                  className="mt-3 min-h-[80px] w-full rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-100"
                  placeholder="Describe the issue..."
                  value={responses[index]?.description || ""}
                  onChange={(event) =>
                    handleDescription(index, event.target.value)
                  }
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!readyToSubmit}
        className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-blue-500"
      >
        Submit Pre-Clean
      </button>

      {showAck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6">
          <div className="max-h-[85vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl border border-amber-400/40 bg-slate-900 p-6 text-sm text-slate-200 shadow-xl">
            <h3 className="text-lg font-semibold text-amber-200">
              Pre-Clean Acknowledgement
            </h3>
            <p>
              By proceeding, I confirm I will follow all GMP and sanitation
              standards, wear required PPE when handling chemicals, and maintain
              a safe work environment during this cleaning cycle.
            </p>
            <label className="flex items-start gap-3 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={ackChecked}
                onChange={(event) => setAckChecked(event.target.checked)}
                className="mt-1 h-4 w-4"
              />
              I understand and agree to the safety and compliance requirements.
            </label>
            <button
              onClick={() => ackChecked && setShowAck(false)}
              disabled={!ackChecked}
              className="w-full rounded-xl bg-amber-400 py-2 text-sm font-bold uppercase tracking-[0.2em] text-slate-900"
            >
              Accept & Continue
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
