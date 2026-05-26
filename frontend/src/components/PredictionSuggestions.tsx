import { motion } from "framer-motion";
import { Target, TrendingUp, Tags } from "lucide-react";
import type { PredictionSuggestion } from "../types/dataset";

const ICONS: Record<string, typeof Target> = {
  classification: Tags,
  regression: TrendingUp,
  clustering: Target,
};

interface Props {
  suggestions: PredictionSuggestion[];
}

export default function PredictionSuggestions({ suggestions }: Props) {
  if (suggestions.length === 0) {
    return (
      <motion.div className="glass p-6 text-gray-400 text-sm">
        No strong prediction targets detected yet. Select a column manually.
      </motion.div>
    );
  }

  return (
    <motion.div
      className="glass p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="font-display text-sm tracking-widest text-gray-400 uppercase mb-4">
        Suggested Targets
      </h3>
      <div className="space-y-3">
        {suggestions.map((s, i) => {
          const Icon = ICONS[s.problem_type] ?? Target;
          return (
            <motion.div
              key={s.target_column}
              className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-colors"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <motion.div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-800">{s.target_column}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {s.problem_type}
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    {Math.round(s.confidence * 100)}% confidence
                  </span>
                </motion.div>
                <p className="text-sm text-gray-500 mt-1">{s.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
