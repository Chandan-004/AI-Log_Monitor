import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const classifyLogMessage = async (message) => {
  try {
    const response = await openai.responses.create({
      model: "gpt-5-nano",
      input: `Classify this log message into 'INFO', 'WARNING', or 'CRITICAL': "${message}"`,
      store: true
    });

    const classification = response.output[0].content[0].text.trim();
    return { level: classification };
  } catch (error) {
    console.error("AI classification error:", error);
    return { level: "INFO" };
  }
};
