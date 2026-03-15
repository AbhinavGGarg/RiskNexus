import { SIGNAL_META } from "@/lib/constants";
import { SignalType } from "@/lib/types";

export function RippleVisual({
  signalType,
  intensity,
}: {
  signalType: SignalType;
  intensity: number;
}) {
  const color = SIGNAL_META[signalType].color;

  return (
    <div className="relative mx-auto flex h-56 w-56 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-950/70">
      <div
        className="absolute h-6 w-6 rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 35px ${color}` }}
      />
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="absolute rounded-full border ripple-ring"
          style={{
            borderColor: `${color}88`,
            animationDelay: `${index * 0.6}s`,
            opacity: 0.45 + intensity * 0.35,
          }}
        />
      ))}
    </div>
  );
}
