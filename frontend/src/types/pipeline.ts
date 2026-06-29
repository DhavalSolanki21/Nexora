export type ProblemType = 'classification' | 'regression' | 'time_series' | 'clustering';

export interface ProblemDetection {
  problem_type: string;
  confidence: number;
  target_column: string;
  unique_values: number;
  hints: string[];
}

export interface FeatureSelection {
  feature_columns: string[];
  excluded_id_columns: string[];
  excluded_datetime_columns: string[];
}

import type { TrainingResult } from './training';

export interface DatasetSession {
  dataset_id: string;
  target_column: string | null;
  problem_type: string | null;
  problem_detection: ProblemDetection | null;
  feature_selection: FeatureSelection | null;
  status: 'analyzed' | 'configured' | 'preprocessed' | 'trained';
  preprocess_result: PreprocessResult | null;
  training_result?: TrainingResult | null;
}

export interface PreprocessStep {
  step: string;
  detail: string;
  affected_rows_or_cols: number;
}

export interface PreprocessMeta {
  rows_before: number;
  rows_after: number;
  columns_before: number;
  columns_after: number;
  feature_count: number;
  encoders: Record<string, string>;
  scalers: Record<string, string>;
}

export interface CorrelationInsight {
  feature: string;
  correlation: number;
}

export interface DatasetInsights {
  top_correlations: CorrelationInsight[];
  class_balance: { class: string; percentage: number }[];
  target_stats: Record<string, unknown>;
  quality_warnings: string[];
  estimated_difficulty: number;
  narrative: string;
  preprocessing_summary: string;
}

export interface PreprocessResult {
  steps: PreprocessStep[];
  meta: PreprocessMeta;
  insights: DatasetInsights;
  preview: Record<string, unknown>[];
  feature_columns: string[];
}

export interface ConfigureTargetResponse {
  session: DatasetSession;
  problem_detection: ProblemDetection;
  feature_selection: FeatureSelection;
}

export interface PreprocessResponse {
  session: DatasetSession;
  result: PreprocessResult;
}

export interface PreprocessOptions {
  missing_strategy?: string;
  outlier_method?: string;
  scaling?: 'standard' | 'minmax' | 'none';
  encode_categorical?: boolean;
  remove_duplicates?: boolean;
  remove_constant?: boolean;
  drop_id_columns?: boolean;
}
