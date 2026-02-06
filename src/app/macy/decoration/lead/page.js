"use client";

import { useEffect, useState } from "react";
import AreaLeadSignOff from "@/components/Workflows/AreaLeadSignOff";
import LeadVerificationChecklist from "@/components/Workflows/LeadVerificationChecklist";
import DamageAcknowledgement from "@/components/Workflows/DamageAcknowledgement";

const leadQuestions = [
  "Cover motors, sensors, air regulators, and electric panels.",
  "No. of equipment covered recorded. No. of bag retrieved recorded.",
  "Depositor Side A and B CIP is done and depositor is clean.",
  "Injection unit frame is clean.",
  "Icing hopper topper and icing pump are clean and assembled.",
  "Manifold A and B are clean and blue pipes are attached to the Depositor side A and B.",
  "Tray denester is clean and stand is fixed.",
  "Sprinkle depositor conveyor is clean and air dried. Sprinkle die is inserted.",
  "Tray puller extractor is clean.",
  "Filling belt conveyor and rollers are clean and belt is air dried.",
  "Lid denester is clean and air dried.",
  "No water on lid denester platform.",
  "Tray closer rollers and belts are clean and air dried.",
  "Clamshell conveyor is clean and air dried.",
  "Floor is clean and dry.",
  "No sanitation equipment is on the floor.",
  "Strainer and drains are clean.",
];

export default function DecorationLeadVerificationPage() {
  const [leadChecklistDone, setLeadChecklistDone] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-indigo-200">
        MACY Decoration Area Verification
      </h1>

      <DamageAcknowledgement lineName="MACY Decoration" />

      {!leadChecklistDone && (
        <LeadVerificationChecklist
          tasks={leadQuestions}
          onComplete={() => setLeadChecklistDone(true)}
        />
      )}

      {leadChecklistDone && <AreaLeadSignOff lineName="MACY Decoration" />}
    </div>
  );
}
