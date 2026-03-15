"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { REGIONS, SYSTEM_NODES } from "@/lib/constants";
import { computeRegionInsights } from "@/lib/scoring";
import {
  buildActivityFeed,
  collectSignalsForFrame,
  createInitialTimeline,
  createNextFrame,
  createSeededRandom,
} from "@/lib/simulation";
import { ActivityItem, RegionInsight, Signal, TimelineFrame } from "@/lib/types";

interface TrendPoint {
  label: string;
  risk: number;
  confidence: number;
  highRiskRegions: number;
}

interface SimulationContextValue {
  regions: typeof REGIONS;
  systemsMonitored: number;
  timeline: TimelineFrame[];
  replayMode: boolean;
  setReplayMode: (enabled: boolean) => void;
  replayIndex: number;
  setReplayIndex: (index: number) => void;
  activeFrameIndex: number;
  activeTimestamp: number;
  activeSignals: Signal[];
  regionInsights: RegionInsight[];
  activityFeed: ActivityItem[];
  trendSeries: TrendPoint[];
  getRegionInsight: (regionId: string) => RegionInsight | undefined;
  getRegionSignals: (regionId: string) => Signal[];
  getSignalById: (signalId: string) => Signal | undefined;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

function buildTrendSeries(
  timeline: TimelineFrame[],
  activeFrameIndex: number,
  replayMode: boolean,
): TrendPoint[] {
  const start = Math.max(0, activeFrameIndex - 16);
  const end = replayMode ? activeFrameIndex : timeline.length - 1;

  const series: TrendPoint[] = [];

  for (let index = start; index <= end; index += 1) {
    const frame = timeline[index];
    if (!frame) {
      continue;
    }

    const signals = collectSignalsForFrame(timeline, index, 24);
    const insights = computeRegionInsights(REGIONS, signals, frame.timestamp);

    const riskAverage = insights.reduce((sum, insight) => sum + insight.riskScore, 0) / insights.length;
    const confidenceAverage =
      insights.reduce((sum, insight) => sum + insight.confidenceScore, 0) / insights.length;

    series.push({
      label: new Date(frame.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      risk: riskAverage,
      confidence: confidenceAverage,
      highRiskRegions: insights.filter((insight) => insight.riskScore >= 0.66).length,
    });
  }

  return series;
}

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [simulationState, setSimulationState] = useState(() => {
    const initialTimeline = createInitialTimeline();
    return {
      timeline: initialTimeline,
      replayIndex: Math.max(0, initialTimeline.length - 1),
    };
  });
  const [replayMode, setReplayMode] = useState(false);
  const randomRef = useRef(createSeededRandom(20260314));
  const replayModeRef = useRef(replayMode);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSimulationState((current) => {
        const nextTimeline = [
          ...current.timeline,
          createNextFrame(current.timeline, randomRef.current),
        ];

        return {
          timeline: nextTimeline,
          replayIndex: replayModeRef.current
            ? Math.min(current.replayIndex, nextTimeline.length - 1)
            : Math.max(0, nextTimeline.length - 1),
        };
      });
    }, 9000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    replayModeRef.current = replayMode;
  }, [replayMode]);

  const timeline = simulationState.timeline;
  const replayIndex = simulationState.replayIndex;

  const activeFrameIndex = replayMode
    ? Math.max(0, Math.min(replayIndex, timeline.length - 1))
    : Math.max(0, timeline.length - 1);

  const activeTimestamp =
    timeline[activeFrameIndex]?.timestamp ??
    timeline[timeline.length - 1]?.timestamp ??
    0;

  const activeSignals = useMemo(
    () => collectSignalsForFrame(timeline, activeFrameIndex, 24),
    [timeline, activeFrameIndex],
  );

  const regionInsights = useMemo(
    () => computeRegionInsights(REGIONS, activeSignals, activeTimestamp),
    [activeSignals, activeTimestamp],
  );

  const regionLookup = useMemo(
    () => new Map(REGIONS.map((region) => [region.id, region.name])),
    [],
  );

  const activityFeed = useMemo(
    () => buildActivityFeed(timeline, activeFrameIndex, regionLookup),
    [timeline, activeFrameIndex, regionLookup],
  );

  const signalLookup = useMemo(() => {
    const map = new Map<string, Signal>();
    for (const frame of timeline) {
      for (const signal of frame.signals) {
        map.set(signal.id, signal);
      }
    }
    return map;
  }, [timeline]);

  const signalsByRegion = useMemo(() => {
    const map = new Map<string, Signal[]>();
    for (const signal of activeSignals) {
      const list = map.get(signal.regionId) ?? [];
      list.push(signal);
      map.set(signal.regionId, list);
    }

    for (const [regionId, signals] of map.entries()) {
      map.set(
        regionId,
        [...signals].sort((a, b) => b.severity - a.severity || b.timestamp - a.timestamp),
      );
    }

    return map;
  }, [activeSignals]);

  const trendSeries = useMemo(
    () => buildTrendSeries(timeline, activeFrameIndex, replayMode),
    [timeline, activeFrameIndex, replayMode],
  );

  const handleReplayMode = (enabled: boolean) => {
    setReplayMode(enabled);
    if (!enabled) {
      setSimulationState((current) => ({
        ...current,
        replayIndex: Math.max(0, current.timeline.length - 1),
      }));
    }
  };

  const handleReplayIndex = (index: number) => {
    setSimulationState((current) => ({
      ...current,
      replayIndex: Math.max(0, Math.min(index, current.timeline.length - 1)),
    }));
  };

  const value: SimulationContextValue = {
    regions: REGIONS,
    systemsMonitored: SYSTEM_NODES.length,
    timeline,
    replayMode,
    setReplayMode: handleReplayMode,
    replayIndex,
    setReplayIndex: handleReplayIndex,
    activeFrameIndex,
    activeTimestamp,
    activeSignals,
    regionInsights,
    activityFeed,
    trendSeries,
    getRegionInsight: (regionId: string) =>
      regionInsights.find((insight) => insight.region.id === regionId),
    getRegionSignals: (regionId: string) => signalsByRegion.get(regionId) ?? [],
    getSignalById: (signalId: string) => signalLookup.get(signalId),
  };

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
}

export function useSimulation() {
  const context = useContext(SimulationContext);

  if (!context) {
    throw new Error("useSimulation must be used inside SimulationProvider");
  }

  return context;
}
