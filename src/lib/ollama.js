import { ApiError } from "./api-error.js";

const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2";

async function requestOllama(path, options) {
  try {
    return await fetch(`${ollamaUrl}${path}`, options);
  } catch {
    throw new ApiError("Unable to connect to the Ollama service", 503);
  }
}

export async function generateChat(messages, options = {}) {
  const response = await requestOllama("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: ollamaModel,
      messages,
      stream: false,
      ...options,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.error || "Ollama request failed", 502);
  }

  return data.message?.content || "";
}

export async function streamChat(messages, options = {}) {
  const response = await requestOllama("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: ollamaModel,
      messages,
      stream: true,
      ...options,
    }),
  });

  if (!response.ok || !response.body) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.error || "Ollama streaming request failed", 502);
  }

  return response.body;
}

export async function generateText(instruction, text, options = {}) {
  return generateChat(
    [
      { role: "system", content: instruction },
      { role: "user", content: text },
    ],
    options,
  );
}
