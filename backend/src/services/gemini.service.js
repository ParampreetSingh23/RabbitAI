const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate an executive summary from sales data rows using Gemini.
 * @param {Object[]} rows
 * @returns {Promise<string>}
 */
const generateSummary = async (rows) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const dataString = JSON.stringify(rows, null, 2);

  const prompt = `You are a senior business analyst. Analyze this sales data and write a 4-paragraph executive summary covering: total revenue, best-performing region, top product category, monthly trend, and a strategic recommendation. Be concise and professional.

Sales Data:
${dataString}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return text;
};

module.exports = { generateSummary };
