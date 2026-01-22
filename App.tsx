
import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  User, 
  Send, 
  Mic, 
  Plus, 
  Search, 
  Moon, 
  Sun, 
  UserPlus, 
  Shield, 
  Mail, 
  X,
  Zap,
  BrainCircuit,
  MessageSquare,
  History,
  ChevronRight,
  ChevronLeft,
  Settings,
  Headphones,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Message, ModelType } from './types';
import { generateAIResponse } from './geminiService';

// --- المكونات الفرعية المصممة بدقة ---

const SidebarAction: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  onClick?: () => void;
  variant?: 'default' | 'danger';
  isDarkMode: boolean;
}> = ({ icon, label, onClick, variant = 'default', isDarkMode }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 text-sm transition-all duration-300 rounded-xl group
      ${variant === 'default' 
        ? (isDarkMode ? 'hover:bg-white/5 text-zinc-300' : 'hover:bg-zinc-100 text-zinc-700') 
        : (isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-600')}`}
  >
    <span className={`${variant === 'default' ? 'text-zinc-400 group-hover:text-black dark:group-hover:text-white' : 'text-zinc-400'} transition-colors`}>
      {icon}
    </span>
    <span className="font-semibold">{label}</span>
  </button>
);

const MessageItem: React.FC<{ message: Message; isDarkMode: boolean }> = ({ message, isDarkMode }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`group flex w-full mb-12 animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out`}>
      <div className={`flex max-w-[98%] md:max-w-[90%] items-start gap-5 ${isUser ? 'mr-auto flex-row-reverse' : 'ml-auto'}`}>
        {/* أفاتار أيقوني أنيق */}
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 group-hover:scale-105 mt-0.5
          ${isUser 
            ? (isDarkMode ? 'bg-zinc-800 text-zinc-100' : 'bg-zinc-100 text-zinc-900') 
            : (isDarkMode ? 'bg-white text-black' : 'bg-black text-white')}`}>
          {isUser ? <User size={18} strokeWidth={2} /> : <div className="font-black text-sm tracking-tighter">G</div>}
        </div>

        {/* محتوى الرسالة - نص صافي بأبعاد مريحة */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`text-[16px] leading-[1.8] font-medium whitespace-pre-wrap transition-colors
            ${isUser 
              ? (isDarkMode ? 'text-zinc-300' : 'text-zinc-600') 
              : (isDarkMode ? 'text-zinc-100' : 'text-zinc-900')}`}>
            {message.content}
          </div>
          
          {/* تذييل الرسالة (الموديل أو الوقت) بشكل شفاف جداً */}
          {!isUser && message.model && (
            <div className={`flex items-center gap-2 mt-3 opacity-20 group-hover:opacity-40 transition-opacity`}>
              <div className={`w-1 h-1 rounded-full ${isDarkMode ? 'bg-white' : 'bg-black'}`}></div>
              <span className="text-[9px] font-black uppercase tracking-[0.1em]">
                {message.model === ModelType.THINKER ? 'Advanced Thinker' : 'Instant Flash'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [modelType, setModelType] = useState<ModelType>(ModelType.FAST);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const phrases = [
    "كيف يمكنني مساعدتك اليوم؟",
    "ماذا يدور في ذهنك؟",
    "أنا هنا للإجابة على تساؤلاتك.",
    "هل نبدأ محادثة جديدة؟",
    "Goyln في خدمتك دائمًا."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const responseText = await generateAIResponse(input, modelType, history);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        model: modelType
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden transition-all duration-500 ease-in-out ${isDarkMode ? 'bg-[#000000] text-white' : 'bg-white text-zinc-900'}`}>
      
      {/* Header - Monochrome icons only */}
      <header className="fixed top-2 left-0 right-0 flex items-center justify-between px-4 z-40 pointer-events-none">
        {/* اليمين: أيقونة القائمة (3 شرط) */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className={`p-2.5 rounded-full transition-all pointer-events-auto shadow-sm backdrop-blur-md border border-transparent
            ${isDarkMode ? 'hover:bg-white/10 text-white/70 hover:text-white' : 'hover:bg-zinc-100 text-zinc-500 hover:text-black'}`}
        >
          <Menu size={22} strokeWidth={2.5} />
        </button>

        {/* اليسار: سهم يفتح قائمة الخيارات بالأبيض والأسود */}
        <div className="relative pointer-events-auto">
          <button 
            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            className={`p-2.5 rounded-full transition-all pointer-events-auto shadow-sm backdrop-blur-md border border-transparent
              ${isDarkMode ? 'hover:bg-white/10 text-white/50 hover:text-white' : 'hover:bg-zinc-100 text-zinc-400 hover:text-black'}
              ${isAccountMenuOpen ? 'rotate-180 opacity-100 text-black dark:text-white' : ''}`}
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>

          {/* القائمة المنسدلة من السهم - أيقونات فقط أبيض وأسود */}
          <div className={`absolute top-full left-0 mt-3 flex flex-col gap-3 p-1 transition-all duration-300 origin-top-left z-50 ${isAccountMenuOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 -translate-y-4 pointer-events-none'}`}>
            <button 
              onClick={() => { setIsLoginOpen(true); setIsAccountMenuOpen(false); }}
              className={`w-11 h-11 flex items-center justify-center backdrop-blur-xl border rounded-full shadow-xl transition-all hover:scale-110 active:scale-90
                ${isDarkMode ? 'bg-zinc-800/80 border-zinc-700/50 text-white' : 'bg-white/80 border-zinc-200 text-black'}`}
              title="تسجيل الدخول"
            >
              <User size={20} strokeWidth={2.5} />
            </button>
            <button 
              className={`w-11 h-11 flex items-center justify-center backdrop-blur-xl border rounded-full shadow-xl transition-all hover:scale-110 active:scale-90
                ${isDarkMode ? 'bg-zinc-800/80 border-zinc-700/50 text-white' : 'bg-white/80 border-zinc-200 text-black'}`}
              title="تحدث مباشر"
            >
              <Headphones size={20} strokeWidth={2.5} />
            </button>
            <button 
              className={`w-11 h-11 flex items-center justify-center backdrop-blur-xl border rounded-full shadow-xl transition-all hover:scale-110 active:scale-90
                ${isDarkMode ? 'bg-zinc-800/80 border-zinc-700/50 text-white' : 'bg-white/80 border-zinc-200 text-black'}`}
              title="الترقية للمدفوع"
            >
              <Sparkles size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      <div className={`fixed inset-0 z-50 transition-all duration-400 ${isSidebarOpen ? 'bg-black/60 visible opacity-100 backdrop-blur-sm' : 'invisible opacity-0'}`} onClick={() => setIsSidebarOpen(false)}>
        <aside 
          onClick={(e) => e.stopPropagation()}
          className={`absolute top-0 right-0 w-72 h-full shadow-2xl transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) transform 
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col
            ${isDarkMode ? 'bg-zinc-900 border-l border-zinc-800' : 'bg-white'}`}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-8">
              <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>Goyln AI</span>
              <button onClick={() => setIsSidebarOpen(false)} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5 text-zinc-500' : 'hover:bg-zinc-50 text-zinc-400'}`}>
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="relative group">
              <Search className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-zinc-600' : 'text-zinc-300'}`} size={16} />
              <input 
                type="text" 
                placeholder="البحث في السجل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pr-10 pl-3 py-3 rounded-xl text-xs font-medium focus:ring-1 outline-none transition-all
                  ${isDarkMode 
                    ? 'bg-zinc-800/50 text-white border-none focus:ring-white/10' 
                    : 'bg-zinc-50 text-zinc-900 border-none focus:ring-black/5'}`}
              />
            </div>
          </div>

          <nav className="flex-1 px-3 overflow-y-auto custom-scrollbar space-y-1">
            <SidebarAction isDarkMode={isDarkMode} icon={<MessageSquare size={17} />} label="دردشة جديدة" onClick={() => { setMessages([]); setIsSidebarOpen(false); }} />
            <SidebarAction isDarkMode={isDarkMode} icon={<UserPlus size={17} />} label="إضافة شخص للدردشة" />
            <SidebarAction isDarkMode={isDarkMode} icon={<History size={17} />} label="سجل المحادثات" />
          </nav>

          <div className={`p-4 border-t ${isDarkMode ? 'border-zinc-800' : 'border-zinc-100'}`}>
            <SidebarAction 
              isDarkMode={isDarkMode}
              icon={isDarkMode ? <Sun size={17} /> : <Moon size={17} />} 
              label={isDarkMode ? "الوضع النهاري" : "الوضع الليلي"} 
              onClick={() => setIsDarkMode(!isDarkMode)}
            />
            <SidebarAction isDarkMode={isDarkMode} icon={<Shield size={17} />} label="الخصوصية والحقوق" />
            <SidebarAction isDarkMode={isDarkMode} icon={<Mail size={17} />} label="اتصل بنا" />
            
            <div className={`mt-4 p-4 rounded-[22px] flex items-center gap-3 cursor-pointer transition-all active:scale-95
              ${isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-50 hover:bg-zinc-100'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg
                ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
                <User size={18} strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-[13px] truncate ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>زائر</p>
                <p className={`text-[10px] truncate ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>سجل دخولك الآن</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Main Container */}
      <main className="flex-1 flex flex-col pt-4 relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4">
          <div className="max-w-2xl mx-auto h-full flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-1000">
                <div className="relative h-24 w-full flex items-center justify-center overflow-hidden">
                  <h2 
                    key={phraseIndex}
                    className={`text-2xl md:text-3xl font-bold transition-all duration-700 animate-slide-up text-center px-4 tracking-tight
                      ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}
                  >
                    {phrases[phraseIndex]}
                  </h2>
                </div>
              </div>
            ) : (
              <div className="py-16">
                {messages.map(msg => <MessageItem key={msg.id} message={msg} isDarkMode={isDarkMode} />)}
                {isLoading && (
                  <div className="flex items-center gap-2 p-4 w-fit ml-auto">
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDarkMode ? 'bg-white/40' : 'bg-black/20'}`} />
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s] ${isDarkMode ? 'bg-white/40' : 'bg-black/20'}`} />
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.4s] ${isDarkMode ? 'bg-white/40' : 'bg-black/20'}`} />
                  </div>
                )}
                <div ref={messagesEndRef} className="h-32" />
              </div>
            )}
          </div>
        </div>

        {/* Floating Input Area - Monochrome */}
        <div className="absolute bottom-6 left-0 right-0 px-4 pointer-events-none">
          <div className="max-w-xl mx-auto w-full pointer-events-auto">
            <div className={`backdrop-blur-2xl border shadow-[0_15px_40px_rgba(0,0,0,0.12)] rounded-[28px] p-2 flex items-center gap-1 transition-all focus-within:shadow-2xl focus-within:scale-[1.01]
              ${isDarkMode 
                ? 'bg-zinc-900/80 border-zinc-800 focus-within:border-zinc-700' 
                : 'bg-white/80 border-zinc-200 focus-within:border-zinc-300'}`}>
              
              <div className="flex items-center px-1">
                <label className={`p-2.5 transition-all cursor-pointer rounded-full active:scale-90
                  ${isDarkMode ? 'text-zinc-500 hover:text-white hover:bg-white/10' : 'text-zinc-400 hover:text-black hover:bg-zinc-100'}`}>
                  <Plus size={20} strokeWidth={2.5} />
                  <input type="file" className="hidden" />
                </label>
                <button className={`p-2.5 transition-all rounded-full active:scale-90
                  ${isDarkMode ? 'text-zinc-500 hover:text-white hover:bg-white/10' : 'text-zinc-400 hover:text-black hover:bg-zinc-100'}`}>
                  <Mic size={20} strokeWidth={2.5} />
                </button>
              </div>

              <textarea 
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                placeholder="تحدث معي..."
                className={`flex-1 bg-transparent py-3 px-2 text-[15px] font-medium outline-none border-none resize-none overflow-hidden max-h-32 
                  ${isDarkMode ? 'text-zinc-100 placeholder-zinc-600' : 'text-zinc-900 placeholder-zinc-400'}`}
              />

              {/* Model Micro-Switcher - Monochrome */}
              <div className={`flex items-center p-1 rounded-full border mx-1
                ${isDarkMode ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-zinc-50 border-zinc-200'}`}>
                <button 
                  onClick={() => setModelType(ModelType.FAST)}
                  className={`p-1.5 rounded-full transition-all shadow-sm ${modelType === ModelType.FAST ? (isDarkMode ? 'bg-white text-black' : 'bg-black text-white') : 'text-zinc-400 hover:text-zinc-500'}`}
                  title="سريع"
                >
                  <Zap size={14} fill={modelType === ModelType.FAST ? "currentColor" : "none"} />
                </button>
                <button 
                  onClick={() => setModelType(ModelType.THINKER)}
                  className={`p-1.5 rounded-full transition-all shadow-sm ${modelType === ModelType.THINKER ? (isDarkMode ? 'bg-white text-black' : 'bg-black text-white') : 'text-zinc-400 hover:text-zinc-500'}`}
                  title="مفكر"
                >
                  <BrainCircuit size={14} />
                </button>
              </div>

              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`p-3 rounded-full transition-all flex items-center justify-center shadow-md
                  ${input.trim() && !isLoading 
                    ? (isDarkMode ? 'bg-white text-black hover:bg-zinc-200 active:scale-95' : 'bg-black text-white hover:bg-zinc-800 active:scale-95') 
                    : (isDarkMode ? 'bg-zinc-800 text-zinc-600' : 'bg-zinc-100 text-zinc-300')}`}
              >
                <Send size={18} strokeWidth={2.5} className="transform rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className={`rounded-[36px] w-full max-sm:w-[95%] max-w-sm p-10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative overflow-hidden text-center border
            ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
            <button onClick={() => setIsLoginOpen(false)} className={`absolute top-8 left-8 transition-colors ${isDarkMode ? 'text-zinc-600 hover:text-white' : 'text-zinc-300 hover:text-black'}`}>
              <X size={20} strokeWidth={2.5} />
            </button>
            <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center mx-auto mb-6 shadow-2xl font-black text-3xl transition-transform hover:rotate-3
              ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>G</div>
            <h3 className={`text-2xl font-black mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>تسجيل الدخول</h3>
            <p className={`text-[13px] mb-8 font-medium leading-relaxed ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>استمتع بكامل مميزات Goyln AI</p>
            
            <div className="space-y-3">
              <button className={`w-full py-4 px-6 border rounded-2xl flex items-center justify-center gap-3 font-bold text-sm transition-all hover:scale-[1.02] active:scale-95
                ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700' : 'bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50'}`}>
                المتابعة بواسطة جوجل
              </button>
              <button className={`w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-lg
                ${isDarkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}>
                البريد الإلكتروني
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
