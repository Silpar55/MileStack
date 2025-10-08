import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY environment variable is not set");
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};
