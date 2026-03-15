import {
  RegionDefinition,
  SdgTag,
  SignalCategory,
  SignalType,
  SystemDependency,
  SystemNode,
} from "@/lib/types";

export const SDG_TAGS: Record<string, SdgTag> = {
  sdg3: { id: 3, title: "Good Health and Well-Being" },
  sdg9: { id: 9, title: "Industry, Innovation and Infrastructure" },
  sdg11: { id: 11, title: "Sustainable Cities and Communities" },
  sdg13: { id: 13, title: "Climate Action" },
  sdg16: { id: 16, title: "Peace, Justice and Strong Institutions" },
};

export const REGIONS: RegionDefinition[] = [
  {
    id: "north_america",
    name: "North America",
    shortName: "N. America",
    center: [-100, 40],
    neighbors: ["south_america", "western_europe"],
    baselineRisk: 0.3,
  },
  {
    id: "south_america",
    name: "South America",
    shortName: "S. America",
    center: [-60, -15],
    neighbors: ["north_america", "west_africa"],
    baselineRisk: 0.39,
  },
  {
    id: "western_europe",
    name: "Western Europe",
    shortName: "W. Europe",
    center: [10, 50],
    neighbors: ["north_america", "north_africa", "middle_east"],
    baselineRisk: 0.29,
  },
  {
    id: "north_africa",
    name: "North Africa",
    shortName: "N. Africa",
    center: [20, 25],
    neighbors: ["western_europe", "west_africa", "middle_east"],
    baselineRisk: 0.46,
  },
  {
    id: "west_africa",
    name: "West Africa",
    shortName: "W. Africa",
    center: [0, 8],
    neighbors: ["north_africa", "south_america", "middle_east"],
    baselineRisk: 0.51,
  },
  {
    id: "middle_east",
    name: "Middle East",
    shortName: "Middle East",
    center: [45, 28],
    neighbors: ["western_europe", "north_africa", "south_asia"],
    baselineRisk: 0.57,
  },
  {
    id: "south_asia",
    name: "South Asia",
    shortName: "S. Asia",
    center: [78, 22],
    neighbors: ["middle_east", "east_asia", "southeast_asia"],
    baselineRisk: 0.54,
  },
  {
    id: "east_asia",
    name: "East Asia",
    shortName: "E. Asia",
    center: [115, 34],
    neighbors: ["south_asia", "southeast_asia", "oceania"],
    baselineRisk: 0.36,
  },
  {
    id: "southeast_asia",
    name: "Southeast Asia",
    shortName: "SE Asia",
    center: [105, 8],
    neighbors: ["south_asia", "east_asia", "oceania"],
    baselineRisk: 0.47,
  },
  {
    id: "oceania",
    name: "Oceania",
    shortName: "Oceania",
    center: [145, -25],
    neighbors: ["southeast_asia", "east_asia"],
    baselineRisk: 0.25,
  },
];

export const SIGNAL_META: Record<
  SignalType,
  {
    title: string;
    category: SignalCategory;
    description: string;
    whyItMatters: string;
    possibleCauses: string[];
    systemsAffected: SystemNode["id"][];
    impactPathway: string[];
    sdgTags: SdgTag[];
    color: string;
  }
> = {
  armed_clash_report: {
    title: "Armed Clash Report",
    category: "kinetic",
    description:
      "Multiple local sources indicate active armed engagements in or near populated areas.",
    whyItMatters:
      "Clashes can escalate quickly, reducing safe movement time for civilians.",
    possibleCauses: [
      "Frontline advances near urban edge",
      "Retaliatory strikes after local incident",
      "Competing control over key junctions",
    ],
    systemsAffected: ["evacuation_routes", "hospitals", "communications"],
    impactPathway: [
      "Armed Clash Report",
      "Movement Restrictions",
      "Emergency Service Pressure",
      "Civilian Harm Risk",
    ],
    sdgTags: [SDG_TAGS.sdg16, SDG_TAGS.sdg11, SDG_TAGS.sdg3],
    color: "#fb7185",
  },
  heavy_weapon_activity: {
    title: "Heavy Weapon Activity",
    category: "kinetic",
    description:
      "Detected blast signatures and weapon activity suggest elevated strike intensity.",
    whyItMatters:
      "High-intensity strikes shorten warning windows and can overwhelm shelters and hospitals.",
    possibleCauses: [
      "Artillery concentration near conflict corridor",
      "Sustained indirect fire exchange",
      "Targeting of strategic facilities",
    ],
    systemsAffected: ["hospitals", "power_grid", "water_networks"],
    impactPathway: [
      "Heavy Weapon Activity",
      "Infrastructure Damage",
      "Essential Service Outages",
      "Civilian Exposure",
    ],
    sdgTags: [SDG_TAGS.sdg16, SDG_TAGS.sdg11, SDG_TAGS.sdg9],
    color: "#f97316",
  },
  roadblock_checkpoint_change: {
    title: "Roadblock / Checkpoint Change",
    category: "mobility",
    description:
      "Rapid checkpoint shifts and road closures are limiting civilian mobility across routes.",
    whyItMatters:
      "Reduced mobility delays evacuation and aid delivery when danger rises.",
    possibleCauses: [
      "Security perimeter expansion",
      "Checkpoint hardening on arterial roads",
      "Sudden closure of crossing points",
    ],
    systemsAffected: ["evacuation_routes", "checkpoint_network", "aid_corridors"],
    impactPathway: [
      "Checkpoint Change",
      "Evacuation Delay",
      "Aid Access Constraints",
      "Civilian Vulnerability Increase",
    ],
    sdgTags: [SDG_TAGS.sdg11, SDG_TAGS.sdg16],
    color: "#facc15",
  },
  communications_disruption: {
    title: "Communications Disruption",
    category: "information",
    description:
      "Intermittent outages are reducing reliability of warning channels and coordination.",
    whyItMatters:
      "When networks fail, civilians receive less timely guidance on safe routes and shelter.",
    possibleCauses: [
      "Tower failures near active conflict lines",
      "Power interruption at network nodes",
      "Intentional communication interference",
    ],
    systemsAffected: ["communications", "evacuation_routes", "hospitals"],
    impactPathway: [
      "Comms Disruption",
      "Warning Gaps",
      "Response Coordination Delays",
      "Higher Civilian Risk",
    ],
    sdgTags: [SDG_TAGS.sdg16, SDG_TAGS.sdg11],
    color: "#22d3ee",
  },
  civilian_displacement_signal: {
    title: "Civilian Displacement Signal",
    category: "humanitarian",
    description:
      "Population movement anomalies suggest civilians are leaving high-risk zones.",
    whyItMatters:
      "Displacement surges can indicate imminent danger and strain nearby shelters.",
    possibleCauses: [
      "Escalation rumors confirmed by local observations",
      "Loss of trust in route safety",
      "Service disruptions in residential districts",
    ],
    systemsAffected: ["shelters", "aid_corridors", "water_networks"],
    impactPathway: [
      "Displacement Signal",
      "Shelter Overload",
      "Resource Shortages",
      "Humanitarian Deterioration",
    ],
    sdgTags: [SDG_TAGS.sdg3, SDG_TAGS.sdg11, SDG_TAGS.sdg16],
    color: "#a78bfa",
  },
};

export const SIGNAL_TYPES: SignalType[] = Object.keys(SIGNAL_META) as SignalType[];

export const SIGNAL_TYPE_LABELS: Record<SignalType, string> = Object.fromEntries(
  Object.entries(SIGNAL_META).map(([key, value]) => [key, value.title]),
) as Record<SignalType, string>;

export const SYSTEM_NODES: SystemNode[] = [
  { id: "evacuation_routes", label: "Evacuation Routes" },
  { id: "checkpoint_network", label: "Checkpoint Network" },
  { id: "communications", label: "Communications" },
  { id: "hospitals", label: "Hospitals" },
  { id: "shelters", label: "Shelters" },
  { id: "aid_corridors", label: "Aid Corridors" },
  { id: "water_networks", label: "Water Networks" },
  { id: "power_grid", label: "Power Grid" },
];

export const SYSTEM_DEPENDENCIES: SystemDependency[] = [
  { source: "communications", target: "evacuation_routes", strength: 0.81 },
  { source: "checkpoint_network", target: "evacuation_routes", strength: 0.88 },
  { source: "evacuation_routes", target: "shelters", strength: 0.72 },
  { source: "aid_corridors", target: "shelters", strength: 0.69 },
  { source: "power_grid", target: "communications", strength: 0.74 },
  { source: "power_grid", target: "water_networks", strength: 0.78 },
  { source: "water_networks", target: "hospitals", strength: 0.66 },
  { source: "communications", target: "hospitals", strength: 0.61 },
  { source: "evacuation_routes", target: "hospitals", strength: 0.54 },
  { source: "checkpoint_network", target: "aid_corridors", strength: 0.63 },
  { source: "aid_corridors", target: "hospitals", strength: 0.58 },
];

export const CASCADE_STEPS_MINUTES = [0, 10, 30, 60];

export const SIGNAL_TYPE_WEIGHT: Record<SignalType, number> = {
  armed_clash_report: 1.1,
  heavy_weapon_activity: 0.95,
  roadblock_checkpoint_change: 0.9,
  communications_disruption: 0.8,
  civilian_displacement_signal: 0.85,
};
