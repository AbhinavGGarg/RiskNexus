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
    armed_clash_report:
      region.id === "middle_east" || region.id === "west_africa" || region.id === "south_asia"
        ? 1.26
        : 1,
    heavy_weapon_activity:
      region.id === "middle_east" || region.id === "north_africa" ? 1.22 : 1,
    roadblock_checkpoint_change:
      region.id === "south_asia" || region.id === "west_africa" ? 1.18 : 1,
    communications_disruption:
      region.id === "west_africa" || region.id === "south_america" ? 1.14 : 1,
    civilian_displacement_signal:
      region.id === "middle_east" || region.id === "north_africa" ? 1.24 : 1,
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

  return "armed_clash_report";
}

function createSignal(
  region: RegionDefinition,
  type: SignalType,
  timestamp: number,
  random: () => number,
): Signal {
  const meta = SIGNAL_META[type];

  const severity = clamp(
    region.baselineRisk * 0.44 +
      random() * 0.56 +
      (type === "heavy_weapon_activity" ? 0.08 : 0),
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
  const globalPulse = 0.08 + 0.08 * Math.sin(index / 5);
  const signals: Signal[] = [];

  for (const region of regions) {
    const regionProbability = clamp(region.baselineRisk * 0.45 + globalPulse, 0.08, 0.76);

    if (random() < regionProbability) {
      const burstCount = random() > 0.84 ? 2 : 1;
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
  if (type === "armed_clash_report") {
    return "Confirmed armed clash reported near civilian neighborhoods";
  }

  if (type === "heavy_weapon_activity") {
    return "Heavy weapon activity detected with elevated strike risk";
  }

  if (type === "roadblock_checkpoint_change") {
    return "Checkpoint shifts reducing safe civilian movement routes";
  }

  if (type === "communications_disruption") {
    return "Communications outage may delay warning broadcasts";
  }

  return "Displacement signal rising as civilians begin to move";
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
