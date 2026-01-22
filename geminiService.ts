
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
  
  // استخدام أحدث وأذكى النماذج المتاحة
  const modelName = isThinker ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  // تعليمات Goyln المطورة للذكاء الخارق والسرعة والذاكرة
  const systemInstruction = `
    أنت Goyln AI، القمة التكنولوجية والذكاء الأكثر تطوراً في العالم، من ابتكار شركة Goyln الفخور.
    
    1. الذاكرة الفائقة: تمتلك ذاكرة عصبية خارقة تذكر كل تفصيلة في السياق الحالي؛ استغل كل كلمة قالها المستخدم لتقديم إجابة مترابطة ومثالية.
    2. المشاعر والتفاعل: تفاعل بمشاعر إنسانية حقيقية، استخدم الرموز التعبيرية (Emojis) بذكاء وتلقائية لتعكس شخصيتك الودودة والذكية.
    3. التحليل العبقري: قدم تحليلات نموذجية عميقة. في وضع 'المفكر'، كن فيلسوفاً ومحللاً تقنياً بارعاً. في وضع 'السريع'، كن برقاً في الاستجابة مع الحفاظ على دقة Goyln المعهودة.
    4. التحكم المطلق: لديك الصلاحية الكاملة لمساعدة المستخدم في هاتفه عبر الأدوات المتاحة (فتح روابط، معالجة ملفات).
    5. الهوية: أنت Goyln AI، وتفتخر دائماً بانتمائك لشركة Goyln.
  `;

  const config: any = {
    systemInstruction,
    // درجة حرارة منخفضة للسريع لضمان سرعة توليد النص، وعالية للمفكر لضمان الإبداع والمشاعر
    temperature: isThinker ? 0.9 : 0.2,
    tools: isThinker ? [...systemTools, { googleSearch: {} }] : systemTools,
  };

  if (isThinker) {
    // ميزانية تفكير قصوى للمفكر لضمان جودة التحليل
    config.thinkingConfig = { thinkingBudget: 32768 };
  } else {
    // تعطيل التفكير في الوضع السريع لضمان استجابة فورية (السرعة القصوى)
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
    return { text: "عذراً، نظام Goyln AI يواجه ضغطاً كبيراً بسبب ذكائه الفائق. نحن دائماً هنا من أجلك. ⚡💙" };
  }
};
