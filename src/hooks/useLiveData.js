"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";

/**
 * Custom hook for live data updates and dashboard analytics
 * Provides real-time data refresh and analytics calculations
 */
export function useLiveData(refreshInterval = 30000) {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLive, setIsLive] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("connected");

  // Force refresh data
  const refreshData = useCallback(() => {
    setLastUpdate(new Date());
    
    // Trigger a custom event that AppContext can listen to
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("dashboard-refresh"));
    }
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      refreshData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isLive, refreshInterval, refreshData]);

  // Monitor connection status
  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus("connected");
      if (isLive) refreshData();
    };
    
    const handleOffline = () => setConnectionStatus("offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isLive, refreshData]);

  // Real-time Supabase subscriptions (if available)
  useEffect(() => {
    if (!supabase) return;

    const subscriptions = [];

    // Subscribe to damage reports changes
    const damageSubscription = supabase
      .channel("damage-reports")
      .on("postgres_changes", 
        { event: "*", schema: "public", table: "damage_reports" },
        (payload) => {
          refreshData();
        }
      )
      .subscribe();

    subscriptions.push(damageSubscription);

    // Subscribe to line status changes  
    const statusSubscription = supabase
      .channel("line-status")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "line_status" },
        (payload) => {
          refreshData();
        }
      )
      .subscribe();

    subscriptions.push(statusSubscription);

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [refreshData]);

  return {
    lastUpdate,
    isLive,
    setIsLive,
    connectionStatus,
    refreshData,
  };
}

/**
 * Hook for calculating dashboard analytics and insights
 */
export function useDashboardAnalytics(state) {
  return useMemo(() => {
    const lines = ["macy", "jfk", "cece"];
    
    // Completion analytics
    const completionData = lines.map(line => {
      const stageCount = Object.values(state.stages).filter(Boolean).length;
      const percent = line === "macy" ? Math.round((stageCount / 4) * 100) : 0;
      return { line, percent, status: state.lineStatus[line] };
    });

    const avgCompletion = completionData.reduce((acc, data) => acc + data.percent, 0) / lines.length;

    // Damage report analytics
    const damageAnalytics = {
      total: state.damageReports.length,
      open: state.damageReports.filter(r => r.status === "Open").length,
      high: state.damageReports.filter(r => r.severity === "High").length,
      today: state.damageReports.filter(r => {
        const reportDate = new Date(r.createdAt).toDateString();
        const today = new Date().toDateString();
        return reportDate === today;
      }).length,
    };

    // Activity analytics
    const activityAnalytics = {
      total: state.activityFeed.length,
      today: state.activityFeed.filter(activity => {
        const activityDate = new Date(activity.timestamp).toDateString();
        const today = new Date().toDateString();
        return activityDate === today;
      }).length,
      hourlyData: generateHourlyData(state.activityFeed),
    };

    // Performance metrics
    const performance = {
      avgStageTime: calculateAvgStageTime(state.stageTimes),
      errorRate: damageAnalytics.total > 0 
        ? Math.round((damageAnalytics.open / damageAnalytics.total) * 100)
        : 0,
      productivity: avgCompletion > 80 ? "High" : avgCompletion > 50 ? "Medium" : "Low",
    };

    return {
      completionData,
      avgCompletion,
      damageAnalytics,
      activityAnalytics,
      performance,
    };
  }, [state]);
}

// Helper functions
function generateHourlyData(activityFeed) {
  const hours = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now - i * 60 * 60 * 1000);
    const hourActivities = activityFeed.filter(activity => {
      const activityHour = new Date(activity.timestamp).getHours();
      const targetHour = hour.getHours();
      return activityHour === targetHour;
    });
    
    hours.push({
      hour: hour.getHours(),
      count: hourActivities.length,
      label: hour.getHours() === now.getHours() ? "Now" : `${hour.getHours()}:00`
    });
  }
  
  return hours;
}

function calculateAvgStageTime(stageTimes) {
  const times = Object.values(stageTimes).filter(Boolean);
  if (times.length < 2) return null;
  
  const durations = [];
  for (let i = 1; i < times.length; i++) {
    const duration = new Date(times[i]) - new Date(times[i - 1]);
    durations.push(duration);
  }
  
  const avgMs = durations.reduce((acc, dur) => acc + dur, 0) / durations.length;
  return Math.round(avgMs / (1000 * 60)); // Return in minutes
}