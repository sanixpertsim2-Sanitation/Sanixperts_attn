"use client";

import { AppProvider } from "@/context/AppContext";
import AppShell from "@/components/Layout/AppShell";

export default function Providers({ children }) {
  return (
    <AppProvider>
      <AppShell>{children}</AppShell>
    </AppProvider>
  );
}
