import { motion } from 'framer-motion';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ColumnProfile } from '../types/dataset';

interface Props {
  profiles: ColumnProfile[];
}

export default function MissingValuesChart({ profiles }: Props) {
  const data = profiles
    .filter((p) => p.missing_pct > 0)
    .sort((a, b) => b.missing_pct - a.missing_pct)
    .slice(0, 12)
    .map((p) => ({ name: p.name, missing: p.missing_pct }));

  const chartData = data.length
    ? data
    : profiles.slice(0, 10).map((profile) => ({ name: profile.name, complete: 100 }));
  const dataKey = data.length ? 'missing' : 'complete';

  return (
    <motion.div
      className="glass p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <h3 className="font-display text-sm tracking-widest text-gray-400 uppercase mb-4">
        {data.length ? 'Missing Values by Column' : 'Complete Data Coverage'}
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            unit="%"
          />
          <YAxis
            type="category"
            dataKey="name"
            width={100}
            tick={{ fill: '#374151', fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
            formatter={(v: number) => [`${v}%`, data.length ? 'Missing' : 'Complete']}
          />
          <Bar dataKey={dataKey} radius={[0, 4, 4, 0]} opacity={0.9} isAnimationActive={false}>
            {chartData.map((_, i) => (
              <Cell
                key={i}
                fill={
                  data.length
                    ? i % 2 === 0
                      ? '#fbbc05'
                      : '#ea4335'
                    : i % 2 === 0
                      ? '#34a853'
                      : '#4285f4'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {!data.length && (
        <p className="text-xs text-gray-400 mt-2">
          No missing values detected in the visible columns.
        </p>
      )}
    </motion.div>
  );
}
