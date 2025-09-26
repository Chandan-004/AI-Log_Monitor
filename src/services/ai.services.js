import dotenv from "dotenv";
dotenv.config();


const AI_API_KEY = process.env.OPENAI_API_KEY;
const AI_API_URL = process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions";

export async function analyzeLog(message) {
  let aiResult = null;

  try {
    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5-nano",
        messages: [
          { role: "system", content: "Classify logs: category + severity (1-10), strict JSON only." },
          { role: "user", content: message }
        ],
        temperature: 0,
        max_tokens: 60
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim() || "";

    // Regex extraction of JSON
    const match = text.match(/\{[\s\S]*\}/);
    if (match) aiResult = JSON.parse(match[0]);

  } catch (err) {
    console.warn("AI failed, using rule-based fallback:", err.message);
  }

  // Fallback if AI fails
  if (!aiResult || !aiResult.category || !aiResult.severity) {
    const ruleResult = await classifyLog({ level: "error", message });
    const severity = ruleResult.status === "critical" ? 9 : 3;
    aiResult = { category: ruleResult.ai_label, severity };
  }

  // Full log object ready for email alert
  return {
    level: aiResult.severity >= 7 ? "critical" : "warning",
    message,
    category: aiResult.category,
    severity: aiResult.severity,
    source: "system",
    metadata: {}
  };
}
