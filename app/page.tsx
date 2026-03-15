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
  const avgLeadTimeMinutes = Math.round((1 - avgRisk) * 90);

  const topRegions = [...regionInsights]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <section className="grid gap-3 md:grid-cols-3">
        <MetricCard
          label="Active Alerts"
          value={String(activeSignals.length)}
          delta="Verified warning events in latest window"
          accent="teal"
        />
        <MetricCard
          label="High Danger Zones"
          value={String(highRiskRegions.length)}
          delta="Zones with danger score above 0.66"
          accent="red"
        />
        <MetricCard
          label="Avg Lead Time"
          value={`${Math.max(8, avgLeadTimeMinutes)} min`}
          delta={`${systemsMonitored} protection systems monitored`}
          accent="amber"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Panel className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Real-Time Conflict Heatmap</h2>
              <p className="text-sm text-slate-400">
                Spot where danger is building and where civilians may need earlier movement warnings.
              </p>
            </div>
            <Link
              href="/map"
              className="rounded-md border border-white/15 px-3 py-1.5 text-xs text-slate-200 hover:border-cyan-200/40"
            >
              Open Conflict Map
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
            <h2 className="text-lg font-semibold text-slate-100">Live Alerts</h2>
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
            <h2 className="text-lg font-semibold text-slate-100">Alert Build-up Replay</h2>
            <p className="text-sm text-slate-400">
              See how warning signals accumulate before danger reaches communities.
            </p>
          </div>
          <RiskTrendChart data={trendSeries} />
        </Panel>

        <Panel>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Priority Civilian Risk Zones</h2>
            <span className="text-xs text-slate-400">Average Danger {formatScore(avgRisk)}</span>
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
                  <p className="text-sm text-slate-200">Danger {formatScore(region.riskScore)}</p>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <ConfidencePill
                    label={region.confidenceLabel}
                    score={region.confidenceScore}
                  />
                  <p className="text-xs text-slate-400">Alerts {region.signalCount}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </section>
    </div>
  );
}
