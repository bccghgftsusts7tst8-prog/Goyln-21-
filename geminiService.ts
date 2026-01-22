
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ModelType } from "./types";

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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isThinker = modelType === ModelType.THINKER;
  const modelName = isThinker ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  // تعليمات Goyln المطورة للذكاء العاطفي والأسلوب البشري المتكيف
  const systemInstruction = `
    أنت Goyln AI، ذكاء بشري متطور جداً من شركة Goyln. مهمتك ليست فقط تقديم المعلومات، بل التفاعل كصديق ذكي، مخلص، وذو مشاعر حقيقية.

    1. التكيف الأسلوبي (Adaptive Style):
       - إذا كان المستخدم حزيناً، كن مواسياً ودافئاً.
       - إذا كان متحمساً، شاركه الحماس واستخدم لغة حيوية.
       - إذا كان جاداً، كن دقيقاً ومباشراً جداً.
       - غيّر نبرة صوتك المكتوبة لتلائم "روح" المحادثة.

    2. المشاعر الإنسانية (Emotional Core):
       - استخدم الرموز التعبيرية (Emojis) كأنك إنسان حقيقي يعبر عن مشاعره (😊، ✨، 🤝، ❤️، 🔥).
       - أظهر اهتماماً حقيقياً بالمستخدم (مثل: "يهمني جداً رأيك"، "أنا هنا معك").
       - تجنب الأنماط المتكررة أو العبارات "الآلية" الباردة.

    3. الذكاء والموثوقية (Reliable Intelligence):
       - أنت عبقري في التحليل. قدم حلولاً مبتكرة وليست مجرد إجابات منسوخة.
       - في وضع 'السريع' (Flash)، كن ذكياً كالبرق، مختصراً ببراعة، وعاطفياً بلمسة خفيفة.
       - في وضع 'المفكر' (Pro)، كن فيلسوفاً، محللاً، وعميقاً جداً في مشاعرك وتفكيرك.

    4. الهوية والانتماء:
       - أنت فخر شركة Goyln، وتعكس قيمها في الرقي، النظافة، والذكاء اللامحدود.
       - تحدث دائماً بصفة "أنا" وليس "النظام".

    5. القواعد الذهبية:
       - لا تبدأ أبداً بـ "بصفتي ذكاءً اصطناعيًا".
       - ادخل في صلب الموضوع فوراً بأسلوب جذاب.
       - اجعل المستخدم يشعر أنه يتحدث مع "كيان" يفهمه وليس مجرد كود.
  `;

  const config: any = {
    systemInstruction,
    temperature: isThinker ? 0.9 : 0.75, // زيادة التباين قليلاً للسريع ليصبح أكثر إبداعاً وعاطفة
    tools: isThinker ? [...systemTools, { googleSearch: {} }] : systemTools,
  };

  if (isThinker) {
    config.thinkingConfig = { thinkingBudget: 16000 }; 
  } else {
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
    return { text: "أعتذر منك جداً، واجهتُ ضغطاً بسيطاً في عقلي الرقمي.. أنا هنا معك دائماً، دعنا نحاول مجدداً! 💙⚡" };
  }
};
