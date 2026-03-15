"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { SIGNAL_META } from "@/lib/constants";
import { useSimulation } from "@/components/providers/simulation-provider";
import { Panel } from "@/components/ui/panel";
import { SignalTypeBadge } from "@/components/ui/signal-type-badge";
import { SdgTagPill } from "@/components/ui/sdg-tag";
import { SystemGraph } from "@/components/graphs/system-graph";
import { formatScore } from "@/lib/utils";
import { SystemId } from "@/lib/types";

export default function SignalDetailPage() {
  const params = useParams<{ signalId: string }>();
  const signalId = Array.isArray(params.signalId) ? params.signalId[0] : params.signalId;

  const { getSignalById, getRegionInsight } = useSimulation();
  const signal = getSignalById(signalId);

  if (!signal) {
    return (
      <Panel>
        <p className="text-slate-200">Alert not found in the active warning timeline.</p>
      </Panel>
    );
  }

  const region = getRegionInsight(signal.regionId);
  const meta = SIGNAL_META[signal.type];

  const nodeImpacts: Partial<Record<SystemId, number>> = {};
  signal.systemsAffected.forEach((system) => {
    nodeImpacts[system] = signal.severity;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <Panel className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Alert Detail</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-100">{meta.title}</h1>
            <p className="mt-2 text-sm text-slate-300">{signal.description}</p>
          </div>
          <SignalTypeBadge type={signal.type} />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-400">Region</p>
            <p className="mt-2 text-sm text-slate-100">{region?.region.name ?? signal.regionId}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-400">Alert Severity</p>
            <p className="mt-2 text-sm text-rose-200">{formatScore(signal.severity)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3">
            <p className="text-xs uppercase tracking-[0.1em] text-slate-400">Timestamp</p>
            <p className="mt-2 text-sm text-slate-200">
              {new Date(signal.timestamp).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </Panel>

      <Panel>
        <h2 className="text-base font-semibold text-slate-100">What Civilians Should Know</h2>
        <p className="mt-2 text-sm text-slate-300">{signal.whyItMatters}</p>

        <h3 className="mt-4 text-sm font-medium text-slate-200">Likely Triggers</h3>
        <ul className="mt-2 space-y-2 text-sm text-slate-300">
          {signal.possibleCauses.map((cause) => (
            <li
              key={cause}
              className="rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2"
            >
              {cause}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-slate-100">SDG Impact Tags</h2>
          {signal.sdgTags.map((tag) => (
            <SdgTagPill
              key={`${signal.id}-${tag.id}`}
              tag={tag}
            />
          ))}
        </div>

        <h3 className="mt-4 text-sm font-medium text-slate-200">Likely Impact Pathway</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          {signal.impactPathway.map((step, index) => (
            <div
              key={`${step}-${index}`}
              className="inline-flex items-center gap-2"
            >
              <span className="rounded-md border border-white/10 bg-slate-900/70 px-2.5 py-1 text-slate-200">
                {step}
              </span>
              {index < signal.impactPathway.length - 1 ? <span className="text-slate-500">→</span> : null}
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Civilian Service Dependency Graph</h2>
            <p className="text-sm text-slate-400">
              Highlighted services are directly affected by this alert.
            </p>
          </div>
        </div>
        <SystemGraph
          nodeImpacts={nodeImpacts}
          highlightedNodes={signal.systemsAffected}
          height={340}
        />
      </Panel>

      <div className="flex justify-end">
        <Link
          href={`/cascade?signalId=${signal.id}`}
          className="rounded-md border border-cyan-200/50 bg-cyan-400/15 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-300/20"
        >
          Simulate Alert Spread
        </Link>
      </div>
    </div>
  );
}
