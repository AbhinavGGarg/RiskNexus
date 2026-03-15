import {
  CASCADE_STEPS_MINUTES,
  REGIONS,
  SYSTEM_DEPENDENCIES,
  SYSTEM_NODES,
} from "@/lib/constants";
import { CascadeStepState, Signal, SystemId } from "@/lib/types";
import { clamp } from "@/lib/utils";

const STEP_DECAY = 0.83;

function initializeImpact(signal: Signal) {
  const map = new Map<SystemId, number>();

  for (const node of SYSTEM_NODES) {
    map.set(node.id, 0);
  }

  for (const system of signal.systemsAffected) {
    map.set(system, Math.max(map.get(system) ?? 0, signal.severity));
  }

  return map;
}

function propagateStep(previous: Map<SystemId, number>, stepIndex: number) {
  const current = new Map(previous);

  for (const dependency of SYSTEM_DEPENDENCIES) {
    const sourceImpact = previous.get(dependency.source) ?? 0;
    const transferred = sourceImpact * dependency.strength * STEP_DECAY;

    if (transferred < 0.06) {
      continue;
    }

    const currentTarget = current.get(dependency.target) ?? 0;
    const timeAttenuation = 1 - stepIndex * 0.08;
    current.set(
      dependency.target,
      Math.max(currentTarget, clamp(transferred * timeAttenuation)),
    );
  }

  return current;
}

function createRegionEffects(signal: Signal, stepIndex: number) {
  const origin = REGIONS.find((region) => region.id === signal.regionId);
  if (!origin) {
    return [];
  }

  const directBoost = clamp(signal.severity * (0.25 + stepIndex * 0.05), 0, 0.35);

  const effects = [{ regionId: origin.id, addedRisk: directBoost }];

  origin.neighbors.forEach((neighborId, index) => {
    const distancePenalty = index * 0.02;
    effects.push({
      regionId: neighborId,
      addedRisk: clamp(directBoost * 0.56 - distancePenalty, 0, 0.21),
    });
  });

  return effects;
}

export function buildCascadeStates(signal: Signal): CascadeStepState[] {
  const states: CascadeStepState[] = [];
  let currentImpact = initializeImpact(signal);

  CASCADE_STEPS_MINUTES.forEach((minute, stepIndex) => {
    if (stepIndex > 0) {
      currentImpact = propagateStep(currentImpact, stepIndex);
    }

    states.push({
      minute,
      nodes: SYSTEM_NODES.map((node) => ({
        id: node.id,
        impact: clamp(currentImpact.get(node.id) ?? 0),
      })),
      affectedRegions: createRegionEffects(signal, stepIndex),
    });
  });

  return states;
}
