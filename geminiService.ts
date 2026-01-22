
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ModelType } from "./types";

const API_KEY = process.env.API_KEY || "";

export const generateAIResponse = async (
  prompt: string,
  modelType: ModelType,
  history: { role: 'user' | 'assistant', content: string }[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // Use gemini-3-flash-preview for FAST, gemini-3-pro-preview for THINKER
  const modelName = modelType === ModelType.THINKER ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const config: any = {
    temperature: 0.7,
  };

  if (modelType === ModelType.THINKER) {
    // Enable thinking budget for Pro models
    config.thinkingConfig = { thinkingBudget: 16000 };
  }

  const contents = history.map(h => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.content }]
  }));

  // Add the current prompt
  contents.push({
    role: 'user',
    parts: [{ text: prompt }]
  });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents,
      config
    });

    return response.text || "عذراً، لم أتمكن من توليد استجابة.";
  } catch (error) {
    console.error("AI Error:", error);
    return "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. يرجى المحاولة لاحقاً.";
  }
};
