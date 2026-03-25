import { GoogleGenAI, Type } from "@google/genai";
import { News } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const fetchExternalNews = async (): Promise<News[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Extraia as 10 notícias mais recentes do site https://www.bahiaativa.com.br/ incluindo título, um pequeno resumo do conteúdo, link da imagem (se houver) e a data da publicação.",
      config: {
        tools: [{ urlContext: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              photo: { type: Type.STRING },
              date: { type: Type.STRING },
              link: { type: Type.STRING }
            },
            required: ["title", "content", "date"]
          }
        }
      }
    });

    const news = JSON.parse(response.text || "[]") as News[];
    return news;
  } catch (error) {
    console.error("Error fetching external news:", error);
    return [];
  }
};
