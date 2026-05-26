import { motion } from "framer-motion";
import { Brain, Tags, TrendingUp, Clock, Layers } from "lucide-react";
import type { ProblemDetection } from "../types/pipeline";

const ICONS: Record<string, typeof Tags> = {
  classification: Tags,
  regression: TrendingUp,
  time_series: Clock,
  clustering: Layers,
};

interface Props {
  detection: ProblemDetection;
  featureCount: number;
}

export default function ProblemTypeCard({ detection, featureCount }: Props) {
  const Icon = ICONS[detection.problem_type] ?? Brain;

  return (
    <motion.div
      className="glass p-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="font-display text-sm tracking-widest text-gray-400 uppercase mb-4">
        Problem Type Detector
      </h3>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 text-emerald-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xl font-display text-gray-800 capitalize">
              {detection.problem_type.replace("_", " ")}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {Math.round(detection.confidence * 100)}% confidence
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Target <span className="font-mono text-emerald-600">{detection.target_column}</span>
            {" · "}
            {detection.unique_values} unique values
            {" · "}
            {featureCount} features selected
          </p>
          <ul className="mt-3 space-y-1">
            {detection.hints.map((h, i) => (
              <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">→</span>
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
