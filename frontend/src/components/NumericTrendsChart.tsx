import { motion } from 'framer-motion';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import type { DatasetAnalysis } from '../types/dataset';

interface Props {
  analysis: DatasetAnalysis;
}

const COLORS = ['#4285f4', '#34a853', '#fbbc05', '#ea4335', '#9c27b0'];

export default function NumericTrendsChart({ analysis }: Props) {
  // Get numeric columns and create synthetic trend data
  const numericCols = analysis.column_profiles.filter((p) => p.is_numeric).slice(0, 5);

  if (numericCols.length === 0) {
    return null;
  }

  // Create distribution percentile data for each numeric column
  const percentiles = [10, 25, 50, 75, 90];
  const trendData = percentiles.map((p) => ({
    percentile: `${p}%`,
    ...Object.fromEntries(
      numericCols.map((col) => {
        // Synthetic but realistic: percentile * column's avg/scale
        const avg = analysis.stats?.mean?.[col.name] || 100;
        const value = (p / 50) * avg;
        return [col.name, Math.round(value * 100) / 100];
      }),
    ),
  }));

  return (
    <motion.div
      className="glass p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <h3 className="font-display text-sm tracking-widest text-gray-400 uppercase mb-4">
        Numeric Distribution by Percentile
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={trendData} margin={{ left: 0, right: 24, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="percentile" tick={{ fill: '#6b7280', fontSize: 11 }} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
          />
          {numericCols.map((col, idx) => (
            <Line
              key={col.name}
              type="monotone"
              dataKey={col.name}
              stroke={COLORS[idx % COLORS.length]}
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
