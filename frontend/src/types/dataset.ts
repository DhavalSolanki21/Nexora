export interface ColumnProfile {
  name: string;
  dtype: string;
  missing_count: number;
  missing_pct: number;
  unique_count: number;
  is_numeric: boolean;
  is_categorical: boolean;
  is_datetime: boolean;
  is_id_like: boolean;
  sample_values: unknown[];
}

export interface HealthScore {
  missing_values: number;
  data_quality: number;
  prediction_readiness: number;
  feature_quality: number;
  overall: number;
}

export interface PredictionSuggestion {
  target_column: string;
  problem_type: string;
  confidence: number;
  description: string;
}

export interface ModelEligibilityFinding {
  task: string;
  eligible: boolean;
  reason: string;
  target_candidates: string[];
  model_examples: string[];
}

export interface DatasetStats {
  mean: Record<string, number | null>;
  median: Record<string, number | null>;
  std: Record<string, number | null>;
  skewness: Record<string, number | null>;
  correlation: Record<string, Record<string, number | null>>;
  outlier_counts: Record<string, number>;
}

export interface DatasetAnalysis {
  dataset_id: string;
  filename: string;
  rows: number;
  columns: number;
  duplicate_rows: number;
  memory_mb: number;
  column_profiles: ColumnProfile[];
  stats: DatasetStats;
  health: HealthScore;
  prediction_suggestions: PredictionSuggestion[];
  model_eligibility: ModelEligibilityFinding[];
  semantic_summary: string;
  preview: Record<string, unknown>[];
}

export interface UploadResponse {
  dataset_id: string;
  filename: string;
  message: string;
  analysis: DatasetAnalysis;
}
