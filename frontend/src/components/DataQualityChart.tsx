import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import type { DatasetAnalysis } from "../types/dataset";

interface Props {
  analysis: DatasetAnalysis;
}

export default function DataQualityChart({ analysis }: Props) {
  // Calculate quality metrics for each column
  const qualityData = analysis.column_profiles
    .slice(0, 12)
    .map((col) => ({
      name: col.name.length > 12 ? col.name.substring(0, 10) + ".." : col.name,
      completeness: 100 - col.missing_pct,
      uniqueness: Math.min(100, (col.unique_count / (analysis.rows || 1)) * 100),
      validity:
        col.is_numeric || col.is_categorical ? 95 : 85, // Estimate based on type
    }))
    .sort((a, b) => b.completeness - a.completeness);

  return (
    <motion.div
      className="glass p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <h3 className="font-display text-sm tracking-widest text-gray-400 uppercase mb-4">
        Data Quality Scorecard
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={qualityData} layout="vertical" margin={{ left: 100, right: 16 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 10 }} unit="%" />
          <YAxis
            type="category"
            dataKey="name"
            width={95}
            tick={{ fill: "#374151", fontSize: 9 }}
          />
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            formatter={(v: number) => `${v.toFixed(1)}%`}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
          <Bar dataKey="completeness" fill="#34a853" radius={[0, 4, 4, 0]} />
          <Bar dataKey="uniqueness" fill="#4285f4" radius={[0, 4, 4, 0]} />
          <Bar dataKey="validity" fill="#fbbc05" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
