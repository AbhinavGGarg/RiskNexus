"use client";

import dynamic from "next/dynamic";
import type {
  ForceGraphProps,
  LinkObject,
  NodeObject,
} from "react-force-graph-2d";
import { type ReactElement, useMemo, useRef } from "react";
import { SYSTEM_DEPENDENCIES, SYSTEM_NODES } from "@/lib/constants";
import { SystemId } from "@/lib/types";
import { useContainerSize } from "@/hooks/use-container-size";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
}) as unknown as (props: ForceGraphProps<GraphNode, GraphLink>) => ReactElement;

interface GraphNode {
  id: SystemId;
  name: string;
  impact: number;
  highlighted: boolean;
  x?: number;
  y?: number;
}

interface GraphLink {
  source: SystemId;
  target: SystemId;
  strength: number;
}

function impactColor(impact: number) {
  if (impact >= 0.7) {
    return "#fb7185";
  }

  if (impact >= 0.4) {
    return "#f59e0b";
  }

  if (impact >= 0.2) {
    return "#fde047";
  }

  return "#67e8f9";
}

export function SystemGraph({
  nodeImpacts,
  highlightedNodes = [],
  className,
  height = 320,
  animateLinks = false,
}: {
  nodeImpacts: Partial<Record<SystemId, number>>;
  highlightedNodes?: SystemId[];
  className?: string;
  height?: number;
  animateLinks?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const size = useContainerSize(containerRef);

  const graphData = useMemo(() => {
    const highlightedSet = new Set(highlightedNodes);

    return {
      nodes: SYSTEM_NODES.map((node) => ({
        id: node.id,
        name: node.label,
        impact: nodeImpacts[node.id] ?? 0,
        highlighted: highlightedSet.has(node.id),
      })) as GraphNode[],
      links: SYSTEM_DEPENDENCIES.map((link) => ({
        source: link.source,
        target: link.target,
        strength: link.strength,
      })) as GraphLink[],
    };
  }, [highlightedNodes, nodeImpacts]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height }}
    >
      <ForceGraph2D
        graphData={graphData}
        width={size.width}
        height={height}
        backgroundColor="transparent"
        cooldownTicks={80}
        d3VelocityDecay={0.38}
        nodeRelSize={5}
        linkCurvature={0.08}
        linkDirectionalParticles={
          animateLinks
            ? (link: LinkObject<GraphNode, GraphLink>) =>
                Math.round((link.strength ?? 0) * 4)
            : 0
        }
        linkDirectionalParticleWidth={2}
        linkColor={(link: LinkObject<GraphNode, GraphLink>) => {
          const source = graphData.nodes.find((node) => node.id === link.source);
          const target = graphData.nodes.find((node) => node.id === link.target);
          const impact = Math.max(source?.impact ?? 0, target?.impact ?? 0);
          return impact > 0.45 ? "rgba(248,113,113,0.75)" : "rgba(103,232,249,0.35)";
        }}
        nodeCanvasObject={(
          node: NodeObject<GraphNode>,
          ctx: CanvasRenderingContext2D,
          globalScale: number,
        ) => {
          const typedNode = node;
          const radius = typedNode.highlighted ? 9 : 7;
          const fontSize = Math.max(10 / globalScale, 3);

          ctx.beginPath();
          ctx.arc(typedNode.x ?? 0, typedNode.y ?? 0, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = impactColor(typedNode.impact);
          ctx.fill();

          if (typedNode.highlighted) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = "rgba(255,255,255,0.85)";
            ctx.stroke();
          }

          ctx.font = `${fontSize}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "top";
          ctx.fillStyle = "#dbeafe";
          ctx.fillText(typedNode.name, typedNode.x ?? 0, (typedNode.y ?? 0) + radius + 3);
        }}
      />
    </div>
  );
}
