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
  stageCompletedBy: {
    preClean: null,
    postClean: null,
    handover: null,
    lead: null,
  },
  stageLockedBy: {
    preClean: null,
    postClean: null,
    handover: null,
    lead: null,
  },
  leadChecklist: [],
  verificationData: {
    preClean: {},
    postClean: {},
  },
  announcements: [],
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
      text: "Cover motors, sensors, air regulators, and electric panels.",
      status: "pending",
    },
    {
      id: "task-2",
      text: "Batter depositor frame is clean.",
      status: "pending",
    },
    {
      id: "task-3",
      text: "Mixers are clean.",
      status: "pending",
    },
    {
      id: "task-4",
      text: "Conveyors are cleaned and air dried (top and underneath).",
      status: "pending",
    },
    {
      id: "task-5",
      text: "Up tower is clean and guards are fixed.",
      status: "pending",
    },
    {
      id: "task-6",
      text: "Batter pump (A) and (B) are clean and fixed.",
      status: "pending",
    },
    {
      id: "task-7",
      text: "Transfer pipes (A) and (B) side pipe are clean and fixed.",
      status: "pending",
    },
    {
      id: "task-8",
      text: "Rubber pipes (A) and (B) pipe are clean and fixed.",
      status: "pending",
    },
    {
      id: "task-9",
      text: "Filters (A) and (B) side filter are clean and fixed.",
      status: "pending",
    },
    {
      id: "task-10",
      text: "Divider: both sides installed correctly.",
      status: "pending",
    },
    {
      id: "task-11",
      text: "Hopper: inside/outside, underneath gasket and die secure and clean.",
      status: "pending",
    },
    {
      id: "task-12",
      text: "Stirrer is clean.",
      status: "pending",
    },
    {
      id: "task-13",
      text: "Rotary valves are in position and die is fixed.",
      status: "pending",
    },
    {
      id: "task-14",
      text: "Depositor plate and gasket: plate and holes are clean.",
      status: "pending",
    },
    {
      id: "task-15",
      text: "Egg cooler: egg wash done and egg room clean and sanitized.",
      status: "pending",
    },
    {
      id: "task-16",
      text: "Floor is clean and dry.",
      status: "pending",
    },
    {
      id: "task-17",
      text: "No sanitation equipment is on the floor.",
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

  const completePreClean = ({ bagsCovered, name, lineName = "MACY Production" }) => {
    const now = new Date().toISOString();
    if (supabase) {
      supabase.from("pre_cleaning_logs").insert([
        {
          line_name: lineName,
          employee_name: name,
          bags_covered: Number(bagsCovered || 0),
          checklist: { bagsCovered, submittedBy: name },
          submitted_at: now,
        },
      ]);
      supabase.from("line_status").upsert([
        {
          line_name: lineName,
          status: "Pre-clean complete",
          updated_by: name,
          updated_at: now,
        },
      ]);
    }
    logEvent("pre_clean_submitted", {
      lineName,
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

  const completePostClean = ({ bagsRetrieved, name, lineName = "MACY Production" }) => {
    const now = new Date().toISOString();
    if (supabase) {
      supabase.from("post_cleaning_logs").insert([
        {
          line_name: lineName,
          employee_name: name,
          bags_retrieved: Number(bagsRetrieved || 0),
          photo_data: "",
          handover_required: Boolean(state.handoverRequired),
          submitted_at: now,
        },
      ]);
      supabase.from("line_status").upsert([
        {
          line_name: lineName,
          status: "Post-clean complete",
          updated_by: name,
          updated_at: now,
        },
      ]);
    }
    logEvent("post_clean_submitted", {
      lineName,
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

  const completeHandover = ({ name, lineName = "MACY Production" }) => {
    const now = new Date().toISOString();
    if (supabase) {
      supabase.from("handover_logs").insert([
        {
          line_name: lineName,
          employee_name: name,
          reason: "",
          notes: { submittedBy: name },
          submitted_at: now,
        },
      ]);
      supabase.from("line_status").upsert([
        {
          line_name: lineName,
          status: "Handover complete",
          updated_by: name,
          updated_at: now,
        },
      ]);
    }
    logEvent("handover_submitted", {
      lineName,
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

  const completeLeadSignoff = ({
    name,
    signature,
    lineName = "MACY Production",
  }) => {
    const now = new Date().toISOString();
    if (supabase) {
      supabase.from("area_verification_logs").insert([
        {
          line_name: lineName,
          lead_name: name,
          checklist: state.leadChecklist,
          signature_data: signature,
          submitted_at: now,
        },
      ]);
      supabase.from("line_status").upsert([
        {
          line_name: lineName,
          status: "Line released for production",
          updated_by: name,
          updated_at: now,
        },
      ]);
    }
    logEvent("lead_released", {
      lineName,
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
