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
  const handleClearCache = async () => {
    if (typeof window === "undefined") return;
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
    } catch (error) {
      // Best-effort cleanup; still force a reload below.
    }
    const url = new URL(window.location.href);
    url.searchParams.set("refresh", Date.now().toString());
    window.location.replace(url.toString());
  };

  return (
    <div className="min-h-screen text-slate-100">
      <SplashScreen />
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="Go to launcher" className="flex items-center rounded-xl px-2 py-2">
              <Image
                src="/assets/give-go-logo%20%26%20sanixpert-logo.png"
                alt="Give & Go and Sanixpert logos"
                width={650}
                height={120}
                priority
                className="h-20 w-auto object-contain mix-blend-screen brightness-125 md:h-24"
              />
            </Link>
            <div className="page-title hidden text-xs font-semibold uppercase tracking-[0.3em] text-amber-400 md:block">
              Sanitation Digital Operations
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
            <button
              type="button"
              onClick={handleClearCache}
              className="rounded-full border border-slate-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-orange-400 hover:text-orange-300"
              title="Clear cache and refresh"
            >
              Clear Cache
            </button>
          </div>
        </div>
      </header>

      <main className="app-shell mx-auto w-full max-w-6xl px-6 py-10">
        {children}
      </main>

      <footer className="border-t border-slate-800/70 py-6 text-center text-xs text-slate-400">
        Sanixpert Digital Sanitation Checklist • Give & Go Facility
      </footer>
    </div>
  );
}
