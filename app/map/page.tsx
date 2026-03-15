"use client";

import { useRouter } from "next/navigation";
import { RiskMap } from "@/components/map/risk-map";
import { useSimulation } from "@/components/providers/simulation-provider";
import { ConfidencePill } from "@/components/ui/confidence-pill";
import { Panel } from "@/components/ui/panel";
import { formatScore } from "@/lib/utils";

export default function SignalsMapPage() {
  const router = useRouter();
  const { regionInsights } = useSimulation();

  const top = [...regionInsights].sort((a, b) => b.riskScore - a.riskScore).slice(0, 4);

  return (
    <div className="space-y-4">
      <Panel className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Conflict Heatmap</h2>
            <p className="text-sm text-slate-400">
              Hover for danger and confidence details. Click any zone for focused civilian warning context.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Low
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300" /> Elevated
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> Severe
            </span>
          </div>
        </div>
        <RiskMap
          regions={regionInsights}
          className="h-[520px]"
          onRegionSelect={(regionId) => router.push(`/region/${regionId}`)}
        />
      </Panel>

      <Panel>
        <h3 className="text-base font-semibold text-slate-100">Highest Alert Zones</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {top.map((region) => (
            <button
              key={region.region.id}
              type="button"
              className="rounded-xl border border-white/10 bg-slate-900/75 p-3 text-left hover:border-cyan-200/35"
              onClick={() => router.push(`/region/${region.region.id}`)}
            >
              <p className="text-sm font-medium text-slate-100">{region.region.name}</p>
              <p className="mt-1 text-xs text-slate-300">Danger {formatScore(region.riskScore)}</p>
              <div className="mt-2">
                <ConfidencePill
                  label={region.confidenceLabel}
                  score={region.confidenceScore}
                />
              </div>
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}
