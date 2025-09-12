import fetch from "node-fetch";
import { classifyLog } from "./ruleBasedAI.js"; 
import dotenv from "dotenv";
dotenv.config();

const AI_API_KEY = process.env.AI_API_KEY;
const AI_API_URL = process.env.AI_API_URL || "https://api.openai.com/v1/completions";


export async function analyzeLog(message) {
  try {
    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: `Classify this log and give severity (1-10):\n\n${message}\n\nReturn JSON with keys category and severity.`,
        temperature: 0,
        max_tokens: 60
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.text || "";

    let aiResult;
    try {
      aiResult = JSON.parse(text);
    } catch {
      aiResult = null;
    }

    if (aiResult && aiResult.category && aiResult.severity) {
      return { category: aiResult.category, severity: aiResult.severity };
    } else {
      throw new Error("Invalid AI response");
    }

  } catch (err) {
    console.warn("AI service failed, using fallback rule-based classifyLog:", err.message);

    
    const ruleResult = await classifyLog({ level: "error", message });
    const severity = ruleResult.status === "critical" ? 9 : 3;

    return { category: ruleResult.ai_label, severity };
  }
}
