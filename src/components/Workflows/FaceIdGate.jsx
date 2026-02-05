"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import LiveDateTime from "@/components/Layout/LiveDateTime";

const defaultRoles = [
  "Sanitation Technician",
  "Sanitation Area Lead",
  "Maintenance",
  "Production",
];

export default function FaceIdGate({ title, onVerified }) {
  const { state, registerEmployee, setCurrentUser } = useApp();
  const [inputName, setInputName] = useState("");
  const [showRegistration, setShowRegistration] = useState(false);
  const [role, setRole] = useState(defaultRoles[0]);

  const handleScan = () => {
    if (!inputName.trim()) return;
    const match = state.employees.find(
      (emp) => emp.name.toLowerCase() === inputName.trim().toLowerCase()
    );
    if (match) {
      setCurrentUser(match);
      onVerified(match);
    } else {
      setShowRegistration(true);
    }
  };

  const handleRegister = () => {
    const name = inputName.trim();
    if (!name) return;
    const faceId = `face-${name.toLowerCase().replace(/\s+/g, "-")}`;
    registerEmployee({ name, role, faceId });
    onVerified({ name, role, faceId });
  };

  return (
    <div className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-6 text-slate-100 shadow-lg">
      <h3 className="text-lg font-semibold text-blue-200">{title}</h3>
      <p className="text-xs text-slate-400">
        Face ID required. If not recognized, register a new profile.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
          placeholder="Scan Face / Enter Full Name"
          value={inputName}
          onChange={(event) => setInputName(event.target.value)}
        />
        <button
          onClick={handleScan}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Start Face Scan
        </button>
      </div>

      {showRegistration && (
        <div className="mt-4 rounded-xl border border-amber-400/40 bg-amber-500/10 p-4">
          <p className="text-sm font-semibold text-amber-300">
            Face not found. Register new employee.
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <input
              className="w-full rounded-lg border border-amber-400/40 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
              placeholder="Full Name"
              value={inputName}
              onChange={(event) => setInputName(event.target.value)}
            />
            <select
              className="w-full rounded-lg border border-amber-400/40 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              {defaultRoles.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <button
              onClick={handleRegister}
              className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900"
            >
              Register
            </button>
          </div>
        </div>
      )}

      {state.currentUser && (
        <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-950/60 p-3 text-xs text-slate-300">
          <p className="font-semibold text-slate-100">
            Verified: {state.currentUser.name} • {state.currentUser.role}
          </p>
          <div className="mt-2">
            <LiveDateTime />
          </div>
        </div>
      )}
    </div>
  );
}
