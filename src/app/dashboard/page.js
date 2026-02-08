"use client";

import { useMemo, useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { BrandMarkDashboard } from "@/components/Layout/BrandMark";
import { useLiveData, useDashboardAnalytics } from "@/hooks/useLiveData";

export default function ComprehensiveDashboard() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Use custom hooks for live data and analytics
  const { lastUpdate, isLive, setIsLive, connectionStatus, refreshData } = useLiveData(30000);
  const analytics = useDashboardAnalytics(state);
  
  // Backwards compatibility - map analytics to metrics
  const metrics = {
    avgCompletion: analytics.avgCompletion,
    completionData: analytics.completionData.reduce((acc, item) => {
      acc[item.line] = item.percent;
      return acc;
    }, {}),
    openReports: analytics.damageAnalytics.open,
    highSeverityReports: analytics.damageAnalytics.high,
    todayReports: analytics.damageAnalytics.today,
    totalActivities: analytics.activityAnalytics.total,
    todayActivities: analytics.activityAnalytics.today,
  };

  // Real-time status classification
  const getStatusClass = (stage) => {
    if (stage.toLowerCase().includes("released")) return "clean";
    if (stage.toLowerCase().includes("damage") || stage.toLowerCase().includes("alert")) return "danger";
    if (stage.toLowerCase().includes("handover") || stage.toLowerCase().includes("progress")) return "warning";
    return "neutral";
  };

  // Use analytics data for charts
  const chartData = analytics.activityAnalytics.hourlyData;

  // KPI Cards Component
  const KPICards = () => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 p-4 text-center">
        <p className="text-2xl font-bold text-blue-200">{metrics.avgCompletion}%</p>
        <p className="text-xs text-slate-400">Avg Completion</p>
      </div>
      <div className="rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 p-4 text-center">
        <p className="text-2xl font-bold text-green-200">{3 - metrics.openReports}</p>
        <p className="text-xs text-slate-400">Lines Clean</p>
      </div>
      <div className="rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 p-4 text-center">
        <p className="text-2xl font-bold text-amber-200">{metrics.openReports}</p>
        <p className="text-xs text-slate-400">Open Issues</p>
      </div>
      <div className="rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 p-4 text-center">
        <p className="text-2xl font-bold text-red-200">{metrics.highSeverityReports}</p>
        <p className="text-xs text-slate-400">High Severity</p>
      </div>
      <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 p-4 text-center">
        <p className="text-2xl font-bold text-purple-200">{metrics.todayActivities}</p>
        <p className="text-xs text-slate-400">Today Events</p>
      </div>
      <div className="rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-600/10 p-4 text-center">
        <p className="text-2xl font-bold text-teal-200">
          {analytics.performance.avgStageTime ? `${analytics.performance.avgStageTime}m` : "N/A"}
        </p>
        <p className="text-xs text-slate-400">Avg Stage Time</p>
      </div>
    </div>
  );

  // Live Progress Charts Component
  const LiveProgressCharts = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {["macy", "jfk", "cece"].map((line) => {
        const percent = metrics.completionData[line];
        const status = state.lineStatus[line];
        const circumference = 2 * Math.PI * 45;
        const strokeDasharray = circumference;
        const strokeDashoffset = circumference - (percent / 100) * circumference;
        
        return (
          <div key={line} className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-100">{line.toUpperCase()}</h3>
                <p className="text-xs text-slate-400">{status.stage}</p>
                <p className="text-[10px] text-slate-500">By: {status.submittedBy}</p>
              </div>
              <div className="relative">
                <svg className="h-16 w-16 -rotate-90 transform">
                  <circle
                    cx="32"
                    cy="32"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-slate-700"
                    style={{ strokeDasharray, strokeDashoffset: circumference }}
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className={percent === 100 ? "text-green-400" : percent > 50 ? "text-blue-400" : "text-amber-400"}
                    style={{ strokeDasharray, strokeDashoffset }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-slate-100">{percent}%</span>
                </div>
              </div>
            </div>
            
            {/* Mini stage indicators */}
            <div className="mt-4 grid grid-cols-4 gap-1">
              {["Pre", "Post", "Hand", "Lead"].map((stage, idx) => (
                <div
                  key={stage}
                  className={`rounded px-2 py-1 text-center text-[10px] font-medium ${
                    Object.values(state.stages)[idx]
                      ? "bg-green-500/20 text-green-300"
                      : "bg-slate-700/50 text-slate-400"
                  }`}
                >
                  {stage}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Activity Timeline Component
  const ActivityTimeline = () => (
    <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Live Activity Timeline</h2>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
          <span>Live</span>
        </div>
      </div>
      
      <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
        {state.activityFeed.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            No activity yet. Start a workflow to see live updates.
          </p>
        ) : (
          state.activityFeed.slice(0, 12).map((item, idx) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg border border-slate-800/50 bg-slate-950/30 p-3"
            >
              <div className="flex-shrink-0">
                <div className={`h-3 w-3 rounded-full ${
                  idx === 0 ? "bg-green-400 animate-pulse" : 
                  idx < 3 ? "bg-blue-400" : "bg-slate-500"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate">{item.text}</p>
                <p className="text-[10px] text-slate-500">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Performance Analytics Component
  const PerformanceAnalytics = () => (
    <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-6">
      <h2 className="text-lg font-semibold text-slate-100">Performance Analytics</h2>
      
      {/* 24-hour activity chart */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-slate-300 mb-3">24-Hour Activity</h3>
        <div className="flex items-end gap-1 h-24">
          {chartData.map((data, idx) => {
            const maxCount = Math.max(...chartData.map(d => d.count), 1);
            const height = Math.max(4, (data.count / maxCount) * 100);
            
            return (
              <div
                key={idx}
                className="chart-bar flex-1 bg-blue-500/20 hover:bg-blue-500/40 transition-colors cursor-pointer rounded-t"
                style={{ 
                  height: `${height}%`,
                  "--bar-height": `${height}%`
                }}
                title={`${data.label} - ${data.count} activities`}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-slate-500">
          <span>24h ago</span>
          <span>12h ago</span>
          <span>Now</span>
        </div>
      </div>

      {/* Efficiency metrics */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg bg-slate-950/50 p-3">
          <p className="text-xs text-slate-400">Avg Stage Time</p>
          <p className="text-lg font-bold text-slate-200">
            {analytics.performance.avgStageTime ? `${analytics.performance.avgStageTime}m` : "N/A"}
          </p>
        </div>
        <div className="rounded-lg bg-slate-950/50 p-3">
          <p className="text-xs text-slate-400">Error Rate</p>
          <p className={`text-lg font-bold ${
            analytics.performance.errorRate > 10 ? "text-red-300" : 
            analytics.performance.errorRate > 5 ? "text-amber-300" : "text-green-300"
          }`}>
            {analytics.performance.errorRate}%
          </p>
        </div>
        <div className="rounded-lg bg-slate-950/50 p-3 sm:col-span-2">
          <p className="text-xs text-slate-400">Productivity Level</p>
          <div className="flex items-center gap-2 mt-1">
            <p className={`text-lg font-bold ${
              analytics.performance.productivity === "High" ? "text-green-300" :
              analytics.performance.productivity === "Medium" ? "text-amber-300" : "text-red-300"
            }`}>
              {analytics.performance.productivity}
            </p>
            <div className={`h-2 w-2 rounded-full ${
              analytics.performance.productivity === "High" ? "bg-green-400" :
              analytics.performance.productivity === "Medium" ? "bg-amber-400" : "bg-red-400"
            }`} />
          </div>
        </div>
      </div>
    </div>
  );

  // Critical Alerts Panel
  const CriticalAlerts = () => {
    const criticalIssues = state.damageReports.filter(r => 
      r.severity === "High" && r.status === "Open"
    );
    
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-red-200">Critical Alerts</h2>
          {criticalIssues.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 animate-pulse rounded-full bg-red-400"></div>
              <span className="text-xs text-red-300">{criticalIssues.length} Active</span>
            </div>
          )}
        </div>
        
        {criticalIssues.length === 0 ? (
          <div className="mt-4 text-center py-6">
            <div className="text-green-400 text-2xl mb-2">✓</div>
            <p className="text-sm text-green-200">All systems operational</p>
            <p className="text-xs text-slate-400">No critical alerts</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {criticalIssues.map((alert) => (
              <div
                key={alert.id}
                className="rounded-lg border border-red-400/30 bg-red-500/10 p-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-red-200">
                      {alert.lineName} - {alert.equipmentArea}
                    </p>
                    <p className="text-xs text-red-300">{alert.description}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Reported: {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="bg-red-500/20 text-red-200 px-2 py-1 rounded text-[10px] font-semibold">
                    {alert.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Live Status Grid Component
  const LiveStatusGrid = () => (
    <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-100">Live Production Status</h2>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-1.5 rounded-full transition-colors ${
              isLive ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-slate-700 text-slate-400 border border-slate-600'
            }`}
          >
            {isLive ? "🔴 Live" : "⏸ Paused"}
          </button>
          <button
            onClick={refreshData}
            className="px-2 py-1 rounded hover:bg-slate-700 transition-colors"
            title="Manual refresh"
          >
            ↻
          </button>
          <span className={connectionStatus === "connected" ? "text-green-400" : "text-red-400"}>
            {connectionStatus === "connected" ? "●" : "●"} {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        {Object.entries(state.lineStatus).map(([line, status]) => (
          <div
            key={line}
            className={`status rounded-xl border p-4 transition-all ${getStatusClass(status.stage)} ${
              getStatusClass(status.stage) === "clean" 
                ? "border-green-500/40 bg-green-500/10" 
                : getStatusClass(status.stage) === "danger"
                ? "border-red-500/40 bg-red-500/10"
                : getStatusClass(status.stage) === "warning"
                ? "border-amber-500/40 bg-amber-500/10"
                : "border-slate-700/50 bg-slate-950/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-100">
                  {line.toUpperCase()} Production Line
                </h3>
                <p className="text-sm text-slate-300">{status.stage}</p>
                <p className="text-xs text-slate-500">
                  {status.submittedBy} • {status.timestamp 
                    ? new Date(status.timestamp).toLocaleTimeString() 
                    : "No recent activity"}
                </p>
              </div>
              <div className="text-right">
                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                  getStatusClass(status.stage) === "clean" 
                    ? "bg-green-500/20 text-green-300" 
                    : getStatusClass(status.stage) === "danger"
                    ? "bg-red-500/20 text-red-300"
                    : getStatusClass(status.stage) === "warning"
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-slate-500/20 text-slate-300"
                }`}>
                  {metrics.completionData[line]}% Complete
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Data Comparison Tables
  const DataComparison = () => (
    <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-6">
      <h2 className="text-lg font-semibold text-slate-100 mb-4">Data Analysis</h2>
      
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stage Performance Comparison */}
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Stage Performance</h3>
          <div className="space-y-2">
            {[
              { stage: "Pre-Clean", completed: state.stages.preClean, time: state.stageTimes.preCleanAt },
              { stage: "Post-Clean", completed: state.stages.postClean, time: state.stageTimes.postCleanAt },
              { stage: "Handover", completed: state.stages.handover, time: state.stageTimes.handoverAt },
              { stage: "Lead Sign-off", completed: state.stages.lead, time: state.stageTimes.leadAt }
            ].map((stage) => (
              <div key={stage.stage} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50">
                <div>
                  <p className="text-sm text-slate-200">{stage.stage}</p>
                  {stage.time && (
                    <p className="text-[10px] text-slate-500">
                      {new Date(stage.time).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  stage.completed 
                    ? "bg-green-500/20 text-green-300" 
                    : "bg-slate-700/50 text-slate-400"
                }`}>
                  {stage.completed ? "✓ Done" : "Pending"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Damage Report Analysis */}
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Damage Report Analysis</h3>
          <div className="space-y-2">
            {["High", "Medium", "Low"].map((severity) => {
              const count = state.damageReports.filter(r => r.severity === severity).length;
              const percentage = metrics.totalDamageReports > 0 
                ? (count / metrics.totalDamageReports * 100).toFixed(0)
                : 0;
              
              return (
                <div key={severity} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      severity === "High" ? "bg-red-400" :
                      severity === "Medium" ? "bg-amber-400" : "bg-green-400"
                    }`} />
                    <span className="text-sm text-slate-200">{severity} Severity</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-100">{count}</p>
                    <p className="text-[10px] text-slate-500">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const tabContent = {
    overview: (
      <div className="space-y-6">
        <KPICards />
        <LiveProgressCharts />
        <CriticalAlerts />
      </div>
    ),
    analytics: (
      <div className="space-y-6">
        <PerformanceAnalytics />
        <DataComparison />
      </div>
    ),
    status: (
      <div className="space-y-6">
        <LiveStatusGrid />
        <ActivityTimeline />
      </div>
    ),
    reports: (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">All Damage Reports</h2>
          {state.damageReports.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No reports yet</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {state.damageReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-start justify-between p-4 rounded-lg border border-slate-800/50 bg-slate-950/30"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      {report.lineName} - {report.equipmentArea}
                    </p>
                    <p className="text-xs text-slate-300">{report.description}</p>
                    <p className="text-[10px] text-slate-500">
                      {new Date(report.createdAt).toLocaleString()} • {report.reportedBy}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-[10px] font-semibold ${
                      report.severity === "High" ? "bg-red-500/20 text-red-300" :
                      report.severity === "Medium" ? "bg-amber-500/20 text-amber-300" :
                      "bg-green-500/20 text-green-300"
                    }`}>
                      {report.severity}
                    </span>
                    <p className={`text-xs mt-1 ${
                      report.status === "Open" ? "text-red-300" : "text-green-300"
                    }`}>
                      {report.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="lg:hidden">
            <BrandMarkDashboard />
          </div>
          <h1 className="text-2xl font-bold text-blue-200 lg:text-3xl">
            Sanitation Command Center
          </h1>
          <p className="text-sm text-slate-400">
            Real-time analytics, live status updates, and performance insights
          </p>
        </div>
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${
              connectionStatus === "connected" 
                ? isLive ? "bg-green-400 animate-pulse" : "bg-amber-400"
                : "bg-red-400"
            }`} />
            <span className="text-slate-400">
              {connectionStatus === "connected" 
                ? isLive ? "Live updates active" : "Updates paused"
                : "Connection lost"}
            </span>
          </div>
          <span className="text-slate-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "analytics", label: "Analytics", icon: "📈" },
            { id: "status", label: "Live Status", icon: "🔴" },
            { id: "reports", label: "Reports", icon: "📋" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg border p-3 text-center transition-colors ${
                activeTab === tab.id
                  ? "border-orange-400/60 bg-orange-500/10 text-orange-200"
                  : "border-slate-700/50 bg-slate-900/30 text-slate-300 hover:border-orange-400/30"
              }`}
            >
              <div className="text-lg">{tab.icon}</div>
              <p className="text-xs font-medium">{tab.label}</p>
            </button>
          ))}
        </div>
        
        <div className="mt-6">
          {tabContent[activeTab]}
        </div>
      </div>

      {/* Desktop Layout - All sections visible */}
      <div className="hidden lg:block">
        <div className="space-y-8">
          {/* Top Row: KPIs and Critical Alerts */}
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div>
              <h2 className="text-lg font-semibold text-slate-100 mb-4">Key Performance Indicators</h2>
              <KPICards />
            </div>
            <CriticalAlerts />
          </div>

          {/* Second Row: Live Progress Charts */}
          <div>
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Production Line Status</h2>
            <LiveProgressCharts />
          </div>

          {/* Third Row: Analytics and Status */}
          <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
            <PerformanceAnalytics />
            <LiveStatusGrid />
          </div>

          {/* Bottom Row: Activity Timeline */}
          <ActivityTimeline />
        </div>
      </div>
    </div>
  );
}