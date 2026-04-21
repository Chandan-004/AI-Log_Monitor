import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const classifyLogMessage = async (message) => {
  // Infer a dynamic fallback severity based on keywords in case the AI API is blocked by your network
  let fallbackSeverity = 1;
  const msgLower = message.toLowerCase();
  
  if (msgLower.includes('brute force') || msgLower.includes('critical') || msgLower.includes('fatal') || msgLower.includes('breach')) fallbackSeverity = 10;
  else if (msgLower.includes('error') || msgLower.includes('timeout') || msgLower.includes('fail') || msgLower.includes('mismatch')) fallbackSeverity = 8;
  else if (msgLower.includes('warning') || msgLower.includes('slow') || msgLower.includes('capacity')) fallbackSeverity = 5;

  let fallbackCategory = "System";
  if (msgLower.includes('login') || msgLower.includes('auth') || msgLower.includes('brute force')) fallbackCategory = "Security";
  else if (msgLower.includes('database') || msgLower.includes('query')) fallbackCategory = "Database";
  else if (msgLower.includes('payment') || msgLower.includes('transaction')) fallbackCategory = "Payment";

  if (!process.env.GEMINI_API_KEY) {
    return {
      level: fallbackSeverity >= 8 ? "error" : "info",
      category: fallbackCategory,
      severity: fallbackSeverity,
      metadata: { note: "AI skipped" }
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
        "metadata": {}
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const analysis = JSON.parse(cleanText);

    return {
      level: analysis.level || "info",
      category: analysis.category || fallbackCategory,
      severity: Number(analysis.severity) > 1 ? Number(analysis.severity) : fallbackSeverity,
      metadata: analysis.metadata || {}
    };

  } catch (error) {
    // This catches your local GoogleGenerativeAIError 
    console.error("Gemini AI classification error, actively using fallback logic.");
    return {
      level: fallbackSeverity >= 8 ? "error" : fallbackSeverity >= 5 ? "warning" : "info",
      category: fallbackCategory,
      severity: fallbackSeverity,
      metadata: { error: "AI classification network failure" }
    };
  }
};
