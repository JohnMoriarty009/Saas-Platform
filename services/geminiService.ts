import { GoogleGenAI } from "@google/genai";
import { BTP_SYSTEM_PROMPT } from "../types";

// Initialize the client
// NOTE: API Key is injected via process.env.API_KEY as per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzePlan = async (
  prompt: string,
  context: string,
  base64Image: string,
  mimeType: string
): Promise<string> => {
  try {
    const fullPrompt = `CONTEXTE: ${context}\nDEMANDE: ${prompt}\nFORMAT: Tableaux Markdown impératifs.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            text: fullPrompt
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          }
        ]
      },
      config: {
        systemInstruction: BTP_SYSTEM_PROMPT,
        temperature: 0.2, // Low temperature for technical precision
      }
    });

    if (!response.text) {
      throw new Error("Aucune réponse générée par l'IA.");
    }

    return response.text;
  } catch (error) {
    console.error("Erreur Gemini:", error);
    throw error;
  }
};