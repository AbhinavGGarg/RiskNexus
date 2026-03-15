import { SIGNAL_META } from "@/lib/constants";
import { SignalType } from "@/lib/types";

export function SignalTypeBadge({ type }: { type: SignalType }) {
  const meta = SIGNAL_META[type];

  return (
    <span
      className="rounded-full border px-2.5 py-1 text-xs"
      style={{
        borderColor: `${meta.color}66`,
        backgroundColor: `${meta.color}22`,
        color: "#e2e8f0",
      }}
    >
      {meta.title}
    </span>
  );
}
