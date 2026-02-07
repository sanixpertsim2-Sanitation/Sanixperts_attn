"use client";

import Link from "next/link";

const cards = [
  {
    title: "Cleaning Checklist",
    description: "Pre-clean and post-clean verification for Macy Spiral.",
    href: "/macy/spiral/checklist",
  },
  {
    title: "Damage Report",
    description: "Separate damage entry with camera-only evidence.",
    href: "/macy/production/damage",
  },
];

export default function MacySpiralPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-blue-200">MACY Spiral</h1>
        <p className="text-sm text-slate-400">
          Choose a workflow entry point.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-6 shadow-lg transition hover:-translate-y-1 hover:border-orange-500/70">
              <h2 className="text-lg font-semibold text-slate-100">
                {card.title}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {card.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
