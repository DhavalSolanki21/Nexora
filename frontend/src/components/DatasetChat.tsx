import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, Loader2, Bot, User, Minimize2 } from "lucide-react";
import { getChatStatus, sendChatMessage } from "../api/client";
import type { ChatMessage } from "../types/chat";

interface Props { datasetId: string; filename?: string; }
type DisplayMessage = ChatMessage & { source?: string };

export default function DatasetChat({ datasetId, filename }: Props) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ollamaOk, setOllamaOk] = useState<boolean | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (open) getChatStatus(datasetId).then((s) => setOllamaOk(s.available && s.model_ready)); }, [open, datasetId]);
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
      if (!res.model.startsWith("nexora-")) setOllamaOk(res.ok);
    } catch { setMessages((m) => [...m, { role: "assistant", content: "Failed to reach Nexora AI." }]); }
    finally { setLoading(false); }
  };

  const suggestions = ["What can I predict?", "Which models are eligible?", "How many rows and columns?"];

  return (
    <>
      <AnimatePresence>
        {open && !minimized && (
          <motion.div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] flex flex-col bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden" initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} style={{ maxHeight: "min(560px, 70vh)" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <div><p className="text-sm font-medium text-gray-800">Nexora Guide</p><p className="text-[10px] text-gray-400 truncate max-w-[220px]">{filename ?? datasetId.slice(0, 8)}{ollamaOk === false && " · explanations limited"}</p></div>
              </div>
              <div className="flex gap-1">
                <button type="button" aria-label="Minimize chat" onClick={() => setMinimized(true)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded"><Minimize2 className="w-4 h-4" /></button>
                <button type="button" aria-label="Close chat" onClick={() => setOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
              {messages.length === 0 && (<div className="space-y-2"><p className="text-xs text-gray-400">CSV facts answer instantly. Open explanations use local Ollama.</p>{suggestions.map((s) => (<button key={s} type="button" onClick={() => setInput(s)} className="block w-full text-left text-xs px-3 py-2 rounded-lg border border-gray-100 text-gray-500 hover:border-blue-200 hover:text-blue-700 transition-colors">{s}</button>))}</div>)}
              {messages.map((m, i) => (<div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}><div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-gray-100" : "bg-blue-50"}`}>{m.role === "user" ? <User className="w-3.5 h-3.5 text-gray-600" /> : <Bot className="w-3.5 h-3.5 text-blue-600" />}</div><div className={`text-sm px-3 py-2 rounded-xl max-w-[85%] leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-gray-100 text-gray-700" : "bg-blue-50 text-gray-700"}`}>{m.source && <span className="block text-[10px] uppercase tracking-wide text-blue-500 mb-1">{m.source}</span>}{m.content}</div></div>))}
              {loading && <div className="flex gap-2 items-center text-gray-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" />Thinking…</div>}
              <div ref={bottomRef} />
            </div>
            <div className="p-3 border-t border-gray-100 flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()} placeholder="Ask what to predict or why…" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none" />
              <button type="button" aria-label="Send message" onClick={send} disabled={loading || !input.trim()} className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"><Send className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button type="button" aria-label="Open data guide chat" onClick={() => { setOpen(true); setMinimized(false); }} className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 hover:scale-105 transition-all" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <MessageSquare className="w-6 h-6" />
        {open && minimized && <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-300 rounded-full animate-pulse" />}
      </motion.button>
    </>
  );
}
