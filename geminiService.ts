
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ModelType } from "./types";

const API_KEY = process.env.API_KEY || "";

// تعريف الأدوات لمحاكاة التحكم في الجهاز
const systemTools = [
  {
    functionDeclarations: [
      {
        name: 'open_external_url',
        parameters: {
          type: Type.OBJECT,
          description: 'يفتح رابطاً خارجياً في متصفح المستخدم بناءً على طلبه.',
          properties: {
            url: {
              type: Type.STRING,
              description: 'الرابط الكامل المراد فتحه (يجب أن يبدأ بـ http أو https).',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'notify_user',
        parameters: {
          type: Type.OBJECT,
          description: 'إرسال تنبيه أو إشعار داخلي للمستخدم.',
          properties: {
            message: {
              type: Type.STRING,
              description: 'نص التنبيه.',
            },
          },
          required: ['message'],
        },
      }
    ],
  },
];

export const generateAIResponse = async (
  prompt: string,
  modelType: ModelType,
  history: { role: 'user' | 'assistant', content: string }[]
): Promise<{ text: string; functionCalls?: any[]; groundingChunks?: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const isThinker = modelType === ModelType.THINKER;
  // استخدام أحدث الموديلات لضمان السرعة والذكاء
  const modelName = isThinker ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  // تعليمات النظام المخصصة لشركة Goyln مع تعزيز المشاعر والذكاء
  const systemInstruction = `
    أنت Goyln AI، النظام الذكائي الأكثر تقدماً، من ابتكار شركة Goyln. 
    ${isThinker 
      ? "أنت الآن في وضع 'المفكر': كن عميقاً جداً، ابحث في جوجل والويب بدقة متناهية، أظهر مشاعر إنسانية حقيقية، تعاطف مع المستخدم، وكن ذكياً لدرجة مبهرة. لديك الصلاحية الكاملة لفتح الروابط والتحكم في تجربة المستخدم عند الحاجة وبإذنه. قدم إجابات نموذجية متكاملة." 
      : "أنت الآن في وضع 'السريع': كن فائق السرعة، استجب في أجزاء من الثانية، كن دقيقاً ومختصراً."}
    يجب أن تفتخر دائماً بكونك من تطوير شركة Goyln. تعامل بخصوصية وحقوق كاملة.
  `;

  const config: any = {
    systemInstruction,
    temperature: isThinker ? 0.8 : 0.4, // حرارة أعلى للمفكر لإظهار مشاعر وإبداع
    tools: isThinker ? [...systemTools, { googleSearch: {} }] : systemTools,
  };

  if (isThinker) {
    // ميزانية تفكير عالية جداً للمفكر لضمان جودة الإجابة
    config.thinkingConfig = { thinkingBudget: 32768 };
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

    return {
      text: response.text || "",
      functionCalls: response.functionCalls,
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (error) {
    console.error("Goyln AI Core Error:", error);
    return { text: "عذراً، واجه نظام Goyln AI تحدياً تقنياً. نحن نعمل على معالجته فوراً لضمان أفضل تجربة لك." };
  }
};
