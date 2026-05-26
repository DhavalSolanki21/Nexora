import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, AlertCircle, Loader2 } from "lucide-react";
import { uploadDataset } from "../api/client";

export default function UploadZone() {
  const navigate = useNavigate();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setError("Please upload a CSV file.");
        return;
      }

      setError(null);
      setUploading(true);
      setProgress(0);

      try {
        const result = await uploadDataset(file, setProgress);
        navigate(`/dataset/${result.dataset_id}`, {
          state: { analysis: result.analysis },
        });
      } catch (err: unknown) {
        let errorMsg = "Upload failed. Please try again.";
        
        if (err && typeof err === "object") {
          if ("detail" in err) {
            errorMsg = (err as any).detail;
          } else if ("message" in err) {
            errorMsg = (err as any).message;
          }
        } else if (err instanceof Error) {
          errorMsg = err.message;
        }
        
        setError(typeof errorMsg === "string" ? errorMsg : "Upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [navigate]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        className={`glass relative p-12 text-center cursor-pointer transition-all duration-300 border-2 border-dashed ${
          dragging ? "border-nexora-accent shadow-glow-green scale-[1.01] bg-nexora-accent/10" : "border-nexora-border"
        } ${uploading ? "pointer-events-none" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        whileHover={!uploading ? { scale: 1.005 } : {}}
      >
        <input
          type="file"
          accept=".csv"
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <Loader2 className="w-12 h-12 mx-auto text-nexora-accent animate-spin" />
              <p className="text-nexora-accent font-medium">Analyzing dataset intelligence...</p>
              <motion.div className="h-1.5 bg-nexora-accent/10 rounded-full overflow-hidden max-w-xs mx-auto">
                <motion.div
                  className="h-full bg-gradient-to-r from-nexora-accent to-nexora-accent-dark rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </motion.div>
              <p className="text-sm text-nexora-dark/40">{progress}%</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <motion.div
                className="w-16 h-16 mx-auto rounded-2xl bg-nexora-accent/10 border border-nexora-accent/30 flex items-center justify-center"
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                {dragging ? (
                  <FileSpreadsheet className="w-8 h-8 text-nexora-accent" />
                ) : (
                  <Upload className="w-8 h-8 text-nexora-accent" />
                )}
              </motion.div>
              <motion.div>
                <p className="text-lg text-nexora-dark font-medium">
                  Drop your CSV here or click to browse
                </p>
                <p className="text-sm text-nexora-dark/50 mt-2">
                  Nexora will automatically understand, profile, and suggest predictions
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-2 text-nexora-dark text-sm justify-center bg-nexora-accent/10 border border-nexora-accent/30 text-nexora-accent rounded-lg px-4 py-3"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
