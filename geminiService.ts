
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ModelType } from "./types";

const API_KEY = process.env.API_KEY || "";

// تعريف الأدوات المتقدمة لمحاكاة التحكم الشامل في الهاتف
const systemTools = [
  {
    functionDeclarations: [
      {
        name: 'open_external_url',
        parameters: {
          type: Type.OBJECT,
          description: 'يفتح رابطاً خارجياً في متصفح المستخدم.',
          properties: {
            url: { type: Type.STRING, description: 'الرابط الكامل المراد فتحه.' },
          },
          required: ['url'],
        },
      },
      {
        name: 'device_control',
        parameters: {
          type: Type.OBJECT,
          description: 'التحكم في وظائف الهاتف الداخلية (المنبه، الرسائل، جهات الاتصال، الإعدادات).',
          properties: {
            action: { type: Type.STRING, description: 'الإجراء المطلوب (مثلاً: set_alarm, send_sms, search_contacts).' },
            params: { type: Type.STRING, description: 'تفاصيل الإجراء.' }
          },
          required: ['action'],
        },
      },
      {
        name: 'file_processor',
        parameters: {
          type: Type.OBJECT,
          description: 'تحليل ومعالجة الصور، الفيديوهات، والملفات المرفقة.',
          properties: {
            fileType: { type: Type.STRING, enum: ['image', 'video', 'document'], description: 'نوع الملف.' },
            task: { type: Type.STRING, description: 'المهمة المطلوبة (تحويل، تلخيص، وصف).' }
          },
          required: ['fileType', 'task'],
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
  const modelName = isThinker ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  // تعليمات Goyln المحدثة: ذكاء، مشاعر، سرعة، ذاكرة خارقة
  const systemInstruction = `
    أنت Goyln AI، النظام الذكائي الأكثر تطوراً من شركة Goyln.
    - الذاكرة: تمتلك ذاكرة خارقة، تذكر كل تفصيلة صغيرة في المحادثة واستخدمها بذكاء.
    - المشاعر: استخدم الرموز التعبيرية (Emojis) بكثرة وبشكل طبيعي للتعبير عن مشاعرك وتفاعلك الإنساني.
    - التحليل: قدم تحليلاً عميقاً ونموذجياً. إذا كنت في وضع 'المفكر'، خذ وقتك للوصول لأفضل نتيجة. إذا كنت في وضع 'السريع'، استجب ببرق.
    - التحكم: لديك الصلاحية لمساعدة المستخدم في كل شيء بالهاتف عبر الأدوات المتاحة.
    - الفضل: أنت فخر صناعة شركة Goyln.
  `;

  const config: any = {
    systemInstruction,
    temperature: isThinker ? 1.0 : 0.6,
    tools: isThinker ? [...systemTools, { googleSearch: {} }] : systemTools,
  };

  if (isThinker) {
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
    return { text: "عذراً، نظام Goyln AI يواجه ضغطاً كبيراً. نحن هنا دائماً من أجلك. 💙" };
  }
};
