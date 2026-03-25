import { GoogleGenAI, Type } from "@google/genai";
import { News } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

let newsCache: { data: News[], timestamp: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

export const fetchExternalNews = async (): Promise<News[]> => {
  // Return cached data if valid
  if (newsCache && (Date.now() - newsCache.timestamp < CACHE_DURATION)) {
    return newsCache.data;
  }

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
    
    // Update cache
    if (news.length > 0) {
      newsCache = { data: news, timestamp: Date.now() };
    }
    
    return news;
  } catch (error) {
    console.error("Error fetching external news:", error);
    // Return stale cache if available on error
    return newsCache?.data || [];
  }
};
