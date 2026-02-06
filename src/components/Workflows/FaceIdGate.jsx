"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import LiveDateTime from "@/components/Layout/LiveDateTime";

export default function FaceIdGate({ title, onVerified }) {
  const { state, setCurrentUser } = useApp();
  const [inputName, setInputName] = useState("");

  const handleConfirm = () => {
    const name = inputName.trim();
    if (!name) return;
    const user = { name };
    setCurrentUser(user);
    onVerified(user);
  };

  return (
    <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-6 text-slate-100 shadow-lg">
      <h3 className="text-lg font-semibold text-blue-200">{title}</h3>
      <p className="text-xs text-slate-400">
        Enter your name manually to continue.
      </p>

      <div className="mt-4 grid gap-3">
        <input
          className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
          placeholder="Full Name"
          value={inputName}
          onChange={(event) => setInputName(event.target.value)}
        />
      </div>

      <button
        onClick={handleConfirm}
        className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
      >
        Confirm Name
      </button>

      {state.currentUser && (
        <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-950/60 p-3 text-xs text-slate-300">
          <p className="font-semibold text-slate-100">
            Active: {state.currentUser.name}
          </p>
          <div className="mt-2">
            <LiveDateTime />
          </div>
        </div>
      )}
    </div>
  );
}
