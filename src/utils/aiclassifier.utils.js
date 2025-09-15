import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

export const classifyLogMessage = async (message) => {
    const aiApiUrl = process.env.AI_API_URL;
    const apiKey = process.env.AI_API_KEY;

    try {
        const response = await axios.post(
            aiApiUrl,
            {
                model: "text-davinci-003",
                prompt: `Classify this log message into 'info', 'warning', or 'critical': "${message}"`,
                max_tokens: 10,
                temperature: 0
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        const classification = response.data.choices[0].text.trim();
        return { level: classification };
    } catch (error) {
        console.error('Error calling AI Classifier API:', error.response?.data || error.message);
        return { level: 'INFO', category: 'Unclassified' };
    }
};
