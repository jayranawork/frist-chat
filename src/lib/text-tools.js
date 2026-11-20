import { generateText } from "./ollama.js";
import { ApiError } from "./api-error.js";

const operations = {
  summarize: {
    instruction: "Summarize the user's text clearly and briefly.",
    key: "summary",
  },
  explain: {
    instruction: "Explain the user's text simply for a beginner.",
    key: "explanation",
  },
  rewrite: {
    instruction: "Rewrite the user's text clearly while preserving its meaning.",
    key: "rewritten",
  },
};

export async function runTextTool(operation, body) {
  if (typeof body.text !== "string" || !body.text.trim()) {
    throw new ApiError("The request must include a non-empty text field", 400);
  }

  if (operation === "extract") {
    const result = await generateText(
      "Extract the important information from the user's text. Return JSON only.",
      body.text,
      { format: "json" },
    );

    try {
      return { data: JSON.parse(result) };
    } catch {
      throw new ApiError("The model did not return valid JSON", 502);
    }
  }

  if (operation === "classify") {
    const categories = body.categories || "positive, negative, neutral";
    const category = await generateText(
      `Classify the user's text into one of these categories: ${categories}. Return only the category name.`,
      body.text,
    );
    return { category };
  }

  const selectedOperation = operations[operation];
  if (!selectedOperation) throw new ApiError("Endpoint not found", 404);

  const result = await generateText(selectedOperation.instruction, body.text);
  return { [selectedOperation.key]: result };
}
