import DamageReport from "@/components/Workflows/DamageReport";

export default function MacyDamagePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-red-200">
        MACY Damage Reporting
      </h1>
      <DamageReport lineName="MACY Production" />
    </div>
  );
}
