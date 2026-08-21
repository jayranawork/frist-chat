import { generateText } from "./ollama.js";

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
    throw new Error("The request must include a non-empty text field");
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
      throw new Error("The model did not return valid JSON");
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
  if (!selectedOperation) throw new Error("Endpoint not found");

  const result = await generateText(selectedOperation.instruction, body.text);
  return { [selectedOperation.key]: result };
}
