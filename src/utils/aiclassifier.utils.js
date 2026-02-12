import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const classifyLogMessage = async (message) => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is missing. Skipping AI classification.");
    return {
      level: "info",
      category: "Unclassified",
      severity: 1,
      metadata: { note: "AI classification skipped (missing key)" }
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert log analysis AI. Analyze the following log message and provide a structured JSON response.
      
      Log Message: "${message}"

      Respond ONLY with valid JSON in the following format (no markdown, no backticks):
      {
        "level": "info" | "warning" | "error" | "critical",
        "category": "Network" | "Database" | "Security" | "Auth" | "Payment" | "Other",
        "severity": <number between 1 and 10, where 10 is most critical>,
        "metadata": { <any relevant extracted key-value pairs from the log> }
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up potential markdown formatting from the response
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const analysis = JSON.parse(cleanText);

    return {
      level: analysis.level || "info",
      category: analysis.category || "Unclassified",
      severity: analysis.severity || 1,
      metadata: analysis.metadata || {}
    };

  } catch (error) {
    console.error("Gemini AI classification error:", error);
    return {
      level: "info",
      category: "Error",
      severity: 1,
      metadata: { error: "AI classification failed" }
    };
  }
};
