"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CASCADE_STEPS_MINUTES, SIGNAL_META } from "@/lib/constants";
import { buildCascadeStates } from "@/lib/cascade";
import { useSimulation } from "@/components/providers/simulation-provider";
import { Panel } from "@/components/ui/panel";
import { SignalTypeBadge } from "@/components/ui/signal-type-badge";
import { SystemGraph } from "@/components/graphs/system-graph";
import { RippleVisual } from "@/components/graphs/ripple-visual";
import { formatScore } from "@/lib/utils";

export default function CascadePage() {
  const searchParams = useSearchParams();
  const { activeSignals, getSignalById, getRegionInsight } = useSimulation();
  const [stepIndex, setStepIndex] = useState(0);

  const signalId = searchParams.get("signalId");

  const selectedSignal = useMemo(() => {
    if (signalId) {
      return getSignalById(signalId);
    }

    return [...activeSignals].sort((a, b) => b.severity - a.severity)[0];
  }, [signalId, getSignalById, activeSignals]);

  if (!selectedSignal) {
    return (
      <Panel>
        <p className="text-slate-200">No alert is available for spread simulation yet.</p>
      </Panel>
    );
  }

  const region = getRegionInsight(selectedSignal.regionId);
  const cascadeStates = buildCascadeStates(selectedSignal);
  const safeStep = Math.max(0, Math.min(stepIndex, cascadeStates.length - 1));
  const state = cascadeStates[safeStep];

  const impactMap = Object.fromEntries(state.nodes.map((node) => [node.id, node.impact]));
  const rippleIntensity = state.nodes.reduce((sum, node) => sum + node.impact, 0) / state.nodes.length;

  return (
    <div className="space-y-4">
      <Panel className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Alert Spread Simulator</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-100">
              {SIGNAL_META[selectedSignal.type].title}
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Origin zone: {region?.region.name ?? selectedSignal.regionId} • Severity {formatScore(selectedSignal.severity)}
            </p>
          </div>
          <SignalTypeBadge type={selectedSignal.type} />
        </div>

        <div className="grid gap-3 md:grid-cols-[1.1fr_1.6fr]">
          <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
            <h2 className="text-sm font-medium text-slate-100">Threat Ripple Visualization</h2>
            <p className="mt-1 text-xs text-slate-400">
              Ripple expands as danger propagates through connected civilian services.
            </p>
            <div className="mt-3">
              <RippleVisual
                signalType={selectedSignal.type}
                intensity={rippleIntensity}
              />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
            <h2 className="text-sm font-medium text-slate-100">Alert Timeline</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {CASCADE_STEPS_MINUTES.map((minute, index) => {
                const isActive = index === safeStep;
                return (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => setStepIndex(index)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                      isActive
                        ? "border-cyan-200/45 bg-cyan-400/12 text-cyan-100"
                        : "border-white/10 bg-slate-950/60 text-slate-300 hover:border-white/20"
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.1em] text-slate-400">Minute {minute}</p>
                    <p className="mt-1">{minute === 0 ? "Initial alert" : "Spread step"}</p>
                  </button>
                );
              })}
            </div>
            <input
              className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-cyan-400"
              type="range"
              min={0}
              max={cascadeStates.length - 1}
              value={safeStep}
              onChange={(event) => setStepIndex(Number(event.target.value))}
              aria-label="Cascade time step"
            />
          </div>
        </div>
      </Panel>

      <Panel>
        <h2 className="text-base font-semibold text-slate-100">Civilian Service Impact</h2>
        <p className="text-sm text-slate-400">
          Services shift from low to high strain as danger propagates.
        </p>
        <SystemGraph
          nodeImpacts={impactMap}
          highlightedNodes={selectedSignal.systemsAffected}
          height={400}
          animateLinks
        />
      </Panel>

      <Panel>
        <h2 className="text-base font-semibold text-slate-100">Neighboring Zone Escalation</h2>
        <p className="text-sm text-slate-400">Nearby zones receive modeled danger increases from the active step.</p>

        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {state.affectedRegions.map((effect) => {
            const target = getRegionInsight(effect.regionId);
            return (
              <div
                key={effect.regionId}
                className="rounded-lg border border-white/10 bg-slate-900/75 p-3"
              >
                <p className="text-sm font-medium text-slate-100">{target?.region.name ?? effect.regionId}</p>
                <p className="mt-1 text-xs text-slate-300">Added danger {formatScore(effect.addedRisk)}</p>
                {target ? (
                  <p className="mt-1 text-xs text-slate-400">
                    Effective danger {formatScore(Math.min(1, target.riskScore + effect.addedRisk))}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex justify-end">
          <Link
            href={`/signal/${selectedSignal.id}`}
            className="rounded-md border border-white/15 px-3 py-1.5 text-xs text-slate-200 hover:border-cyan-200/40"
          >
            Back to Alert Detail
          </Link>
        </div>
      </Panel>
    </div>
  );
}
