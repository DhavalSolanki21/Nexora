import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DatasetAnalysis } from "../types/dataset";

interface Props {
  analysis: DatasetAnalysis;
}

const COLORS = ["#4285f4", "#34a853", "#fbbc05", "#ea4335"];

export default function DatasetCharts({ analysis }: Props) {
  const roles = [
    { name: "Numeric", value: analysis.column_profiles.filter((column) => column.is_numeric).length },
    { name: "Category", value: analysis.column_profiles.filter((column) => column.is_categorical).length },
    { name: "Date", value: analysis.column_profiles.filter((column) => column.is_datetime).length },
    { name: "ID", value: analysis.column_profiles.filter((column) => column.is_id_like).length },
  ].filter((role) => role.value > 0);

  const correlations = Object.entries(analysis.stats.correlation)
    .flatMap(([left, entries]) =>
      Object.entries(entries)
        .filter(([right, value]) => left < right && value != null)
        .map(([right, value]) => ({
          pair: `${left} / ${right}`,
          label: `${compact(left)} | ${compact(right)}`,
          value: value as number,
          strength: Math.abs(value as number),
        }))
    )
    .sort((left, right) => right.strength - left.strength)
    .slice(0, 5);

  const outliers = Object.entries(analysis.stats.outlier_counts)
    .filter(([, count]) => count > 0)
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 8);

  return (
    <motion.section
      className="grid lg:grid-cols-[0.82fr_1.18fr_1fr] gap-6 mb-6"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.32 }}
    >
      <ChartPanel title="Column Roles">
        <ResponsiveContainer width="100%" height={218}>
          <PieChart>
            <Pie data={roles} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={2} isAnimationActive={false}>
              {roles.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel title="Strongest Relationships">
        {correlations.length > 0 ? (
          <ResponsiveContainer width="100%" height={218}>
            <BarChart data={correlations} layout="vertical" margin={{ left: 4, right: 12 }}>
              <XAxis type="number" domain={[0, 1]} tick={{ fill: "#6b7280", fontSize: 10 }} />
              <YAxis type="category" dataKey="label" width={116} tick={{ fill: "#374151", fontSize: 10 }} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(_, __, item) => [
                  (item.payload.value as number).toFixed(3),
                  "Correlation",
                ]}
              />
              <Bar dataKey="strength" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                {correlations.map((item) => (
                  <Cell key={item.pair} fill={item.value >= 0 ? "#4285f4" : "#ea4335"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart text="Two numeric columns are needed for relationship scoring." />
        )}
      </ChartPanel>

      <ChartPanel title="Outlier Signals">
        {outliers.length > 0 ? (
          <ResponsiveContainer width="100%" height={218}>
            <BarChart data={outliers} margin={{ left: 0, right: 8 }}>
              <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 10 }} interval={0} angle={-20} height={42} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [value, "Outliers"]} />
              <Bar dataKey="count" fill="#fbbc05" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart text="No numeric outlier signals detected." />
        )}
      </ChartPanel>
    </motion.section>
  );
}

function ChartPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="glass p-5 min-w-0">
      <h3 className="font-display text-xs tracking-widest text-gray-400 uppercase mb-3">{title}</h3>
      {children}
    </div>
  );
}

function EmptyChart({ text }: { text: string }) {
  return <div className="h-[218px] flex items-center text-center justify-center px-6 text-xs text-gray-400">{text}</div>;
}

const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #dbeafe",
  borderRadius: 8,
  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
};

function compact(name: string) {
  return name.length > 12 ? `${name.slice(0, 11)}...` : name;
}
