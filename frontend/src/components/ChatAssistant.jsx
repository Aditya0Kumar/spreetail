import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2, Sparkles } from "lucide-react";

export default function ChatAssistant({ backendUrl, groupId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hi! I'm your Spreetail AI Assistant. Ask me about balances, who owes whom, or detailed expenses like 'How much did the Goa trip cost?' or 'Why does Sam owe Aisha?'"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { if (isOpen) scrollToBottom(); }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, groupId })
      });
      if (!res.ok) throw new Error("Failed to generate response");
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: "bot", text: "⚠️ Failed to connect to AI. Make sure your server is online and GEMINI_API_KEY is configured." }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-2xl shadow-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
        style={{
          background: "linear-gradient(135deg, var(--accent), #0d9488)",
          color: "var(--text-inverse)",
          boxShadow: "0 4px 20px rgba(5,150,105,0.3)",
        }}
        title="Ask AI Assistant"
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </button>

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-[420px] z-40 flex flex-col transition-transform duration-300"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          background: "var(--bg-secondary)",
          borderLeft: "1px solid var(--border-primary)",
          boxShadow: isOpen ? "var(--shadow-xl)" : "none",
        }}
      >
        {/* Header */}
        <div className="p-4 flex justify-between items-center" style={{ borderBottom: "1px solid var(--border-primary)", background: "var(--bg-elevated)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-light)" }}>
              <Sparkles className="w-4 h-4" style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>AI Assistant</h3>
              <span className="text-[10px] flex items-center gap-1" style={{ color: "var(--accent-text)" }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: "var(--accent)" }} />
                Powered by Gemini 2.5 Flash
              </span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg transition-colors duration-200" style={{ color: "var(--text-tertiary)" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "var(--bg-primary)" }}>
          {messages.map((msg, idx) => {
            const isBot = msg.sender === "bot";
            return (
              <div key={idx} className={`flex ${isBot ? "justify-start" : "justify-end"} animate-fadeIn`}>
                <div
                  className="max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed"
                  style={{
                    background: isBot ? "var(--bg-elevated)" : "var(--accent)",
                    color: isBot ? "var(--text-primary)" : "var(--text-inverse)",
                    border: isBot ? "1px solid var(--border-primary)" : "none",
                    fontWeight: isBot ? "normal" : "500",
                    whiteSpace: "pre-line",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-3 text-xs flex items-center gap-2" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }}>
                <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "var(--accent)" }} />
                Querying database...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 flex gap-2" style={{ borderTop: "1px solid var(--border-primary)", background: "var(--bg-elevated)" }}>
          <input
            type="text" required
            placeholder="Ask: 'Who spent the most?'"
            value={input} onChange={(e) => setInput(e.target.value)} disabled={loading}
            className="input-field flex-1 py-2.5 text-xs"
          />
          <button type="submit" disabled={loading || !input.trim()} className="btn-primary p-2.5 rounded-xl disabled:opacity-40">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
}
