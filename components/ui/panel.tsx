import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-white/10 bg-slate-950/65 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur",
        className,
      )}
    >
      {children}
    </section>
  );
}
