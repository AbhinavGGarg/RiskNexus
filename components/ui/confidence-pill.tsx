import { ConfidenceLabel } from "@/lib/types";
import { formatPercent } from "@/lib/utils";

export function ConfidencePill({
  label,
  score,
}: {
  label: ConfidenceLabel;
  score: number;
}) {
  const tone =
    label === "High"
      ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-100"
      : label === "Medium"
        ? "border-amber-300/50 bg-amber-400/15 text-amber-100"
        : "border-rose-300/50 bg-rose-400/15 text-rose-100";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs ${tone}`}>
      Confidence {label}
      <span className="font-semibold">{formatPercent(score)}</span>
    </span>
  );
}
