import { motion } from "framer-motion";

export type WorkflowTab = "overview" | "configure" | "studio" | "preprocess" | "arena" | "insights";

const TABS: { id: WorkflowTab; label: string; step: number }[] = [
  { id: "overview", label: "Intelligence", step: 1 },
  { id: "configure", label: "Target", step: 2 },
  { id: "studio", label: "Predict", step: 3 },
  { id: "preprocess", label: "Pipeline", step: 4 },
  { id: "arena", label: "Compare", step: 5 },
  { id: "insights", label: "Explain", step: 6 },
];

interface Props {
  active: WorkflowTab;
  onChange: (tab: WorkflowTab) => void;
  maxUnlocked: WorkflowTab;
}

const ORDER: WorkflowTab[] = ["overview", "configure", "studio", "preprocess", "arena", "insights"];

function tabIndex(t: WorkflowTab) {
  return ORDER.indexOf(t);
}

export default function WorkflowTabs({ active, onChange, maxUnlocked }: Props) {
  const maxIdx = tabIndex(maxUnlocked);

  return (
    <motion.div className="flex gap-1 sm:gap-2 p-1.5 glass rounded-xl mb-8 overflow-x-auto">
      {TABS.map((tab) => {
        const idx = tabIndex(tab.id);
        const unlocked = idx <= maxIdx;
        const isActive = active === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            disabled={!unlocked}
            onClick={() => unlocked && onChange(tab.id)}
            className={`relative flex-1 min-w-[80px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              isActive
                ? "text-nexora-accent-dark font-semibold"
                : unlocked
                  ? "text-gray-500 hover:text-gray-700"
                  : "text-gray-300 cursor-not-allowed"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="tab-bg"
                className="absolute inset-0 bg-nexora-accent/10 border border-nexora-accent/30 rounded-lg"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10 font-mono text-[10px] text-nexora-accent/70 font-semibold">{tab.step}</span>
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </motion.div>
  );
}
