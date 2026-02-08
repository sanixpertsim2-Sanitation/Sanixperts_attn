"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function ProductionManager() {
  const { 
    state, 
    resetStages, 
    unlockStages, 
    resetAllData, 
    addAnnouncement, 
    removeAnnouncement,
    getActiveAnnouncements 
  } = useApp();
  
  const [show, setShow] = useState(false);
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState("unlock");
  
  // Announcement form state
  const [announcementForm, setAnnouncementForm] = useState({
    lineName: "MACY Production",
    message: "",
    duration: "8", // hours
  });

  const handleUnlock = () => {
    if (pin === "2451") {
      setUnlocked(true);
    }
  };

  const handleStageReset = (stageKeys, isReset = false) => {
    const confirmMessage = isReset 
      ? `Reset ${stageKeys.join(", ")} - This will CLEAR ALL DATA for these stages. Continue?`
      : `Unlock ${stageKeys.join(", ")} - This will keep data but allow re-access. Continue?`;
    
    if (window.confirm(confirmMessage)) {
      if (isReset) {
        resetStages(stageKeys);
      } else {
        unlockStages(stageKeys);
      }
    }
  };

  const handleCompleteReset = () => {
    if (window.confirm("COMPLETE SYSTEM RESET - This will clear ALL data for ALL lines. This is typically done at shift start. Continue?")) {
      resetAllData();
      setShow(false);
      setUnlocked(false);
      setPin("");
    }
  };

  const handleAddAnnouncement = () => {
    if (!announcementForm.message.trim()) {
      alert("Please enter an announcement message.");
      return;
    }
    
    const expiresAt = new Date(Date.now() + parseInt(announcementForm.duration) * 60 * 60 * 1000).toISOString();
    
    addAnnouncement({
      lineName: announcementForm.lineName,
      message: announcementForm.message.trim(),
      expiresAt,
      createdBy: state.currentUser?.name || "Admin"
    });

    setAnnouncementForm({
      lineName: "MACY Production",
      message: "",
      duration: "8"
    });
    
    alert("Announcement created successfully!");
  };

  return (
    <div className="mt-8 text-center">
      <button
        onClick={() => setShow(true)}
        className="text-xs uppercase tracking-[0.3em] text-slate-400 underline hover:text-slate-300 transition-colors"
      >
        🔧 Admin / Production Manager
      </button>

      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700/70 bg-slate-900/95 backdrop-blur">
            
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-700/50 bg-slate-900/98 p-6">
              <div>
                <h3 className="text-lg font-semibold text-amber-200">Production Manager</h3>
                <p className="text-xs text-slate-400">System controls and announcements</p>
              </div>
              <button
                onClick={() => {
                  setShow(false);
                  setUnlocked(false);
                  setPin("");
                }}
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-slate-500 hover:text-slate-200"
              >
                Close
              </button>
            </div>

            <div className="p-6">
              {!unlocked ? (
                // PIN Entry
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h4 className="text-xl font-semibold text-slate-200">Admin Access Required</h4>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    Enter your admin PIN to access production management controls, system resets, and announcement tools.
                  </p>
                  
                  <div className="flex flex-col gap-3 max-w-sm mx-auto">
                    <input
                      type="password"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 text-center text-lg font-mono text-slate-100"
                      placeholder="Enter PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      maxLength="4"
                    />
                    <button
                      onClick={handleUnlock}
                      disabled={pin.length !== 4}
                      className="w-full rounded-lg bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Access Production Controls
                    </button>
                  </div>
                </div>
              ) : (
                // Admin Controls
                <div className="space-y-6">
                  
                  {/* Tab Navigation */}
                  <div className="flex gap-2 border-b border-slate-700/50">
                    {[
                      { id: "unlock", label: "Reset & Unlock", icon: "🔓" },
                      { id: "announcements", label: "Announcements", icon: "📢" },
                      { id: "system", label: "System Status", icon: "⚙️" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? "border-b-2 border-amber-400 text-amber-200"
                            : "text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        <span>{tab.icon}</span>
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Reset & Unlock Tab */}
                  {activeTab === "unlock" && (
                    <div className="space-y-6">
                      
                      {/* Emergency Reset */}
                      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
                        <h4 className="text-lg font-semibold text-red-200 mb-3">🚨 Emergency Reset</h4>
                        <p className="text-sm text-red-300 mb-4">
                          Complete system reset - clears ALL data for ALL lines. Use at shift start.
                        </p>
                        <button
                          onClick={handleCompleteReset}
                          className="w-full rounded-lg border-2 border-red-500/50 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 hover:bg-red-500/20 transition"
                        >
                          🔄 COMPLETE SYSTEM RESET
                        </button>
                      </div>

                      {/* Stage Controls */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        
                        {/* Unlock Stages */}
                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
                          <h4 className="text-lg font-semibold text-amber-200 mb-3">🔓 Unlock Stages</h4>
                          <p className="text-xs text-amber-300 mb-4">
                            Unlock stages to allow re-access. Data is preserved.
                          </p>
                          
                          <div className="space-y-2">
                            {[
                              { key: "preClean", label: "Pre-Clean" },
                              { key: "postClean", label: "Post-Clean" },
                              { key: "handover", label: "Handover" },
                              { key: "lead", label: "Lead Verification" },
                            ].map((stage) => (
                              <div
                                key={stage.key}
                                className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-950/30 px-3 py-2"
                              >
                                <div className="text-sm">
                                  <span className="text-slate-200">{stage.label}</span>
                                  {state.stages[stage.key] && (
                                    <span className="ml-2 text-xs text-green-400">✓ Complete</span>
                                  )}
                                  {state.stageLockedBy[stage.key] && (
                                    <span className="ml-2 text-xs text-amber-300">
                                      🔒 {state.stageLockedBy[stage.key]}
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleStageReset([stage.key], false)}
                                  disabled={!state.stages[stage.key] && !state.stageLockedBy[stage.key]}
                                  className="rounded-md border border-amber-400/50 px-3 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-400/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Unlock
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Reset Stages */}
                        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
                          <h4 className="text-lg font-semibold text-red-200 mb-3">🗑️ Reset Stages</h4>
                          <p className="text-xs text-red-300 mb-4">
                            Reset stages and clear their data. Cannot be undone.
                          </p>
                          
                          <div className="space-y-2">
                            {[
                              { key: "preClean", label: "Pre-Clean" },
                              { key: "postClean", label: "Post-Clean" },
                              { key: "handover", label: "Handover" },
                              { key: "lead", label: "Lead Verification" },
                            ].map((stage) => (
                              <button
                                key={stage.key}
                                onClick={() => handleStageReset([stage.key], true)}
                                disabled={!state.stages[stage.key]}
                                className="w-full rounded-lg border border-red-400/50 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Reset {stage.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Announcements Tab */}
                  {activeTab === "announcements" && (
                    <div className="space-y-6">
                      
                      {/* Create Announcement */}
                      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-6">
                        <h4 className="text-lg font-semibold text-blue-200 mb-4">📢 Create Announcement</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Target Line
                            </label>
                            <select
                              value={announcementForm.lineName}
                              onChange={(e) => setAnnouncementForm(prev => ({ ...prev, lineName: e.target.value }))}
                              className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
                            >
                              <option value="MACY Production">MACY Production</option>
                              <option value="MACY Decoration">MACY Decoration</option>
                              <option value="MACY Spiral">MACY Spiral</option>
                              <option value="MACY Palletizing">MACY Palletizing</option>
                              <option value="MACY Oven">MACY Oven</option>
                              <option value="JFK Production">JFK Production</option>
                              <option value="CECE Production">CECE Production</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Announcement Message
                            </label>
                            <textarea
                              value={announcementForm.message}
                              onChange={(e) => setAnnouncementForm(prev => ({ ...prev, message: e.target.value }))}
                              className="w-full h-24 rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
                              placeholder="Enter urgent announcement or instructions for the production line..."
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Duration (max 24 hours)
                            </label>
                            <select
                              value={announcementForm.duration}
                              onChange={(e) => setAnnouncementForm(prev => ({ ...prev, duration: e.target.value }))}
                              className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
                            >
                              <option value="1">1 hour</option>
                              <option value="2">2 hours</option>
                              <option value="4">4 hours</option>
                              <option value="8">8 hours (shift)</option>
                              <option value="12">12 hours</option>
                              <option value="24">24 hours (max)</option>
                            </select>
                          </div>
                          
                          <button
                            onClick={handleAddAnnouncement}
                            disabled={!announcementForm.message.trim()}
                            className="w-full rounded-lg bg-blue-500 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            📢 Create Announcement
                          </button>
                        </div>
                      </div>

                      {/* Active Announcements */}
                      <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-6">
                        <h4 className="text-lg font-semibold text-slate-200 mb-4">Active Announcements</h4>
                        
                        {state.announcements.length === 0 ? (
                          <p className="text-sm text-slate-400 text-center py-4">
                            No active announcements
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {state.announcements.map((announcement) => (
                              <div
                                key={announcement.id}
                                className="rounded-lg border border-slate-700/50 bg-slate-950/50 p-4"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-semibold">
                                        {announcement.lineName}
                                      </span>
                                      <span className="text-xs text-slate-500">
                                        by {announcement.createdBy}
                                      </span>
                                    </div>
                                    <p className="text-sm text-slate-200">{announcement.message}</p>
                                    <p className="text-xs text-slate-500 mt-2">
                                      Expires: {new Date(announcement.expiresAt).toLocaleString()}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => removeAnnouncement(announcement.id)}
                                    className="ml-4 text-red-400 hover:text-red-300 text-sm"
                                    title="Remove announcement"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* System Status Tab */}
                  {activeTab === "system" && (
                    <div className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        
                        {/* Current Stage Status */}
                        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-6">
                          <h4 className="text-lg font-semibold text-slate-200 mb-4">Stage Status</h4>
                          <div className="space-y-2">
                            {Object.entries(state.stages).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between text-sm">
                                <span className="text-slate-300 capitalize">{key}</span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  value ? "bg-green-500/20 text-green-300" : "bg-slate-700/50 text-slate-400"
                                }`}>
                                  {value ? "✓ Complete" : "Pending"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Locked Stages */}
                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
                          <h4 className="text-lg font-semibold text-amber-200 mb-4">Locked Stages</h4>
                          <div className="space-y-2">
                            {Object.entries(state.stageLockedBy).map(([key, user]) => (
                              <div key={key} className="flex items-center justify-between text-sm">
                                <span className="text-slate-300 capitalize">{key}</span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  user ? "bg-amber-500/20 text-amber-300" : "bg-slate-700/50 text-slate-400"
                                }`}>
                                  {user ? `🔒 ${user}` : "Available"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* System Info */}
                        <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-6">
                          <h4 className="text-lg font-semibold text-slate-200 mb-4">System Info</h4>
                          <div className="space-y-2 text-xs text-slate-400">
                            <p>Current User: {state.currentUser?.name || "None"}</p>
                            <p>Damage Reports: {state.damageReports.length}</p>
                            <p>Activity Feed: {state.activityFeed.length}</p>
                            <p>Announcements: {state.announcements.length}</p>
                            <p>Last Activity: {state.activityFeed[0]?.timestamp 
                              ? new Date(state.activityFeed[0].timestamp).toLocaleString()
                              : "None"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}