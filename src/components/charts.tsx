"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { formatGBP } from "@/lib/utils";

const COFFEE = "#6F4E37";
const TERRA = "#C5704A";
const CREAM = "#E8DCC9";
const PIE_COLORS = ["#6F4E37", "#C5704A", "#A87858", "#D2A679", "#E8DCC9"];

export function RevenueChart({ data }: { data: { day: string; total: number; count: number }[] }) {
  if (data.length === 0) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 6, right: 10, left: -14, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="day" tickFormatter={(d) => d.slice(5)} />
        <YAxis tickFormatter={(v) => "£" + v} width={50} />
        <Tooltip formatter={(v: number) => formatGBP(v)} labelFormatter={(l) => `Day ${l}`} />
        <Line type="monotone" dataKey="total" stroke={COFFEE} strokeWidth={2} dot={{ r: 3, fill: TERRA }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TopProductsChart({ data }: { data: { name: string; revenue: number }[] }) {
  if (data.length === 0) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tickFormatter={(v) => "£" + v} />
        <YAxis type="category" dataKey="name" width={90} />
        <Tooltip formatter={(v: number) => formatGBP(v)} />
        <Bar dataKey="revenue" fill={TERRA} radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TypeSplitChart({ data }: { data: { type: string; revenue: number }[] }) {
  if (data.length === 0) return <Empty />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="revenue"
          nameKey="type"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => formatGBP(v)} />
        <Legend verticalAlign="bottom" height={24} iconSize={8} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function Empty() {
  return (
    <div className="h-full flex items-center justify-center text-xs text-muted">
      No data yet.
    </div>
  );
}

// Re-export constants (consumed by analytics page for matching swatches)
export { COFFEE, TERRA, CREAM };
