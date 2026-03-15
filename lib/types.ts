export type SignalType =
  | "infrastructure_stress"
  | "environmental_anomaly"
  | "supply_chain_congestion"
  | "humanitarian_risk_indicator"
  | "governance_instability";

export type SignalCategory =
  | "infrastructure"
  | "environmental"
  | "supply"
  | "humanitarian"
  | "institutional";

export type SystemId =
  | "transport_hubs"
  | "ports"
  | "power_stations"
  | "water_systems"
  | "hospitals"
  | "supply_routes"
  | "communications";

export type ConfidenceLabel = "Low" | "Medium" | "High";

export interface SdgTag {
  id: number;
  title: string;
}

export interface RegionDefinition {
  id: string;
  name: string;
  shortName: string;
  center: [number, number];
  neighbors: string[];
  baselineRisk: number;
}

export interface Signal {
  id: string;
  regionId: string;
  type: SignalType;
  category: SignalCategory;
  severity: number;
  location: [number, number];
  timestamp: number;
  description: string;
  whyItMatters: string;
  possibleCauses: string[];
  systemsAffected: SystemId[];
  impactPathway: string[];
  sdgTags: SdgTag[];
}

export interface TimelineFrame {
  id: string;
  timestamp: number;
  signals: Signal[];
}

export interface RegionInsight {
  region: RegionDefinition;
  riskScore: number;
  confidenceScore: number;
  confidenceLabel: ConfidenceLabel;
  confidenceExplanation: string;
  signalCount: number;
  dominantSignalType: SignalType | null;
}

export interface ActivityItem {
  id: string;
  timestamp: number;
  regionName: string;
  message: string;
  signalType: SignalType;
}

export interface SystemNode {
  id: SystemId;
  label: string;
}

export interface SystemDependency {
  source: SystemId;
  target: SystemId;
  strength: number;
}

export interface CascadeNodeState {
  id: SystemId;
  impact: number;
}

export interface CascadeRegionEffect {
  regionId: string;
  addedRisk: number;
}

export interface CascadeStepState {
  minute: number;
  nodes: CascadeNodeState[];
  affectedRegions: CascadeRegionEffect[];
}
