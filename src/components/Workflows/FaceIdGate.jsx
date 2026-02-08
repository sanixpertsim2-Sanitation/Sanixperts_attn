"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import LiveDateTime from "@/components/Layout/LiveDateTime";

export default function FaceIdGate({ title, onVerified, stageKey }) {
  const { state, setCurrentUser, lockStageToUser, isStageAccessible } = useApp();
  const [inputName, setInputName] = useState(state.currentUser?.name || "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setInputName(state.currentUser?.name || "");
  }, [state.currentUser?.name]);

  useEffect(() => {
    if (!inputName.trim()) return;
    const timer = setTimeout(() => {
      const name = inputName.trim();
      if (!name) return;
      if (state.currentUser?.name === name) return;
      // Check stage access before proceeding
      if (stageKey && !isStageAccessible(stageKey, name)) {
        const lockedBy = state.stageLockedBy[stageKey];
        alert(`This stage is currently being worked on by ${lockedBy}. Please wait for them to complete or contact admin.`);
        return;
      }

      const user = { name };
      setCurrentUser(user);
      
      // Lock the stage to this user
      if (stageKey) {
        lockStageToUser(stageKey, name);
      }
      
      onVerified(user);
      setSaved(true);
    }, 600);
    return () => clearTimeout(timer);
  }, [inputName, onVerified, setCurrentUser, state.currentUser?.name]);

  return (
    <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-6 text-slate-100 shadow-lg">
      <h3 className="text-lg font-semibold text-blue-200">{title}</h3>
      <p className="text-xs text-slate-400">
        Enter your name to continue. Saved automatically.
      </p>

      <div className="mt-4 grid gap-3">
        <input
          className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
          placeholder="Full Name"
          value={inputName}
          onChange={(event) => {
            setInputName(event.target.value);
            setSaved(false);
          }}
          onBlur={() => {
            const name = inputName.trim();
            if (!name) return;
            if (state.currentUser?.name === name) return;
            
            // Check stage access
            if (stageKey && !isStageAccessible(stageKey, name)) {
              const lockedBy = state.stageLockedBy[stageKey];
              alert(`This stage is locked by ${lockedBy}`);
              return;
            }
            
            const user = { name };
            setCurrentUser(user);
            if (stageKey) lockStageToUser(stageKey, name);
            onVerified(user);
            setSaved(true);
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            const name = inputName.trim();
            if (!name) return;
            if (state.currentUser?.name === name) return;
            
            // Check stage access
            if (stageKey && !isStageAccessible(stageKey, name)) {
              const lockedBy = state.stageLockedBy[stageKey];
              alert(`This stage is locked by ${lockedBy}`);
              return;
            }
            
            const user = { name };
            setCurrentUser(user);
            if (stageKey) lockStageToUser(stageKey, name);
            onVerified(user);
            setSaved(true);
          }}
        />
      </div>

      {state.currentUser && (
        <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-950/60 p-3 text-xs text-slate-300">
          <p className="font-semibold text-slate-100">
            Active: {state.currentUser.name}
          </p>
          {saved && (
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-emerald-300">
              Saved
            </p>
          )}
          <div className="mt-2">
            <LiveDateTime />
          </div>
        </div>
      )}
    </div>
  );
}
