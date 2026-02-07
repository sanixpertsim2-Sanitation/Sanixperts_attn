"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function HelpUnlock() {
  const { state, resetStages } = useApp();
  const [show, setShow] = useState(false);
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const handleUnlock = () => {
    if (pin === "2451") {
      setUnlocked(true);
    }
  };

  const handleReset = (stageKey, value) => {
    resetStages({ [stageKey]: value });
  };

  return (
    <div className="mt-10 text-center">
      <button
        onClick={() => setShow(true)}
        className="text-xs uppercase tracking-[0.3em] text-slate-400 underline"
      >
        Help / Unlock
      </button>

      {show && (
        <div className="mx-auto mt-4 max-w-xl rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4 text-left text-sm text-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Superuser Access
            </p>
            <button
              onClick={() => {
                setShow(false);
                setUnlocked(false);
                setPin("");
              }}
              className="text-xs text-slate-400"
            >
              Close
            </button>
          </div>
          {!unlocked ? (
            <div className="mt-3 flex flex-col gap-3 md:flex-row">
              <input
                type="password"
                className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
                placeholder="Enter PIN"
                value={pin}
                onChange={(event) => setPin(event.target.value)}
              />
              <button
                onClick={handleUnlock}
                className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900"
              >
                Unlock
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-amber-200">
                Restoring a stage can impact future cleaning locks. Please
                confirm the change is required before submitting.
              </p>
              {[
                { key: "preClean", label: "Pre-Clean Submitted" },
                { key: "postClean", label: "Post-Clean Submitted" },
                { key: "handover", label: "Handover Submitted" },
                { key: "lead", label: "Lead Verification" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-lg border border-slate-700/70 bg-slate-950/50 px-3 py-2"
                >
                  <span>{item.label}</span>
                  <button
                    onClick={() => handleReset(item.key, false)}
                    className="rounded-full border border-amber-400 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200"
                  >
                    Restore
                  </button>
                </div>
              ))}
              <p className="text-[10px] text-slate-500">
                Current stages:{" "}
                {Object.entries(state.stages)
                  .map(([key, value]) => `${key}:${value ? "Y" : "N"}`)
                  .join(" • ")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
