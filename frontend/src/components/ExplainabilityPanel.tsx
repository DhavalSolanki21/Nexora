import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Loader2,
  FileDown,
  BarChart3,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  runExplainability,
  generateReport,
  getReportDownloadUrl,
  type ExplainabilityResult,
} from "../api/client";

const GRADIENT_COLORS = [
  "#10b981", "#0d9488", "#0f766e", "#059669", "#047857",
  "#34d399", "#2dd4bf", "#14b8a6", "#06b6d4", "#0891b2",
];

const cleanError = (message: string) => message.replace(/\x1b\[[0-9;]*m/g, "").slice(0, 260); // eslint-disable-line no-control-regex

interface Props {
  datasetId: string;
  problemType: string;
  bestModelId: string | null;
  bestModelName: string | null;
}

export default function ExplainabilityPanel({
  datasetId,
  problemType,
  bestModelId,
  bestModelName,
}: Props) {
  const [result, setResult] = useState<ExplainabilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportReady, setReportReady] = useState(false);
  const [expandedPlot, setExpandedPlot] = useState<string | null>(null);

  const handleExplain = async () => {
    if (!bestModelId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await runExplainability(datasetId, bestModelId);
      setResult(res);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Explainability analysis failed";
      setError(typeof msg === "string" ? cleanError(msg) : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async () => {
    setReportLoading(true);
    setError(null);
    try {
      const res = await generateReport(datasetId, true);
      if (res.pdf_base64) {
        // Convert base64 to blob and trigger download
        const byteChars = atob(res.pdf_base64);
        const byteNumbers = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNumbers[i] = byteChars.charCodeAt(i);
        }
        const blob = new Blob([byteNumbers], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.filename || `nexora_report_${datasetId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setReportReady(true);
      } else {
        window.location.href = getReportDownloadUrl(datasetId);
        setReportReady(true);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Report generation failed";
      setError(typeof msg === "string" ? cleanError(msg) : "Failed");
    } finally {
      setReportLoading(false);
    }
  };

  const togglePlot = (name: string) => {
    setExpandedPlot(expandedPlot === name ? null : name);
  };

  return (
    <div className="space-y-6">
      {/* Header + Actions */}
      <motion.div
        className="glass p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <Brain className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-display text-lg text-gray-800 tracking-wide">
                Model Explainability & Reports
              </h3>
              <p className="text-sm text-gray-500">
                {bestModelName
                  ? `Analyze "${bestModelName}" with SHAP · Generate PDF reports`
                  : "Complete training to unlock explainability"}
              </p>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleExplain}
              disabled={loading || !bestModelId}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Run SHAP Analysis
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleReport}
              disabled={reportLoading}
              className="btn-ghost border border-emerald-100 hover:border-emerald-300 disabled:opacity-50"
            >
              {reportLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating PDF…
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  Download PDF Report
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {reportReady && !error && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 text-emerald-600 text-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            PDF report downloaded successfully!
          </motion.div>
        )}
      </motion.div>

      {/* Results */}
      {result && (
        <AnimatePresence>
          {/* Metrics Summary */}
          <motion.div
            className="glass p-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              <h3 className="font-display text-sm tracking-widest text-gray-400 uppercase">
                Model Metrics — {result.model_name}
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(result.metrics).map(([key, val]) => (
                <div key={key} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">
                    {key}
                  </p>
                  <p className="font-mono text-lg text-emerald-600 font-semibold">
                    {key === "accuracy" ? `${(val * 100).toFixed(1)}%` : val.toFixed(4)}
                  </p>
                </div>
              ))}
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">
                  Test Samples
                </p>
                <p className="font-mono text-lg text-gray-800">{result.test_count}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">
                  Features
                </p>
                <p className="font-mono text-lg text-gray-800">{result.feature_count}</p>
              </div>
            </div>
          </motion.div>

          {/* Feature Importance Chart */}
          <motion.div
            className="glass p-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-emerald-500" />
              <h3 className="font-display text-sm tracking-widest text-gray-400 uppercase">
                Feature Importance (SHAP)
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={Math.max(200, result.feature_importance.length * 32)}>
              <BarChart
                data={result.feature_importance.slice(0, 12)}
                layout="vertical"
                margin={{ left: 12 }}
              >
                <XAxis
                  type="number"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis
                  type="category"
                  dataKey="feature"
                  width={140}
                  tick={{ fill: "#374151", fontSize: 10 }}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #a7f3d0",
                    borderRadius: 12,
                    fontSize: 12,
                    boxShadow: "0 12px 28px rgba(16,185,129,0.12)",
                  }}
                  formatter={(val: number) => [val.toFixed(6), "Mean |SHAP|"]}
                />
                <Bar dataKey="importance" radius={[0, 6, 6, 0]}>
                  {result.feature_importance.slice(0, 12).map((_, i) => (
                    <Cell key={i} fill={GRADIENT_COLORS[i % GRADIENT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Percentage table */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {result.feature_importance.slice(0, 12).map((f, i) => (
                <div
                  key={f.feature}
                  className="flex items-center gap-2 text-sm p-2 rounded bg-gray-50"
                >
                  <span className="font-mono text-xs text-gray-400 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-600 truncate block">{f.feature}</span>
                  </div>
                  <span
                    className="font-mono text-xs px-2 py-0.5 rounded-full"
                    style={{
                      color: GRADIENT_COLORS[i % GRADIENT_COLORS.length],
                      backgroundColor: `${GRADIENT_COLORS[i % GRADIENT_COLORS.length]}15`,
                    }}
                  >
                    {f.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* SHAP Visualizations */}
          {Object.keys(result.plots).length > 0 && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="font-display text-sm tracking-widest text-gray-400 uppercase px-1">
                Deep Visualizations
              </h3>
              {Object.entries(result.plots).map(([name, b64]) => {
                const titles: Record<string, string> = {
                  feature_importance: "Feature Importance Chart",
                  shap_summary: "SHAP Summary (Beeswarm)",
                  shap_bar: "SHAP Bar Chart",
                  prediction_distribution:
                    problemType === "classification" ? "Confusion Matrix" : "Actual vs Predicted",
                  residuals: "Residual Analysis",
                };
                const isExpanded = expandedPlot === name;

                return (
                  <motion.div key={name} className="glass overflow-hidden" layout>
                    <button
                      type="button"
                      onClick={() => togglePlot(name)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {titles[name] ?? name}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0">
                            <img
                              src={`data:image/png;base64,${b64}`}
                              alt={titles[name] ?? name}
                              className="w-full rounded-lg border border-gray-100"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <motion.div
          className="glass p-8 text-center border-dashed border-emerald-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Brain className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            Click <span className="text-emerald-600 font-medium">&quot;Run SHAP Analysis&quot;</span> to understand
            why your champion model makes the predictions it does.
          </p>
          <p className="text-gray-400 text-xs mt-2">
            SHAP (SHapley Additive exPlanations) reveals each feature&apos;s contribution.
          </p>
        </motion.div>
      )}
    </div>
  );
}
