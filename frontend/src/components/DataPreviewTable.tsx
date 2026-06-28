import { motion } from 'framer-motion';

interface Props {
  preview: Record<string, unknown>[];
  totalRows: number;
}

export default function DataPreviewTable({ preview, totalRows }: Props) {
  if (preview.length === 0) return null;

  const columns = Object.keys(preview[0]);

  return (
    <motion.div
      className="glass overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-display text-sm tracking-widest text-gray-400 uppercase">
          Dataset Preview
        </h3>
        <span className="text-xs text-gray-400 font-mono">
          Showing {preview.length} of {totalRows.toLocaleString()} rows
        </span>
      </div>
      <div className="overflow-x-auto max-h-80">
        <table className="w-full text-xs font-mono">
          <thead className="sticky top-0 bg-white/95 backdrop-blur">
            <tr className="text-left text-gray-400 border-b border-gray-100">
              {columns.map((col) => (
                <th key={col} className="px-4 py-3 font-medium whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                {columns.map((col) => (
                  <td
                    key={col}
                    className="px-4 py-2 text-gray-600 whitespace-nowrap max-w-[200px] truncate"
                  >
                    {row[col] == null ? (
                      <span className="text-gray-300 italic">null</span>
                    ) : (
                      String(row[col])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
