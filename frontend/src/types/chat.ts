export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply: string;
  model: string;
  ok: boolean;
}

export interface OllamaStatus {
  available: boolean;
  models: string[];
  configured_model: string;
  model_ready: boolean;
}
