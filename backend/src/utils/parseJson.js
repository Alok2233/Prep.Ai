// src/utils/parseJson.js

export function extractJson(text) {
  if (!text || typeof text !== "string") {
    throw new Error("No text provided to extractJson");
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No JSON object found in AI response");
  }

  const jsonString = text.slice(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("JSON parse failed. Raw text:", text);
    throw new Error("Invalid JSON returned by AI");
  }
}
