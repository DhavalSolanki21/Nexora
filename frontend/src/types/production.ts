export interface DeployableModelOption {
  model_id: string;
  model_name: string;
  family: string;
  speed: string;
  recommended: boolean;
}

export interface PredictionInputField {
  name: string;
  kind: "number" | "category" | "date" | "text";
  required: boolean;
  default: string | number | null;
  min_value: number | null;
  max_value: number | null;
  options: string[];
}

export interface DeployedModel {
  model_id: string;
  model_name: string;
  family: string;
  problem_type: string;
  metrics: Record<string, number>;
  primary_score: number;
  train_time_sec: number;
}

export interface ProductionStatus {
  dataset_id: string;
  target_column: string;
  problem_type: string;
  input_fields: PredictionInputField[];
  models: DeployedModel[];
  trained_at: string | null;
}

export interface ProductionModelsResponse {
  dataset_id: string;
  target_column: string;
  problem_type: string;
  available_models: DeployableModelOption[];
  eligibility_reason: string;
  limitations: string[];
  deployed: ProductionStatus | null;
}

export interface PredictionOutput {
  model_id: string;
  model_name: string;
  family: string;
  prediction: string | number;
  metrics: Record<string, number>;
  confidence: number | null;
  probabilities: Record<string, number>;
}

export interface PredictionReceipt {
  dataset_id: string;
  target_column: string;
  problem_type: string;
  submitted_inputs: Record<string, unknown>;
  assumed_inputs: Record<string, unknown>;
  warnings: string[];
  predictions: PredictionOutput[];
  consensus: string | number;
  consensus_label: string;
  created_at: string;
}
