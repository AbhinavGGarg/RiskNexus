export type SignalType =
  | "armed_clash_report"
  | "heavy_weapon_activity"
  | "roadblock_checkpoint_change"
  | "communications_disruption"
  | "civilian_displacement_signal";

export type SignalCategory =
  | "kinetic"
  | "mobility"
  | "information"
  | "humanitarian"
  | "infrastructure";

export type SystemId =
  | "evacuation_routes"
  | "hospitals"
  | "shelters"
  | "communications"
  | "water_networks"
  | "power_grid"
  | "aid_corridors"
  | "checkpoint_network";

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
