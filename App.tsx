
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
  Cpu,
  RefreshCcw,
  Image as ImageIcon,
  Film,
  FileText,
  MapPin,
  MicOff,
  Paperclip
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
    className={`w-full flex items-center gap-3 px-3 py-2 text-[13px] transition-all duration-300 rounded-xl group
      ${variant === 'default' 
        ? (isDarkMode ? 'hover:bg-white/5 text-zinc-400' : 'hover:bg-zinc-50 text-zinc-500') 
        : (isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-600')}`}
  >
    <span className={`${variant === 'default' ? 'text-zinc-400 group-hover:text-black dark:group-hover:text-white' : 'text-zinc-400'} transition-colors`}>
      {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 16, strokeWidth: 1.5 }) : icon}
    </span>
    <span className="font-medium">{label}</span>
  </button>
);

const MessageItem: React.FC<{ message: Message; isDarkMode: boolean }> = ({ message, isDarkMode }) => {
  const isUser = message.role === 'user';
  const groundingLinks = (message as any).groundingChunks
    ?.filter((chunk: any) => chunk.web?.uri || chunk.maps?.uri)
    ?.map((chunk: any) => chunk.web || chunk.maps);

  return (
    <div className={`group flex w-full mb-10 animate-slide-up duration-700`}>
      <div className={`flex w-full items-start gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg transition-all duration-500 group-hover:scale-105 mt-1
          ${isUser 
            ? (isDarkMode ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' : 'bg-zinc-100 text-zinc-800 border border-zinc-200') 
            : (isDarkMode ? 'bg-white text-black' : 'bg-black text-white')}`}>
          {isUser ? <User size={16} strokeWidth={1.5} /> : <div className="font-black text-base tracking-tighter">G</div>}
        </div>

        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} flex-1 overflow-hidden`}>
          <div className={`p-4 rounded-3xl max-w-[92%] transition-all leading-[1.8] whitespace-pre-wrap
            ${isUser 
              ? `font-user text-[14.5px] ${isDarkMode ? 'bg-zinc-900/50 text-zinc-200' : 'bg-zinc-50 text-zinc-700'}` 
              : `font-assistant text-[15.5px] ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}`}>
            {message.content}
          </div>
          
          {groundingLinks && groundingLinks.length > 0 && (
            <div className={`mt-4 flex flex-wrap gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {groundingLinks.map((link: any, idx: number) => (
                <a 
                  key={idx} 
                  href={link.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' : 'bg-white border-zinc-200 text-zinc-500 hover:text-black shadow-sm'}`}
                >
                  {link.uri.includes('google.com/maps') ? <MapPin size={10} className="text-red-500" /> : <Globe size={10} />}
                  <span className="truncate max-w-[120px]">{link.title || 'عرض المصدر'}</span>
                  <ExternalLink size={9} />
                </a>
              ))}
            </div>
          )}

          {!isUser && (
            <div className={`flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-40 transition-all duration-500`}>
              <div className={`h-[1px] w-6 ${isDarkMode ? 'bg-white' : 'bg-black'}`}></div>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Cpu size={10} />
                {message.model === ModelType.THINKER ? 'Goyln Mind' : 'Goyln Fast'}
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
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [modelType, setModelType] = useState<ModelType>(ModelType.FAST);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ data: string; mimeType: string; name: string }[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const phrases = [
    "أنا هنا لأجلك.. كيف أجعلك تبتسم اليوم؟",
    "Goyln AI: قلبٌ نابض في عالم الأرقام.",
    "دعنا نبدع سوياً، فأنا أسمعك بكل جوارحي..",
    "فخر Goyln أن أكون رفيقك الذكي والمخلص.",
    "ذكاء ينمو بمشاعرك، وسرعة تسبق خيالك.."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Voice Input Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'ar-SA';
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsRecording(false);
      };
      recognitionRef.current.onerror = () => setIsRecording(false);
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = await Promise.all(Array.from(files).map(async file => {
      const data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
      });
      return { data, mimeType: file.type, name: file.name };
    }));

    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;
    
    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: input, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    const currentFiles = [...attachedFiles];
    setInput('');
    setAttachedFiles([]);
    setIsLoading(true);
    setIsAddMenuOpen(false);

    try {
      let location: { latitude: number; longitude: number } | undefined;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      } catch (e) {
        console.warn("Location permission denied or timed out");
      }

      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const result = await generateAIResponse(currentInput, modelType, history, location, currentFiles);
      
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
      
      <header className="fixed top-4 left-0 right-0 flex items-center justify-between px-6 z-40 pointer-events-none">
        <button onClick={() => setIsSidebarOpen(true)} className={`p-2 rounded-2xl transition-all pointer-events-auto shadow-sm glass-input border border-transparent ${isDarkMode ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-zinc-100 text-zinc-400 hover:text-black'}`}>
          <Menu size={20} strokeWidth={2} />
        </button>

        <div className="relative pointer-events-auto">
          <button onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)} className={`p-2 rounded-2xl transition-all pointer-events-auto shadow-sm glass-input border border-transparent ${isDarkMode ? 'hover:bg-white/10 text-white/30 hover:text-white' : 'hover:bg-zinc-100 text-zinc-300 hover:text-black'} ${isAccountMenuOpen ? 'rotate-180 text-black dark:text-white scale-110' : ''}`}>
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div className={`absolute top-full left-0 mt-4 flex flex-col gap-3 p-1 transition-all duration-500 origin-top-left z-50 ${isAccountMenuOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 -translate-y-5 pointer-events-none'}`}>
            <button onClick={() => { setIsLoginOpen(true); setIsAccountMenuOpen(false); }} className={`w-9 h-9 flex items-center justify-center glass-input border rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 ${isDarkMode ? 'bg-zinc-800/90 border-zinc-700/50 text-white' : 'bg-white/95 border-zinc-200 text-black'}`}>
              <User size={16} strokeWidth={2} />
            </button>
            <button className={`w-9 h-9 flex items-center justify-center glass-input border rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 ${isDarkMode ? 'bg-zinc-800/90 border-zinc-700/50 text-white' : 'bg-white/95 border-zinc-200 text-black'}`}>
              <Sparkles size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar - ضبط المساحات بناءً على طلب المستخدم */}
      <div className={`fixed inset-0 z-50 transition-all duration-500 ${isSidebarOpen ? 'bg-black/60 visible opacity-100 backdrop-blur-md' : 'invisible opacity-0'}`} onClick={() => setIsSidebarOpen(false)}>
        <aside onClick={(e) => e.stopPropagation()} className={`absolute top-0 right-0 w-[280px] h-full shadow-2xl transition-transform duration-600 cubic-bezier(0.16, 1, 0.3, 1) transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col ${isDarkMode ? 'bg-zinc-950 border-l border-zinc-900' : 'bg-white'}`}>
          <div className="pt-8 px-6 pb-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col items-end">
                <span className={`text-[9px] font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-zinc-700' : 'text-zinc-300'}`}>GOYLN</span>
                <span className={`text-[11px] font-black uppercase tracking-[0.2em] -mt-1 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>INTELLIGENCE</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className={`p-1.5 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5 text-zinc-500' : 'hover:bg-zinc-50 text-zinc-400'}`}>
                <ChevronRight size={20} strokeWidth={2} />
              </button>
            </div>
            <div className="relative group mb-4">
              <Search className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-zinc-700' : 'text-zinc-300'}`} size={14} />
              <input type="text" placeholder="ابحث في سجل Goyln..." className={`w-full pr-10 pl-3 py-3 rounded-2xl text-[12px] font-bold outline-none border transition-all ${isDarkMode ? 'bg-zinc-900/40 text-white border-zinc-800 focus:border-zinc-700' : 'bg-zinc-50/50 text-zinc-900 border-zinc-100 focus:border-zinc-200'}`} />
            </div>
          </div>
          
          <nav className="flex-1 px-3 overflow-y-auto custom-scrollbar space-y-0.5">
            <SidebarAction isDarkMode={isDarkMode} icon={<MessageSquare />} label="محادثة جديدة وذكية" onClick={() => { setMessages([]); setIsSidebarOpen(false); }} />
            <SidebarAction isDarkMode={isDarkMode} icon={<UserPlus />} label="إضافة صديق للحوار" />
            <SidebarAction isDarkMode={isDarkMode} icon={<History />} label="الأرشيف التاريخي" />
            
            <div className={`h-[1px] mx-3 my-3 ${isDarkMode ? 'bg-zinc-900' : 'bg-zinc-50'}`}></div>
            
            <SidebarAction isDarkMode={isDarkMode} icon={isDarkMode ? <Sun /> : <Moon />} label={isDarkMode ? "الوضع النهاري" : "الوضع الليلي"} onClick={() => setIsDarkMode(!isDarkMode)} />
            <SidebarAction isDarkMode={isDarkMode} icon={<Shield />} label="ميثاق الخصوصية" />
            <SidebarAction isDarkMode={isDarkMode} icon={<Mail />} label="مركز Goyln للدعم" />
          </nav>

          <div className="p-4 pb-8">
            <div className={`p-4 rounded-[24px] flex flex-row items-center justify-between cursor-pointer transition-all active:scale-95 border border-transparent ${isDarkMode ? 'bg-zinc-900/40 hover:border-zinc-800' : 'bg-zinc-50 hover:border-zinc-100'}`}>
              <div className="flex-1 min-w-0 text-right pr-3">
                <p className={`font-black text-[13px] truncate ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>حسابك في Goyln</p>
                <p className={`text-[9px] truncate font-black uppercase tracking-[0.05em] opacity-40 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>PREMIUM ACCESS</p>
              </div>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg font-black text-sm shrink-0 ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>G</div>
            </div>
          </div>
        </aside>
      </div>

      <main className="flex-1 flex flex-col relative w-full h-full">
        <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
          <div className="max-w-4xl mx-auto w-full min-h-full px-6 flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 animate-in fade-in duration-1000">
                <div className="relative h-32 w-full flex items-center justify-center mb-6">
                  <h2 key={phraseIndex} className={`text-2xl md:text-3xl font-black transition-all duration-1000 animate-slide-up text-center px-8 tracking-tighter leading-tight ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    {phrases[phraseIndex]}
                  </h2>
                </div>
              </div>
            ) : (
              <div className="py-24">
                {messages.map(msg => <MessageItem key={msg.id} message={msg} isDarkMode={isDarkMode} />)}
                {isLoading && (
                  <div className="flex items-center gap-3 p-8 w-fit ml-auto">
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDarkMode ? 'bg-white/30' : 'bg-black/10'}`} />
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:150ms] ${isDarkMode ? 'bg-white/30' : 'bg-black/10'}`} />
                    <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:300ms] ${isDarkMode ? 'bg-white/30' : 'bg-black/10'}`} />
                  </div>
                )}
                <div ref={messagesEndRef} className="h-40" />
              </div>
            )}
          </div>
        </div>

        {/* Floating Input Area - تصغير الحجم وتنظيمه */}
        <div className="absolute bottom-10 left-0 right-0 px-4 pointer-events-none">
          <div className="max-w-lg mx-auto w-full pointer-events-auto relative">
            
            {/* File Previews */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 p-2 glass-input rounded-2xl border border-transparent animate-in slide-in-from-bottom-2">
                {attachedFiles.map((file, i) => (
                  <div key={i} className={`flex items-center gap-2 px-2.5 py-1 rounded-xl text-[10px] font-bold border ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-white border-zinc-100 text-zinc-600'}`}>
                    {file.mimeType.includes('image') ? <ImageIcon size={10} /> : <FileText size={10} />}
                    <span className="max-w-[80px] truncate">{file.name}</span>
                    <button onClick={() => setAttachedFiles(f => f.filter((_, idx) => idx !== i))} className="hover:text-red-500"><X size={10} /></button>
                  </div>
                ))}
              </div>
            )}

            <div className={`glass-input border shadow-xl rounded-[28px] p-1.5 flex items-center gap-1.5 transition-all duration-700 focus-within:shadow-indigo-500/5 focus-within:scale-[1.01]
              ${isDarkMode ? 'bg-zinc-950/80 border-zinc-800 focus-within:border-zinc-700' : 'bg-white/95 border-zinc-100 focus-within:border-zinc-200'}`}>
              
              <div className="flex items-center gap-0.5 pl-1">
                <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className={`p-2 transition-all rounded-full active:scale-90 ${isDarkMode ? 'text-zinc-600 hover:text-white hover:bg-white/5' : 'text-zinc-400 hover:text-black hover:bg-zinc-50'}`}>
                  <Paperclip size={18} strokeWidth={2.5} />
                </button>
                <button onClick={toggleRecording} className={`p-2 transition-all rounded-full active:scale-90 ${isRecording ? 'bg-red-500 text-white animate-pulse' : (isDarkMode ? 'text-zinc-600 hover:text-white hover:bg-white/5' : 'text-zinc-400 hover:text-black hover:bg-zinc-50')}`}>
                  {isRecording ? <MicOff size={18} strokeWidth={2.5} /> : <Mic size={18} strokeWidth={2.5} />}
                </button>
              </div>

              <textarea 
                rows={1} 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => { 
                  if(e.key === 'Enter' && !e.shiftKey) { 
                    e.preventDefault(); 
                    handleSend(); 
                  } 
                }} 
                placeholder="اسأل Goyln..." 
                className={`flex-1 bg-transparent py-2 px-1 text-[15px] font-semibold outline-none border-none resize-none overflow-hidden max-h-40 tracking-tight ${isDarkMode ? 'text-zinc-100 placeholder-zinc-800' : 'text-zinc-900 placeholder-zinc-300'}`} 
              />

              <div className={`flex items-center p-0.5 rounded-2xl border mx-1 transition-all ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                <button onClick={() => setModelType(ModelType.FAST)} className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black transition-all flex items-center gap-1 ${modelType === ModelType.FAST ? (isDarkMode ? 'bg-white text-black shadow-md scale-105' : 'bg-black text-white shadow-md scale-105') : 'text-zinc-500 hover:text-zinc-800'}`}>
                  <Zap size={10} fill={modelType === ModelType.FAST ? "currentColor" : "none"} /> Goyln
                </button>
                <button onClick={() => setModelType(ModelType.THINKER)} className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black transition-all flex items-center gap-1 ${modelType === ModelType.THINKER ? (isDarkMode ? 'bg-white text-black shadow-md scale-105' : 'bg-black text-white shadow-md scale-105') : 'text-zinc-500 hover:text-zinc-800'}`}>
                  <BrainCircuit size={10} /> Mind
                </button>
              </div>

              <button onClick={handleSend} disabled={(!input.trim() && attachedFiles.length === 0) || isLoading} className={`p-3 rounded-[20px] transition-all flex items-center justify-center shadow-lg ${input.trim() || attachedFiles.length > 0 ? (isDarkMode ? 'bg-white text-black hover:bg-zinc-200 active:scale-95' : 'bg-black text-white hover:bg-zinc-800 active:scale-95') : (isDarkMode ? 'bg-zinc-900 text-zinc-800' : 'bg-zinc-100 text-zinc-200')}`}>
                <Send size={18} strokeWidth={2.5} className="transform rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {isLoginOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-2xl p-6 animate-in fade-in duration-700">
          <div className={`rounded-[40px] w-full max-sm:w-full max-w-sm p-12 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden text-center border ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-100'}`}>
            <button onClick={() => setIsLoginOpen(false)} className={`absolute top-10 left-10 transition-colors ${isDarkMode ? 'text-zinc-800 hover:text-white' : 'text-zinc-300 hover:text-black'}`}>
              <X size={24} strokeWidth={2.5} />
            </button>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-10 shadow-2xl font-black text-3xl ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>G</div>
            <h3 className={`text-2xl font-black mb-3 tracking-tighter ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Goyln Account</h3>
            <p className={`text-[13px] mb-10 font-bold ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>مستقبلك في Goyln يبدأ الآن.</p>
            <div className="space-y-3">
              <button className={`w-full py-4 px-8 border rounded-2xl flex items-center justify-center gap-3 font-black text-[13px] transition-all hover:scale-[1.02] active:scale-95 ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800' : 'bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50 shadow-sm'}`}>عبر جوجل</button>
              <button className={`w-full py-4 px-8 rounded-2xl font-black text-[13px] transition-all hover:scale-[1.02] active:scale-95 shadow-xl ${isDarkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}>البريد الإلكتروني</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
