import {
  RegionDefinition,
  SdgTag,
  SignalCategory,
  SignalType,
  SystemDependency,
  SystemNode,
} from "@/lib/types";

export const SDG_TAGS: Record<string, SdgTag> = {
  sdg9: { id: 9, title: "Industry, Innovation and Infrastructure" },
  sdg11: { id: 11, title: "Sustainable Cities and Communities" },
  sdg13: { id: 13, title: "Climate Action" },
  sdg16: { id: 16, title: "Peace, Justice and Strong Institutions" },
  sdg3: { id: 3, title: "Good Health and Well-Being" },
};

export const REGIONS: RegionDefinition[] = [
  {
    id: "north_america",
    name: "North America",
    shortName: "N. America",
    center: [-100, 40],
    neighbors: ["south_america", "western_europe"],
    baselineRisk: 0.34,
  },
  {
    id: "south_america",
    name: "South America",
    shortName: "S. America",
    center: [-60, -15],
    neighbors: ["north_america", "west_africa"],
    baselineRisk: 0.41,
  },
  {
    id: "western_europe",
    name: "Western Europe",
    shortName: "W. Europe",
    center: [10, 50],
    neighbors: ["north_america", "north_africa", "middle_east"],
    baselineRisk: 0.32,
  },
  {
    id: "north_africa",
    name: "North Africa",
    shortName: "N. Africa",
    center: [20, 25],
    neighbors: ["western_europe", "west_africa", "middle_east"],
    baselineRisk: 0.43,
  },
  {
    id: "west_africa",
    name: "West Africa",
    shortName: "W. Africa",
    center: [0, 8],
    neighbors: ["north_africa", "south_america", "middle_east"],
    baselineRisk: 0.48,
  },
  {
    id: "middle_east",
    name: "Middle East",
    shortName: "Middle East",
    center: [45, 28],
    neighbors: ["western_europe", "north_africa", "south_asia"],
    baselineRisk: 0.46,
  },
  {
    id: "south_asia",
    name: "South Asia",
    shortName: "S. Asia",
    center: [78, 22],
    neighbors: ["middle_east", "east_asia", "southeast_asia"],
    baselineRisk: 0.51,
  },
  {
    id: "east_asia",
    name: "East Asia",
    shortName: "E. Asia",
    center: [115, 34],
    neighbors: ["south_asia", "southeast_asia", "oceania"],
    baselineRisk: 0.39,
  },
  {
    id: "southeast_asia",
    name: "Southeast Asia",
    shortName: "SE Asia",
    center: [105, 8],
    neighbors: ["south_asia", "east_asia", "oceania"],
    baselineRisk: 0.49,
  },
  {
    id: "oceania",
    name: "Oceania",
    shortName: "Oceania",
    center: [145, -25],
    neighbors: ["southeast_asia", "east_asia"],
    baselineRisk: 0.28,
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
  infrastructure_stress: {
    title: "Infrastructure Stress",
    category: "infrastructure",
    description:
      "Critical transport and utility assets are operating above resilient thresholds.",
    whyItMatters:
      "Infrastructure bottlenecks can quickly degrade mobility, emergency response, and access to essential services.",
    possibleCauses: [
      "Deferred maintenance in transport corridors",
      "Extreme weather loading on legacy assets",
      "Demand spikes near urban logistics hubs",
    ],
    systemsAffected: ["transport_hubs", "power_stations", "supply_routes"],
    impactPathway: [
      "Infrastructure Stress",
      "Transport Network Strain",
      "Service Reliability Drop",
      "Community Access Disruption",
    ],
    sdgTags: [SDG_TAGS.sdg9, SDG_TAGS.sdg11],
    color: "#f97316",
  },
  environmental_anomaly: {
    title: "Environmental Anomaly",
    category: "environmental",
    description:
      "Unusual environmental conditions indicate elevated probability of climate-linked disruption.",
    whyItMatters:
      "Anomalies can be leading indicators for flood, drought, and ecosystem stress that pressure public infrastructure.",
    possibleCauses: [
      "Rapid sea-surface temperature shifts",
      "Persistent precipitation variance",
      "Heat anomalies near dense settlements",
    ],
    systemsAffected: ["water_systems", "power_stations", "hospitals"],
    impactPathway: [
      "Environmental Anomaly",
      "Resource Stress",
      "Public Service Overload",
      "Humanitarian Pressure",
    ],
    sdgTags: [SDG_TAGS.sdg13, SDG_TAGS.sdg11],
    color: "#22d3ee",
  },
  supply_chain_congestion: {
    title: "Supply Chain Congestion",
    category: "supply",
    description:
      "Flow constraints indicate rising delays in goods movement across strategic corridors.",
    whyItMatters:
      "Congestion increases costs and can restrict delivery of medicine, food, and recovery materials.",
    possibleCauses: [
      "Port throughput reduction",
      "Container imbalance and route rerouting",
      "Cross-border inspection slowdowns",
    ],
    systemsAffected: ["ports", "supply_routes", "transport_hubs"],
    impactPathway: [
      "Supply Chain Congestion",
      "Distribution Delay",
      "Essential Goods Shortfall",
      "Household Vulnerability Increase",
    ],
    sdgTags: [SDG_TAGS.sdg9, SDG_TAGS.sdg11, SDG_TAGS.sdg3],
    color: "#facc15",
  },
  humanitarian_risk_indicator: {
    title: "Humanitarian Risk Indicator",
    category: "humanitarian",
    description:
      "Signals suggest growing pressure on essential services and vulnerable communities.",
    whyItMatters:
      "Early visibility supports targeted preparedness before displacement, shortages, or health shocks intensify.",
    possibleCauses: [
      "Rapid displacement in peri-urban zones",
      "Food or medical stock depletion",
      "Compounded climate and economic stressors",
    ],
    systemsAffected: ["hospitals", "water_systems", "communications"],
    impactPathway: [
      "Humanitarian Risk Indicator",
      "Service Strain",
      "Coverage Gaps",
      "Community Wellbeing Decline",
    ],
    sdgTags: [SDG_TAGS.sdg3, SDG_TAGS.sdg11, SDG_TAGS.sdg16],
    color: "#f43f5e",
  },
  governance_instability: {
    title: "Governance Instability",
    category: "institutional",
    description:
      "Institutional friction and coordination gaps may reduce response capacity during shocks.",
    whyItMatters:
      "Fragile coordination can amplify disruption by delaying decisions and resource mobilization.",
    possibleCauses: [
      "Operational policy conflict",
      "Reduced information-sharing trust",
      "Administrative bottlenecks",
    ],
    systemsAffected: ["communications", "transport_hubs", "hospitals"],
    impactPathway: [
      "Governance Instability",
      "Response Coordination Delays",
      "Service Degradation",
      "Longer Recovery Windows",
    ],
    sdgTags: [SDG_TAGS.sdg16, SDG_TAGS.sdg11],
    color: "#c084fc",
  },
};

export const SIGNAL_TYPES: SignalType[] = Object.keys(SIGNAL_META) as SignalType[];

export const SIGNAL_TYPE_LABELS: Record<SignalType, string> = Object.fromEntries(
  Object.entries(SIGNAL_META).map(([key, value]) => [key, value.title]),
) as Record<SignalType, string>;

export const SYSTEM_NODES: SystemNode[] = [
  { id: "ports", label: "Ports" },
  { id: "transport_hubs", label: "Transport Hubs" },
  { id: "supply_routes", label: "Supply Routes" },
  { id: "power_stations", label: "Power Stations" },
  { id: "water_systems", label: "Water Systems" },
  { id: "communications", label: "Communications" },
  { id: "hospitals", label: "Hospitals" },
];

export const SYSTEM_DEPENDENCIES: SystemDependency[] = [
  { source: "ports", target: "supply_routes", strength: 0.82 },
  { source: "transport_hubs", target: "supply_routes", strength: 0.78 },
  { source: "supply_routes", target: "hospitals", strength: 0.66 },
  { source: "power_stations", target: "water_systems", strength: 0.75 },
  { source: "power_stations", target: "communications", strength: 0.71 },
  { source: "communications", target: "hospitals", strength: 0.62 },
  { source: "water_systems", target: "hospitals", strength: 0.74 },
  { source: "transport_hubs", target: "power_stations", strength: 0.48 },
  { source: "ports", target: "transport_hubs", strength: 0.69 },
  { source: "communications", target: "transport_hubs", strength: 0.54 },
  { source: "supply_routes", target: "water_systems", strength: 0.45 },
];

export const CASCADE_STEPS_MINUTES = [0, 5, 15, 30];

export const SIGNAL_TYPE_WEIGHT: Record<SignalType, number> = {
  infrastructure_stress: 1,
  environmental_anomaly: 1,
  supply_chain_congestion: 1,
  humanitarian_risk_indicator: 0.9,
  governance_instability: 0.6,
};
