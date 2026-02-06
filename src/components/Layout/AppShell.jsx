"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LiveDateTime from "./LiveDateTime";
import SplashScreen from "./SplashScreen";

const navLinks = [
  { href: "/", label: "Launcher" },
  { href: "/macy/lines", label: "Lines" },
  { href: "/cleaning-log", label: "Cleaning Log" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/help", label: "Help" },
];

export default function AppShell({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen text-slate-100">
      <SplashScreen />
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-xl px-3 py-2">
              <Image
                src="/assets/give-go-logo%20%26%20sanixpert-logo.png"
                alt="Give & Go and Sanixpert logos"
                width={260}
                height={48}
                priority
                className="h-10 w-auto object-contain drop-shadow-md"
              />
            </div>
            <div className="hidden text-xs font-semibold uppercase tracking-[0.3em] text-amber-400 md:block">
              Sanitation Digital Checklist
            </div>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <nav className="flex items-center gap-3 text-sm font-semibold text-slate-300">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 transition ${
                  pathname === link.href
                    ? "bg-orange-500 text-white"
                    : "hover:bg-slate-800/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>

      <footer className="border-t border-slate-800/70 py-6 text-center text-xs text-slate-400">
        Sanixpert Digital Sanitation Checklist • Give & Go Facility
      </footer>
    </div>
  );
}
