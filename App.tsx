
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  FileText,
  Zap,
  BrainCircuit,
  Settings
} from 'lucide-react';
import { Message, ModelType, ProviderType, User as UserType } from './types';
import { generateAIResponse } from './geminiService';

// --- Sub-components (Outside to prevent re-render) ---

const SidebarItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  onClick?: () => void;
  className?: string;
}> = ({ icon, label, onClick, className = "" }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors rounded-xl ${className}`}
  >
    <span className="text-gray-500">{icon}</span>
    <span className="text-gray-700 font-medium">{label}</span>
  </button>
);

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-start' : 'justify-start'}`}>
      <div className="flex max-w-[85%] items-start gap-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-gray-100' : 'bg-blue-50 text-blue-600'}`}>
          {isUser ? <User size={16} /> : <div className="font-bold text-xs">G</div>}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider font-semibold">
            {isUser ? 'أنت' : 'Goyln AI'}
          </span>
          <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-[15px]">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 left-6 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-2xl">G</div>
          <h2 className="text-2xl font-bold">مرحباً بك في Goyln</h2>
          <p className="text-gray-500 mt-2">سجل دخولك لمزامنة محادثاتك</p>
        </div>
        <div className="space-y-4">
          <button className="w-full py-4 px-6 border border-gray-200 rounded-2xl flex items-center justify-center gap-3 font-medium hover:bg-gray-50 transition-all">
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="google" />
            المتابعة باستخدام Google
          </button>
          <button className="w-full py-4 px-6 bg-black text-white rounded-2xl font-medium hover:bg-gray-800 transition-all">
            البريد الإلكتروني
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-8">
          من خلال المتابعة، فإنك توافق على شروط الخدمة وسياسة الخصوصية
        </p>
      </div>
    </div>
  );
};

// --- Main App Component ---

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${isDarkMode ? 'dark' : ''} bg-white transition-colors`}>
      
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-50/50 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <button 
          onClick={() => setIsLoginOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 text-gray-400 transition-colors"
        >
          <User size={22} strokeWidth={1.5} />
        </button>

        <div className="flex flex-col items-center">
          <span className="font-bold text-xl tracking-tight">Goyln</span>
          <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">Company</span>
        </div>

        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Sidebar / Drawer */}
      <div 
        className={`fixed inset-0 z-50 transition-all duration-300 ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        <aside className={`absolute top-0 right-0 w-80 h-full bg-white shadow-2xl transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg">القائمة</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="البحث في السجل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-11 pl-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
            <SidebarItem icon={<UserPlus size={18} />} label="إضافة شخص للمحادثة" />
            <SidebarItem icon={<Shield size={18} />} label="الخصوصية والحقوق" />
            <SidebarItem icon={<Mail size={18} />} label="اتصل بنا" />
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <SidebarItem 
              icon={isDarkMode ? <Sun size={18} /> : <Moon size={18} />} 
              label={isDarkMode ? "الوضع المضيء" : "الوضع الليلي"} 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="mb-2"
            />
            <div className="mt-4 p-4 flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-gray-200 transition-all">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white shrink-0">
                <User size={20} />
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-sm truncate">زائر</p>
                <p className="text-xs text-gray-400 truncate">سجل الدخول للمزيد</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Main Chat Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar pt-4 pb-32 px-4 md:px-0">
        <div className="max-w-3xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
              <div className="w-16 h-16 bg-black text-white rounded-3xl flex items-center justify-center mb-6 shadow-xl animate-pulse">
                <BrainCircuit size={32} />
              </div>
              <h1 className="text-3xl font-bold mb-3">كيف يمكنني مساعدتك؟</h1>
              <p className="text-gray-400 max-w-sm">مرحباً بك في Goyln، مساعدك الذكي المتكامل. اسألني عن أي شيء.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && (
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <div className="font-bold text-xs">G</div>
                  </div>
                  <div className="flex space-x-1 mt-2">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Floating Input Bar */}
      <div className="fixed bottom-8 left-0 right-0 z-40 px-4 pointer-events-none">
        <div className="max-w-3xl mx-auto w-full pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-2xl rounded-[32px] p-2 flex items-center gap-2 group transition-all focus-within:ring-2 focus-within:ring-black/5">
            
            <label className="p-3 text-gray-400 hover:text-black transition-colors cursor-pointer rounded-full hover:bg-gray-100 flex items-center justify-center shrink-0">
              <Plus size={20} strokeWidth={2} />
              <input type="file" className="hidden" />
            </label>

            <button className="p-3 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100 flex items-center justify-center shrink-0">
              <Mic size={20} strokeWidth={2} />
            </button>

            <textarea 
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="تحدث معي..."
              className="flex-1 bg-transparent py-3 px-1 text-[15px] outline-none border-none resize-none overflow-hidden max-h-32 min-h-[44px]"
              style={{ direction: 'rtl' }}
            />

            {/* Model Switcher - Small and Minimal as requested */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-full border border-gray-100 shrink-0">
              <button 
                onClick={() => setModelType(ModelType.FAST)}
                className={`p-2 rounded-full transition-all flex items-center justify-center ${modelType === ModelType.FAST ? 'bg-white shadow-sm text-black scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                title="سريع"
              >
                <Zap size={14} fill={modelType === ModelType.FAST ? 'currentColor' : 'none'} />
              </button>
              <button 
                onClick={() => setModelType(ModelType.THINKER)}
                className={`p-2 rounded-full transition-all flex items-center justify-center ${modelType === ModelType.THINKER ? 'bg-white shadow-sm text-black scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                title="مفكر"
              >
                <BrainCircuit size={14} />
              </button>
            </div>

            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`p-3 rounded-full transition-all flex items-center justify-center shrink-0 ${input.trim() && !isLoading ? 'bg-black text-white scale-100 shadow-md active:scale-95' : 'bg-gray-100 text-gray-300 scale-95 cursor-not-allowed'}`}
            >
              <Send size={20} className="transform rotate-180" />
            </button>
          </div>
        </div>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default App;
