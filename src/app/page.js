import Image from "next/image";
import Link from "next/link";

const cards = [
  {
    id: "macy",
    title: "MACY",
    subtitle: "Cupcake Line",
    image: "/assets/macy.jpg",
    active: true,
    href: "/macy/lines",
  },
  {
    id: "jfk",
    title: "JFK",
    subtitle: "Doughnut Line",
    image: "/assets/jfk.jpg",
    active: false,
  },
  {
    id: "cece",
    title: "CECE",
    subtitle: "Cookie Line",
    image: "/assets/cece.jpg",
    active: false,
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-blue-200">
          Sanixpert Digital Sanitation Checklist
        </h1>
        <p className="text-sm text-slate-400">
          Select a production line to begin. Only MACY is currently active.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => {
          const content = (
            <div className="relative overflow-hidden rounded-3xl border border-slate-700/70 bg-slate-900/60 shadow-lg transition hover:-translate-y-1 hover:border-orange-500/70">
              <Image
                src={card.image}
                alt={card.title}
                width={400}
                height={260}
                className={`h-48 w-full object-cover ${
                  card.active ? "" : "grayscale"
                }`}
              />
              {!card.active && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70">
                  <span className="rounded-full border border-slate-400 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                    Coming Soon
                  </span>
                </div>
              )}
              <div className="p-5">
                <p className="text-xl font-semibold text-slate-100">
                  {card.title}
                </p>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {card.subtitle}
                </p>
              </div>
            </div>
          );

          if (!card.active) return <div key={card.id}>{content}</div>;

          return (
            <Link key={card.id} href={card.href}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
