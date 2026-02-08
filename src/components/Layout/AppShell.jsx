"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SplashScreen from "./SplashScreen";
import BrandMark from "./BrandMark";
import ProductionManager from "../Admin/ProductionManager";

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
      
      {/* Mobile-first header: max 64px height, clean layout */}
      <header className="app-header sticky top-0 z-50 border-b border-slate-700/50 bg-slate-950/95 backdrop-blur-sm">
        <div className="header-content mx-auto w-full max-w-6xl">
          
          {/* Left: Logo - responsive variants */}
          <div className="flex items-center">
            <Link href="/" aria-label="Go to launcher" className="flex items-center">
              {/* Mobile: icon only */}
              <div className="lg:hidden">
                <BrandMark variant="mobile" />
              </div>
              {/* Desktop: full brand lockup */}
              <div className="hidden lg:block">
                <BrandMark variant="desktop" />
              </div>
            </Link>
          </div>

          {/* Right: Navigation - mobile menu button, desktop nav */}
          <div className="flex items-center gap-3">
            
            {/* Desktop navigation - hidden on mobile */}
            <nav className="hidden items-center gap-2 lg:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-orange-500/90 text-white"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Desktop clear cache */}
              <button
                type="button"
                onClick={async () => {
                  await handleClearCache();
                }}
                className="ml-2 rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-orange-400/60 hover:text-orange-200"
                title="Clear cache and refresh"
              >
                Clear Cache
              </button>
            </nav>

            {/* Mobile menu button - simplified */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="mobile-touch-target rounded-md border border-slate-600/60 text-slate-200 transition-colors hover:border-orange-400/60 hover:text-orange-200 lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                  <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                  <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation dropdown - clean and efficient */}
        {mobileOpen && (
          <div
            id="mobile-nav"
            className="mobile-nav-dropdown px-4 py-3 lg:hidden"
          >
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-orange-500/90 text-white"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            
            {/* Admin and utility controls */}
            <div className="mt-3 border-t border-slate-700/30 pt-3 space-y-2">
              <button
                type="button"
                onClick={async () => {
                  await handleClearCache();
                  setMobileOpen(false);
                }}
                className="w-full rounded-md border border-slate-600/60 py-2.5 text-xs font-medium text-slate-300 transition-colors hover:border-orange-400/60 hover:text-orange-200"
                title="Clear cache and refresh"
              >
                🔄 Clear Cache & Refresh
              </button>
              
              <div className="pt-2">
                <ProductionManager />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content - mobile-optimized spacing */}
      <main className="mx-auto w-full max-w-6xl px-4 py-4 lg:px-6 lg:py-8">
        {children}
      </main>

      {/* Footer - simplified */}
      <footer className="border-t border-slate-700/30 px-4 py-6 text-center text-xs text-slate-500 lg:px-6">
        Sanixpert Digital Operations • Give &amp; Go Facility
      </footer>
    </div>
  );
}