const genAI = require("../config/geminiClient");

const expandQueryWithAI = async (userQuery) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
You are an AI assistant helping users find travel destinations in a recommendation app.

The app supports the following **categories**:
- Historical
- Cafe
- Adventure
- Romantic
- Shopping
- Religious
- Cultural
- Entertainment
- Nightlife
- Family-friendly

It also supports these **tags**:
Romantic, Family-Friendly, Budget-Friendly, Luxury, Near Metro, Peaceful, Photogenic, Nature, Historical, Night Views.

A user entered the following search query: "${userQuery}"

Your job is to expand this query into a comma-separated list of relevant search keywords or synonyms **that match the above categories or tags**. Only return that list. No explanations or extra text.
`;


    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const keywords = text
      .split(",")
      .map((word) => word.trim().toLowerCase())
      .filter(Boolean);

    return keywords;
  } catch (error) {
    console.error("🔍 AI Query Expansion Error:", error.message);
    return [];
  }
};

module.exports = { expandQueryWithAI };
