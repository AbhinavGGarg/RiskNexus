"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Panel } from "@/components/ui/panel";
import { MetricCard } from "@/components/ui/metric-card";
import { ActivityFeed } from "@/components/ui/activity-feed";
import { useSimulation } from "@/components/providers/simulation-provider";
import { RiskMap } from "@/components/map/risk-map";
import { ConfidencePill } from "@/components/ui/confidence-pill";
import { formatScore } from "@/lib/utils";

const RiskTrendChart = dynamic(
  () => import("@/components/charts/risk-trend-chart").then((mod) => mod.RiskTrendChart),
  {
    ssr: false,
    loading: () => <div className="h-60 w-full rounded-xl bg-slate-900/50" />,
  },
);

export default function OverviewPage() {
  const router = useRouter();
  const {
    activeSignals,
    regionInsights,
    activityFeed,
    trendSeries,
    systemsMonitored,
    activeTimestamp,
  } = useSimulation();

  const highRiskRegions = regionInsights.filter((region) => region.riskScore >= 0.66);
  const avgRisk =
    regionInsights.reduce((sum, region) => sum + region.riskScore, 0) / regionInsights.length;

  const topRegions = [...regionInsights]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <section className="grid gap-3 md:grid-cols-3">
        <MetricCard
          label="Active Signals"
          value={String(activeSignals.length)}
          delta="Signals observed in latest replay window"
          accent="teal"
        />
        <MetricCard
          label="High Risk Regions"
          value={String(highRiskRegions.length)}
          delta="Regions with risk score above 0.66"
          accent="red"
        />
        <MetricCard
          label="Systems Monitored"
          value={String(systemsMonitored)}
          delta="Cross-system dependencies currently modeled"
          accent="amber"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Panel className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Global Risk Overview</h2>
              <p className="text-sm text-slate-400">
                Heat signatures, confidence glow, and regional risk concentration.
              </p>
            </div>
            <Link
              href="/map"
              className="rounded-md border border-white/15 px-3 py-1.5 text-xs text-slate-200 hover:border-cyan-200/40"
            >
              Open Signals Map
            </Link>
          </div>
          <RiskMap
            regions={regionInsights}
            className="h-[360px]"
            onRegionSelect={(regionId) => router.push(`/region/${regionId}`)}
          />
        </Panel>

        <Panel>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Activity Feed</h2>
            <p className="text-xs text-slate-400">
              {new Date(activeTimestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <ActivityFeed
            items={activityFeed}
            activeTimestamp={activeTimestamp}
          />
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Panel>
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-slate-100">Event Replay Trend</h2>
            <p className="text-sm text-slate-400">
              Observe how aggregate risk and confidence changed across the replay timeline.
            </p>
          </div>
          <RiskTrendChart data={trendSeries} />
        </Panel>

        <Panel>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Priority Regions</h2>
            <span className="text-xs text-slate-400">Global Avg Risk {formatScore(avgRisk)}</span>
          </div>
          <ul className="mt-3 space-y-3">
            {topRegions.map((region) => (
              <li
                key={region.region.id}
                className="rounded-lg border border-white/10 bg-slate-900/70 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={`/region/${region.region.id}`}
                    className="text-sm font-medium text-slate-100 hover:text-cyan-200"
                  >
                    {region.region.name}
                  </Link>
                  <p className="text-sm text-slate-200">Risk {formatScore(region.riskScore)}</p>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <ConfidencePill
                    label={region.confidenceLabel}
                    score={region.confidenceScore}
                  />
                  <p className="text-xs text-slate-400">Signals {region.signalCount}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </section>
    </div>
  );
}
