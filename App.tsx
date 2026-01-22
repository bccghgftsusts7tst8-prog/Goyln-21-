
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
    className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs transition-all duration-300 rounded-xl group
      ${variant === 'default' 
        ? (isDarkMode ? 'hover:bg-white/5 text-zinc-300' : 'hover:bg-zinc-100 text-zinc-700') 
        : (isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-600')}`}
  >
    <span className={`${variant === 'default' ? 'text-zinc-400 group-hover:text-black dark:group-hover:text-white' : 'text-zinc-400'} transition-colors`}>
      {React.cloneElement(icon as React.ReactElement, { size: 16 })}
    </span>
    <span className="font-semibold">{label}</span>
  </button>
);

const MessageItem: React.FC<{ message: Message; isDarkMode: boolean }> = ({ message, isDarkMode }) => {
  const isUser = message.role === 'user';
  const groundingLinks = (message as any).groundingChunks
    ?.filter((chunk: any) => chunk.web?.uri)
    ?.map((chunk: any) => chunk.web);

  return (
    <div className={`group flex w-full mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out`}>
      <div className={`flex max-w-[98%] md:max-w-[85%] items-start gap-4 ${isUser ? 'mr-auto flex-row-reverse' : 'ml-auto'}`}>
        {/* أفاتار أيقوني مصغر */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-500 group-hover:scale-105 mt-0.5
          ${isUser 
            ? (isDarkMode ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' : 'bg-zinc-100 text-zinc-800 border border-zinc-200') 
            : (isDarkMode ? 'bg-white text-black' : 'bg-black text-white')}`}>
          {isUser ? <User size={16} strokeWidth={1.5} /> : <div className="font-black text-sm tracking-tighter">G</div>}
        </div>

        <div className={`flex flex-col ${isUser ? 'items-end text-right' : 'items-start text-left'} flex-1`}>
          <div className={`text-[14.5px] leading-[1.7] font-medium whitespace-pre-wrap transition-all tracking-tight
            ${isUser 
              ? (isDarkMode ? 'text-zinc-400' : 'text-zinc-500') 
              : (isDarkMode ? 'text-zinc-100' : 'text-zinc-900')}`}>
            {message.content}
          </div>
          
          {!isUser && groundingLinks && groundingLinks.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4 animate-in fade-in slide-in-from-left-2 duration-700">
              {groundingLinks.map((link: any, i: number) => (
                <a 
                  key={i}
                  href={link.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold border transition-all hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black
                    ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-400'}`}
                >
                  <Globe size={10} />
                  <span className="max-w-[120px] truncate">{link.title || 'Goyln Source'}</span>
                  <ExternalLink size={9} />
                </a>
              ))}
            </div>
          )}

          {!isUser && (
            <div className={`flex items-center gap-2.5 mt-4 opacity-0 group-hover:opacity-30 transition-all duration-500`}>
              <div className={`h-[1px] w-6 ${isDarkMode ? 'bg-white' : 'bg-black'}`}></div>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Cpu size={10} />
                {message.model === ModelType.THINKER ? 'Goyln Thinker' : 'Goyln Fast'}
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
    "Goyln AI: ذكاء بلمسة إنسانية.",
    "فكر بعمق، استجب بسرعة.",
    "Goyln Company: نبتكر للمستقبل.",
    "كامل الفخر لـ Goyln في هذه الصناعة."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleFunctionCalls = (calls: any[]) => {
    calls.forEach(call => {
      if (call.name === 'open_external_url') {
        window.open(call.args.url, '_blank');
      } else if (call.name === 'notify_user') {
        alert(`Goyln AI: ${call.args.message}`);
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
    <div className={`flex h-screen w-full overflow-hidden transition-all duration-700 ease-in-out ${isDarkMode ? 'bg-[#000000] text-white' : 'bg-white text-zinc-900'}`}>
      
      <header className="fixed top-3 left-0 right-0 flex items-center justify-between px-5 z-40 pointer-events-none">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className={`p-2 rounded-xl transition-all pointer-events-auto shadow-sm backdrop-blur-2xl border border-transparent
            ${isDarkMode ? 'hover:bg-white/10 text-white/50 hover:text-white' : 'hover:bg-zinc-100 text-zinc-400 hover:text-black'}`}
        >
          <Menu size={20} strokeWidth={2} />
        </button>

        <div className="relative pointer-events-auto">
          <button 
            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            className={`p-2 rounded-xl transition-all pointer-events-auto shadow-sm backdrop-blur-2xl border border-transparent
              ${isDarkMode ? 'hover:bg-white/10 text-white/30 hover:text-white' : 'hover:bg-zinc-100 text-zinc-300 hover:text-black'}
              ${isAccountMenuOpen ? 'rotate-180 text-black dark:text-white scale-105' : ''}`}
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </button>

          <div className={`absolute top-full left-0 mt-3 flex flex-col gap-3 p-1 transition-all duration-500 origin-top-left z-50 ${isAccountMenuOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 -translate-y-4 pointer-events-none'}`}>
            <button 
              onClick={() => { setIsLoginOpen(true); setIsAccountMenuOpen(false); }}
              className={`w-10 h-10 flex items-center justify-center backdrop-blur-2xl border rounded-full shadow-xl transition-all hover:scale-105 active:scale-95
                ${isDarkMode ? 'bg-zinc-800/90 border-zinc-700/50 text-white' : 'bg-white/95 border-zinc-200 text-black'}`}
            >
              <User size={18} strokeWidth={2} />
            </button>
            <button className={`w-10 h-10 flex items-center justify-center backdrop-blur-2xl border rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-zinc-800/90 border-zinc-700/50 text-white' : 'bg-white/95 border-zinc-200 text-black'}`}>
              <Headphones size={18} strokeWidth={2} />
            </button>
            <button className={`w-10 h-10 flex items-center justify-center backdrop-blur-2xl border rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-zinc-800/90 border-zinc-700/50 text-white' : 'bg-white/95 border-zinc-200 text-black'}`}>
              <Sparkles size={18} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className={`fixed inset-0 z-50 transition-all duration-500 ${isSidebarOpen ? 'bg-black/60 visible opacity-100 backdrop-blur-sm' : 'invisible opacity-0'}`} onClick={() => setIsSidebarOpen(false)}>
        <aside 
          onClick={(e) => e.stopPropagation()}
          className={`absolute top-0 right-0 w-72 h-full shadow-2xl transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) transform 
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col
            ${isDarkMode ? 'bg-zinc-950 border-l border-zinc-900' : 'bg-white'}`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-zinc-700' : 'text-zinc-300'}`}>Goyln Systems</span>
              <button onClick={() => setIsSidebarOpen(false)} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5 text-zinc-500' : 'hover:bg-zinc-50 text-zinc-400'}`}>
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="relative group">
              <Search className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-zinc-700' : 'text-zinc-300'}`} size={14} />
              <input 
                type="text" 
                placeholder="بحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pr-10 pl-4 py-3 rounded-xl text-[12px] font-bold focus:ring-1 outline-none transition-all
                  ${isDarkMode 
                    ? 'bg-zinc-900/50 text-white border-zinc-800 focus:ring-white/10' 
                    : 'bg-zinc-50 text-zinc-900 border-none focus:ring-black/5'}`}
              />
            </div>
          </div>
          <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar space-y-1">
            <SidebarAction isDarkMode={isDarkMode} icon={<MessageSquare />} label="دردشة جديدة" onClick={() => { setMessages([]); setIsSidebarOpen(false); }} />
            <SidebarAction isDarkMode={isDarkMode} icon={<UserPlus />} label="إضافة شخص" />
            <SidebarAction isDarkMode={isDarkMode} icon={<History />} label="سجل Goyln" />
          </nav>
          <div className={`p-5 border-t ${isDarkMode ? 'border-zinc-900' : 'border-zinc-100'}`}>
            <SidebarAction isDarkMode={isDarkMode} icon={isDarkMode ? <Sun /> : <Moon />} label={isDarkMode ? "الوضع النهاري" : "الوضع الليلي"} onClick={() => setIsDarkMode(!isDarkMode)} />
            <SidebarAction isDarkMode={isDarkMode} icon={<Shield />} label="الخصوصية" />
            <SidebarAction isDarkMode={isDarkMode} icon={<Mail />} label="تواصل معنا" />
            <div className={`mt-6 p-3.5 rounded-2xl flex items-center gap-3.5 cursor-pointer transition-all active:scale-95 border border-transparent hover:border-zinc-800 dark:hover:border-zinc-700
              ${isDarkMode ? 'bg-zinc-900/50' : 'bg-zinc-50'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg font-black text-xs ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>G</div>
              <div className="flex-1 min-w-0">
                <p className={`font-black text-[13px] truncate ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>حساب Goyln</p>
                <p className={`text-[9px] truncate font-bold ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>Goyln Company</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <main className="flex-1 flex flex-col pt-4 relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6">
          <div className="max-w-2xl mx-auto h-full flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-1000">
                <div className="relative h-24 w-full flex items-center justify-center overflow-hidden">
                  <h2 
                    key={phraseIndex}
                    className={`text-2xl md:text-3xl font-black transition-all duration-1000 animate-slide-up text-center px-6 tracking-tight
                      ${isDarkMode ? 'text-zinc-700' : 'text-zinc-400'}`}
                  >
                    {phrases[phraseIndex]}
                  </h2>
                </div>
                <p className={`text-[9px] font-black uppercase tracking-[0.4em] mt-3 ${isDarkMode ? 'text-zinc-800' : 'text-zinc-200'}`}>Powered by Goyln Company</p>
              </div>
            ) : (
              <div className="py-16">
                {messages.map(msg => <MessageItem key={msg.id} message={msg} isDarkMode={isDarkMode} />)}
                {isLoading && (
                  <div className="flex items-center gap-2 p-6 w-fit ml-auto">
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDarkMode ? 'bg-white/20' : 'bg-black/10'}`} />
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s] ${isDarkMode ? 'bg-white/20' : 'bg-black/10'}`} />
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.4s] ${isDarkMode ? 'bg-white/20' : 'bg-black/10'}`} />
                  </div>
                )}
                <div ref={messagesEndRef} className="h-40" />
              </div>
            )}
          </div>
        </div>

        {/* Floating Input Area - Micro Design */}
        <div className="absolute bottom-8 left-0 right-0 px-5 pointer-events-none">
          <div className="max-w-xl mx-auto w-full pointer-events-auto">
            <div className={`backdrop-blur-3xl border shadow-[0_20px_50px_rgba(0,0,0,0.12)] rounded-3xl p-1.5 flex items-center gap-1 transition-all duration-500 focus-within:shadow-2xl focus-within:scale-[1.01]
              ${isDarkMode 
                ? 'bg-zinc-950/80 border-zinc-800 focus-within:border-zinc-600' 
                : 'bg-white/95 border-zinc-100 focus-within:border-zinc-300'}`}>
              
              <div className="flex items-center px-0.5">
                <label className={`p-2 transition-all cursor-pointer rounded-xl active:scale-90
                  ${isDarkMode ? 'text-zinc-600 hover:text-white hover:bg-white/5' : 'text-zinc-400 hover:text-black hover:bg-zinc-50'}`}>
                  <Plus size={18} strokeWidth={2.5} />
                  <input type="file" className="hidden" />
                </label>
                <button className={`p-2 transition-all rounded-xl active:scale-90
                  ${isDarkMode ? 'text-zinc-600 hover:text-white hover:bg-white/5' : 'text-zinc-400 hover:text-black hover:bg-zinc-50'}`}>
                  <Mic size={18} strokeWidth={2.5} />
                </button>
              </div>

              <textarea 
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                placeholder="تحدث مع Goyln..."
                className={`flex-1 bg-transparent py-2.5 px-2 text-[14.5px] font-semibold outline-none border-none resize-none overflow-hidden max-h-32 tracking-tight
                  ${isDarkMode ? 'text-zinc-100 placeholder-zinc-800' : 'text-zinc-900 placeholder-zinc-300'}`}
              />

              <div className={`flex items-center p-1 rounded-full border mx-1 transition-all
                ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                <button 
                  onClick={() => setModelType(ModelType.FAST)}
                  className={`p-1.5 rounded-full transition-all duration-500 ${modelType === ModelType.FAST ? (isDarkMode ? 'bg-white text-black scale-105' : 'bg-black text-white scale-105') : 'text-zinc-500 hover:text-zinc-800'}`}
                >
                  <Zap size={14} fill={modelType === ModelType.FAST ? "currentColor" : "none"} />
                </button>
                <button 
                  onClick={() => setModelType(ModelType.THINKER)}
                  className={`p-1.5 rounded-full transition-all duration-500 ${modelType === ModelType.THINKER ? (isDarkMode ? 'bg-white text-black scale-105' : 'bg-black text-white scale-105') : 'text-zinc-500 hover:text-zinc-800'}`}
                >
                  <BrainCircuit size={14} />
                </button>
              </div>

              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`p-2.5 rounded-2xl transition-all flex items-center justify-center shadow-lg
                  ${input.trim() && !isLoading 
                    ? (isDarkMode ? 'bg-white text-black hover:bg-zinc-200 active:scale-95' : 'bg-black text-white hover:bg-zinc-800 active:scale-95') 
                    : (isDarkMode ? 'bg-zinc-900 text-zinc-800' : 'bg-zinc-100 text-zinc-200')}`}
              >
                <Send size={18} strokeWidth={2.5} className="transform rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal - Scaled Down */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-xl p-6 animate-in fade-in duration-500">
          <div className={`rounded-[32px] w-full max-sm:w-full max-w-xs p-10 shadow-[0_30px_80px_rgba(0,0,0,0.5)] relative overflow-hidden text-center border
            ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-100'}`}>
            <button onClick={() => setIsLoginOpen(false)} className={`absolute top-8 left-8 transition-colors ${isDarkMode ? 'text-zinc-800 hover:text-white' : 'text-zinc-300 hover:text-black'}`}>
              <X size={20} strokeWidth={2} />
            </button>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl font-black text-3xl
              ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>G</div>
            <h3 className={`text-2xl font-black mb-2 tracking-tighter ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Goyln Account</h3>
            <p className={`text-[12px] mb-8 font-bold ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>مستقبل Goyln بانتظارك.</p>
            
            <div className="space-y-3.5">
              <button className={`w-full py-4 px-6 border rounded-2xl flex items-center justify-center gap-3 font-black text-[13px] transition-all hover:scale-[1.02] active:scale-95
                ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800' : 'bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50'}`}>
                جوجل
              </button>
              <button className={`w-full py-4 px-6 rounded-2xl font-black text-[13px] transition-all hover:scale-[1.02] active:scale-95 shadow-lg
                ${isDarkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}>
                البريد الإلكتروني
              </button>
            </div>
            <div className="mt-8">
              <p className={`text-[9px] font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-zinc-900' : 'text-zinc-100'}`}>Goyln Company</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
