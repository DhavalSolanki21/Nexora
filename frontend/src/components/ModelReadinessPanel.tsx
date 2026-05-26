import { motion } from "framer-motion";
import { Ban, CheckCircle2, Layers3 } from "lucide-react";
import type { ModelEligibilityFinding } from "../types/dataset";

interface Props {
  findings: ModelEligibilityFinding[];
}

export default function ModelReadinessPanel({ findings }: Props) {
  return (
    <motion.section
      className="glass p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.28 }}
    >
      <div className="flex items-center gap-2 mb-5">
        <Layers3 className="w-4 h-4 text-blue-600" />
        <h3 className="font-display text-sm tracking-widest text-gray-400 uppercase">
          Model Readiness
        </h3>
      </div>
      <div className="space-y-4">
        {findings.map((finding) => (
          <div key={finding.task} className="flex gap-3">
            {finding.eligible ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" />
            ) : (
              <Ban className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 capitalize">{finding.task}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{finding.reason}</p>
              {finding.target_candidates.length > 0 && (
                <p className="text-xs text-blue-700 mt-1.5 truncate" title={finding.target_candidates.join(", ")}>
                  Targets: {finding.target_candidates.join(", ")}
                </p>
              )}
              {finding.model_examples.length > 0 && (
                <p className="text-[11px] text-gray-400 mt-1">
                  Starts with {finding.model_examples.join(", ")}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
