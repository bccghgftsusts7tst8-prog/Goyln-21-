
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ModelType } from "./types";

const API_KEY = process.env.API_KEY || "";

export const generateAIResponse = async (
  prompt: string,
  modelType: ModelType,
  history: { role: 'user' | 'assistant', content: string }[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // اختيار الموديل بناءً على رغبة المستخدم
  // الموديل السريع: gemini-3-flash-preview
  // الموديل المفكر: gemini-3-pro-preview مع ميزانية تفكير
  const modelName = modelType === ModelType.THINKER ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const config: any = {
    temperature: modelType === ModelType.THINKER ? 0.4 : 0.8, // حرارة أقل للدقة، أعلى للإبداع السريع
  };

  if (modelType === ModelType.THINKER) {
    // تفعيل ميزانية التفكير للنماذج المتقدمة
    config.thinkingConfig = { thinkingBudget: 24576 };
  }

  const contents = history.map(h => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.content }]
  }));

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

    return response.text || "عذراً، لم أتمكن من الحصول على رد مفيد.";
  } catch (error) {
    console.error("Goyln AI Error:", error);
    return "حدث خطأ فني أثناء معالجة طلبك. يرجى التأكد من الاتصال والمحاولة مرة أخرى.";
  }
};
