"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { ReplayControls } from "@/components/layout/replay-controls";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Overview", href: "/" },
  { label: "Conflict Map", href: "/map" },
  { label: "Alert Spread", href: "/cascade" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04070f] text-slate-100">
      <div className="pointer-events-none absolute -left-44 top-[-220px] h-[520px] w-[520px] rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-200px] right-[-120px] h-[440px] w-[440px] rounded-full bg-rose-400/10 blur-3xl" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-slate-950/80 px-5 py-6 md:block">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">RiskNexus</p>
            <h1 className="mt-2 text-xl font-semibold text-slate-100">Civilian Conflict Early Warning</h1>
          </div>
          <nav className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-lg border px-3 py-2 text-sm transition",
                    isActive
                      ? "border-cyan-200/40 bg-cyan-400/10 text-cyan-100"
                      : "border-transparent text-slate-300 hover:border-white/15 hover:bg-white/5",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <p className="mt-8 text-xs leading-5 text-slate-400">
            Real-time heatmap monitoring that helps civilians and responders see danger
            building before it reaches them.
          </p>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-white/10 bg-[#050915]/85 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Layered Exploration</p>
                <p className="text-sm text-slate-200">Track conflict alerts from global overview to local warning details.</p>
              </div>
              <ReplayControls />
            </div>
            <nav className="mt-3 flex gap-2 md:hidden">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-md px-2.5 py-1.5 text-xs",
                      isActive ? "bg-cyan-400/20 text-cyan-100" : "bg-slate-800 text-slate-300",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>

          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
