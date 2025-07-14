import dotenv from "dotenv";
import { createOllama } from "ollama-ai-provider";

// Load environment variables once at the beginning
dotenv.config();

// Export all your environment variables
// Defaults to Ollama qwen2.5:1.5b - optimized for speed
// https://ollama.com/library/qwen2.5
export const modelName = process.env.MODEL_NAME_AT_ENDPOINT ?? "qwen2.5:1.5b";
export const baseURL = process.env.API_BASE_URL ?? "http://127.0.0.1:11434/api";

// Create and export the model instance with optimized settings for speed
export const model = createOllama({
  baseURL,
  fetch: undefined, // Use default fetch for better performance
}).chat(modelName, {
  simulateStreaming: true,
  // Optimized for faster responses and better context management
  maxTokens: 2048, // Reasonable response length
  temperature: 0.1, // Lower temperature for faster, more focused responses
  topP: 0.9, // Focused sampling
  frequencyPenalty: 0.1,
  presencePenalty: 0.1,
});

console.log(`ModelName: ${modelName}\nbaseURL: ${baseURL}`);
