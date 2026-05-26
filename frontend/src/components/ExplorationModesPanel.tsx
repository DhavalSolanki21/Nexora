import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Boxes, CalendarClock, Loader2, Play } from "lucide-react";
import {
  runClustering,
  runTimeSeries,
  type ClusteringResult,
  type TimeSeriesResult,
} from "../api/client";
import type { DatasetAnalysis } from "../types/dataset";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function ExplorationModesPanel({
  datasetId,
  analysis,
}: {
  datasetId: string;
  analysis: DatasetAnalysis;
}) {
  const [clusters, setClusters] = useState<ClusteringResult | null>(null);
  const [forecast, setForecast] = useState<TimeSeriesResult | null>(null);
  const [clusterCount, setClusterCount] = useState(3);
  const [dateColumn, setDateColumn] = useState("");
  const [targetColumn, setTargetColumn] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const numericColumns = analysis.column_profiles.filter((p) => p.is_numeric).map((p) => p.name);
  const dateColumns = analysis.column_profiles.filter((p) => p.is_datetime).map((p) => p.name);
  const fallbackDateOptions = analysis.column_profiles
    .filter((p) => p.name.toLowerCase().includes("date") || p.name.toLowerCase().includes("time"))
    .map((p) => p.name);
  const timeDateOptions = dateColumns.length ? dateColumns : fallbackDateOptions;

  const forecastChart = useMemo(() => {
    if (!forecast) return [];
    return [
      ...forecast.history.slice(-24).map((point) => ({ date: point.date, actual: point.value })),
      ...forecast.forecast.map((point) => ({ date: point.date, forecast: point.prediction })),
    ];
  }, [forecast]);

  const startClustering = async () => {
    setBusy("cluster");
    setError(null);
    try {
      setClusters(await runClustering(datasetId, { nClusters: clusterCount }));
    } catch (err: unknown) {
      setError(apiError(err, "Clustering failed."));
    } finally {
      setBusy(null);
    }
  };

  const startForecast = async () => {
    if (!dateColumn || !targetColumn) {
      setError("Choose date and numeric target columns for forecasting.");
      return;
    }
    setBusy("time");
    setError(null);
    try {
      setForecast(await runTimeSeries(datasetId, {
        dateColumn,
        targetColumn,
        periods: 12,
        frequency: "M",
      }));
    } catch (err: unknown) {
      setError(apiError(err, "Forecasting failed."));
    } finally {
      setBusy(null);
    }
  };

  return (
    <motion.section className="glass p-6 mb-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-5">
        <p className="text-[11px] uppercase tracking-widest text-emerald-600 font-mono mb-1">
          Additional Modeling Modes
        </p>
        <h3 className="font-display text-lg text-gray-900">Clustering & Time-Series Forecasting</h3>
        <p className="text-sm text-gray-500 mt-1">
          Run unsupervised segmentation or a simple dated numeric forecast directly from this dataset.
        </p>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="grid xl:grid-cols-2 gap-5">
        <div className="rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Boxes className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-medium text-gray-800">Clustering</h4>
          </div>
          <div className="flex gap-3">
            <select
              value={clusterCount}
              onChange={(event) => setClusterCount(Number(event.target.value))}
              className="h-10 rounded-lg border border-gray-200 px-3 text-sm"
            >
              {[2, 3, 4, 5, 6, 8].map((count) => (
                <option key={count} value={count}>{count} clusters</option>
              ))}
            </select>
            <button type="button" onClick={startClustering} disabled={busy === "cluster"} className="btn-primary py-2">
              {busy === "cluster" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run
            </button>
          </div>

          {clusters && (
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-3">
                Silhouette {clusters.metrics.silhouette?.toFixed(3) ?? "-"} · inertia {clusters.metrics.inertia?.toLocaleString() ?? "-"}
              </p>
              <div className="grid sm:grid-cols-2 gap-2">
                {clusters.clusters.map((cluster) => (
                  <div key={String(cluster.cluster)} className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                    <p className="text-sm text-gray-800">Cluster {String(cluster.cluster)}</p>
                    <p className="text-xs text-gray-400">
                      {String(cluster.size)} rows · {String(cluster.percentage)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-medium text-gray-800">Time-Series Forecast</h4>
          </div>
          <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-3">
            <select
              value={dateColumn}
              onChange={(event) => setDateColumn(event.target.value)}
              className="h-10 rounded-lg border border-gray-200 px-3 text-sm"
            >
              <option value="">Date column</option>
              {timeDateOptions.map((column) => (
                <option key={column} value={column}>{column}</option>
              ))}
            </select>
            <select
              value={targetColumn}
              onChange={(event) => setTargetColumn(event.target.value)}
              className="h-10 rounded-lg border border-gray-200 px-3 text-sm"
            >
              <option value="">Numeric target</option>
              {numericColumns.map((column) => (
                <option key={column} value={column}>{column}</option>
              ))}
            </select>
            <button type="button" onClick={startForecast} disabled={busy === "time"} className="btn-primary py-2">
              {busy === "time" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run
            </button>
          </div>

          {forecast && (
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-3">
                MAE {forecast.metrics.mae?.toLocaleString() ?? "-"} · R² {forecast.metrics.r2?.toFixed(3) ?? "-"}
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={forecastChart} margin={{ top: 8, right: 12, left: 0, bottom: 20 }}>
                  <CartesianGrid stroke="#eef2f7" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="actual" stroke="#4285f4" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="forecast" stroke="#34a853" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}

function apiError(error: unknown, fallback: string) {
  const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
  return typeof detail === "string" ? detail : fallback;
}

