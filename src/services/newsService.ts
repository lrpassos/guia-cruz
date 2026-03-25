import { GoogleGenAI, Type } from "@google/genai";
import { News } from "../types";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. News service will be disabled.");
      return null;
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

let newsCache: { data: News[], timestamp: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

export const fetchExternalNews = async (): Promise<News[]> => {
  // Return cached data if valid
  if (newsCache && (Date.now() - newsCache.timestamp < CACHE_DURATION)) {
    return newsCache.data;
  }

  const ai = getAI();
  if (!ai) return getFallbackNews();

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
      return news;
    }
    
    return getFallbackNews();
  } catch (error) {
    console.error("Error fetching external news:", error);
    // Return stale cache if available on error
    return newsCache?.data || getFallbackNews();
  }
};

const getFallbackNews = (): News[] => {
  return [
    {
      id: 'f1',
      title: 'Guia Cruz: O seu portal de informações locais',
      content: 'Fique por dentro de tudo o que acontece na nossa cidade. Encontre empresas, serviços e as principais notícias em um só lugar.',
      date: new Date().toLocaleDateString('pt-BR'),
      photo: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'f2',
      title: 'Novas empresas cadastradas no Guia',
      content: 'Confira os novos estabelecimentos que acabaram de chegar ao nosso guia. Apoie o comércio local!',
      date: new Date().toLocaleDateString('pt-BR'),
      photo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80'
    }
  ];
};
