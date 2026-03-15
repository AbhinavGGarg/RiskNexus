import { REGIONS, SIGNAL_META, SIGNAL_TYPES, SIGNAL_TYPE_WEIGHT } from "@/lib/constants";
import {
  ActivityItem,
  RegionDefinition,
  Signal,
  SignalType,
  TimelineFrame,
} from "@/lib/types";
import { clamp } from "@/lib/utils";

const FRAME_INTERVAL_MS = 15 * 60 * 1000;
const INITIAL_FRAME_COUNT = 44;

let signalCounter = 0;

export function createSeededRandom(seed: number) {
  let state = seed;

  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function chooseType(region: RegionDefinition, random: () => number): SignalType {
  const adjustments: Partial<Record<SignalType, number>> = {
    infrastructure_stress: region.baselineRisk >= 0.45 ? 1.18 : 1,
    environmental_anomaly:
      region.id === "oceania" || region.id === "southeast_asia" ? 1.22 : 1,
    supply_chain_congestion:
      region.id === "east_asia" ||
      region.id === "south_asia" ||
      region.id === "north_america"
        ? 1.2
        : 1,
    humanitarian_risk_indicator:
      region.id === "west_africa" || region.id === "north_africa" ? 1.28 : 1,
    governance_instability:
      region.id === "middle_east" || region.id === "west_africa" ? 1.25 : 1,
  };

  const weighted = SIGNAL_TYPES.map((type) => ({
    type,
    weight: SIGNAL_TYPE_WEIGHT[type] * (adjustments[type] ?? 1),
  }));

  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  const pick = random() * total;

  let cursor = 0;
  for (const entry of weighted) {
    cursor += entry.weight;
    if (pick <= cursor) {
      return entry.type;
    }
  }

  return "infrastructure_stress";
}

function createSignal(
  region: RegionDefinition,
  type: SignalType,
  timestamp: number,
  random: () => number,
): Signal {
  const meta = SIGNAL_META[type];

  const severity = clamp(
    region.baselineRisk * 0.42 + random() * 0.58 + (type === "governance_instability" ? 0.06 : 0),
  );

  const lngJitter = (random() - 0.5) * 10;
  const latJitter = (random() - 0.5) * 6;

  signalCounter += 1;

  return {
    id: `signal-${signalCounter}`,
    regionId: region.id,
    type,
    category: meta.category,
    severity,
    location: [region.center[0] + lngJitter, region.center[1] + latJitter],
    timestamp,
    description: meta.description,
    whyItMatters: meta.whyItMatters,
    possibleCauses: meta.possibleCauses,
    systemsAffected: meta.systemsAffected,
    impactPathway: meta.impactPathway,
    sdgTags: meta.sdgTags,
  };
}

function createFrame(
  index: number,
  timestamp: number,
  regions: RegionDefinition[],
  random: () => number,
): TimelineFrame {
  const globalPulse = 0.06 + 0.06 * Math.sin(index / 5);
  const signals: Signal[] = [];

  for (const region of regions) {
    const regionProbability = clamp(region.baselineRisk * 0.42 + globalPulse, 0.08, 0.7);

    if (random() < regionProbability) {
      const burstCount = random() > 0.86 ? 2 : 1;
      for (let i = 0; i < burstCount; i += 1) {
        const type = chooseType(region, random);
        signals.push(createSignal(region, type, timestamp, random));
      }
    }
  }

  return {
    id: `frame-${index}`,
    timestamp,
    signals,
  };
}

export function createInitialTimeline(
  seed = 2026,
  regions: RegionDefinition[] = REGIONS,
): TimelineFrame[] {
  const random = createSeededRandom(seed);
  const now = Date.now();
  const startTimestamp = now - (INITIAL_FRAME_COUNT - 1) * FRAME_INTERVAL_MS;

  return Array.from({ length: INITIAL_FRAME_COUNT }, (_, index) => {
    const timestamp = startTimestamp + index * FRAME_INTERVAL_MS;
    return createFrame(index, timestamp, regions, random);
  });
}

export function createNextFrame(
  timeline: TimelineFrame[],
  random: () => number,
  regions: RegionDefinition[] = REGIONS,
): TimelineFrame {
  const lastFrame = timeline[timeline.length - 1];
  const timestamp = (lastFrame?.timestamp ?? Date.now()) + FRAME_INTERVAL_MS;
  const nextIndex = timeline.length;

  return createFrame(nextIndex, timestamp, regions, random);
}

export function collectSignalsForFrame(
  timeline: TimelineFrame[],
  frameIndex: number,
  maxFrames = 24,
): Signal[] {
  const safeIndex = Math.max(0, Math.min(frameIndex, timeline.length - 1));
  const startIndex = Math.max(0, safeIndex - maxFrames + 1);

  return timeline
    .slice(startIndex, safeIndex + 1)
    .flatMap((frame) => frame.signals)
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function getMostRecentSignals(
  timeline: TimelineFrame[],
  frameIndex: number,
  maxSignals = 18,
): Signal[] {
  return collectSignalsForFrame(timeline, frameIndex, 8).slice(0, maxSignals);
}

function getMessage(type: SignalType) {
  if (type === "environmental_anomaly") {
    return "Environmental anomaly detected near coastal belt";
  }

  if (type === "infrastructure_stress") {
    return "Infrastructure stress signal detected near major transportation hub";
  }

  if (type === "supply_chain_congestion") {
    return "Supply route congestion trend rising across strategic corridor";
  }

  if (type === "humanitarian_risk_indicator") {
    return "Humanitarian pressure indicator rising in vulnerable communities";
  }

  return "Institutional coordination instability signal observed";
}

export function buildActivityFeed(
  timeline: TimelineFrame[],
  frameIndex: number,
  regionLookup: Map<string, string>,
  maxItems = 12,
): ActivityItem[] {
  const latestSignals = getMostRecentSignals(timeline, frameIndex, maxItems * 2);

  return latestSignals.slice(0, maxItems).map((signal) => ({
    id: `${signal.id}-activity`,
    timestamp: signal.timestamp,
    regionName: regionLookup.get(signal.regionId) ?? signal.regionId,
    message: getMessage(signal.type),
    signalType: signal.type,
  }));
}
