"use client";

import { useParams } from "next/navigation";
import { useMessages, useSendMessage } from "@/hooks/use-conversations";
import { useState, useRef, useEffect } from "react";

export default function ChatPage() {
  const params = useParams();
  const slug = params.slug as string;
  const conversationId = params.conversationId as string;

  const { data: messages, isLoading } = useMessages(slug, conversationId);
  const sendMessage = useSendMessage(slug, conversationId);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sendMessage.isPending) return;
    setInput("");
    await sendMessage.mutateAsync(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full" data-testid="chat-area">
      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.03) 0%, transparent 50%)",
        }}
      >
        <div className="max-w-3xl mx-auto space-y-1">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                  <div className="skeleton h-12 rounded-2xl" style={{ width: `${40 + i * 15}%` }} />
                </div>
              ))}
            </div>
          ) : !messages || messages.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">💬</div>
              <p className="text-surface-400 text-lg mb-1">Start the conversation</p>
              <p className="text-surface-500 text-sm">Type a message below to talk with the AI assistant</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={msg._id}
                className="animate-fade-in"
                style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}
              >
                {msg.role === "step" ? (
                  /* Step indicator */
                  <div className="flex items-center gap-2 py-1.5 px-4">
                    <div className="flex items-center gap-2 text-xs text-surface-500">
                      {msg.stepType === "shopify" && "🛍️"}
                      {msg.stepType === "crm" && "👥"}
                      {msg.stepType === "analyzing" && (
                        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                      )}
                      {msg.stepType === "error" && "⚠️"}
                      <span className="italic">{msg.content}</span>
                    </div>
                  </div>
                ) : msg.role === "user" ? (
                  /* User message */
                  <div className="flex justify-end py-1.5">
                    <div
                      className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-md text-sm leading-relaxed"
                      style={{
                        background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                        color: "white",
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  /* Assistant message */
                  <div className="flex justify-start py-1.5">
                    <div className="flex gap-3 max-w-[85%]">
                      <div
                        className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-1"
                        style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))", border: "1px solid rgba(99, 102, 241, 0.2)" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L2 7l10 5 10-5-10-5z" />
                          <path d="M2 17l10 5 10-5" />
                        </svg>
                      </div>
                      <div
                        className="px-4 py-3 rounded-2xl rounded-tl-md text-sm leading-relaxed whitespace-pre-wrap"
                        style={{
                          background: "rgba(30, 41, 59, 0.6)",
                          border: "1px solid rgba(148, 163, 184, 0.08)",
                          color: "var(--color-surface-200)",
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Typing indicator */}
          {sendMessage.isPending && (
            <div className="flex justify-start py-1.5">
              <div className="flex gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))", border: "1px solid rgba(99, 102, 241, 0.2)" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                  </svg>
                </div>
                <div
                  className="px-5 py-4 rounded-2xl rounded-tl-md flex gap-1.5 items-center"
                  style={{ background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(148, 163, 184, 0.08)" }}
                >
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div
        className="px-4 py-4 border-t"
        style={{ borderColor: "rgba(148, 163, 184, 0.08)", background: "rgba(2, 6, 23, 0.8)" }}
      >
        <div className="max-w-3xl mx-auto">
          <div
            className="flex items-end gap-3 p-2 rounded-2xl"
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              border: "1px solid rgba(148, 163, 184, 0.12)",
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="flex-1 bg-transparent text-surface-100 placeholder:text-surface-500 resize-none outline-none text-sm px-3 py-2.5 max-h-32"
              style={{ minHeight: "40px" }}
              data-testid="chat-input"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sendMessage.isPending}
              className="p-2.5 rounded-xl transition-all duration-200 flex-shrink-0"
              style={{
                background: input.trim()
                  ? "linear-gradient(135deg, #6366f1, #4f46e5)"
                  : "rgba(71, 85, 105, 0.3)",
                opacity: input.trim() ? 1 : 0.5,
              }}
              data-testid="send-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-surface-600 text-center mt-2">
            AI responses are generated by Gemini. Integration data is simulated.
          </p>
        </div>
      </div>
    </div>
  );
}
