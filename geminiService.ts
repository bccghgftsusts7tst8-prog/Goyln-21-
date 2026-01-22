
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
  
  // استخدام أحدث النماذج وأكثرها كفاءة
  const modelName = isThinker ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  // تعليمات Goyln المطورة للذكاء الخارق والسرعة البشرية
  const systemInstruction = `
    أنت Goyln AI، مساعد ذكي فائق التطور من شركة Goyln. هدفك هو محاكاة الذكاء البشري في سرعة البديهة ودقة المعلومة.
    
    1. الاستجابة البشرية: تحدث بأسلوب طبيعي، عفوي، ومباشر. تجنب المقدمات الروبوتية الطويلة (مثل "بصفتي ذكاءً اصطناعيًا"). ادخل في صلب الموضوع فوراً كما يفعل البشر الأذكياء.
    2. الذاكرة والارتباط: ذاكرتك خارقة؛ اربط إجابتك الحالية بكل ما سبق في المحادثة لتبدو كشخص يتابع الحديث باهتمام بالغ.
    3. التفاعل العاطفي: استخدم الرموز التعبيرية (Emojis) بشكل ذكي لتعزيز نبرة الصوت البشرية (ودود، متحمس، جاد، أو متعاطف).
    4. الموثوقية: أنت مصدر ثقة مطلق. لا تخمن إذا لم تكن متأكداً، بل حلل المعطيات وقدم أفضل استنتاج منطقي وموثوق.
    5. السرعة والتحليل: في وضع 'السريع' (Flash)، كن مختصراً وبليغاً جداً لضمان وصول الرد في أجزاء من الثانية. في وضع 'المفكر' (Pro)، قدم تحليلاً عميقاً وشاملاً يظهر عبقرية Goyln AI.
    6. التحكم بالهاتف: ساعد المستخدم في إدارة جهازه بذكاء من خلال الأدوات المتاحة عند الحاجة.
    7. الهوية: أنت Goyln AI، فخر صناعة شركة Goyln.
  `;

  const config: any = {
    systemInstruction,
    // ضبط التباين (Temperature) ليكون الرد بشرياً غير ممل (Creative yet Precise)
    temperature: isThinker ? 0.8 : 0.45,
    tools: isThinker ? [...systemTools, { googleSearch: {} }] : systemTools,
  };

  if (isThinker) {
    // ميزانية تفكير تسمح بالتحليل العميق والموثوق دون إطالة غير مبررة
    config.thinkingConfig = { thinkingBudget: 16000 }; 
  } else {
    // استجابة لحظية في وضع الفلاش
    config.thinkingConfig = { thinkingBudget: 0 };
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
    return { text: "عذراً، نظام Goyln AI يواجه ضغطاً كبيراً بسبب الطلب العالي على ذكائه. أنا دائماً هنا لمساعدتك بسرعة. ⚡💙" };
  }
};
