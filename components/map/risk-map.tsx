"use client";

import mapboxgl, { GeoJSONSource } from "mapbox-gl";
import { useEffect, useMemo, useRef } from "react";
import { RegionInsight } from "@/lib/types";
import { cn, formatPercent, formatScore } from "@/lib/utils";

interface RiskMapProps {
  regions: RegionInsight[];
  onRegionSelect?: (regionId: string) => void;
  className?: string;
}

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

export function RiskMap({ regions, onRegionSelect, className }: RiskMapProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const featureCollection = useMemo(() => toFeatureCollection(regions), [regions]);

  useEffect(() => {
    if (!token || !containerRef.current || mapRef.current) {
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [18, 14],
      zoom: 1.15,
      projection: "mercator",
      attributionControl: false,
    });

    mapRef.current = map;
    popupRef.current = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 10,
      className: "risk-popup",
    });

    map.on("load", () => {
      map.addSource("regions", {
        type: "geojson",
        data: featureCollection,
      });

      map.addLayer({
        id: "risk-heat",
        type: "heatmap",
        source: "regions",
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
        source: "regions",
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
        source: "regions",
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
        if (!feature?.properties) {
          return;
        }
        if (!feature.geometry || feature.geometry.type !== "Point") {
          return;
        }

        const { name, risk, confidence, confidenceLabel, signalCount } = feature.properties as {
          name: string;
          risk: number;
          confidence: number;
          confidenceLabel: string;
          signalCount: number;
        };

        popupRef.current
          ?.setLngLat(feature.geometry.coordinates as [number, number])
          .setHTML(
            `<div style="font-family: system-ui; font-size: 12px; color: #dbeafe;">
              <div style="font-weight: 600; margin-bottom: 4px;">${name}</div>
              <div>Risk: ${formatScore(Number(risk))}</div>
              <div>Confidence: ${confidenceLabel} (${formatPercent(Number(confidence))})</div>
              <div>Signals: ${signalCount}</div>
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
        const regionId = feature?.properties?.id;
        if (typeof regionId === "string") {
          onRegionSelect?.(regionId);
        }
      });
    });

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [token, featureCollection, onRegionSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const source = map.getSource("regions") as GeoJSONSource | undefined;
    if (source) {
      source.setData(featureCollection);
    }
  }, [featureCollection]);

  if (!token) {
    return (
      <div
        className={cn(
          "flex h-full min-h-[280px] items-center justify-center rounded-xl border border-amber-300/30 bg-amber-400/10 p-5 text-center text-sm text-amber-100",
          className,
        )}
      >
        Add `NEXT_PUBLIC_MAPBOX_TOKEN` to `.env.local` to enable interactive map layers.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "h-full min-h-[300px] w-full overflow-hidden rounded-xl border border-white/10",
        className,
      )}
    />
  );
}
