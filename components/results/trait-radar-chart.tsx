"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

type TraitRadarChartProps = {
  data: Array<{
    trait: string;
    value: number;
  }>;
};

export function TraitRadarChart({ data }: TraitRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data}>
        <PolarGrid stroke="#fbcfe8" />
        <PolarAngleAxis dataKey="trait" tick={{ fill: "#4b5563", fontSize: 13 }} />
        <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
        <Radar dataKey="value" stroke="#ec4899" fill="#ec4899" fillOpacity={0.4} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
