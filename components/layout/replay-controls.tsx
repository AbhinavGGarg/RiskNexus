"use client";

import { useSimulation } from "@/components/providers/simulation-provider";

export function ReplayControls() {
  const {
    replayMode,
    setReplayMode,
    replayIndex,
    setReplayIndex,
    activeFrameIndex,
    timeline,
    activeTimestamp,
  } = useSimulation();

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/65 px-3 py-2">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setReplayMode(!replayMode)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
            replayMode
              ? "bg-cyan-400/20 text-cyan-100"
              : "bg-slate-800 text-slate-200 hover:bg-slate-700"
          }`}
        >
          {replayMode ? "Replay Mode On" : "Live Mode"}
        </button>
        <p className="text-xs text-slate-300">
          Frame {activeFrameIndex + 1}/{timeline.length}
        </p>
        <p className="text-xs text-slate-400">
          {new Date(activeTimestamp).toLocaleString([], {
            hour: "2-digit",
            minute: "2-digit",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
      {replayMode ? (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={Math.max(0, timeline.length - 1)}
            value={Math.min(replayIndex, timeline.length - 1)}
            onChange={(event) => setReplayIndex(Number(event.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-cyan-400"
            aria-label="Event replay timeline"
          />
        </div>
      ) : null}
    </div>
  );
}
