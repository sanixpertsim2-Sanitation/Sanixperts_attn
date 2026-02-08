import ProductionManager from "@/components/Admin/ProductionManager";

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-blue-200">
        SaniXpert Digital Guide
      </h1>
      <p className="text-sm text-slate-400">
        Use this guide for training or quick reference during sanitation
        cycles.
      </p>

      <section className="space-y-3 rounded-2xl border border-slate-700/70 bg-slate-900/60 p-5 text-sm text-slate-200">
        <h2 className="text-lg font-semibold text-slate-100">
          Step 1: Login & Identity (Face ID)
        </h2>
        <ul className="list-disc space-y-1 pl-4 text-slate-300">
          <li>Select MACY Cupcake from the launcher.</li>
          <li>Align your face in the camera prompt.</li>
          <li>New staff are guided through registration.</li>
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-700/70 bg-slate-900/60 p-5 text-sm text-slate-200">
        <h2 className="text-lg font-semibold text-slate-100">
          Step 2: Pre-Cleaning (Bag Count)
        </h2>
        <ul className="list-disc space-y-1 pl-4 text-slate-300">
          <li>Complete the pre-clean checklist.</li>
          <li>Enter the exact number of covering bags used.</li>
          <li>Each checklist response requires a live camera photo.</li>
          <li>Once submitted, the button vanishes to lock the stage.</li>
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-700/70 bg-slate-900/60 p-5 text-sm text-slate-200">
        <h2 className="text-lg font-semibold text-slate-100">
          Step 3: Damage Reporting (Anytime)
        </h2>
        <ul className="list-disc space-y-1 pl-4 text-slate-300">
          <li>Use the red Damage Report gate at any time.</li>
          <li>High severity triggers a red dashboard alert and email.</li>
          <li>Every report requires a timestamped camera photo.</li>
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-700/70 bg-slate-900/60 p-5 text-sm text-slate-200">
        <h2 className="text-lg font-semibold text-slate-100">
          Step 4: Post-Cleaning (Verification)
        </h2>
        <ul className="list-disc space-y-1 pl-4 text-slate-300">
          <li>Enter the number of bags retrieved.</li>
          <li>The count must match the Pre-Clean bag count.</li>
          <li>Mismatches are blocked until corrected.</li>
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-700/70 bg-slate-900/60 p-5 text-sm text-slate-200">
        <h2 className="text-lg font-semibold text-slate-100">
          Step 5: Handover & Lead Sign-Off
        </h2>
        <ul className="list-disc space-y-1 pl-4 text-slate-300">
          <li>Each handover task requires a camera photo.</li>
          <li>Area Lead must verify via Face ID.</li>
          <li>Lead signature releases the line.</li>
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 text-sm text-amber-100">
        <h2 className="text-lg font-semibold text-amber-200">
          Production Management (PIN 2451)
        </h2>
        <ul className="list-disc space-y-1 pl-4">
          <li>Access reset/unlock controls for stages</li>
          <li>Create announcements for production lines</li>
          <li>Monitor stage locking and system status</li>
          <li>Complete system reset for shift changes</li>
        </ul>
      </section>

      {/* Production Manager Controls */}
      <ProductionManager />
    </div>
  );
}
