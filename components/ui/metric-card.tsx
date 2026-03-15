import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  delta,
  accent,
  icon,
}: {
  label: string;
  value: string;
  delta?: string;
  accent?: "teal" | "amber" | "red" | "violet";
  icon?: ReactNode;
}) {
  const accentClass =
    accent === "red"
      ? "from-red-400/20"
      : accent === "amber"
        ? "from-amber-300/20"
        : accent === "violet"
          ? "from-violet-400/20"
          : "from-cyan-300/20";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/70 p-4",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:to-transparent",
        accentClass,
      )}
    >
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{value}</p>
          {delta ? <p className="mt-1 text-xs text-slate-300">{delta}</p> : null}
        </div>
        {icon ? <div className="text-slate-300">{icon}</div> : null}
      </div>
    </div>
  );
}
