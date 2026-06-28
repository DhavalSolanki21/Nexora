import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GitCompare, Loader2, Trophy } from 'lucide-react';
import { compareExperiments, getExperiments, type ExperimentRecord } from '../api/client';

export default function ExperimentPanel({ datasetId }: { datasetId: string }) {
  const [experiments, setExperiments] = useState<ExperimentRecord[]>([]);
  const [comparison, setComparison] = useState<{
    metric_names: string[];
    rows: Record<string, unknown>[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getExperiments(datasetId), compareExperiments(datasetId)])
      .then(([runs, compare]) => {
        setExperiments(runs);
        setComparison(compare);
      })
      .finally(() => setLoading(false));
  }, [datasetId]);

  if (loading) {
    return (
      <section className="glass p-6 flex justify-center text-emerald-600">
        <Loader2 className="w-5 h-5 animate-spin" />
      </section>
    );
  }

  return (
    <motion.section
      className="glass p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <GitCompare className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-display text-lg text-gray-900">Experiment Tracking</h3>
          <p className="text-sm text-gray-500">
            Training runs, production model versions, clustering, and forecasts.
          </p>
        </div>
      </div>

      {experiments.length === 0 ? (
        <p className="text-sm text-gray-400">
          No experiments recorded yet. Train models or run an exploration mode.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="py-3 pr-4">Run</th>
                <th className="py-3 pr-4">Kind</th>
                <th className="py-3 pr-4">Best Model</th>
                {comparison?.metric_names.slice(0, 4).map((metric) => (
                  <th key={metric} className="py-3 pr-4">
                    {metric}
                  </th>
                ))}
                <th className="py-3 pr-4">Config</th>
              </tr>
            </thead>
            <tbody>
              {comparison?.rows.map((row) => (
                <tr key={String(row.run_id)} className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-mono text-xs text-gray-400">
                    {String(row.run_id).slice(0, 8)}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-600">
                      {String(row.kind)}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-700">
                    <span className="inline-flex items-center gap-1">
                      {row.best_model ? <Trophy className="w-3 h-3 text-amber-500" /> : null}
                      {String(row.best_model ?? '-')}
                    </span>
                  </td>
                  {comparison.metric_names.slice(0, 4).map((metric) => (
                    <td key={metric} className="py-3 pr-4 font-mono text-gray-600">
                      {formatMetric(row[metric])}
                    </td>
                  ))}
                  <td className="py-3 pr-4 text-xs text-gray-400">
                    {configSummary(
                      experiments.find((exp) => exp.run_id === row.run_id)?.config ?? {},
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.section>
  );
}

function formatMetric(value: unknown) {
  if (typeof value === 'number')
    return Math.abs(value) <= 1 ? value.toFixed(4) : value.toLocaleString();
  return value == null ? '-' : String(value);
}

function configSummary(config: Record<string, unknown>) {
  const entries = Object.entries(config).slice(0, 3);
  if (!entries.length) return '-';
  return entries.map(([key, value]) => `${key}=${String(value)}`).join(', ');
}
