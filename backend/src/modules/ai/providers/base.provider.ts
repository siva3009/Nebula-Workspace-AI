export interface ChatProviderResponse {
  response: string;
  model: string;
  createdAt: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  fallbackUsed?: boolean;
  fallbackProvider?: string;
  providerUnavailable?: boolean;
  attemptedProviders?: string[];
}

export interface AiProvider {
  name: string;
  chat(prompt: string, model?: string): Promise<ChatProviderResponse>;
  checkHealth(): Promise<boolean>;
}
