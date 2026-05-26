import { motion } from "framer-motion";
import type { ColumnProfile } from "../types/dataset";

interface Props {
  profiles: ColumnProfile[];
}

export default function ColumnProfiles({ profiles }: Props) {
  return (
    <motion.div
      className="glass overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <div className="p-6 border-b border-gray-100">
        <h3 className="font-display text-sm tracking-widest text-gray-400 uppercase">
          Column Intelligence
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="px-6 py-3 font-medium">Column</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Missing</th>
              <th className="px-4 py-3 font-medium">Unique</th>
              <th className="px-4 py-3 font-medium">Tags</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p, i) => (
              <motion.tr
                key={p.name}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.02 * i }}
              >
                <td className="px-6 py-3 font-mono text-gray-800">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.dtype}</td>
                <td className="px-4 py-3">
                  <span className={p.missing_pct > 20 ? "text-amber-600 font-medium" : "text-gray-500"}>
                    {p.missing_pct}%
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{p.unique_count.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.is_numeric && <Tag label="numeric" color="green" />}
                    {p.is_categorical && <Tag label="categorical" color="blue" />}
                    {p.is_datetime && <Tag label="datetime" color="amber" />}
                    {p.is_id_like && <Tag label="id" color="gray" />}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  const colors: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    gray: "bg-gray-100 text-gray-500 border-gray-200",
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${colors[color]}`}>
      {label}
    </span>
  );
}
