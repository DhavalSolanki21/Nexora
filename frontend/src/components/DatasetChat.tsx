import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, Loader2, Bot, User, Minimize2, AlertCircle, ExternalLink } from "lucide-react";
import { sendChatMessage } from "../api/client";
import type { ChatMessage } from "../types/chat";

interface Props { datasetId: string; filename?: string; }
type DisplayMessage = ChatMessage & { source?: string };

export default function DatasetChat({ datasetId, filename }: Props) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput(""); setLoading(true);
    try {
      const history = messages.map(({ role, content }) => ({ role, content }));
      const res = await sendChatMessage(datasetId, text, history);
      const source = res.model === "nexora-grounded"
        ? "CSV fact"
        : res.model === "nexora-guidance"
          ? "Workflow guidance"
          : "Ollama explanation";
      setMessages((m) => [...m, { role: "assistant", content: res.reply, source }]);
    } catch { 
      setMessages((m) => [...m, { role: "assistant", content: "Failed to reach Nexora AI. Please make sure the backend is running." }]); 
    } finally { 
      setLoading(false); 
    }
  };

  const suggestions = ["What can I predict?", "Which models are eligible?", "How many rows and columns?"];

  return (
    <>
      <AnimatePresence>
        {open && !minimized && (
          <motion.div 
            className="fixed bottom-24 right-6 z-50 w-[390px] max-w-[calc(100vw-3rem)] flex flex-col glass shadow-data-viz rounded-2xl overflow-hidden" 
            initial={{ opacity: 0, y: 30, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 30, scale: 0.95 }} 
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            style={{ maxHeight: "min(600px, 75vh)" }}
          >
            {/* Header with gradient accent */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-nexora-border bg-gradient-to-r from-white via-white to-nexora-accent/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-nexora-accent/10 border border-nexora-accent/30 flex items-center justify-center">
                  <Bot className="w-4.5 h-4.5 text-nexora-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-nexora-dark tracking-tight">Nexora-Helper</p>
                  <p className="text-[10px] text-nexora-dark/40 truncate max-w-[200px]">{filename ?? datasetId.slice(0, 8)}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button type="button" aria-label="Minimize chat" onClick={() => setMinimized(true)} className="p-1.5 text-nexora-dark/40 hover:text-nexora-accent hover:bg-nexora-accent/5 rounded transition-colors"><Minimize2 className="w-3.8 h-3.8" /></button>
                <button type="button" aria-label="Close chat" onClick={() => setOpen(false)} className="p-1.5 text-nexora-dark/40 hover:text-nexora-accent hover:bg-nexora-accent/5 rounded transition-colors"><X className="w-3.8 h-3.8" /></button>
              </div>
            </div>

            {!isLocal && (
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-50/50 border-b border-yellow-200/40 px-4 py-3 text-xs text-yellow-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <span>
                    <strong>Nexora-Helper (Ollama)</strong> is only available locally.
                  </span>
                  <a 
                    href="https://github.com/jeet2005/Nexora" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-0.5 text-yellow-700 hover:text-yellow-800 font-medium underline ml-1.5"
                  >
                    View clone guide <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-[220px] bg-mesh-gradient">
              {messages.length === 0 && (
                <div className="space-y-3 py-2">
                  <p className="text-xs text-nexora-dark/50 leading-relaxed font-medium">
                    💡 CSV facts answer instantly. Detailed explanations require Ollama.
                  </p>
                  <div className="space-y-2">
                    {suggestions.map((s) => (
                      <button 
                        key={s} 
                        type="button" 
                        onClick={() => setInput(s)} 
                        className="block w-full text-left text-xs px-3.5 py-2.5 rounded-xl border border-nexora-border bg-white text-nexora-dark/60 hover:border-nexora-accent/50 hover:text-nexora-accent hover:shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 animate-fade-in-up ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center shrink-0 border ${m.role === "user" ? "bg-nexora-dark/5 border-nexora-border" : "bg-nexora-accent/10 border-nexora-accent/30"}`}>
                    {m.role === "user" ? <User className="w-3.8 h-3.8 text-nexora-dark/60" /> : <Bot className="w-3.8 h-3.8 text-nexora-accent" />}
                  </div>
                  <div className={`text-sm px-3.5 py-2.5 rounded-2xl max-w-[82%] leading-relaxed whitespace-pre-wrap shadow-sm border ${m.role === "user" ? "bg-nexora-dark/5 border-nexora-border/50 text-nexora-dark" : "bg-nexora-accent/5 border-nexora-accent/20 text-nexora-dark"}`}>
                    {m.source && <span className="block text-[9px] font-bold uppercase tracking-widest text-nexora-accent mb-1.5 opacity-70">{m.source}</span>}
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 items-center animate-fade-in-up">
                  <div className="w-7.5 h-7.5 rounded-lg flex items-center justify-center shrink-0 border bg-nexora-accent/10 border-nexora-accent/30">
                    <Loader2 className="w-4 h-4 animate-spin text-nexora-accent" />
                  </div>
                  <div className="text-sm px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-nexora-accent/10 to-nexora-accent/5 border border-nexora-accent/20 text-nexora-dark/60 font-medium inline-flex items-center gap-2">
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-nexora-accent animate-pulse"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-nexora-accent animate-pulse" style={{ animationDelay: "0.2s" }}></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-nexora-accent animate-pulse" style={{ animationDelay: "0.4s" }}></span>
                    </span>
                    Nexora-Helper thinking...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            
            <div className="p-3 border-t border-nexora-border flex gap-2 bg-gradient-to-r from-white via-white to-nexora-accent/5">
              <input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()} 
                placeholder="Ask what to predict or why…" 
                className="flex-1 bg-nexora-dark/5 border border-nexora-border rounded-xl px-3.5 py-2.5 text-sm text-nexora-dark placeholder:text-nexora-dark/40 focus:border-nexora-accent/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-nexora-accent/20 transition-all" 
              />
              <motion.button 
                type="button" 
                aria-label="Send message" 
                onClick={send} 
                disabled={loading || !input.trim()} 
                className="p-2.5 rounded-xl bg-nexora-accent text-white hover:bg-nexora-accent-dark active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all shadow-glow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button 
        type="button" 
        aria-label="Open data guide chat" 
        onClick={() => { setOpen(true); setMinimized(false); }} 
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-nexora-accent text-white flex items-center justify-center shadow-lift hover:shadow-glow-green hover:scale-110 active:scale-95 transition-all"
        whileHover={{ scale: 1.1 }} 
        whileTap={{ scale: 0.95 }}
      >
        <MessageSquare className="w-6 h-6" />
        {open && minimized && <span className="absolute -top-1 -right-1 w-3 h-3 bg-nexora-light rounded-full animate-pulse" />}
      </motion.button>
    </>
  );
}
