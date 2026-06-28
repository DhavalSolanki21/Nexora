import { motion } from 'framer-motion';
import { Check, Circle } from 'lucide-react';
import type { PreprocessStep } from '../types/pipeline';

interface Props {
  steps: PreprocessStep[];
  pending?: boolean;
}

export default function PreprocessSteps({ steps, pending }: Props) {
  return (
    <div className="space-y-2">
      {steps.map((s, i) => (
        <motion.div
          key={`${s.step}-${i}`}
          className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: pending ? 0 : i * 0.05 }}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
              pending
                ? 'bg-gray-100 border border-gray-200'
                : 'bg-emerald-100 border border-emerald-300'
            }`}
          >
            {pending ? (
              <Circle className="w-3 h-3 text-gray-400" />
            ) : (
              <Check className="w-3 h-3 text-emerald-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 font-mono">{s.step.replace(/_/g, ' ')}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.detail}</p>
          </div>
          {!pending && s.affected_rows_or_cols > 0 && (
            <span className="text-xs font-mono text-emerald-600 shrink-0">
              {s.affected_rows_or_cols}
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
