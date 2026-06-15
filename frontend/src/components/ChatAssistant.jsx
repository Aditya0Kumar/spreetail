import React, { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Loader2, Bot } from "lucide-react";

export default function ChatAssistant({ backendUrl, groupId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I'm your Spreetail AI Assistant. Ask me about balances, who owes whom, or detailed expenses like 'How much did the Goa trip cost?'"
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
      setMessages((prev) => [...prev, { sender: "bot", text: "Failed to connect to AI server. Please check your backend." }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-[#5b45ff] text-white rounded-full shadow-lg hover:bg-indigo-700 hover:-translate-y-1 transition-all duration-200"
        title="Ask AI Assistant"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white border-l border-slate-200 shadow-2xl z-40 flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#5b45ff]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Spreetail AI Assistant</h3>
              <p className="text-[10px] text-slate-500">Powered by Gemini</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#f4f7fb] space-y-4">
          {messages.map((msg, idx) => {
            const isBot = msg.sender === "bot";
            return (
              <div key={idx} className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    isBot 
                      ? "bg-white text-slate-700 border border-slate-100 rounded-tl-sm" 
                      : "bg-[#5b45ff] text-white rounded-tr-sm"
                  }`}
                  style={{ whiteSpace: "pre-line" }}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 text-sm flex items-center gap-2 text-slate-500 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-[#5b45ff]" />
                Analyzing ledger...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Ask anything about expenses..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-[#f4f7fb] border border-transparent rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5b45ff] focus:bg-white transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 bg-[#5b45ff] disabled:bg-indigo-300 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-[9px] text-center text-slate-400 mt-2">AI can make mistakes. Verify important information.</p>
        </div>
      </div>
    </>
  );
}
