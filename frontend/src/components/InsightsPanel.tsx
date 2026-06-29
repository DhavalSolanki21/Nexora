import { motion } from 'framer-motion';
import { Lightbulb, AlertTriangle, Gauge } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PreprocessResult } from '../types/pipeline';
import PreprocessSteps from './PreprocessSteps';

const LAB_COLORS = ['#10b981', '#34a853', '#fbbc05', '#ea4335', '#a142f4', '#00acc1'];

interface Props {
  result: PreprocessResult;
}

export default function InsightsPanel({ result }: Props) {
  const { insights, meta, steps } = result;
  const flowData = [
    { stage: 'Rows', before: meta.rows_before, after: meta.rows_after },
    { stage: 'Columns', before: meta.columns_before, after: meta.columns_after },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        className="glass p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-amber-600" />
          </div>
          <motion.div>
            <h3 className="font-display text-sm tracking-widest text-gray-400 uppercase mb-2">
              AI Dataset Insights
            </h3>
            <p className="text-gray-600 leading-relaxed">{insights.narrative}</p>
          </motion.div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          className="glass p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Gauge className="w-4 h-4 text-emerald-500" />
            <h3 className="font-display text-sm tracking-widest text-gray-400 uppercase">
              Prediction Difficulty
            </h3>
          </div>
          <div className="text-center">
            <span className="font-display text-5xl font-bold text-gray-900">
              {insights.estimated_difficulty}
            </span>
            <span className="text-gray-400 text-sm">/ 100</span>
            <p className="text-xs text-gray-400 mt-2">Higher = easier to model</p>
          </div>
        </motion.div>

        <motion.div
          className="glass p-6 lg:col-span-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h3 className="font-display text-sm tracking-widest text-gray-400 uppercase mb-4">
            Top Feature Correlations
          </h3>
          {insights.top_correlations.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={insights.top_correlations} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid stroke="#eef2f7" horizontal={false} />
                <XAxis type="number" domain={[0, 1]} tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="feature"
                  width={110}
                  tick={{ fill: '#374151', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #a7f3d0',
                    borderRadius: 12,
                    boxShadow: '0 12px 28px rgba(16,185,129,0.12)',
                  }}
                />
                <Bar dataKey="correlation" radius={[0, 6, 6, 0]}>
                  {insights.top_correlations.map((_, i) => (
                    <Cell key={i} fill={LAB_COLORS[i % LAB_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400">No numeric correlations available.</p>
          )}
        </motion.div>
      </div>

      <motion.div
        className="glass p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-display text-sm tracking-widest text-gray-400 uppercase">
              Data Flow Before vs After
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Shows how preprocessing changed the dataset before model training.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            {meta.feature_count} ready features
          </span>
        </div>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={flowData}>
            <CartesianGrid stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="stage" tick={{ fill: '#374151', fontSize: 11 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: '#ffffff',
                border: '1px solid #a7f3d0',
                borderRadius: 12,
                boxShadow: '0 12px 28px rgba(16,185,129,0.12)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="before" name="Before" fill="#0d9488" radius={[6, 6, 0, 0]} />
            <Bar dataKey="after" name="After" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {insights.class_balance.length > 0 && (
        <motion.div
          className="glass p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-display text-sm tracking-widest text-gray-400 uppercase mb-4">
            Class Balance
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={insights.class_balance}>
              <CartesianGrid stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="class" tick={{ fill: '#374151', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} unit="%" />
              <Tooltip
                contentStyle={{
                  background: '#ffffff',
                  border: '1px solid #a7f3d0',
                  borderRadius: 12,
                  boxShadow: '0 12px 28px rgba(16,185,129,0.12)',
                }}
              />
              <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                {insights.class_balance.map((_, i) => (
                  <Cell key={i} fill={LAB_COLORS[i % LAB_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {insights.quality_warnings.length > 0 && (
        <motion.div
          className="glass p-6 border-amber-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-medium text-amber-700">Data Quality Warnings</h3>
          </div>
          <ul className="space-y-2">
            {insights.quality_warnings.map((w, i) => (
              <li key={i} className="text-sm text-gray-500 flex gap-2">
                <span className="text-amber-500">!</span>
                {w}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      <motion.div className="grid lg:grid-cols-2 gap-6">
        <div className="glass p-6">
          <h3 className="font-display text-sm tracking-widest text-gray-400 uppercase mb-4">
            Pipeline Results
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-gray-400 text-xs">Rows</p>
              <p className="font-mono text-gray-800">
                {meta.rows_before} → {meta.rows_after}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-gray-400 text-xs">Columns</p>
              <p className="font-mono text-gray-800">
                {meta.columns_before} → {meta.columns_after}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 col-span-2">
              <p className="text-gray-400 text-xs">Features ready for training</p>
              <p className="font-mono text-emerald-600">{meta.feature_count}</p>
            </div>
          </div>
          <PreprocessSteps steps={steps} />
        </div>

        <div className="glass p-6 overflow-hidden">
          <h3 className="font-display text-sm tracking-widest text-gray-400 uppercase mb-4">
            Processed Preview
          </h3>
          <div className="overflow-x-auto max-h-64 text-xs font-mono">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100">
                  {result.preview[0] &&
                    Object.keys(result.preview[0])
                      .slice(0, 6)
                      .map((k) => (
                        <th key={k} className="px-2 py-2 text-left whitespace-nowrap">
                          {k}
                        </th>
                      ))}
                </tr>
              </thead>
              <tbody>
                {result.preview.slice(0, 8).map((row, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Object.keys(row)
                      .slice(0, 6)
                      .map((k) => (
                        <td key={k} className="px-2 py-1.5 text-gray-600 whitespace-nowrap">
                          {row[k] == null
                            ? '—'
                            : typeof row[k] === 'number'
                              ? (row[k] as number).toFixed(2)
                              : String(row[k])}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="glass p-6 text-center border-dashed border-emerald-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-gray-500 text-sm">
          Dataset is preprocessed and ready for{' '}
          <span className="text-emerald-600 font-medium">Model Battle Arena</span>
        </p>
      </motion.div>
    </div>
  );
}
