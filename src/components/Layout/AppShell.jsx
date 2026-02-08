"use client";

import { useEffect, useState } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 md:gap-6 md:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="Go to launcher">
              <BrandMark />
            </Link>
            <div className="page-title hidden text-xs font-semibold uppercase tracking-[0.3em] text-amber-400 md:block">
              Digital Sanitation Checklist
            </div>
          </div>

          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-3 text-sm font-semibold text-slate-300 md:flex">
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
              onClick={async () => {
                await handleClearCache();
              }}
              className="hidden rounded-full border border-slate-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-orange-400 hover:text-orange-300 md:inline-flex"
              title="Clear cache and refresh"
            >
              Clear Cache
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-orange-400 hover:text-orange-300 md:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              {mobileOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        <div
          id="mobile-nav"
          className={`mobile-nav md:hidden ${mobileOpen ? "is-open" : ""}`}
          aria-hidden={!mobileOpen}
        >
          <nav className="flex flex-col gap-2 text-sm font-semibold text-slate-200">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-4 py-3 transition ${
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
            onClick={async () => {
              await handleClearCache();
            }}
            className="mt-4 w-full rounded-xl border border-slate-700 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-orange-400 hover:text-orange-300"
            title="Clear cache and refresh"
          >
            Clear Cache
          </button>
        </div>
      </header>

      <main className="app-shell mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-10">
        {children}
      </main>

      <footer className="border-t border-slate-800/70 py-6 text-center text-xs text-slate-400">
        Sanixpert Digital Sanitation Checklist • Give & Go Facility
      </footer>
    </div>
  );
}
