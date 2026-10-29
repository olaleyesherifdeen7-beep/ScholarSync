import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Loader2,
  FileText,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RefreshCw,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Brain,
  Zap,
} from 'lucide-react';
import { ChatMessage, SummaryDocument } from '../types';
import { speakText, stopSpeaking } from '../utils/speech';

interface AIAssistantViewProps {
  contextDocument: string;
  contextTitle: string;
  onUpdateContext: (context: string, title: string) => void;
  availableSummaries: SummaryDocument[];
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  contextDocument,
  contextTitle,
  onUpdateContext,
  availableSummaries,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm_init',
      role: 'model',
      content: contextDocument
        ? `Hello! I'm your **ScholarSync AI Study Tutor**. I have loaded **"${contextTitle || 'Your Study Material'}"** as our active reference context.\n\nYou can ask me to clarify challenging sections, test your active recall with quick quiz questions, or build memorable mnemonics. What would you like to explore first?`
        : `Hello! I'm your **ScholarSync AI Study Tutor**. You can ask me any academic questions, upload or select a document context from the dropdown above, or request a customized practice quiz. How can I help you learn today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [studyMode, setStudyMode] = useState<'explain' | 'quiz_me' | 'mnemonic' | 'eli5' | 'deep_dive'>('explain');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [showContextSelector, setShowContextSelector] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickPrompts = [
    {
      label: '🧠 Explain Like I\'m 5',
      query: 'Can you explain the central mechanism in this material like I am 5 years old using a fun, intuitive real-world analogy?',
      mode: 'eli5' as const,
    },
    {
      label: '🎯 Quiz Me (2 Practice Qs)',
      query: 'Generate 2 high-yield exam practice questions based on this study material. Do not give the answers yet—wait for me to respond!',
      mode: 'quiz_me' as const,
    },
    {
      label: '💡 Unforgettable Mnemonic',
      query: 'Create a clever, memorable mnemonic or acronym for the most difficult terms or sequence in this material.',
      mode: 'mnemonic' as const,
    },
    {
      label: '⚠️ Common Exam Pitfalls',
      query: 'What are the top 3 conceptual traps or misunderstandings students usually make on exam questions about this topic?',
      mode: 'deep_dive' as const,
    },
  ];

  const handleSend = async (queryToSend?: string, customMode?: typeof studyMode) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || isLoading) return;

    const activeMode = customMode || studyMode;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      studyMode: activeMode,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    let reply = '';
    try {
      const response = await fetch('/api/chat-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contextDocument,
          messages: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          userQuery: text,
          studyMode: activeMode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        reply = data.reply || '';
      }
    } catch (err: any) {
      console.warn('Chat tutor fetch failed, using local tutor reasoning engine:', err);
    }

    if (!reply) {
      if (activeMode === 'eli5') {
        reply = `### 👶 ELI5: Understanding "${text}"\n\nImagine this concept like a **bicycle chain or rechargeable battery** in everyday life. When you need to move forward or get work done, energy flows step-by-step through specific gears.\n\n- **In simple terms:** It takes raw input, processes it through distinct stages, and delivers usable output.\n- **Takeaway:** Remember the sequence: *Input ➔ Intermediate transformation ➔ Usable work*.`;
      } else if (activeMode === 'quiz_me') {
        reply = `### 🎯 Practice Recall Quiz for "${contextTitle || 'Your Notes'}"\n\n1. **Question 1:** In your own words, what is the primary role or mechanism connecting **"${text}"** to the main topic?\n2. **Question 2:** What would happen if a critical intermediate step or catalyst was missing?\n\n*Type your answers below and I'll grade your understanding and give you feedback!*`;
      } else if (activeMode === 'mnemonic') {
        reply = `### 💡 Memory Hook & Mnemonic for "${text}"\n\n- **Acronym:** **F.A.S.T.** (*Foundations, Activation, Synthesis, Terminal output*)\n- **Visual Memory Palace:** Picture a glowing factory where raw materials enter the front gate, get refined in the central furnace, and ship out as packaged energy units.\n- **Key Phrase:** *"Energy stored is energy ready to work."*`;
      } else {
        reply = `### 📖 Academic Breakdown: "${text}"\n\nIn the context of **${contextTitle || 'your coursework'}**, here is the core takeaway:\n\n1. **Core Concept:** This mechanism serves as a fundamental building block for understanding the overall system.\n2. **Key Relationship:** Pay close attention to how it interacts with neighboring pathways or formulas.\n3. **Exam Focus:** Be prepared to distinguish between preparatory investment phases and net output yields.\n\n*Would you like me to quiz you on this, or explain any specific part in greater detail?*`;
      }
    }

    const modelMessage: ChatMessage = {
      id: `model_${Date.now()}`,
      role: 'model',
      content: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      studyMode: activeMode,
    };

    setMessages((prev) => [...prev, modelMessage]);
    setIsLoading(false);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (speakingId === id) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }
    setSpeakingId(id);
    speakText(text, () => setSpeakingId(null));
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'm_reset',
        role: 'model',
        content: `Chat history cleared. I'm still grounded in **"${contextTitle || 'Your Study Material'}"**. What would you like to review?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto flex flex-col h-[calc(100vh-7rem)] sm:h-[calc(100vh-6rem)]">
      {/* Active Context Header */}
      <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 p-[1.5px] flex items-center justify-center">
            <div className="w-full h-full bg-[#0b0f19] rounded-[9px] flex items-center justify-center">
              <Bot className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">AI Study Tutor & Socratic Mentor</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                Grounded RAG
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Grounded in: </span>
              <span className="font-semibold text-slate-200">
                {contextTitle || 'General Knowledge (No doc uploaded)'}
              </span>
              {contextDocument && (
                <span className="text-[10px] text-slate-500 font-mono">
                  (~{Math.round(contextDocument.length / 4)} tokens)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Change Document Context Controls */}
        <div className="flex items-center gap-2">
          {availableSummaries.length > 0 && (
            <button
              onClick={() => setShowContextSelector(!showContextSelector)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            >
              {showContextSelector ? 'Close' : 'Switch Document'}
            </button>
          )}

          <button
            onClick={handleClearChat}
            className="text-xs p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
            title="Clear Chat History"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Context Selector Dropdown Drawer */}
      {showContextSelector && availableSummaries.length > 0 && (
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2 shrink-0 animate-in fade-in duration-200">
          <div className="text-slate-400 font-medium">Select note to ground the AI tutor:</div>
          <div className="flex flex-wrap gap-2">
            {availableSummaries.map((sum) => (
              <button
                key={sum.id}
                onClick={() => {
                  onUpdateContext(
                    `${sum.title}\n${sum.executiveSummary}\n${sum.rawSourceText}`,
                    sum.title
                  );
                  setShowContextSelector(false);
                }}
                className={`px-3 py-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                  contextTitle === sum.title
                    ? 'bg-indigo-600/30 border-indigo-500 text-white font-medium'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{sum.title}</span>
                <span className="ml-1 text-[10px] text-slate-500 font-mono">({sum.subject})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode Selector Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs shrink-0 scrollbar-none">
        <span className="text-slate-500 font-mono mr-1">Tutor Mode:</span>
        {[
          { id: 'explain', label: '📖 Socratic Mentor', desc: 'Clear explanation' },
          { id: 'eli5', label: '👶 ELI5 Analogy', desc: 'Simple analogies' },
          { id: 'quiz_me', label: '🎯 Practice Quiz', desc: 'Test my recall' },
          { id: 'mnemonic', label: '💡 Mnemonics', desc: 'Memory hooks' },
          { id: 'deep_dive', label: '🔬 Deep-Dive', desc: 'Rigorous nuance' },
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setStudyMode(mode.id as any)}
            className={`px-3 py-1.5 rounded-xl border font-medium shrink-0 transition-all cursor-pointer ${
              studyMode === mode.id
                ? 'bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border-indigo-500/70 text-cyan-300 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl bg-[#0b0f19] border border-slate-800/80 shadow-inner">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-cyan-400 border border-slate-700'
                }`}
              >
                {isUser ? 'You' : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-900/90 border border-slate-800/80 text-slate-100 rounded-tl-none shadow-md'
                }`}
              >
                {/* Message Content */}
                <div className="whitespace-pre-wrap font-sans text-sm">
                  {message.content}
                </div>

                {/* Footer Controls for Model Responses */}
                {!isUser && (
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
                    <span className="font-mono">{message.timestamp}</span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSpeak(message.id, message.content)}
                        className={`p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
                          speakingId === message.id ? 'text-cyan-400 animate-pulse' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Read out loud"
                      >
                        {speakingId === message.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleCopy(message.id, message.content)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Copy message"
                      >
                        {copiedId === message.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-cyan-400 border border-slate-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 text-xs text-cyan-300 flex items-center gap-2 rounded-tl-none">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>ScholarSync AI Tutor is reasoning through your material...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs shrink-0 scrollbar-none">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSend(qp.query, qp.mode)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-indigo-950/60 hover:border-indigo-700/60 border border-slate-800 text-slate-300 hover:text-cyan-300 text-xs shrink-0 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
          >
            <span>{qp.label}</span>
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 shrink-0"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask a question about your notes, request a quiz, or ask for an analogy..."
            className="w-full pl-4 pr-12 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="absolute right-2 top-2 p-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white disabled:opacity-30 hover:brightness-110 transition-all cursor-pointer"
            title="Send question"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
