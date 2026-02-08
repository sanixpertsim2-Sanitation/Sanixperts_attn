"use client";

import { useApp } from "@/context/AppContext";
import { validateReportRequirements, generateComprehensiveReport } from "@/utils/reportGenerator";

export default function LineReportSummary({ lineName }) {
  const { state } = useApp();
  
  const validation = validateReportRequirements(state);
  const isLineComplete = validation.isValid;
  
  const handleGenerateReport = () => {
    if (!state.currentUser?.name) {
      alert("Please verify your identity first.");
      return;
    }
    
    generateComprehensiveReport(state, lineName, state.currentUser.name, null);
  };

  // Don't show if line isn't complete
  if (!isLineComplete) {
    return null;
  }

  const completionStats = {
    stages: Object.values(state.stages).filter(Boolean).length,
    totalStages: 4,
    damageReports: state.damageReports.length,
    openIssues: state.damageReports.filter(r => r.status === "Open").length,
    handoverTasks: state.handoverTasks.length,
    completedTasks: state.handoverTasks.filter(t => t.status === "completed").length,
  };

  const completionPercent = Math.round((completionStats.stages / completionStats.totalStages) * 100);

  return (
    <div className="rounded-3xl border border-green-500/40 bg-green-500/10 p-6 shadow-xl">
      
      {/* Line Complete Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">✅</div>
          <div>
            <h2 className="text-xl font-bold text-green-200">
              {lineName} - Line Released for Production
            </h2>
            <p className="text-sm text-green-300">
              All stages completed • Report available
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-200">{completionPercent}%</p>
          <p className="text-xs text-green-400">Complete</p>
        </div>
      </div>

      {/* Completion Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        
        <div className="rounded-lg bg-green-500/20 p-4 text-center">
          <p className="text-2xl font-bold text-green-200">{completionStats.stages}</p>
          <p className="text-xs text-green-300">Stages Complete</p>
        </div>
        
        <div className="rounded-lg bg-blue-500/20 p-4 text-center">
          <p className="text-2xl font-bold text-blue-200">
            {state.bagCounts.covered || 0} / {state.bagCounts.retrieved || 0}
          </p>
          <p className="text-xs text-blue-300">Bags Covered/Retrieved</p>
        </div>
        
        <div className="rounded-lg bg-amber-500/20 p-4 text-center">
          <p className="text-2xl font-bold text-amber-200">
            {completionStats.completedTasks}/{completionStats.handoverTasks}
          </p>
          <p className="text-xs text-amber-300">Handover Tasks</p>
        </div>
        
        <div className={`rounded-lg p-4 text-center ${
          completionStats.openIssues > 0 
            ? "bg-red-500/20" 
            : "bg-green-500/20"
        }`}>
          <p className={`text-2xl font-bold ${
            completionStats.openIssues > 0 ? "text-red-200" : "text-green-200"
          }`}>
            {completionStats.damageReports}
          </p>
          <p className={`text-xs ${
            completionStats.openIssues > 0 ? "text-red-300" : "text-green-300"
          }`}>
            Damage Reports
          </p>
        </div>
      </div>

      {/* Timeline Summary */}
      <div className="rounded-xl border border-green-400/30 bg-green-500/5 p-4 mb-6">
        <h3 className="text-sm font-semibold text-green-200 mb-3">Cleaning Timeline</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { key: "preCleanAt", label: "Pre-Clean", stage: "preClean" },
            { key: "postCleanAt", label: "Post-Clean", stage: "postClean" },
            { key: "handoverAt", label: "Handover", stage: "handover" },
            { key: "leadAt", label: "Released", stage: "lead" },
          ].map((item) => (
            <div key={item.key} className="text-center">
              <p className="text-xs text-green-300">{item.label}</p>
              <p className="text-sm font-medium text-green-100">
                {state.stageTimes[item.key] 
                  ? new Date(state.stageTimes[item.key]).toLocaleTimeString()
                  : "Not completed"}
              </p>
              {state.stages[item.stage] && (
                <span className="text-xs text-green-400">✓</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Report Generation */}
      <div className="space-y-3">
        <div className="rounded-xl border border-blue-400/30 bg-blue-500/5 p-4">
          <h3 className="text-sm font-semibold text-blue-200 mb-2">📋 Complete Documentation Available</h3>
          <p className="text-xs text-blue-300 mb-3">
            Comprehensive report includes all damage reports, verification photos, checklist responses, 
            handover tasks, timestamps, and user tracking for complete line documentation.
          </p>
          
          <div className="grid gap-2 text-xs text-blue-200">
            <div className="flex justify-between">
              <span>✓ All stage verifications</span>
              <span>✓ Damage report details</span>
            </div>
            <div className="flex justify-between">
              <span>✓ Photo evidence included</span>
              <span>✓ Complete timestamps</span>
            </div>
            <div className="flex justify-between">
              <span>✓ User tracking</span>
              <span>✓ Handover task details</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleGenerateReport}
          className="w-full rounded-xl bg-blue-500 py-4 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-blue-400 shadow-lg"
        >
          📄 Download Complete Line Report
        </button>
        
        <p className="text-xs text-green-400 text-center">
          Released: {state.stageTimes.leadAt 
            ? new Date(state.stageTimes.leadAt).toLocaleString()
            : "Just now"} • Report includes all cleaning data and verifications
        </p>
      </div>
    </div>
  );
}