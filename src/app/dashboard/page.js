"use client";

import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import BrandMark from "@/components/Layout/BrandMark";

export default function DashboardPage() {
  const { state } = useApp();

  const completion = useMemo(() => {
    const macySteps = Object.values(state.stages).filter(Boolean).length;
    const macyPercent = Math.round((macySteps / 4) * 100);
    return { macy: macyPercent, jfk: 0, cece: 0 };
  }, [state.stages]);

  const statusClass = (stage) => {
    if (stage.toLowerCase().includes("released")) return "clean";
    if (stage.toLowerCase().includes("damage") || stage.toLowerCase().includes("handover")) {
      return "warning";
    }
    if (stage.toLowerCase().includes("stopped")) return "danger";
    return "warning";
  };

  const highSeverity = state.damageReports.filter(
    (report) => report.severity === "High"
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <BrandMark variant="dashboard" />
        <h1 className="text-3xl font-bold text-blue-200">
          Sanixpert Command Center
        </h1>
        <p className="text-sm text-slate-400">
          Real-time sanitation status and high-severity alerts.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {["macy", "jfk", "cece"].map((key) => {
          const percent = completion[key];
          const offset = 327 - (327 * percent) / 100;
          return (
          <div
            key={key}
            className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-4"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              {key.toUpperCase()}
            </p>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-3xl font-bold text-blue-200">{percent}%</p>
                <p className="metric-label">Completion</p>
              </div>
              <svg className="health-ring h-16 w-16 -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="6"
                />
                <circle
                  className="progress"
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  strokeWidth="6"
                  style={{ strokeDashoffset: offset }}
                />
              </svg>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-800">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
        })}
      </div>

      {highSeverity.length > 0 && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-100 animate-pulse">
          <p className="text-sm font-semibold">
            HIGH SEVERITY DAMAGE ALERT
          </p>
          <ul className="mt-2 space-y-1 text-xs">
            {highSeverity.map((report) => (
              <li key={report.id}>
                {report.lineName}: {report.description} •{" "}
                {new Date(report.createdAt).toLocaleTimeString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold text-slate-100">
            Live Line Status
          </h2>
          <div className="mt-4 space-y-3 text-sm text-slate-200">
            {Object.entries(state.lineStatus).map(([key, status]) => (
              <div
                key={key}
                className={`status rounded-xl border border-slate-700/50 bg-slate-950/50 p-3 ${statusClass(
                  status.stage
                )}`}
              >
                <p className="font-semibold">
                  {key.toUpperCase()} Production: {status.stage}
                </p>
                <p className="text-xs text-slate-400">
                  Submitted by {status.submittedBy}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold text-slate-100">
            Activity Feed
          </h2>
          <div className="mt-4 space-y-3 text-xs text-slate-300">
            {state.activityFeed.length === 0 && (
              <p className="text-slate-500">
                No activity yet. Start a workflow to see updates.
              </p>
            )}
            {state.activityFeed.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-slate-800 bg-slate-950/50 p-3"
              >
                <p>{item.text}</p>
                <p className="mt-1 text-[10px] text-slate-500">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
