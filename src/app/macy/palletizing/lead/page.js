"use client";

import { useEffect, useState } from "react";
import AreaLeadSignOff from "@/components/Workflows/AreaLeadSignOff";
import LeadVerificationChecklist from "@/components/Workflows/LeadVerificationChecklist";
import DamageAcknowledgement from "@/components/Workflows/DamageAcknowledgement";

export default function PalletizingLeadVerificationPage() {
  const [leadChecklistDone, setLeadChecklistDone] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-indigo-200">
        MACY Palletizing - Area Verification
      </h1>

      <DamageAcknowledgement lineName="MACY Palletizing" />

      {!leadChecklistDone && (
        <LeadVerificationChecklist
          onComplete={() => setLeadChecklistDone(true)}
        />
      )}

      {leadChecklistDone && <AreaLeadSignOff lineName="MACY Palletizing" />}
    </div>
  );
}