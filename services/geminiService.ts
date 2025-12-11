import { GoogleGenAI, Type } from "@google/genai";
import { GiftIdea } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getGiftSuggestions = async (
  receiverName: string,
  interests: string
): Promise<GiftIdea[]> => {
  if (!apiKey) {
    console.warn("No API Key found. Returning mock data.");
    return [
      { title: "Cozy Scarf", description: "A warm wool scarf for winter.", priceRange: "$15 - $25" },
      { title: "Gourmet Chocolate", description: "A box of artisanal chocolates.", priceRange: "$20 - $30" },
      { title: "Holiday Mug", description: "A festive ceramic mug.", priceRange: "$10 - $15" },
    ];
  }

  try {
    const prompt = `Suggest 3 creative and thoughtful Christmas gift ideas for ${receiverName} who is interested in: ${interests}. 
    Keep the budget reasonable (under $100).
    Return the response as a JSON array of objects with title, description, and priceRange.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              priceRange: { type: Type.STRING },
            },
            required: ["title", "description", "priceRange"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as GiftIdea[];
  } catch (error) {
    console.error("Error fetching gift ideas:", error);
    return [];
  }
};

export const generateFestiveGreeting = async (name: string): Promise<string> => {
    if (!apiKey) return `Ho Ho Ho! Merry Christmas, ${name}!`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Write a very short, rhyming 2-line Christmas greeting for ${name} who is about to discover who they are being a Secret Santa for.`,
        });
        return response.text || `Merry Christmas, ${name}!`;
    } catch (e) {
        return `Merry Christmas, ${name}!`;
    }
}