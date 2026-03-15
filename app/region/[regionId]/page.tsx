"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSimulation } from "@/components/providers/simulation-provider";
import { ConfidencePill } from "@/components/ui/confidence-pill";
import { Panel } from "@/components/ui/panel";
import { SignalTypeBadge } from "@/components/ui/signal-type-badge";
import { formatScore } from "@/lib/utils";

export default function RegionDetailPage() {
  const params = useParams<{ regionId: string }>();
  const regionId = Array.isArray(params.regionId) ? params.regionId[0] : params.regionId;

  const { getRegionInsight, getRegionSignals } = useSimulation();

  const insight = getRegionInsight(regionId);
  const signals = getRegionSignals(regionId).slice(0, 8);

  if (!insight) {
    return (
      <Panel>
        <p className="text-slate-200">Region not found.</p>
      </Panel>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Panel className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Region Details</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-100">{insight.region.name}</h1>
            <p className="mt-1 text-sm text-slate-400">Focused view of current risk drivers.</p>
          </div>
          <Link
            href="/map"
            className="rounded-md border border-white/15 px-3 py-1.5 text-xs text-slate-200 hover:border-cyan-200/40"
          >
            Back to Signals Map
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Risk Score</p>
            <p className="mt-2 text-3xl font-semibold text-rose-200">{formatScore(insight.riskScore)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Confidence</p>
            <div className="mt-2">
              <ConfidencePill
                label={insight.confidenceLabel}
                score={insight.confidenceScore}
              />
            </div>
            <p className="mt-3 text-sm text-slate-300">{insight.confidenceExplanation}</p>
          </div>
        </div>
      </Panel>

      <Panel>
        <h2 className="text-base font-semibold text-slate-100">Key Signals Affecting This Region</h2>
        <p className="mt-1 text-sm text-slate-400">
          Select a signal card to inspect causes, dependencies, and potential cascade impact.
        </p>

        <div className="mt-4 grid gap-3">
          {signals.length ? (
            signals.map((signal) => (
              <Link
                key={signal.id}
                href={`/signal/${signal.id}`}
                className="rounded-xl border border-white/10 bg-slate-900/70 p-4 transition hover:border-cyan-200/35"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <SignalTypeBadge type={signal.type} />
                  <p className="text-sm text-slate-300">Severity {formatScore(signal.severity)}</p>
                </div>
                <p className="mt-3 text-sm text-slate-200">{signal.description}</p>
              </Link>
            ))
          ) : (
            <p className="rounded-xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
              No active signals in the current replay window.
            </p>
          )}
        </div>
      </Panel>
    </div>
  );
}
