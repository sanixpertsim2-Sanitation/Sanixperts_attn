"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SplashScreen from "./SplashScreen";
import BrandMark from "./BrandMark";

const navLinks = [
  { href: "/", label: "Launcher" },
  { href: "/macy/lines", label: "Lines" },
  { href: "/cleaning-log", label: "Cleaning Log" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/help", label: "Help" },
];

export default function AppShell({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Silent fail keeps UI responsive even if SW fails.
      });
    }
  }, []);
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
    <div className="min-h-[100dvh] text-slate-100">
      <SplashScreen />
      <div className="app-shell">
        <aside className="app-sidebar">
          <div className="sidebar-brand">
            <Link href="/" aria-label="Go to launcher">
              <BrandMark />
            </Link>
          </div>
          <nav className="sidebar-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link ${
                  pathname === link.href ? "is-active" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={async () => {
                await handleClearCache();
              }}
              className="sidebar-link sidebar-action"
              title="Clear cache and refresh"
            >
              Clear Cache
            </button>
          </nav>
        </aside>

        <div className="app-main">
          <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 md:gap-6 md:px-6">
              <div className="flex items-center gap-4">
                <Link href="/" aria-label="Go to launcher" className="md:hidden">
                  <BrandMark />
                </Link>
                <div className="page-title hidden text-xs font-semibold uppercase tracking-[0.3em] text-amber-400 md:block">
                  Digital Sanitation Checklist
                </div>
              </div>
            </div>
          </header>

          <main className="app-main-content mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-10">
            {children}
          </main>

          <footer className="border-t border-slate-800/70 py-6 text-center text-xs text-slate-400">
            Sanixpert Digital Sanitation Checklist • Give & Go Facility
          </footer>
        </div>

      </div>
    </div>
  );
}
