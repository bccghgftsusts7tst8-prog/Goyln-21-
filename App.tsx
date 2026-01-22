
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
  ChevronLeft,
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
    className={`w-full flex items-center gap-4 px-4 py-3.5 text-sm transition-all duration-200 rounded-2xl group
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
    <div className={`flex w-full mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500`}>
      <div className={`flex max-w-[90%] md:max-w-[75%] items-start gap-4 ${isUser ? 'mr-auto flex-row-reverse' : 'ml-auto'}`}>
        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm
          ${isUser ? 'bg-black text-white' : 'bg-blue-600 text-white'}`}>
          {isUser ? <User size={18} strokeWidth={2} /> : <div className="font-black text-xs">G</div>}
        </div>
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-5 py-3.5 rounded-[22px] text-[15.5px] leading-relaxed shadow-sm border
            ${isUser 
              ? 'bg-gray-50 border-gray-100 text-gray-800 rounded-tr-none' 
              : 'bg-white border-blue-50 text-gray-900 rounded-tl-none'}`}>
            {message.content}
          </div>
          <span className="text-[10px] text-gray-400 mt-2 font-medium tracking-tighter">
            {new Date(message.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            {message.model && ` • ${message.model === ModelType.THINKER ? 'نموذج مفكر' : 'نموذج سريع'}`}
          </span>
        </div>
      </div>
    </div>
  );
};

// --- المكون الرئيسي ---

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
    <div className={`flex h-screen w-full overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-gray-900'}`}>
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 z-40 bg-inherit/80 backdrop-blur-xl border-b border-gray-100/10">
        <button 
          onClick={() => setIsLoginOpen(true)}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100/50 transition-all opacity-60 hover:opacity-100"
        >
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <User size={18} />
          </div>
          <span className="text-xs font-bold hidden md:block">تسجيل الدخول</span>
        </button>

        <div className="flex flex-col items-center">
          <h1 className="text-lg font-black tracking-tighter flex items-center gap-1.5">
            <span className="bg-black text-white px-1.5 py-0.5 rounded-lg text-sm">G</span>
            GOYLN
          </h1>
        </div>

        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2.5 rounded-2xl hover:bg-gray-100 transition-all"
        >
          <Menu size={22} strokeWidth={2.5} />
        </button>
      </header>

      {/* Sidebar Overlay */}
      <div className={`fixed inset-0 z-50 transition-all duration-500 ${isSidebarOpen ? 'bg-black/40 backdrop-blur-md visible opacity-100' : 'invisible opacity-0'}`} onClick={() => setIsSidebarOpen(false)}>
        {/* Sidebar Content */}
        <aside 
          onClick={(e) => e.stopPropagation()}
          className={`absolute top-0 right-0 w-80 h-full bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] transition-transform duration-500 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xs font-black tracking-widest text-gray-400">القائمة الرئيسية</span>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                <ChevronLeft size={20} />
              </button>
            </div>

            <div className="relative group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="البحث في السجل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-11 pl-4 py-3.5 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-black/5 outline-none transition-all"
              />
            </div>
          </div>

          <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar">
            <SidebarAction icon={<MessageSquare size={19} />} label="دردشة جديدة" onClick={() => { setMessages([]); setIsSidebarOpen(false); }} />
            <SidebarAction icon={<UserPlus size={19} />} label="إضافة شخص للدردشة" />
            <SidebarAction icon={<History size={19} />} label="سجل المحادثات" />
          </nav>

          <div className="p-4 border-t border-gray-50 space-y-2">
            <SidebarAction 
              icon={isDarkMode ? <Sun size={19} /> : <Moon size={19} />} 
              label={isDarkMode ? "الوضع النهاري" : "الوضع الليلي"} 
              onClick={() => setIsDarkMode(!isDarkMode)}
            />
            <SidebarAction icon={<Shield size={19} />} label="الخصوصية والحقوق" />
            <SidebarAction icon={<Mail size={19} />} label="اتصل بنا" />
            
            <div className="mt-4 p-4 bg-black rounded-[24px] text-white flex items-center gap-4 group cursor-pointer active:scale-95 transition-all">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <User size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">حساب المستخدم</p>
                <p className="text-[10px] text-white/50 truncate">إدارة الملف الشخصي</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Main Container */}
      <main className="flex-1 flex flex-col pt-20 relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-0">
          <div className="max-w-3xl mx-auto py-8">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-8 animate-in fade-in zoom-in duration-700">
                <div className="w-20 h-20 bg-black text-white rounded-[32px] flex items-center justify-center mb-8 shadow-2xl shadow-black/10">
                  <BrainCircuit size={40} />
                </div>
                <h2 className="text-4xl font-black mb-4 tracking-tight">Goyln AI</h2>
                <p className="text-gray-400 max-w-sm leading-relaxed text-sm">
                  مرحباً بك في الجيل القادم من الذكاء الاصطناعي. اختر نموذجك وابدأ في الإبداع.
                </p>
              </div>
            ) : (
              messages.map(msg => <MessageItem key={msg.id} message={msg} />)
            )}
            {isLoading && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 w-fit rounded-2xl animate-pulse">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
            <div ref={messagesEndRef} className="h-40" />
          </div>
        </div>

        {/* Floating Input Area */}
        <div className="absolute bottom-8 left-0 right-0 px-4 md:px-0 pointer-events-none">
          <div className="max-w-3xl mx-auto w-full pointer-events-auto">
            <div className={`bg-white/90 backdrop-blur-2xl border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[32px] p-2 flex items-center gap-1 transition-all focus-within:ring-4 focus-within:ring-black/5`}>
              
              <div className="flex items-center">
                <label className="p-3 text-gray-400 hover:text-black transition-all cursor-pointer rounded-full hover:bg-gray-50 active:scale-90">
                  <Plus size={20} />
                  <input type="file" className="hidden" />
                </label>
                <button className="p-3 text-gray-400 hover:text-black transition-all rounded-full hover:bg-gray-50 active:scale-90">
                  <Mic size={20} />
                </button>
              </div>

              <textarea 
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                placeholder="اسأل Goyln عن أي شيء..."
                className="flex-1 bg-transparent py-3 px-2 text-[15px] font-medium outline-none border-none resize-none overflow-hidden max-h-40"
              />

              {/* Model Micro-Switcher */}
              <div className="flex items-center bg-gray-50/80 p-1 rounded-2xl border border-gray-100 mx-1">
                <button 
                  onClick={() => setModelType(ModelType.FAST)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${modelType === ModelType.FAST ? 'bg-white shadow-sm text-black scale-100' : 'text-gray-400 scale-95 opacity-50'}`}
                >
                  <Zap size={13} fill={modelType === ModelType.FAST ? "currentColor" : "none"} />
                  <span className="text-[10px] font-black uppercase">سريع</span>
                </button>
                <button 
                  onClick={() => setModelType(ModelType.THINKER)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${modelType === ModelType.THINKER ? 'bg-white shadow-sm text-black scale-100' : 'text-gray-400 scale-95 opacity-50'}`}
                >
                  <BrainCircuit size={13} />
                  <span className="text-[10px] font-black uppercase">مفكر</span>
                </button>
              </div>

              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`p-3.5 rounded-[22px] transition-all flex items-center justify-center 
                  ${input.trim() && !isLoading ? 'bg-black text-white shadow-lg active:scale-95' : 'bg-gray-50 text-gray-300'}`}
              >
                <Send size={18} className="transform rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-sm p-10 shadow-2xl relative overflow-hidden">
            <button onClick={() => setIsLoginOpen(false)} className="absolute top-8 left-8 text-gray-400 hover:text-black transition-colors">
              <X size={20} />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-black text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl font-black text-2xl">G</div>
              <h3 className="text-2xl font-black mb-2 tracking-tight">أهلاً بك مجدداً</h3>
              <p className="text-gray-400 text-sm mb-8 px-4 leading-relaxed">سجل دخولك لتجربة كاملة ومزامنة ذكية لمحادثاتك في Goyln.</p>
              
              <div className="space-y-3">
                <button className="w-full py-4 px-6 border border-gray-100 rounded-[22px] flex items-center justify-center gap-3 font-bold text-sm hover:bg-gray-50 transition-all">
                  <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="G" />
                  المتابعة بواسطة جوجل
                </button>
                <button className="w-full py-4 px-6 bg-black text-white rounded-[22px] font-bold text-sm hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  البريد الإلكتروني
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
