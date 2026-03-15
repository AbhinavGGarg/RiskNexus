"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RegionInsight } from "@/lib/types";
import { cn, formatPercent, formatScore } from "@/lib/utils";

interface RiskMapProps {
  regions: RegionInsight[];
  onRegionSelect?: (regionId: string) => void;
  className?: string;
}

interface MapFeature {
  geometry?: {
    type?: string;
    coordinates?: [number, number];
  };
  properties?: Record<string, unknown>;
}

interface MapPointerEvent {
  features?: MapFeature[];
}

interface MapSourceLike {
  setData: (data: GeoJSON.FeatureCollection<GeoJSON.Point>) => void;
}

interface MapLike {
  addSource: (id: string, source: Record<string, unknown>) => void;
  getSource: (id: string) => unknown;
  addLayer: (layer: Record<string, unknown>) => void;
  on: {
    (event: "load", listener: () => void): void;
    (event: string, layerId: string, listener: (event: MapPointerEvent) => void): void;
  };
  getCanvas: () => HTMLCanvasElement;
  remove: () => void;
}

interface PopupLike {
  setLngLat: (lngLat: [number, number]) => PopupLike;
  setHTML: (html: string) => PopupLike;
  addTo: (map: MapLike) => PopupLike;
  remove: () => void;
}

interface MapLibrary {
  Map: new (options: {
    container: HTMLElement;
    style: string;
    center: [number, number];
    zoom: number;
    projection: "mercator";
    attributionControl: boolean;
  }) => MapLike;
  Popup: new (options: {
    closeButton: boolean;
    closeOnClick: boolean;
    offset: number;
    className: string;
  }) => PopupLike;
  accessToken?: string;
}

const DEFAULT_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const SOURCE_ID = "regions";

function toFeatureCollection(regions: RegionInsight[]) {
  return {
    type: "FeatureCollection" as const,
    features: regions.map((insight) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: insight.region.center,
      },
      properties: {
        id: insight.region.id,
        name: insight.region.name,
        risk: insight.riskScore,
        confidence: insight.confidenceScore,
        confidenceLabel: insight.confidenceLabel,
        signalCount: insight.signalCount,
      },
    })),
  };
}

function readString(props: Record<string, unknown>, key: string, fallback = "") {
  const value = props[key];
  return typeof value === "string" ? value : fallback;
}

function readNumber(props: Record<string, unknown>, key: string, fallback = 0) {
  const value = props[key];
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

async function loadMapRuntime(token: string | undefined) {
  if (token) {
    const mapboxModule = (await import("mapbox-gl")).default as unknown as MapLibrary;
    mapboxModule.accessToken = token;

    return {
      library: mapboxModule,
      provider: "mapbox" as const,
      style: "mapbox://styles/mapbox/dark-v11",
    };
  }

  const maplibreModule = (await import("maplibre-gl")).default as unknown as MapLibrary;
  return {
    library: maplibreModule,
    provider: "maplibre" as const,
    style: DEFAULT_STYLE,
  };
}

export function RiskMap({ regions, onRegionSelect, className }: RiskMapProps) {
  const mapRef = useRef<MapLike | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<PopupLike | null>(null);
  const onRegionSelectRef = useRef(onRegionSelect);
  const [provider, setProvider] = useState<"mapbox" | "maplibre" | null>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();
  const featureCollection = useMemo(() => toFeatureCollection(regions), [regions]);
  const featureCollectionRef = useRef(featureCollection);

  useEffect(() => {
    onRegionSelectRef.current = onRegionSelect;
  }, [onRegionSelect]);

  useEffect(() => {
    featureCollectionRef.current = featureCollection;
  }, [featureCollection]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    let disposed = false;

    const initMap = async () => {
      const runtime = await loadMapRuntime(token);
      if (disposed || !containerRef.current) {
        return;
      }

      const map = new runtime.library.Map({
        container: containerRef.current,
        style: runtime.style,
        center: [18, 14],
        zoom: 1.15,
        projection: "mercator",
        attributionControl: false,
      });

      mapRef.current = map;
      setProvider(runtime.provider);

      popupRef.current = new runtime.library.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 10,
        className: "risk-popup",
      });

      map.on("load", () => {
        map.addSource(SOURCE_ID, {
          type: "geojson",
          data: featureCollectionRef.current,
        });

        map.addLayer({
          id: "risk-heat",
          type: "heatmap",
          source: SOURCE_ID,
          maxzoom: 4,
          paint: {
            "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 0.4, 3, 1],
            "heatmap-weight": ["get", "risk"],
            "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 18, 4, 45],
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(26, 177, 136, 0)",
              0.3,
              "rgba(16, 185, 129, 0.38)",
              0.6,
              "rgba(245, 158, 11, 0.55)",
              1,
              "rgba(244, 63, 94, 0.75)",
            ],
            "heatmap-opacity": 0.8,
          },
        });

        map.addLayer({
          id: "region-points",
          type: "circle",
          source: SOURCE_ID,
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["get", "risk"], 0, 9, 1, 18],
            "circle-color": [
              "interpolate",
              ["linear"],
              ["get", "risk"],
              0,
              "#34d399",
              0.5,
              "#facc15",
              1,
              "#fb7185",
            ],
            "circle-opacity": 0.92,
            "circle-stroke-width": [
              "interpolate",
              ["linear"],
              ["get", "confidence"],
              0,
              1,
              1,
              4,
            ],
            "circle-stroke-color": [
              "interpolate",
              ["linear"],
              ["get", "confidence"],
              0,
              "#64748b",
              0.5,
              "#67e8f9",
              1,
              "#a5f3fc",
            ],
          },
        });

        map.addLayer({
          id: "region-glow",
          type: "circle",
          source: SOURCE_ID,
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["get", "risk"], 0, 12, 1, 28],
            "circle-color": "#67e8f9",
            "circle-blur": 1,
            "circle-opacity": [
              "interpolate",
              ["linear"],
              ["get", "confidence"],
              0,
              0.05,
              1,
              0.35,
            ],
          },
        });

        map.on("mousemove", "region-points", (event) => {
          map.getCanvas().style.cursor = "pointer";
          const feature = event.features?.[0];
          const props = feature?.properties;
          const coordinates = feature?.geometry?.coordinates;

          if (!props || !coordinates) {
            return;
          }

          popupRef.current
            ?.setLngLat(coordinates)
            .setHTML(
              `<div style="font-family: system-ui; font-size: 12px; color: #dbeafe;">
                <div style="font-weight: 600; margin-bottom: 4px;">${readString(props, "name")}</div>
                <div>Risk: ${formatScore(readNumber(props, "risk"))}</div>
                <div>Confidence: ${readString(props, "confidenceLabel", "Unknown")} (${formatPercent(readNumber(props, "confidence"))})</div>
                <div>Signals: ${Math.round(readNumber(props, "signalCount"))}</div>
              </div>`,
            )
            .addTo(map);
        });

        map.on("mouseleave", "region-points", () => {
          map.getCanvas().style.cursor = "";
          popupRef.current?.remove();
        });

        map.on("click", "region-points", (event) => {
          const feature = event.features?.[0];
          const props = feature?.properties;
          if (!props) {
            return;
          }

          const regionId = readString(props, "id");
          if (regionId) {
            onRegionSelectRef.current?.(regionId);
          }
        });
      });
    };

    void initMap();

    return () => {
      disposed = true;
      popupRef.current?.remove();
      popupRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const source = map.getSource(SOURCE_ID) as MapSourceLike | undefined;
    source?.setData(featureCollection);
  }, [featureCollection]);

  return (
    <div className={cn("relative h-full min-h-[300px] w-full", className)}>
      <div
        ref={containerRef}
        className="h-full min-h-[300px] w-full overflow-hidden rounded-xl border border-white/10"
      />
      <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/15 bg-slate-900/70 px-2.5 py-1 text-[11px] text-slate-300">
        {provider === "mapbox" ? "Mapbox" : provider === "maplibre" ? "MapLibre fallback" : "Loading map"}
      </div>
    </div>
  );
}
