import { randomUUID } from "node:crypto";
import { generateChat, streamChat } from "./ollama.js";
import { ApiError } from "./api-error.js";

const sessions = new Map();
const maxHistoryMessages = 12;

const systemPrompt = `
You are an advanced AI developer mentor.
Give accurate, practical answers and explain concepts clearly.
Use Markdown when it improves readability.
If the user asks for code, provide a complete useful example.
Never invent facts, names, relationships, dates, or current events.
If you are unsure or the information may have changed, say that you are not certain.
You do not have live web access, so do not pretend that you verified recent information.

About this application:
- It uses Next.js App Router, React, and JavaScript.
- It uses Next.js route handlers for the backend API.
- It uses Ollama with the llama3.2 model for local inference.
- It does not use Express, Kafka, MongoDB, TensorFlow, or PyTorch.
- Its API routes are /api/chat, /api/summarize, /api/explain, /api/rewrite, /api/extract, /api/classify, and /api/health.
When asked about this application's technology or endpoints, use only these facts.
`;

function getSession(sessionId) {
  if (!sessionId || !sessions.has(sessionId)) {
    const id = randomUUID();
    const messages = [{ role: "system", content: systemPrompt }];
    sessions.set(id, messages);
    return { id, messages };
  }

  return { id: sessionId, messages: sessions.get(sessionId) };
}

export async function sendChatMessage({ sessionId, message }) {
  if (typeof message !== "string" || !message.trim()) {
    throw new ApiError("The request must include a non-empty message field", 400);
  }

  const session = getSession(sessionId);
  session.messages.push({ role: "user", content: message.trim() });

  const messagesForModel = [
    session.messages[0],
    ...session.messages.slice(1).slice(-maxHistoryMessages),
  ];

  const reply = await generateChat(messagesForModel);
  session.messages.push({ role: "assistant", content: reply });

  sessions.set(session.id, [
    session.messages[0],
    ...session.messages.slice(1).slice(-maxHistoryMessages),
  ]);

  return { sessionId: session.id, reply };
}

export async function streamChatMessage({ sessionId, message }) {
  if (typeof message !== "string" || !message.trim()) {
    throw new ApiError("The request must include a non-empty message field", 400);
  }

  const session = getSession(sessionId);
  session.messages.push({ role: "user", content: message.trim() });

  const messagesForModel = [
    session.messages[0],
    ...session.messages.slice(1).slice(-maxHistoryMessages),
  ];
  const ollamaStream = await streamChat(messagesForModel);
  const reader = ollamaStream.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let assistantResponse = "";
  let pending = "";

  function enqueueLines(text, controller) {
    pending += text;
    const lines = pending.split("\n");
    pending = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      const chunk = JSON.parse(line);
      const content = chunk.message?.content || "";
      assistantResponse += content;
      controller.enqueue(encoder.encode(content));
    }
  }

  const stream = new ReadableStream({
    async pull(controller) {
      try {
        const { value, done } = await reader.read();

        if (done) {
          enqueueLines(decoder.decode(), controller);
          if (pending.trim()) enqueueLines("\n", controller);
          session.messages.push({ role: "assistant", content: assistantResponse });
          sessions.set(session.id, [
            session.messages[0],
            ...session.messages.slice(1).slice(-maxHistoryMessages),
          ]);
          controller.close();
          return;
        }

        enqueueLines(decoder.decode(value, { stream: true }), controller);
      } catch (error) {
        controller.error(error);
      }
    },
    cancel() {
      reader.cancel();
    },
  });

  return { sessionId: session.id, stream };
}

export function clearChat(sessionId) {
  if (sessionId) sessions.delete(sessionId);
  return { cleared: true };
}
