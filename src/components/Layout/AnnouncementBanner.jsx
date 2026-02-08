"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";

export default function AnnouncementBanner({ lineName }) {
  const { getActiveAnnouncements, removeAnnouncement } = useApp();
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    const active = getActiveAnnouncements(lineName);
    setAnnouncements(active);
  }, [getActiveAnnouncements, lineName]);

  const handleDismiss = (announcementId) => {
    setDismissed(prev => new Set(prev).add(announcementId));
  };

  const visibleAnnouncements = announcements.filter(ann => !dismissed.has(ann.id));

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {visibleAnnouncements.map((announcement) => {
        const timeLeft = new Date(announcement.expiresAt) - new Date();
        const hoursLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60)));
        
        return (
          <div
            key={announcement.id}
            className="rounded-xl border border-orange-400/40 bg-orange-500/10 p-4 shadow-lg animate-pulse"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">📢</span>
                  <div>
                    <h3 className="text-sm font-semibold text-orange-200">
                      Urgent Announcement - {lineName}
                    </h3>
                    <p className="text-xs text-orange-300">
                      From: {announcement.createdBy} • Expires in {hoursLeft}h
                    </p>
                  </div>
                </div>
                
                <div className="rounded-lg bg-orange-500/20 p-3 mb-3">
                  <p className="text-sm font-medium text-orange-100">
                    {announcement.message}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-orange-300">
                    🕐 Created: {new Date(announcement.createdAt).toLocaleString()}
                  </span>
                  <span className="text-orange-400">
                    ⏰ Expires: {new Date(announcement.expiresAt).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleDismiss(announcement.id)}
                  className="rounded-lg border border-orange-400/50 px-3 py-1.5 text-xs font-medium text-orange-200 hover:bg-orange-400/10"
                  title="Dismiss for this session"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => removeAnnouncement(announcement.id)}
                  className="rounded-lg border border-red-400/50 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-400/10"
                  title="Remove permanently (Admin only)"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}