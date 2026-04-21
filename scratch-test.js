import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
(async () => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = 'Return JSON {"severity": 8}';
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
  } catch(e) {
    console.error(e);
  }
})();
