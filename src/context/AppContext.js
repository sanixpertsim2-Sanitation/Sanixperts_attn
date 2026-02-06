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
  leadChecklist: [],
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
    const loadHandoverTasks = async () => {
      const { data, error } = await supabase
        .from("handover_tasks")
        .select("*")
        .eq("line_name", "MACY Production")
        .order("created_at", { ascending: true });
      if (error || !data) return;
      setState((prev) => ({
        ...prev,
        handoverTasks: data.map((task) => ({
          id: task.id,
          text: task.task_text,
          response: task.response,
          description: task.description,
          photo: task.photo_data
            ? { dataUrl: task.photo_data, timestamp: task.created_at }
            : null,
          status: task.status,
          createdAt: task.created_at,
        })),
      }));
    };
    const loadLineStatus = async () => {
      const { data, error } = await supabase
        .from("line_status")
        .select("*")
        .eq("line_name", "MACY Production")
        .order("updated_at", { ascending: false })
        .limit(1);
      if (error || !data?.[0]) return;
      setState((prev) => ({
        ...prev,
        lineStatus: {
          ...prev.lineStatus,
          macy: {
            stage: data[0].status,
            submittedBy: data[0].updated_by || "-",
            timestamp: data[0].updated_at,
          },
        },
      }));
    };
    loadDamageReports();
    loadHandoverTasks();
    loadLineStatus();
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
    if (supabase) {
      supabase.from("pre_cleaning_logs").insert([
        {
          line_name: "MACY Production",
          employee_name: name,
          bags_covered: Number(bagsCovered || 0),
          checklist: { bagsCovered, submittedBy: name },
          submitted_at: now,
        },
      ]);
      supabase.from("line_status").upsert([
        {
          line_name: "MACY Production",
          status: "Pre-clean complete",
          updated_by: name,
          updated_at: now,
        },
      ]);
    }
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
    if (supabase) {
      supabase.from("post_cleaning_logs").insert([
        {
          line_name: "MACY Production",
          employee_name: name,
          bags_retrieved: Number(bagsRetrieved || 0),
          photo_data: "",
          handover_required: Boolean(state.handoverRequired),
          submitted_at: now,
        },
      ]);
      supabase.from("line_status").upsert([
        {
          line_name: "MACY Production",
          status: "Post-clean complete",
          updated_by: name,
          updated_at: now,
        },
      ]);
    }
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

  const updateHandoverTasks = (tasks, persist = false) => {
    if (supabase && persist) {
      supabase
        .from("handover_tasks")
        .delete()
        .eq("line_name", "MACY Production")
        .then(() =>
          supabase.from("handover_tasks").insert(
            tasks.map((task) => ({
              line_name: "MACY Production",
              task_text: task.text,
              response: task.response || null,
              description: task.description || null,
              photo_data: task.photo?.dataUrl || null,
              status: task.status || "pending",
              created_at: new Date().toISOString(),
            }))
          )
        );
    }
    setState((prev) => ({ ...prev, handoverTasks: tasks }));
  };

  const completeHandover = ({ name }) => {
    const now = new Date().toISOString();
    if (supabase) {
      supabase.from("handover_logs").insert([
        {
          line_name: "MACY Production",
          employee_name: name,
          reason: "",
          notes: { submittedBy: name },
          submitted_at: now,
        },
      ]);
      supabase.from("line_status").upsert([
        {
          line_name: "MACY Production",
          status: "Handover complete",
          updated_by: name,
          updated_at: now,
        },
      ]);
    }
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
    if (supabase) {
      supabase.from("area_verification_logs").insert([
        {
          line_name: "MACY Production",
          lead_name: name,
          checklist: state.leadChecklist,
          signature_data: signature,
          submitted_at: now,
        },
      ]);
      supabase.from("line_status").upsert([
        {
          line_name: "MACY Production",
          status: "Line released for production",
          updated_by: name,
          updated_at: now,
        },
      ]);
    }
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

  const setLeadChecklist = (items) => {
    setState((prev) => ({ ...prev, leadChecklist: items }));
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
      setLeadChecklist,
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
