import {
  ConfidenceLabel,
  RegionDefinition,
  RegionInsight,
  Signal,
  SignalType,
} from "@/lib/types";
import { clamp } from "@/lib/utils";

const RISK_LOOKBACK_MS = 6 * 60 * 60 * 1000;

function stdDev(values: number[]) {
  if (!values.length) {
    return 0;
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) * (value - mean), 0) /
    values.length;
  return Math.sqrt(variance);
}

function getDominantSignalType(signals: Signal[]): SignalType | null {
  if (!signals.length) {
    return null;
  }

  const counts = new Map<SignalType, number>();
  for (const signal of signals) {
    counts.set(signal.type, (counts.get(signal.type) ?? 0) + 1);
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function toConfidenceLabel(score: number): ConfidenceLabel {
  if (score >= 0.71) {
    return "High";
  }

  if (score >= 0.45) {
    return "Medium";
  }

  return "Low";
}

function getConfidenceExplanation(label: ConfidenceLabel, count: number): string {
  if (label === "High") {
    return `High confidence based on ${count} corroborating and recent signals.`;
  }

  if (label === "Medium") {
    return "Medium confidence due to partial signal agreement across monitored systems.";
  }

  return "Low confidence because signals are sparse or inconsistent across neighboring regions.";
}

export function computeRegionInsights(
  regions: RegionDefinition[],
  signals: Signal[],
  activeTimestamp: number,
): RegionInsight[] {
  const regionSignalMap = new Map<string, Signal[]>();

  for (const region of regions) {
    regionSignalMap.set(region.id, []);
  }

  for (const signal of signals) {
    if (activeTimestamp - signal.timestamp > RISK_LOOKBACK_MS) {
      continue;
    }

    const list = regionSignalMap.get(signal.regionId);
    if (!list) {
      continue;
    }

    list.push(signal);
  }

  const baseRiskMap = new Map<string, number>();

  for (const region of regions) {
    const regionSignals = regionSignalMap.get(region.id) ?? [];
    const count = regionSignals.length;
    const density = clamp(count / 8);

    const severityAverage =
      count > 0
        ? regionSignals.reduce((sum, signal) => sum + signal.severity, 0) / count
        : 0;

    const anomalyFactor =
      count > 0
        ? regionSignals.filter((signal) => signal.type === "environmental_anomaly")
            .length / count
        : 0;

    const recencyFactor =
      count > 0
        ? regionSignals.reduce((sum, signal) => {
            const age = activeTimestamp - signal.timestamp;
            const freshness = clamp(1 - age / RISK_LOOKBACK_MS);
            return sum + freshness;
          }, 0) / count
        : 0;

    const baseRisk = clamp(
      region.baselineRisk * 0.25 +
        density * 0.3 +
        severityAverage * 0.3 +
        anomalyFactor * 0.08 +
        recencyFactor * 0.07,
    );

    baseRiskMap.set(region.id, baseRisk);
  }

  const finalRiskMap = new Map<string, number>();

  for (const region of regions) {
    const neighborRisk =
      region.neighbors.reduce(
        (sum, neighborId) => sum + (baseRiskMap.get(neighborId) ?? region.baselineRisk),
        0,
      ) / Math.max(region.neighbors.length, 1);

    const adjustedRisk = clamp(
      (baseRiskMap.get(region.id) ?? 0) * 0.84 + neighborRisk * 0.16,
    );

    finalRiskMap.set(region.id, adjustedRisk);
  }

  return regions.map((region) => {
    const regionSignals = regionSignalMap.get(region.id) ?? [];
    const signalCount = regionSignals.length;
    const riskScore = finalRiskMap.get(region.id) ?? region.baselineRisk;

    const agreement =
      signalCount > 1
        ? clamp(1 - stdDev(regionSignals.map((signal) => signal.severity)) / 0.5)
        : signalCount === 1
          ? 0.62
          : 0.25;

    const recency =
      signalCount > 0
        ? clamp(
            1 -
              (activeTimestamp -
                Math.max(...regionSignals.map((signal) => signal.timestamp))) /
                RISK_LOOKBACK_MS,
          )
        : 0;

    const neighborConsistency = clamp(
      1 -
        Math.abs(
          riskScore -
            region.neighbors.reduce(
              (sum, neighborId) => sum + (finalRiskMap.get(neighborId) ?? 0),
              0,
            ) /
              Math.max(region.neighbors.length, 1),
        ),
    );

    const confidenceScore = clamp(
      clamp(signalCount / 7) * 0.36 +
        agreement * 0.22 +
        recency * 0.24 +
        neighborConsistency * 0.18,
    );

    const confidenceLabel = toConfidenceLabel(confidenceScore);

    return {
      region,
      riskScore,
      confidenceScore,
      confidenceLabel,
      confidenceExplanation: getConfidenceExplanation(confidenceLabel, signalCount),
      signalCount,
      dominantSignalType: getDominantSignalType(regionSignals),
    };
  });
}
