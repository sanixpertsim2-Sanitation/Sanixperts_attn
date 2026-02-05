"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const STORAGE_KEY = "sanixpertState";

const defaultState = {
  employees: [],
  currentUser: null,
  bagCounts: {
    covered: "",
    retrieved: "",
  },
  stages: {
    preClean: false,
    postClean: false,
    handover: false,
    lead: false,
  },
  stageInProgress: {
    preCleanBy: null,
    postCleanBy: null,
  },
  stageTimes: {
    preCleanAt: null,
    postCleanAt: null,
    handoverAt: null,
    leadAt: null,
  },
  handoverRequired: null,
  handoverTasks: [
    {
      id: "task-1",
      text: "Verify all lines and conveyors are clean to sanitation standard.",
      status: "pending",
    },
    {
      id: "task-2",
      text: "Inspect all coverings and confirm every cover is removed.",
      status: "pending",
    },
    {
      id: "task-3",
      text: "Verify drain strainers near the line are clean and clear.",
      status: "pending",
    },
    {
      id: "task-4",
      text: "Verify housekeeping and garbage removal is completed for the line.",
      status: "pending",
    },
  ],
  damageReports: [],
  activityFeed: [],
  lineStatus: {
    macy: { stage: "Idle", submittedBy: "-", timestamp: null },
    jfk: { stage: "Coming Soon", submittedBy: "-", timestamp: null },
    cece: { stage: "Coming Soon", submittedBy: "-", timestamp: null },
  },
};

const AppContext = createContext(null);

const loadState = () => {
  if (typeof window === "undefined") return defaultState;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultState;
  try {
    return { ...defaultState, ...JSON.parse(stored) };
  } catch {
    return defaultState;
  }
};

export function AppProvider({ children }) {
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    setState(loadState());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!supabase) return;
    const loadDamageReports = async () => {
      const { data, error } = await supabase
        .from("damage_reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (error || !data) return;
      setState((prev) => ({
        ...prev,
        damageReports: data.map((report) => ({
          id: report.id,
          lineName: report.line_name,
          equipmentArea: report.equipment_area,
          description: report.description,
          severity: report.severity,
          status: report.status,
          reportedBy: report.reported_by,
          createdAt: report.created_at,
          photo: report.photo_data
            ? { dataUrl: report.photo_data, timestamp: report.created_at }
            : null,
          fixedBy: report.fixed_by,
          closedAt: report.closed_at,
          closePhoto: report.close_photo_data
            ? { dataUrl: report.close_photo_data, timestamp: report.closed_at }
            : null,
        })),
      }));
    };
    loadDamageReports();
  }, []);

  const registerEmployee = ({ name, role, faceId }) => {
    setState((prev) => ({
      ...prev,
      employees: [
        ...prev.employees,
        { id: `emp-${Date.now()}`, name, role, faceId },
      ],
      currentUser: { name, role, faceId },
    }));
  };

  const setCurrentUser = (user) => {
    setState((prev) => ({
      ...prev,
      currentUser: user,
    }));
  };

  const completePreClean = ({ bagsCovered, name }) => {
    const now = new Date().toISOString();
    logEvent("pre_clean_submitted", {
      lineName: "MACY Production",
      bagsCovered,
      submittedBy: name,
      timestamp: now,
    });
    setState((prev) => ({
      ...prev,
      bagCounts: { ...prev.bagCounts, covered: bagsCovered },
      stages: { ...prev.stages, preClean: true },
      stageInProgress: { ...prev.stageInProgress, preCleanBy: null },
      stageTimes: { ...prev.stageTimes, preCleanAt: now },
      lineStatus: {
        ...prev.lineStatus,
        macy: {
          stage: "Under Wash",
          submittedBy: name,
          timestamp: now,
        },
      },
      activityFeed: [
        {
          id: `feed-${Date.now()}`,
          text: `${name} submitted Pre-Clean for MACY Production`,
          timestamp: now,
        },
        ...prev.activityFeed,
      ],
    }));
  };

  const completePostClean = ({ bagsRetrieved, name }) => {
    const now = new Date().toISOString();
    logEvent("post_clean_submitted", {
      lineName: "MACY Production",
      bagsRetrieved,
      submittedBy: name,
      timestamp: now,
    });
    setState((prev) => ({
      ...prev,
      bagCounts: { ...prev.bagCounts, retrieved: bagsRetrieved },
      stages: { ...prev.stages, postClean: true },
      stageInProgress: { ...prev.stageInProgress, postCleanBy: null },
      stageTimes: { ...prev.stageTimes, postCleanAt: now },
      lineStatus: {
        ...prev.lineStatus,
        macy: {
          stage: "Post-Clean Completed",
          submittedBy: name,
          timestamp: now,
        },
      },
      activityFeed: [
        {
          id: `feed-${Date.now()}`,
          text: `${name} submitted Post-Clean for MACY Production`,
          timestamp: now,
        },
        ...prev.activityFeed,
      ],
    }));
  };

  const setHandoverRequired = (value) => {
    setState((prev) => ({ ...prev, handoverRequired: value }));
  };

  const markStageInProgress = (stageKey, name) => {
    setState((prev) => ({
      ...prev,
      stageInProgress: {
        ...prev.stageInProgress,
        [`${stageKey}By`]: name,
      },
    }));
  };

  const updateHandoverTasks = (tasks) => {
    setState((prev) => ({ ...prev, handoverTasks: tasks }));
  };

  const completeHandover = ({ name }) => {
    const now = new Date().toISOString();
    logEvent("handover_submitted", {
      lineName: "MACY Production",
      submittedBy: name,
      timestamp: now,
    });
    setState((prev) => ({
      ...prev,
      stages: { ...prev.stages, handover: true },
      stageTimes: { ...prev.stageTimes, handoverAt: now },
      lineStatus: {
        ...prev.lineStatus,
        macy: {
          stage: "Handover Completed",
          submittedBy: name,
          timestamp: now,
        },
      },
      activityFeed: [
        {
          id: `feed-${Date.now()}`,
          text: `${name} completed Handover for MACY Production`,
          timestamp: now,
        },
        ...prev.activityFeed,
      ],
    }));
  };

  const completeLeadSignoff = ({ name, signature }) => {
    const now = new Date().toISOString();
    logEvent("lead_released", {
      lineName: "MACY Production",
      leadName: name,
      timestamp: now,
    });
    setState((prev) => ({
      ...prev,
      stages: { ...prev.stages, lead: true },
      leadSignature: signature,
      stageTimes: { ...prev.stageTimes, leadAt: now },
      lineStatus: {
        ...prev.lineStatus,
        macy: {
          stage: "Released for Production",
          submittedBy: name,
          timestamp: now,
        },
      },
      activityFeed: [
        {
          id: `feed-${Date.now()}`,
          text: `${name} released MACY Production`,
          timestamp: now,
        },
        ...prev.activityFeed,
      ],
    }));
  };

  const addDamageReport = (report) => {
    if (supabase) {
      supabase.from("damage_reports").insert([
        {
          line_name: report.lineName,
          equipment_area: report.equipmentArea,
          description: report.description,
          severity: report.severity,
          status: report.status,
          reported_by: report.reportedBy,
          created_at: report.createdAt,
          photo_data: report.photo?.dataUrl || null,
        },
      ]);
    }
    setState((prev) => ({
      ...prev,
      damageReports: [report, ...prev.damageReports],
      activityFeed: [
        {
          id: `feed-${Date.now()}`,
          text: `${report.reportedBy} reported damage (${report.severity})`,
          timestamp: new Date().toISOString(),
        },
        ...prev.activityFeed,
      ],
    }));
  };

  const updateDamageReport = (id, updates) => {
    if (supabase) {
      supabase
        .from("damage_reports")
        .update({
          status: updates.status,
          fixed_by: updates.fixedBy,
          closed_at: updates.closedAt,
          close_photo_data: updates.closePhoto?.dataUrl || null,
        })
        .eq("id", id);
    }
    setState((prev) => ({
      ...prev,
      damageReports: prev.damageReports.map((report) =>
        report.id === id ? { ...report, ...updates } : report
      ),
    }));
  };

  const logEvent = (eventType, payload) => {
    if (!supabase) return;
    supabase.from("event_logs").insert([
      {
        line_name: payload.lineName || "MACY Production",
        event_type: eventType,
        payload,
      },
    ]);
  };

  const resetStages = (nextStages) => {
    setState((prev) => ({
      ...prev,
      stages: { ...prev.stages, ...nextStages },
      bagCounts: {
        covered: nextStages.preClean ? prev.bagCounts.covered : "",
        retrieved: nextStages.postClean ? prev.bagCounts.retrieved : "",
      },
    }));
  };

  const value = useMemo(
    () => ({
      state,
      registerEmployee,
      setCurrentUser,
      completePreClean,
      completePostClean,
      setHandoverRequired,
      markStageInProgress,
      updateHandoverTasks,
      completeHandover,
      completeLeadSignoff,
      addDamageReport,
      updateDamageReport,
      resetStages,
    }),
    [state]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }
  return ctx;
};
