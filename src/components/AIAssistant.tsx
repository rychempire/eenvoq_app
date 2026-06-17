import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, Mic, Image, Paperclip, ChevronRight, 
  RefreshCcw, ShieldCheck, FileText, ArrowLeft
} from 'lucide-react';
import EenvoqIcon from './EenvoqIcon';
import { ChatMessage, Receipt, InventoryItem, Debtor, TruthAudit, Alert } from '../types';

interface AIAssistantProps {
  chatLogs: ChatMessage[];
  onSendMessage: (text: string, attachments?: { name: string; type: string }[]) => Promise<void>;
  receipts: Receipt[];
  inventory: InventoryItem[];
  debtors: Debtor[];
  audits: TruthAudit[];
  alerts: Alert[];
  clearChat: () => void;
  prefilledPrompt?: string;
  clearPrefilledPrompt?: () => void;
}

export default function AIAssistant({
  chatLogs,
  onSendMessage,
  receipts,
  inventory,
  debtors,
  audits,
  alerts,
  clearChat,
  prefilledPrompt,
  clearPrefilledPrompt
}: AIAssistantProps) {
  const [inputText, setInputText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; type: string }[]>([]);
  const [sending, setSending] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLogs]);

  // Handle prefilled triggers from Dashboard or Sidebar links
  useEffect(() => {
    if (prefilledPrompt) {
      setInputText(prefilledPrompt);
      if (clearPrefilledPrompt) clearPrefilledPrompt();
    }
  }, [prefilledPrompt, clearPrefilledPrompt]);

  const handleSendSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && attachedFiles.length === 0) return;

    const messageToSend = inputText;
    const filesToSend = attachedFiles;
    
    setInputText('');
    setAttachedFiles([]);
    setSending(true);

    try {
      await onSendMessage(messageToSend, filesToSend);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleQuickPillClick = (prompt: string) => {
    setInputText(prompt);
  };

  const simulateReceiptAttachment = () => {
    const samples = [
      { name: "Scanned_Receipt_4011.jpg", type: "image/jpeg" },
      { name: "Lagos_MegaStores_TILL_1.pdf", type: "application/pdf" },
      { name: "Bank_Transfer_CONFIRM_NQR.png", type: "image/png" }
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    setAttachedFiles([picked]);
  };

  const formatAIResponseText = (text: string) => {
    return text.split('\n').map((line, lineIdx) => {
      let content: React.ReactNode = line;
      
      // Check lists
      let isBullet = false;
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        isBullet = true;
        content = line.replace(/^[\s*-]+/, '').trim();
      }

      // Format bold text
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      const stringContent = typeof content === 'string' ? content : line;

      while ((match = boldRegex.exec(stringContent)) !== null) {
        if (match.index > lastIndex) {
          parts.push(stringContent.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-semibold text-[#1F1F1F]">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < stringContent.length) {
        parts.push(stringContent.substring(lastIndex));
      }

      const finalRendered = parts.length > 0 ? parts : content;

      if (isBullet) {
        return (
          <li key={lineIdx} className="ml-5 list-disc text-[#1F1F1F] leading-relaxed text-xs my-1 font-sans">
            {finalRendered}
          </li>
        );
      } else if (line.trim() === '') {
        return <div key={lineIdx} className="h-2" />;
      } else if (line.startsWith('### ')) {
        return <h4 key={lineIdx} className="text-xs font-semibold text-[#1F1F1F] mt-4 mb-1 font-sans">{line.replace('### ', '')}</h4>;
      } else if (line.startsWith('## ')) {
        return <h3 key={lineIdx} className="text-sm font-semibold text-[#1F1F1F] mt-4 mb-2 pb-1 border-b border-[#E3E3E3] font-sans">{line.replace('## ', '')}</h3>;
      }

      return <p key={lineIdx} className="text-xs text-[#1F1F1F] leading-relaxed my-0.5 font-sans">{finalRendered}</p>;
    });
  };

  const quickPills = [
    { title: "Revenue Analysis", desc: "Scan expected vs till cash", prompt: "Why was revenue lower today? Summarize cash declared versus transaction expectations, and point out potential leakage areas." },
    { title: "Predict Depletion", desc: "Analyze soonest stockouts", prompt: "Predict stock depletion based on sales rate velocity. Which inventory items need immediate orders before Tuesday?" },
    { title: "Audit Reminders", desc: "Show debtor notifications", prompt: "Show suspicious customer transaction variances and draft suitable WhatsApp debt reminder message templates for Baba Sadiq." },
    { title: "Customer Churn", desc: "Who might stop visits?", prompt: "Which high-value store customers have not returned in 7 days, and what loyalty coupon discounts can we offer them?" }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] bg-[#FAF9F5] rounded-[24px] border border-[#E3E3E3] shadow-none overflow-hidden" id="ai-assistant-canvas">
      
      {/* Thread control panel */}
      <div className="h-16 border-b border-[#E3E3E3] px-6 flex items-center justify-between bg-[#FAF9F5]/90 backdrop-blur select-none">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.location.hash = 'dashboard'}
            className="p-1 px-1.5 mr-1 hover:bg-gray-100 rounded-full transition text-[#1F1F1F] cursor-pointer flex items-center justify-center shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-6 h-6 stroke-[1.5]" />
          </button>
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse animate-pulse" />
          <h2 className="text-xs font-semibold font-sans text-[#1F1F1F] flex items-center gap-1 uppercase tracking-wider">
            AI Auditor
          </h2>
        </div>
        <button 
          onClick={clearChat}
          className="text-xs text-[#5F6368] hover:text-[#1F1F1F] hover:bg-gray-50 border border-[#E3E3E3] px-4 h-9 rounded-full flex items-center gap-2 cursor-pointer transition font-medium"
        >
          <RefreshCcw className="w-3.5 h-3.5 stroke-[1.5]" />
          Clear
        </button>
      </div>

      {/* Message History Screen */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAF9F5]" id="messages-scroller-viewport">
        {chatLogs.length === 0 ? (
          
          /* Empty state resembling standard Gemini center stage */
          <div className="max-w-2xl mx-auto text-left pt-6 md:pt-16 space-y-8" id="empty-thread-welcome">
            <div className="space-y-2">
              <h3 className="text-[28px] font-sans font-semibold text-[#1F1F1F] tracking-tight leading-tight select-none">
                Hello.
              </h3>
              <p className="text-xl font-sans text-[#757575] font-normal leading-tight">
                Ask anything.
              </p>
            </div>

            {/* Suggested cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4" id="chat-quick-pills">
              {quickPills.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPillClick(qp.prompt)}
                  className="p-5 bg-[#FCF5E8] hover:bg-[#FBEED7] rounded-[24px] border border-[#ECDCCB] text-left transition-all text-xs group cursor-pointer shadow-sm hover:scale-[0.99]"
                >
                  <p className="font-sans font-bold text-[#78350F] flex items-center justify-between gap-1 text-[13px]">
                    {qp.title}
                    <ChevronRight className="w-4 h-4 text-[#B45309] stroke-[1.5] transition-transform group-hover:translate-x-1" />
                  </p>
                  <p className="text-[#B45309] text-[11px] mt-1 font-semibold font-sans">{qp.desc}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Populated chat messages loop */
          <div className="max-w-3xl mx-auto space-y-6" id="messages-list-wrapper">
            {chatLogs.map((msg) => {
              const isAI = msg.role === 'model';
              return (
                <div 
                  className={`flex gap-4 ${isAI ? 'justify-start' : 'justify-end'}`}
                  id={`chat-msg-block-${msg.id}`}
                  key={msg.id}
                >
                  {isAI && (
                    <div className="w-10 h-10 rounded-full border border-[#CCD7CE] bg-[#E6F4EA] flex items-center justify-center shrink-0">
                      <EenvoqIcon className="w-5 h-5 text-[#137333] stroke-[1.2]" />
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-[24px] p-5 shadow-sm ${
                    isAI 
                      ? 'bg-[#E6F4EA] border border-[#CCD7CE] text-[#137333]' 
                      : 'bg-white border-2 border-black text-[#1F1F1F]'
                  }`}>
                    
                    {/* File Attachment Pill inside message body if applicable */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {msg.attachments.map((file, fileIdx) => (
                          <div 
                            key={fileIdx} 
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono border border-neutral-250 bg-white text-[#1F1F1F]"
                          >
                            <FileText className="w-4 h-4 text-[#757575] stroke-[1.5]" />
                            <span className="truncate max-w-[120px] font-medium">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-1">
                      {isAI ? (
                        formatAIResponseText(msg.text)
                      ) : (
                        <p className="text-xs leading-relaxed break-words font-semibold text-[#1F1F1F] font-sans">{msg.text}</p>
                      )}
                    </div>
                    
                    <div className={`text-[9px] font-sans mt-2 text-right ${isAI ? 'text-[#137333]/80' : 'text-[#757575]'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {!isAI && (
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border-2 border-black text-xs font-bold text-[#1F1F1F] font-sans">
                      Me
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Inline typing spinner */}
            {sending && (
              <div className="flex gap-4 justify-start">
                <div className="w-10 h-10 rounded-full border border-[#CCD7CE] bg-[#E6F4EA] flex items-center justify-center shrink-0">
                  <EenvoqIcon className="w-5 h-5 text-[#137333] stroke-[1.2] animate-pulse" />
                </div>
                <div className="bg-[#E6F4EA] border border-[#CCD7CE] rounded-[24px] px-5 py-4 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-[#137333] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-1.5 w-1.5 bg-[#137333] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-1.5 w-1.5 bg-[#137333] rounded-full animate-bounce" />
                  <span className="text-[10px] text-[#137333] font-semibold pl-1 font-sans">Analyzing...</span>
                </div>
              </div>
            )}

            <div ref={threadEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Input box segment */}
      <div className="p-4 border-t border-[#E3E3E3] bg-[#FAF9F5]" id="assistant-input-tray">
        <div className="max-w-3xl mx-auto">
          
          {/* File attach indicators tray */}
          {attachedFiles.length > 0 && (
            <div className="flex items-center gap-1.5 px-4 py-1.5 bg-white border border-[#E3E3E3] rounded-full mb-3 text-xs text-[#1F1F1F] w-fit font-normal">
              <Paperclip className="w-4 h-4 text-[#5F6368] stroke-[1.5]" />
              <span className="font-mono">{attachedFiles[0].name}</span>
              <button 
                onClick={() => setAttachedFiles([])}
                className="ml-2 text-red-650 font-bold hover:scale-110 shrink-0"
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSendSubmit} className="relative flex items-center" id="assistant-text-composer">
            <button
              type="button"
              onClick={simulateReceiptAttachment}
              className="absolute left-4 p-2 rounded-full hover:bg-[#F0F4F9] text-[#5F6368] cursor-pointer transition"
              title="Attach sample receipt"
            >
              <Image className="w-5 h-5 stroke-[1.5]" />
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask AI..."
              className="w-full bg-white border border-[#E3E3E3] rounded-[24px] py-4 pl-14 pr-24 text-sm text-[#1F1F1F] font-normal placeholder-[#757575] focus:outline-none focus:border-[#5F6368] transition shadow-none"
              id="assistant-chat-text-input"
            />
            
            {/* Submit button embedded inside input bar */}
            <div className="absolute right-4 flex items-center">
              <button
                type="submit"
                disabled={!inputText.trim() && attachedFiles.length === 0}
                className="bg-white text-[#5F6368] rounded-full p-2 hover:bg-[#F0F4F9] active:scale-95 disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer border border-[#E3E3E3] h-10 w-10 shrink-0"
              >
                <Send className="w-4 h-4 stroke-[1.5]" />
              </button>
            </div>
          </form>
          
          <div className="flex items-center justify-between text-[11px] text-[#757575] px-3 mt-2 select-none font-normal font-sans" id="assistant-api-notice">
            <span>Powered by Gemini.</span>
            <span className="flex items-center gap-1 font-normal">
              <ShieldCheck className="w-4 h-4 stroke-[1.5]" />
              Secured
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
