"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/context/AppContext";

const lines = [
  { id: "production", label: "Production", active: true },
  { id: "decoration", label: "Decoration", active: true },
  { id: "packaging", label: "Packaging", active: false },
];

export default function LinesPage() {
  const { state } = useApp();
  const [brand, setBrand] = useState("MACY");
  const [showBrands, setShowBrands] = useState(false);
  const isActiveBrand = brand === "MACY";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-blue-200">Line Selection</h1>
        <p className="text-sm text-slate-400">
          Select a line and then choose the workflow to proceed.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-5">
        <button
          type="button"
          onClick={() => setShowBrands((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-left"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Brand
            </p>
            <p className="text-lg font-semibold text-slate-100">{brand}</p>
          </div>
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
            {showBrands ? "Close" : "Change"}
          </span>
        </button>

        {showBrands && (
          <div className="mt-3 grid gap-2">
            {["MACY", "JFK", "CECE"].map((option) => (
              <button
                key={option}
                onClick={() => {
                  setBrand(option);
                  setShowBrands(false);
                }}
                className={`rounded-lg border px-4 py-2 text-left text-sm font-semibold ${
                  option === "MACY"
                    ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-200"
                    : "border-slate-700 bg-slate-950/60 text-slate-300"
                }`}
              >
                {option} {option === "MACY" ? "(Active)" : "(Coming Soon)"}
              </button>
            ))}
          </div>
        )}
      </div>

      {!isActiveBrand && (
        <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-5 text-sm text-slate-300">
          {brand} lines are coming soon. Please select MACY to proceed.
        </div>
      )}

      {isActiveBrand && (
        <div className="grid gap-4 md:grid-cols-3">
          {lines.map((line) => {
            const inProgress =
              line.id === "production" &&
              (state?.stageInProgress?.preCleanBy ||
                state?.stageInProgress?.postCleanBy);
            const released =
              line.id === "production" && state?.stages?.lead === true;
            const card = (
              <div
                className={`rounded-2xl border bg-slate-900/60 p-5 text-center shadow-lg ${
                  inProgress
                    ? "border-emerald-400/60 ring-2 ring-emerald-400/40"
                    : "border-slate-700/70"
                }`}
              >
                <p className="text-lg font-semibold text-slate-100">
                  {line.label}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-400">
                  {released
                    ? "Line released by sanitation"
                    : inProgress
                    ? "Cleaning in progress"
                    : line.active
                    ? "Active"
                    : "Coming Soon"}
                </p>
              </div>
            );

            if (!line.active) return <div key={line.id}>{card}</div>;

            return (
              <Link key={line.id} href={`/macy/${line.id}`}>
                {card}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
