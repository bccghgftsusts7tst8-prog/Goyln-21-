
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
  Settings
} from 'lucide-react';
import { Message, ModelType } from './types';
import { generateAIResponse } from './geminiService';

// --- المكونات الفرعية المصممة بدقة ---

const SidebarAction: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  onClick?: () => void;
  variant?: 'default' | 'danger';
}> = ({ icon, label, onClick, variant = 'default' }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 text-sm transition-all duration-200 rounded-xl group
      ${variant === 'default' ? 'hover:bg-gray-50 text-gray-700' : 'hover:bg-red-50 text-red-600'}`}
  >
    <span className={`${variant === 'default' ? 'text-gray-400 group-hover:text-black' : 'text-red-400'} transition-colors`}>
      {icon}
    </span>
    <span className="font-medium">{label}</span>
  </button>
);

const MessageItem: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex w-full mb-6 animate-in fade-in slide-in-from-bottom-1 duration-400`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] items-start gap-3 ${isUser ? 'mr-auto flex-row-reverse' : 'ml-auto'}`}>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm
          ${isUser ? 'bg-gray-100 text-gray-600' : 'bg-black text-white'}`}>
          {isUser ? <User size={14} strokeWidth={2.5} /> : <div className="font-black text-[10px]">G</div>}
        </div>
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-2.5 rounded-[20px] text-[14.5px] leading-relaxed border
            ${isUser 
              ? 'bg-white border-gray-100 text-gray-800 rounded-tr-none' 
              : 'bg-gray-50 border-gray-50 text-gray-900 rounded-tl-none'}`}>
            {message.content}
          </div>
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
  const [modelType, setModelType] = useState<ModelType>(ModelType.FAST);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    <div className={`flex h-screen w-full overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      
      {/* Header - Transparent wrapper for icons only */}
      <header className="fixed top-2 left-0 right-0 flex items-center justify-between px-4 z-40 pointer-events-none">
        {/* اليمين: أيقونة القائمة (3 شرط) */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2.5 rounded-full hover:bg-gray-100 transition-all text-gray-500 pointer-events-auto"
        >
          <Menu size={22} strokeWidth={2} />
        </button>

        {/* اليسار: أيقونة تسجيل الدخول الشفافة */}
        <button 
          onClick={() => setIsLoginOpen(true)}
          className="p-2.5 rounded-full hover:bg-gray-100/50 transition-all opacity-40 hover:opacity-100 pointer-events-auto"
        >
          <User size={20} strokeWidth={1.5} />
        </button>
      </header>

      {/* Sidebar Overlay */}
      <div className={`fixed inset-0 z-50 transition-all duration-400 ${isSidebarOpen ? 'bg-black/5 visible opacity-100' : 'invisible opacity-0'}`} onClick={() => setIsSidebarOpen(false)}>
        <aside 
          onClick={(e) => e.stopPropagation()}
          className={`absolute top-0 right-0 w-72 h-full bg-white shadow-2xl transition-transform duration-400 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Goyln AI</span>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 transition-all">
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="relative group">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input 
                type="text" 
                placeholder="البحث في السجل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-3 py-2.5 bg-gray-50 border-none rounded-xl text-xs focus:ring-1 focus:ring-black/5 outline-none"
              />
            </div>
          </div>

          <nav className="flex-1 px-3 overflow-y-auto custom-scrollbar space-y-0.5">
            <SidebarAction icon={<MessageSquare size={17} />} label="دردشة جديدة" onClick={() => { setMessages([]); setIsSidebarOpen(false); }} />
            <SidebarAction icon={<UserPlus size={17} />} label="إضافة شخص للدردشة" />
            <SidebarAction icon={<History size={17} />} label="سجل المحادثات" />
          </nav>

          <div className="p-4 border-t border-gray-50">
            <SidebarAction 
              icon={isDarkMode ? <Sun size={17} /> : <Moon size={17} />} 
              label={isDarkMode ? "الوضع النهاري" : "الوضع الليلي"} 
              onClick={() => setIsDarkMode(!isDarkMode)}
            />
            <SidebarAction icon={<Shield size={17} />} label="الخصوصية والحقوق" />
            <SidebarAction icon={<Mail size={17} />} label="اتصل بنا" />
            
            <div className="mt-4 p-3 bg-gray-50 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition-all">
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white">
                <User size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[13px] truncate">زائر</p>
                <p className="text-[9px] text-gray-400 truncate">سجل دخولك الآن</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Main Container */}
      <main className="flex-1 flex flex-col pt-4 relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4">
          <div className="max-w-2xl mx-auto py-6">
            {messages.map(msg => <MessageItem key={msg.id} message={msg} />)}
            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 w-fit rounded-xl">
                <div className="w-1.5 h-1.5 bg-gray-200 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-gray-200 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            )}
            <div ref={messagesEndRef} className="h-32" />
          </div>
        </div>

        {/* Floating Input Area - Shrunk (max-w-xl) */}
        <div className="absolute bottom-6 left-0 right-0 px-4 pointer-events-none">
          <div className="max-w-xl mx-auto w-full pointer-events-auto">
            <div className={`bg-white/80 backdrop-blur-xl border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.05)] rounded-[24px] p-1.5 flex items-center gap-1 transition-all focus-within:shadow-lg`}>
              
              <div className="flex items-center">
                <label className="p-2.5 text-gray-300 hover:text-black transition-all cursor-pointer rounded-full hover:bg-gray-50 active:scale-90">
                  <Plus size={18} />
                  <input type="file" className="hidden" />
                </label>
                <button className="p-2.5 text-gray-300 hover:text-black transition-all rounded-full hover:bg-gray-50 active:scale-90">
                  <Mic size={18} />
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
                className="flex-1 bg-transparent py-2 px-1 text-[14px] outline-none border-none resize-none overflow-hidden max-h-32"
              />

              {/* Model Micro-Switcher - Smallest possible */}
              <div className="flex items-center bg-gray-50/50 p-0.5 rounded-full border border-gray-100 mx-1">
                <button 
                  onClick={() => setModelType(ModelType.FAST)}
                  className={`p-1.5 rounded-full transition-all ${modelType === ModelType.FAST ? 'bg-white shadow-xs text-black' : 'text-gray-300'}`}
                  title="سريع"
                >
                  <Zap size={12} fill={modelType === ModelType.FAST ? "currentColor" : "none"} />
                </button>
                <button 
                  onClick={() => setModelType(ModelType.THINKER)}
                  className={`p-1.5 rounded-full transition-all ${modelType === ModelType.THINKER ? 'bg-white shadow-xs text-black' : 'text-gray-300'}`}
                  title="مفكر"
                >
                  <BrainCircuit size={12} />
                </button>
              </div>

              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`p-2.5 rounded-full transition-all flex items-center justify-center 
                  ${input.trim() && !isLoading ? 'bg-black text-white active:scale-95' : 'bg-gray-50 text-gray-200'}`}
              >
                <Send size={16} className="transform rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/10 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-xs p-8 shadow-2xl relative overflow-hidden text-center">
            <button onClick={() => setIsLoginOpen(false)} className="absolute top-6 left-6 text-gray-300 hover:text-black transition-colors">
              <X size={18} />
            </button>
            <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg font-black text-xl">G</div>
            <h3 className="text-xl font-black mb-1 tracking-tight">تسجيل الدخول</h3>
            <p className="text-gray-400 text-[12px] mb-6 leading-relaxed">انضم إلى Goyln AI</p>
            
            <div className="space-y-2">
              <button className="w-full py-3 px-4 border border-gray-100 rounded-xl flex items-center justify-center gap-3 font-bold text-xs hover:bg-gray-50 transition-all">
                المتابعة بواسطة جوجل
              </button>
              <button className="w-full py-3 px-4 bg-black text-white rounded-xl font-bold text-xs hover:bg-gray-900 transition-all">
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
