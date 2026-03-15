"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface RiskTrendPoint {
  label: string;
  risk: number;
  confidence: number;
  highRiskRegions: number;
}

export function RiskTrendChart({ data }: { data: RiskTrendPoint[] }) {
  return (
    <div className="h-60 w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <LineChart data={data} margin={{ top: 5, right: 12, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
          <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis
            domain={[0, 1]}
            tickFormatter={(value) => `${Math.round(value * 100)}%`}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
          />
          <Tooltip
            formatter={(value, name) => {
              const numericValue =
                typeof value === "number"
                  ? value
                  : typeof value === "string"
                    ? Number(value)
                    : 0;

              if (name === "highRiskRegions") {
                return [String(Math.round(numericValue)), "High-risk regions"];
              }

              return [
                `${Math.round(numericValue * 100)}%`,
                name === "risk" ? "Avg risk" : "Avg confidence",
              ];
            }}
            contentStyle={{
              background: "#0b1220",
              border: "1px solid rgba(148,163,184,0.2)",
              borderRadius: 10,
              color: "#e2e8f0",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="risk"
            stroke="#fb7185"
            strokeWidth={2.5}
            dot={false}
            name="risk"
          />
          <Line
            type="monotone"
            dataKey="confidence"
            stroke="#67e8f9"
            strokeWidth={2}
            dot={false}
            name="confidence"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
