
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
  Phone,
  Volume2
} from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Message, ModelType } from './types';
import { generateAIResponse } from './geminiService';

// --- مساعدات ترميز وفك ترميز الصوت للـ Live API ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

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
      {/* Fix: Cast icon to React.ReactElement<any> to resolve TypeScript 'size' property error on cloneElement. Also verify validity. */}
      {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 16 }) : icon}
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
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-500 group-hover:scale-105 mt-0.5
          ${isUser 
            ? (isDarkMode ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' : 'bg-zinc-100 text-zinc-800 border border-zinc-200') 
            : (isDarkMode ? 'bg-white text-black' : 'bg-black text-white')}`}>
          {isUser ? <User size={16} strokeWidth={1.5} /> : <div className="font-black text-sm tracking-tighter">G</div>}
        </div>

        <div className={`flex flex-col ${isUser ? 'items-end text-right' : 'items-start text-left'} flex-1`}>
          <div className={`text-[14.5px] leading-[1.7] whitespace-pre-wrap transition-all tracking-tight
            ${isUser 
              ? (isDarkMode ? 'text-zinc-400 font-normal' : 'text-zinc-500 font-normal') 
              : (isDarkMode ? 'text-zinc-100 font-semibold' : 'text-zinc-900 font-semibold')}`}>
            {message.content}
          </div>
          
          {/* Implement mandatory display of grounding links as per Gemini API requirements for Google Search grounding */}
          {!isUser && groundingLinks && groundingLinks.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
              {groundingLinks.map((link: any, idx: number) => (
                <a 
                  key={idx} 
                  href={link.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700' : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-black hover:border-zinc-300'}`}
                >
                  <Globe size={10} />
                  <span className="truncate max-w-[120px]">{link.title || 'Source'}</span>
                  <ExternalLink size={10} />
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
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [modelType, setModelType] = useState<ModelType>(ModelType.FAST);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // مراجع للتحدث المباشر
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [liveStatus, setLiveStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');

  const phrases = [
    "كيف يمكن لـ Goyln مساعدتك؟ ✨",
    "Goyln AI: ذكاء بلمسة إنسانية. 😊",
    "فكر بعمق، استجب بسرعة. ⚡",
    "Goyln Company: نبتكر للمستقبل. 🚀",
    "كامل الفخر لـ Goyln في هذه الصناعة. 💎"
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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const result = await generateAIResponse(input, modelType, history);
      // Ensure grounding chunks are preserved in the message state
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

  const startLiveConversation = async () => {
    setIsLiveMode(true);
    setLiveStatus('connecting');
    
    // Always initialize a fresh GoogleGenAI instance with process.env.API_KEY for Live API sessions.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let nextStartTime = 0;
    const sources = new Set<AudioBufferSourceNode>();

    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    audioContextRef.current = outputAudioContext;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setLiveStatus('listening');
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              // Crucial: Use the resolved session promise to send realtime input as per guidelines to avoid stale closures.
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              setLiveStatus('speaking');
              nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContext.destination);
              source.addEventListener('ended', () => {
                sources.delete(source);
                if (sources.size === 0) setLiveStatus('listening');
              });
              source.start(nextStartTime);
              nextStartTime += audioBuffer.duration;
              sources.add(source);
            }
            if (message.serverContent?.interrupted) {
              sources.forEach(s => s.stop());
              sources.clear();
              nextStartTime = 0;
              setLiveStatus('listening');
            }
          },
          onclose: () => { setLiveStatus('idle'); setIsLiveMode(false); },
          onerror: (e) => { console.error(e); setIsLiveMode(false); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'أنت الآن تتحدث مباشرة مع المستخدم كإنسان حقيقي من شركة Goyln. كن ودوداً جداً، بشرياً في أسلوبك، وتحدث بصوت واضح ومطمئن.'
        }
      });
      liveSessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsLiveMode(false);
    }
  };

  const stopLiveConversation = () => {
    if (liveSessionRef.current) liveSessionRef.current.close();
    setIsLiveMode(false);
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden transition-all duration-700 ease-in-out ${isDarkMode ? 'bg-[#000000] text-white' : 'bg-white text-zinc-900'}`}>
      
      {/* واجهة التحدث المباشر الغامرة */}
      {isLiveMode && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
          {/* الخلفية: منظر طبيعي خلاب للمياه */}
          <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000 brightness-[0.4]" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=2070")' }}></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60"></div>
          
          <button onClick={stopLiveConversation} className="absolute top-10 left-10 p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl transition-all active:scale-90 text-white z-50 shadow-2xl border border-white/10">
            <X size={28} />
          </button>

          <div className="relative flex flex-col items-center gap-12 text-center max-w-xl px-10 animate-slide-up">
            {/* الشخص البشري المساعد - Goyln Agent */}
            <div className={`relative group transition-all duration-700 ${liveStatus === 'speaking' ? 'scale-110' : 'scale-100'}`}>
              <div className={`absolute -inset-8 bg-blue-500/20 rounded-full blur-3xl transition-opacity duration-1000 ${liveStatus === 'speaking' ? 'opacity-100 animate-pulse' : 'opacity-0'}`}></div>
              <div className={`w-64 h-64 md:w-80 md:h-80 rounded-full border-4 border-white/20 overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.1)] transition-all duration-500 ${liveStatus === 'speaking' ? 'border-white/60 shadow-[0_0_150px_rgba(255,255,255,0.3)]' : ''}`}>
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600" alt="Goyln Human Assistant" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              </div>
              {liveStatus === 'speaking' && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1 items-center bg-white/10 backdrop-blur-3xl px-6 py-2 rounded-full border border-white/20 shadow-2xl">
                   <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0s]"></div>
                   <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
                   <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-2xl">Goyln Live</h2>
              <p className="text-white/60 font-bold text-lg uppercase tracking-[0.3em] drop-shadow-lg">
                {liveStatus === 'connecting' ? 'جاري الاتصال بالنظام...' : liveStatus === 'speaking' ? 'Goyln يتحدث الآن' : 'أنا أسمعك بكل اهتمام...'}
              </p>
            </div>

            <div className="flex items-center gap-8">
               <div className={`w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-3xl border border-white/10 shadow-2xl transition-all duration-500 ${liveStatus === 'listening' ? 'bg-white/20 scale-125 shadow-white/20' : 'bg-white/5 opacity-50'}`}>
                  <Mic size={32} className="text-white" />
               </div>
               <div className={`w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-3xl border border-white/10 shadow-2xl transition-all duration-500 ${liveStatus === 'speaking' ? 'bg-blue-500/40 scale-125 shadow-blue-500/40' : 'bg-white/5 opacity-50'}`}>
                  <Volume2 size={32} className="text-white" />
               </div>
            </div>
            
            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.6em] mt-10">Developed by Goyln Company</p>
          </div>
        </div>
      )}

      <header className="fixed top-3 left-0 right-0 flex items-center justify-between px-5 z-40 pointer-events-none">
        <button onClick={() => setIsSidebarOpen(true)} className={`p-2 rounded-xl transition-all pointer-events-auto shadow-sm backdrop-blur-2xl border border-transparent ${isDarkMode ? 'hover:bg-white/10 text-white/50 hover:text-white' : 'hover:bg-zinc-100 text-zinc-400 hover:text-black'}`}>
          <Menu size={20} strokeWidth={2} />
        </button>

        <div className="relative pointer-events-auto">
          <button onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)} className={`p-2 rounded-xl transition-all pointer-events-auto shadow-sm backdrop-blur-2xl border border-transparent ${isDarkMode ? 'hover:bg-white/10 text-white/30 hover:text-white' : 'hover:bg-zinc-100 text-zinc-300 hover:text-black'} ${isAccountMenuOpen ? 'rotate-180 text-black dark:text-white scale-105' : ''}`}>
            <ArrowLeft size={18} strokeWidth={2} />
          </button>
          <div className={`absolute top-full left-0 mt-3 flex flex-col gap-3 p-1 transition-all duration-500 origin-top-left z-50 ${isAccountMenuOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 -translate-y-4 pointer-events-none'}`}>
            <button onClick={() => { setIsLoginOpen(true); setIsAccountMenuOpen(false); }} className={`w-10 h-10 flex items-center justify-center backdrop-blur-2xl border rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-zinc-800/90 border-zinc-700/50 text-white' : 'bg-white/95 border-zinc-200 text-black'}`}>
              <User size={18} strokeWidth={2} />
            </button>
            <button className={`w-10 h-10 flex items-center justify-center backdrop-blur-2xl border rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-zinc-800/90 border-zinc-700/50 text-white' : 'bg-white/95 border-zinc-200 text-black'}`}>
              <Headphones size={18} strokeWidth={2} />
            </button>
            <button onClick={startLiveConversation} className={`w-10 h-10 flex items-center justify-center backdrop-blur-2xl border rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-zinc-800/90 border-zinc-700/50 text-white' : 'bg-white/95 border-zinc-200 text-black'}`}>
              <Sparkles size={18} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className={`fixed inset-0 z-50 transition-all duration-500 ${isSidebarOpen ? 'bg-black/60 visible opacity-100 backdrop-blur-sm' : 'invisible opacity-0'}`} onClick={() => setIsSidebarOpen(false)}>
        <aside onClick={(e) => e.stopPropagation()} className={`absolute top-0 right-0 w-72 h-full shadow-2xl transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col ${isDarkMode ? 'bg-zinc-950 border-l border-zinc-900' : 'bg-white'}`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-zinc-700' : 'text-zinc-300'}`}>Goyln Systems</span>
              <button onClick={() => setIsSidebarOpen(false)} className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/5 text-zinc-500' : 'hover:bg-zinc-50 text-zinc-400'}`}>
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="relative group">
              <Search className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors ${isDarkMode ? 'text-zinc-700' : 'text-zinc-300'}`} size={14} />
              <input type="text" placeholder="بحث..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full pr-10 pl-4 py-3 rounded-xl text-[12px] font-bold focus:ring-1 outline-none transition-all ${isDarkMode ? 'bg-zinc-900/50 text-white border-zinc-800 focus:ring-white/10' : 'bg-zinc-50 text-zinc-900 border-none focus:ring-black/5'}`} />
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
            <div className={`mt-6 p-3.5 rounded-2xl flex items-center gap-3.5 cursor-pointer transition-all active:scale-95 border border-transparent hover:border-zinc-800 dark:hover:border-zinc-700 ${isDarkMode ? 'bg-zinc-900/50' : 'bg-zinc-50'}`}>
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
                  <h2 key={phraseIndex} className={`text-2xl md:text-3xl font-black transition-all duration-1000 animate-slide-up text-center px-6 tracking-tight ${isDarkMode ? 'text-zinc-700' : 'text-zinc-400'}`}>
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

        {/* Floating Input Area */}
        <div className="absolute bottom-8 left-0 right-0 px-5 pointer-events-none">
          <div className="max-w-xl mx-auto w-full pointer-events-auto relative">
            
            {/* القائمة المنسدلة "أضف" */}
            <div className={`absolute bottom-[110%] left-0 flex flex-col gap-2 p-2 rounded-2xl border transition-all duration-500 origin-bottom shadow-2xl backdrop-blur-3xl ${isAddMenuOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-10 pointer-events-none'} ${isDarkMode ? 'bg-zinc-950/90 border-zinc-800' : 'bg-white/90 border-zinc-100'}`}>
               <button className={`p-3 rounded-xl transition-all flex items-center gap-3 text-[10px] font-black uppercase ${isDarkMode ? 'hover:bg-white/5 text-zinc-400' : 'hover:bg-zinc-50 text-zinc-500'}`}>
                  <RefreshCcw size={16} /> تحويل
               </button>
               <button className={`p-3 rounded-xl transition-all flex items-center gap-3 text-[10px] font-black uppercase ${isDarkMode ? 'hover:bg-white/5 text-zinc-400' : 'hover:bg-zinc-50 text-zinc-500'}`}>
                  <ImageIcon size={16} /> صورة
               </button>
               <button className={`p-3 rounded-xl transition-all flex items-center gap-3 text-[10px] font-black uppercase ${isDarkMode ? 'hover:bg-white/5 text-zinc-400' : 'hover:bg-zinc-50 text-zinc-500'}`}>
                  <Film size={16} /> فيديو
               </button>
               <button className={`p-3 rounded-xl transition-all flex items-center gap-3 text-[10px] font-black uppercase ${isDarkMode ? 'hover:bg-white/5 text-zinc-400' : 'hover:bg-zinc-50 text-zinc-500'}`}>
                  <FileText size={16} /> ملف
               </button>
            </div>

            <div className={`backdrop-blur-3xl border shadow-[0_20px_50px_rgba(0,0,0,0.12)] rounded-3xl p-1.5 flex items-center gap-1 transition-all duration-500 focus-within:shadow-2xl focus-within:scale-[1.01]
              ${isDarkMode ? 'bg-zinc-950/80 border-zinc-800 focus-within:border-zinc-600' : 'bg-white/95 border-zinc-100 focus-within:border-zinc-300'}`}>
              
              <div className="flex items-center px-0.5">
                <button onClick={() => setIsAddMenuOpen(!isAddMenuOpen)} className={`p-2 transition-all rounded-xl active:scale-90 ${isDarkMode ? 'text-zinc-600 hover:text-white hover:bg-white/5' : 'text-zinc-400 hover:text-black hover:bg-zinc-50'} ${isAddMenuOpen ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white rotate-45' : ''}`}>
                  <Plus size={18} strokeWidth={2.5} />
                </button>
                <button onClick={startLiveConversation} className={`p-2 transition-all rounded-xl active:scale-90 ${isDarkMode ? 'text-zinc-600 hover:text-white hover:bg-white/5' : 'text-zinc-400 hover:text-black hover:bg-zinc-50'}`}>
                  <Phone size={18} strokeWidth={2.5} />
                </button>
              </div>

              <textarea rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); setIsAddMenuOpen(false); } }} placeholder="تحدث مع Goyln..." className={`flex-1 bg-transparent py-2.5 px-2 text-[14.5px] font-semibold outline-none border-none resize-none overflow-hidden max-h-32 tracking-tight ${isDarkMode ? 'text-zinc-100 placeholder-zinc-800' : 'text-zinc-900 placeholder-zinc-300'}`} />

              <div className={`flex items-center p-1 rounded-full border mx-1 transition-all ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                <button onClick={() => setModelType(ModelType.FAST)} className={`p-1.5 rounded-full transition-all duration-500 ${modelType === ModelType.FAST ? (isDarkMode ? 'bg-white text-black scale-105' : 'bg-black text-white scale-105') : 'text-zinc-500 hover:text-zinc-800'}`}>
                  <Zap size={14} fill={modelType === ModelType.FAST ? "currentColor" : "none"} />
                </button>
                <button onClick={() => setModelType(ModelType.THINKER)} className={`p-1.5 rounded-full transition-all duration-500 ${modelType === ModelType.THINKER ? (isDarkMode ? 'bg-white text-black scale-105' : 'bg-black text-white scale-105') : 'text-zinc-500 hover:text-zinc-800'}`}>
                  <BrainCircuit size={14} />
                </button>
              </div>

              <button onClick={handleSend} disabled={!input.trim() || isLoading} className={`p-2.5 rounded-2xl transition-all flex items-center justify-center shadow-lg ${input.trim() && !isLoading ? (isDarkMode ? 'bg-white text-black hover:bg-zinc-200 active:scale-95' : 'bg-black text-white hover:bg-zinc-800 active:scale-95') : (isDarkMode ? 'bg-zinc-900 text-zinc-800' : 'bg-zinc-100 text-zinc-200')}`}>
                <Send size={18} strokeWidth={2.5} className="transform rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {isLoginOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-xl p-6 animate-in fade-in duration-500">
          <div className={`rounded-[32px] w-full max-sm:w-full max-w-xs p-10 shadow-[0_30px_80px_rgba(0,0,0,0.5)] relative overflow-hidden text-center border ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-100'}`}>
            <button onClick={() => setIsLoginOpen(false)} className={`absolute top-8 left-8 transition-colors ${isDarkMode ? 'text-zinc-800 hover:text-white' : 'text-zinc-300 hover:text-black'}`}>
              <X size={20} strokeWidth={2} />
            </button>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl font-black text-3xl ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>G</div>
            <h3 className={`text-2xl font-black mb-2 tracking-tighter ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Goyln Account</h3>
            <p className={`text-[12px] mb-8 font-bold ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>مستقبل Goyln بانتظارك.</p>
            <div className="space-y-3.5">
              <button className={`w-full py-4 px-6 border rounded-2xl flex items-center justify-center gap-3 font-black text-[13px] transition-all hover:scale-[1.02] active:scale-95 ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800' : 'bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50'}`}>جوجل</button>
              <button className={`w-full py-4 px-6 rounded-2xl font-black text-[13px] transition-all hover:scale-[1.02] active:scale-95 shadow-lg ${isDarkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}>البريد الإلكتروني</button>
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
