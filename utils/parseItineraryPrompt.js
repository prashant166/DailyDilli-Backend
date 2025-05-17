const genAI = require("../config/geminiClient");

const parseItineraryPrompt = async (userPrompt) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
You're an intelligent travel assistant. Given a user's free-form query, extract structured values for building a personalized travel itinerary.

User Input: "${userPrompt}"

Respond ONLY in strict JSON with the following structure:

{
  "location": string,                  // e.g. "Delhi"
  "duration_in_hours": number,         // total duration available, like 6
  "category": string,                  // e.g. "historical", "shopping", "romantic"
  "budget": "low" | "medium" | "high" | "luxury",
  "mode_of_travel": "car" | "public" | "bike" | "walking",
  "tags": string[],                    // relevant tags like "monuments", "heritage", "market", "photogenic"
  "place_keywords": string[]           // partial or full place name mentions like ["sarojini", "qutub", "majnu"]
}

Defaults if missing:
- location: "Delhi"
- duration_in_hours: 3
- category: "photogenic"
- budget: "medium"
- mode_of_travel: "public"
- tags: []
- place_keywords: []

Return only valid JSON. Do NOT include any explanation or markdown code blocks.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    // 🧹 Clean up any accidental code formatting
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      location: parsed.location || "Delhi",
      duration_in_hours: parsed.duration_in_hours || 3,
      category: parsed.category || "photogenic",
      budget: parsed.budget || "medium",
      mode_of_travel: parsed.mode_of_travel || "public",
      tags: parsed.tags || [],
      place_keywords: parsed.place_keywords || [],
    };
  } catch (err) {
    console.error("Prompt parsing failed:", err.message);
    return {
      location: "Delhi",
      duration_in_hours: 3,
      category: "photogenic",
      budget: "medium",
      mode_of_travel: "public",
      tags: [],
      place_keywords: [],
    };
  }
};

module.exports = { parseItineraryPrompt };
