
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
  ArrowLeft,
  ExternalLink,
  Globe,
  Cpu
} from 'lucide-react';
import { Message, ModelType } from './types';
import { generateAIResponse } from './geminiService';

const SidebarAction: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  onClick?: () => void;
  variant?: 'default' | 'danger';
  isDarkMode: boolean;
}> = ({ icon, label, onClick, variant = 'default', isDarkMode }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3.5 text-sm transition-all duration-300 rounded-2xl group
      ${variant === 'default' 
        ? (isDarkMode ? 'hover:bg-white/5 text-zinc-300' : 'hover:bg-zinc-100 text-zinc-700') 
        : (isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-600')}`}
  >
    <span className={`${variant === 'default' ? 'text-zinc-400 group-hover:text-black dark:group-hover:text-white' : 'text-zinc-400'} transition-colors`}>
      {icon}
    </span>
    <span className="font-bold">{label}</span>
  </button>
);

const MessageItem: React.FC<{ message: Message; isDarkMode: boolean }> = ({ message, isDarkMode }) => {
  const isUser = message.role === 'user';
  const groundingLinks = (message as any).groundingChunks
    ?.filter((chunk: any) => chunk.web?.uri)
    ?.map((chunk: any) => chunk.web);

  return (
    <div className={`group flex w-full mb-16 animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out`}>
      <div className={`flex max-w-[96%] md:max-w-[88%] items-start gap-7 ${isUser ? 'mr-auto flex-row-reverse' : 'ml-auto'}`}>
        {/* أفاتار أيقوني فخم لـ Goyln */}
        <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center shrink-0 shadow-lg transition-all duration-700 group-hover:scale-110 mt-1
          ${isUser 
            ? (isDarkMode ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' : 'bg-zinc-100 text-zinc-900 border border-zinc-200') 
            : (isDarkMode ? 'bg-white text-black' : 'bg-black text-white')}`}>
          {isUser ? <User size={22} strokeWidth={1} /> : <div className="font-black text-xl tracking-tighter">G</div>}
        </div>

        <div className={`flex flex-col ${isUser ? 'items-end text-right' : 'items-start text-left'} flex-1`}>
          {/* النص الأساسي - أناقة بصرية مطلقة */}
          <div className={`text-[17.5px] leading-[1.9] font-medium whitespace-pre-wrap transition-all tracking-tight
            ${isUser 
              ? (isDarkMode ? 'text-zinc-400' : 'text-zinc-500') 
              : (isDarkMode ? 'text-zinc-100' : 'text-zinc-900')}`}>
            {message.content}
          </div>
          
          {/* روابط البحث المصدرية */}
          {!isUser && groundingLinks && groundingLinks.length > 0 && (
            <div className="flex flex-wrap gap-2.5 mt-6 animate-in fade-in slide-in-from-left-4 duration-1000">
              {groundingLinks.map((link: any, i: number) => (
                <a 
                  key={i}
                  href={link.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[11px] font-black border transition-all hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black
                    ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-400'}`}
                >
                  <Globe size={13} />
                  <span className="max-w-[150px] truncate">{link.title || 'Goyln Search Result'}</span>
                  <ExternalLink size={11} />
                </a>
              ))}
            </div>
          )}

          {/* تذييل الرسالة مع اسم الشركة */}
          {!isUser && (
            <div className={`flex items-center gap-4 mt-6 opacity-0 group-hover:opacity-40 transition-all duration-700`}>
              <div className={`h-[1px] w-12 ${isDarkMode ? 'bg-white' : 'bg-black'}`}></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                <Cpu size={12} />
                {message.model === ModelType.THINKER ? 'Goyln Thinker Pro' : 'Goyln Fast Light'}
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
    "كيف يمكن لـ Goyln مساعدتك؟",
    "ذكاء اصطناعي بلمسة إنسانية من Goyln.",
    "Goyln AI: فكر بعمق، استجب بسرعة.",
    "مستقبل الذكاء، بين يديك الآن.",
    "كل الفخر لشركة Goyln في هذا الابتكار."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleFunctionCalls = (calls: any[]) => {
    calls.forEach(call => {
      if (call.name === 'open_external_url') {
        const url = call.args.url;
        // محاكاة التحكم في الهاتف بفتح الروابط
        window.open(url, '_blank');
      } else if (call.name === 'notify_user') {
        alert(`Goyln AI System: ${call.args.message}`);
      }
    });
  };

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
      const result = await generateAIResponse(input, modelType, history);
      
      if (result.functionCalls) {
        handleFunctionCalls(result.functionCalls);
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.text,
        timestamp: new Date(),
        model: modelType,
        groundingChunks: result.groundingChunks
      } as any;
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden transition-all duration-1000 ease-in-out ${isDarkMode ? 'bg-[#000000] text-white' : 'bg-white text-zinc-900'}`}>
      
      <header className="fixed top-4 left-0 right-0 flex items-center justify-between px-6 z-40 pointer-events-none">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className={`p-3 rounded-2xl transition-all pointer-events-auto shadow-sm backdrop-blur-3xl border border-transparent
            ${isDarkMode ? 'hover:bg-white/10 text-white/60 hover:text-white' : 'hover:bg-zinc-100 text-zinc-500 hover:text-black'}`}
        >
          <Menu size={24} strokeWidth={2} />
        </button>

        <div className="relative pointer-events-auto">
          <button 
            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            className={`p-3 rounded-2xl transition-all pointer-events-auto shadow-sm backdrop-blur-3xl border border-transparent
              ${isDarkMode ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-zinc-100 text-zinc-400 hover:text-black'}
              ${isAccountMenuOpen ? 'rotate-180 text-black dark:text-white scale-110' : ''}`}
          >
            <ArrowLeft size={22} strokeWidth={2} />
          </button>

          <div className={`absolute top-full left-0 mt-4 flex flex-col gap-4 p-1 transition-all duration-500 origin-top-left z-50 ${isAccountMenuOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 -translate-y-6 pointer-events-none'}`}>
            <button 
              onClick={() => { setIsLoginOpen(true); setIsAccountMenuOpen(false); }}
              className={`w-12 h-12 flex items-center justify-center backdrop-blur-3xl border rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95
                ${isDarkMode ? 'bg-zinc-800/90 border-zinc-700/50 text-white' : 'bg-white/95 border-zinc-200 text-black'}`}
            >
              <User size={22} strokeWidth={2} />
            </button>
            <button className={`w-12 h-12 flex items-center justify-center backdrop-blur-3xl border rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 ${isDarkMode ? 'bg-zinc-800/90 border-zinc-700/50 text-white' : 'bg-white/95 border-zinc-200 text-black'}`}>
              <Headphones size={22} strokeWidth={2} />
            </button>
            <button className={`w-12 h-12 flex items-center justify-center backdrop-blur-3xl border rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 ${isDarkMode ? 'bg-zinc-800/90 border-zinc-700/50 text-white' : 'bg-white/95 border-zinc-200 text-black'}`}>
              <Sparkles size={22} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar - Goyln Identity */}
      <div className={`fixed inset-0 z-50 transition-all duration-700 ${isSidebarOpen ? 'bg-black/70 visible opacity-100 backdrop-blur-md' : 'invisible opacity-0'}`} onClick={() => setIsSidebarOpen(false)}>
        <aside 
          onClick={(e) => e.stopPropagation()}
          className={`absolute top-0 right-0 w-80 h-full shadow-2xl transition-transform duration-700 cubic-bezier(0.19, 1, 0.22, 1) transform 
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col
            ${isDarkMode ? 'bg-zinc-950 border-l border-zinc-900' : 'bg-white'}`}
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-12">
              <span className={`text-[12px] font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-zinc-700' : 'text-zinc-300'}`}>Goyln Systems</span>
              <button onClick={() => setIsSidebarOpen(false)} className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5 text-zinc-500' : 'hover:bg-zinc-50 text-zinc-400'}`}>
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="relative group">
              <Search className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-zinc-700 group-focus-within:text-white' : 'text-zinc-300 group-focus-within:text-black'}`} size={18} />
              <input 
                type="text" 
                placeholder="البحث في تاريخ Goyln AI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pr-12 pl-4 py-4 rounded-2xl text-[14px] font-bold focus:ring-1 outline-none transition-all
                  ${isDarkMode 
                    ? 'bg-zinc-900/50 text-white border-zinc-800 focus:ring-white/10' 
                    : 'bg-zinc-50 text-zinc-900 border-none focus:ring-black/5'}`}
              />
            </div>
          </div>
          <nav className="flex-1 px-5 overflow-y-auto custom-scrollbar space-y-2">
            <SidebarAction isDarkMode={isDarkMode} icon={<MessageSquare size={19} />} label="محادثة جديدة" onClick={() => { setMessages([]); setIsSidebarOpen(false); }} />
            <SidebarAction isDarkMode={isDarkMode} icon={<UserPlus size={19} />} label="إضافة شخص" />
            <SidebarAction isDarkMode={isDarkMode} icon={<History size={19} />} label="السجل الذكي" />
          </nav>
          <div className={`p-6 border-t ${isDarkMode ? 'border-zinc-900' : 'border-zinc-100'}`}>
            <SidebarAction isDarkMode={isDarkMode} icon={isDarkMode ? <Sun size={19} /> : <Moon size={19} />} label={isDarkMode ? "الوضع النهاري" : "الوضع الليلي"} onClick={() => setIsDarkMode(!isDarkMode)} />
            <SidebarAction isDarkMode={isDarkMode} icon={<Shield size={19} />} label="الخصوصية والذكاء" />
            <SidebarAction isDarkMode={isDarkMode} icon={<Mail size={19} />} label="تواصل مع Goyln" />
            <div className={`mt-8 p-5 rounded-[28px] flex items-center gap-5 cursor-pointer transition-all active:scale-95 border border-transparent hover:border-zinc-800 dark:hover:border-zinc-700
              ${isDarkMode ? 'bg-zinc-900/50' : 'bg-zinc-50'}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl font-black text-lg ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>G</div>
              <div className="flex-1 min-w-0">
                <p className={`font-black text-[15px] truncate ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>حساب Goyln</p>
                <p className={`text-[11px] truncate font-bold ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>تم التطوير بواسطة شركة Goyln</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <main className="flex-1 flex flex-col pt-6 relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar px-8">
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-1000">
                <div className="relative h-32 w-full flex items-center justify-center overflow-hidden">
                  <h2 
                    key={phraseIndex}
                    className={`text-3xl md:text-5xl font-black transition-all duration-1000 animate-slide-up text-center px-8 tracking-tighter
                      ${isDarkMode ? 'text-zinc-700' : 'text-zinc-400'}`}
                  >
                    {phrases[phraseIndex]}
                  </h2>
                </div>
                <div className="flex flex-col items-center gap-2 mt-6">
                  <p className={`text-[11px] font-black uppercase tracking-[0.5em] ${isDarkMode ? 'text-zinc-800' : 'text-zinc-200'}`}>Created by Goyln Company</p>
                  <div className={`h-1 w-12 rounded-full ${isDarkMode ? 'bg-zinc-900' : 'bg-zinc-100'}`}></div>
                </div>
              </div>
            ) : (
              <div className="py-24">
                {messages.map(msg => <MessageItem key={msg.id} message={msg} isDarkMode={isDarkMode} />)}
                {isLoading && (
                  <div className="flex items-center gap-3 p-8 w-fit ml-auto animate-pulse">
                    <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-white/20' : 'bg-black/10'}`} />
                    <div className={`w-2 h-2 rounded-full [animation-delay:0.2s] ${isDarkMode ? 'bg-white/20' : 'bg-black/10'}`} />
                    <div className={`w-2 h-2 rounded-full [animation-delay:0.4s] ${isDarkMode ? 'bg-white/20' : 'bg-black/10'}`} />
                  </div>
                )}
                <div ref={messagesEndRef} className="h-48" />
              </div>
            )}
          </div>
        </div>

        {/* Floating Input Area - Pure Goyln Elegance */}
        <div className="absolute bottom-10 left-0 right-0 px-6 pointer-events-none">
          <div className="max-w-3xl mx-auto w-full pointer-events-auto">
            <div className={`backdrop-blur-3xl border shadow-[0_30px_80px_rgba(0,0,0,0.22)] rounded-[36px] p-3 flex items-center gap-2 transition-all duration-700 focus-within:shadow-[0_40px_100px_rgba(0,0,0,0.3)] focus-within:scale-[1.03]
              ${isDarkMode 
                ? 'bg-zinc-950/80 border-zinc-800 focus-within:border-zinc-500' 
                : 'bg-white/95 border-zinc-100 focus-within:border-zinc-300'}`}>
              
              <div className="flex items-center px-1">
                <label className={`p-3 transition-all cursor-pointer rounded-2xl active:scale-90
                  ${isDarkMode ? 'text-zinc-600 hover:text-white hover:bg-white/5' : 'text-zinc-400 hover:text-black hover:bg-zinc-50'}`}>
                  <Plus size={22} strokeWidth={2.5} />
                  <input type="file" className="hidden" />
                </label>
                <button className={`p-3 transition-all rounded-2xl active:scale-90
                  ${isDarkMode ? 'text-zinc-600 hover:text-white hover:bg-white/5' : 'text-zinc-400 hover:text-black hover:bg-zinc-50'}`}>
                  <Mic size={22} strokeWidth={2.5} />
                </button>
              </div>

              <textarea 
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                placeholder="تحدث مع Goyln AI المتطور..."
                className={`flex-1 bg-transparent py-4 px-3 text-[17px] font-bold outline-none border-none resize-none overflow-hidden max-h-48 tracking-tight
                  ${isDarkMode ? 'text-zinc-100 placeholder-zinc-800' : 'text-zinc-900 placeholder-zinc-200'}`}
              />

              <div className={`flex items-center p-1.5 rounded-full border mx-2 transition-all duration-500
                ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                <button 
                  onClick={() => setModelType(ModelType.FAST)}
                  className={`p-2 rounded-full transition-all duration-500 shadow-sm ${modelType === ModelType.FAST ? (isDarkMode ? 'bg-white text-black scale-110 rotate-12' : 'bg-black text-white scale-110 rotate-12') : 'text-zinc-500 hover:text-zinc-800'}`}
                  title="Goyln Fast"
                >
                  <Zap size={16} fill={modelType === ModelType.FAST ? "currentColor" : "none"} />
                </button>
                <button 
                  onClick={() => setModelType(ModelType.THINKER)}
                  className={`p-2 rounded-full transition-all duration-500 shadow-sm ${modelType === ModelType.THINKER ? (isDarkMode ? 'bg-white text-black scale-110 rotate-12' : 'bg-black text-white scale-110 rotate-12') : 'text-zinc-500 hover:text-zinc-800'}`}
                  title="Goyln Thinker"
                >
                  <BrainCircuit size={16} />
                </button>
              </div>

              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`p-4 rounded-full transition-all duration-500 flex items-center justify-center shadow-2xl
                  ${input.trim() && !isLoading 
                    ? (isDarkMode ? 'bg-white text-black hover:bg-zinc-200 active:scale-95' : 'bg-black text-white hover:bg-zinc-800 active:scale-95') 
                    : (isDarkMode ? 'bg-zinc-900 text-zinc-800' : 'bg-zinc-100 text-zinc-200')}`}
              >
                <Send size={22} strokeWidth={2.5} className="transform rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal - Goyln Branding */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-2xl p-6 animate-in fade-in duration-700">
          <div className={`rounded-[48px] w-full max-sm:w-full max-w-md p-14 shadow-[0_50px_120px_rgba(0,0,0,0.8)] relative overflow-hidden text-center border
            ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-100'}`}>
            <button onClick={() => setIsLoginOpen(false)} className={`absolute top-12 left-12 transition-colors ${isDarkMode ? 'text-zinc-800 hover:text-white' : 'text-zinc-300 hover:text-black'}`}>
              <X size={28} strokeWidth={2} />
            </button>
            <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] font-black text-5xl transition-all hover:rotate-12 hover:scale-110
              ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>G</div>
            <h3 className={`text-4xl font-black mb-4 tracking-tighter ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Goyln Account</h3>
            <p className={`text-[15px] mb-12 font-bold leading-relaxed ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>سجل دخولك لتجربة ذكاء Goyln الكاملة.</p>
            
            <div className="space-y-5">
              <button className={`w-full py-6 px-10 border rounded-3xl flex items-center justify-center gap-5 font-black text-[16px] transition-all hover:scale-[1.03] active:scale-95 shadow-sm
                ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800' : 'bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50'}`}>
                المتابعة بواسطة جوجل
              </button>
              <button className={`w-full py-6 px-10 rounded-3xl font-black text-[16px] transition-all hover:scale-[1.03] active:scale-95 shadow-2xl
                ${isDarkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}>
                البريد الإلكتروني
              </button>
            </div>
            <div className="mt-12">
              <p className={`text-[11px] font-black uppercase tracking-[0.6em] ${isDarkMode ? 'text-zinc-900' : 'text-zinc-100'}`}>Developed by Goyln Company</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
