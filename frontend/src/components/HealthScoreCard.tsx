import { motion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { HealthScore } from "../types/dataset";

const METRICS: { key: keyof Omit<HealthScore, "overall">; label: string }[] = [
  { key: "missing_values", label: "Missing Values" },
  { key: "data_quality", label: "Data Quality" },
  { key: "prediction_readiness", label: "Prediction Readiness" },
  { key: "feature_quality", label: "Feature Quality" },
];

const COLORS = ["#93C998", "#7ab37f", "#a8d9a8", "#6a9b6f"];

interface Props {
  health: HealthScore;
}

export default function HealthScoreCard({ health }: Props) {
  const pieData = [{ name: "score", value: health.overall }, { name: "rest", value: 100 - health.overall }];

  return (
    <motion.div
      className="glass p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="font-display text-sm tracking-widest text-nexora-dark/40 uppercase mb-4">
        Dataset Health Score
      </h3>

      <motion.div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-36 h-36">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={64}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
              >
                <Cell fill="url(#healthGrad)" />
                <Cell fill="#f3f3f2" />
              </Pie>
              <defs>
                <linearGradient id="healthGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#93C998" />
                  <stop offset="52%" stopColor="#7ab37f" />
                  <stop offset="100%" stopColor="#a8d9a8" />
                </linearGradient>
              </defs>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-bold text-nexora-dark">{health.overall}</span>
            <span className="text-xs text-nexora-dark/40">/ 100</span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-3">
          {METRICS.map(({ key, label }, i) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-nexora-dark/60">{label}</span>
                <span className="font-mono text-nexora-dark font-semibold">{health[key]}</span>
              </div>
              <div className="h-1.5 bg-nexora-accent/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${health[key]}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
