require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY;

const listGeminiModels = async () => {
  try {
    const fetch = (await import('node-fetch')).default;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );

    const data = await response.json();

    if (data.models) {
      console.log("✅ Available Gemini Models:");
      data.models.forEach((model) => {
        console.log(`- ${model.name}`);
      });
    } else {
      console.error("❌ No models found or invalid API key:");
      console.error(data);
    }
  } catch (error) {
    console.error("❌ Error listing models:", error.message);
  }
};

listGeminiModels();
