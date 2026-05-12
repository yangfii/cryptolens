"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import {
  Send,
  Sparkles,
  TrendingUp,
  BookOpen,
  Shield,
  Scale,
  User,
} from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

type Suggestion = {
  icon: typeof TrendingUp;
  iconColor: string;
  title: string;
  prompt: string;
};

const SUGGESTIONS: Suggestion[] = [
  {
    icon: TrendingUp,
    iconColor: "#fbbf24",
    title: "Bitcoin halving",
    prompt: "What is Bitcoin halving and how does it affect price historically?",
  },
  {
    icon: BookOpen,
    iconColor: "#22d3ee",
    title: "Ethereum gas fees",
    prompt: "Explain Ethereum gas fees for a beginner.",
  },
  {
    icon: Shield,
    iconColor: "#f43f5e",
    title: "Altcoin risks",
    prompt: "What are the main risks of spot trading altcoins?",
  },
  {
    icon: Scale,
    iconColor: "#a78bfa",
    title: "SOL vs AVAX",
    prompt: "Compare Solana and Avalanche fundamentals.",
  },
];

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return;

    setError(null);
    const userMsg: Message = { role: "user", content: text };
    const assistantMsg: Message = { role: "assistant", content: "" };
    const nextMessages = [...messages, userMsg];
    setMessages([...nextMessages, assistantMsg]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok) {
        const text = await res.text();
        try {
          const json = JSON.parse(text) as { error?: string };
          throw new Error(json.error || `Request failed: ${res.status}`);
        } catch (parseErr) {
          if (
            parseErr instanceof Error &&
            parseErr.message !== `Request failed: ${res.status}`
          ) {
            throw parseErr;
          }
          throw new Error(text || `Request failed: ${res.status}`);
        }
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response stream");

      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setStreaming(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="premium-card rounded-2xl flex flex-col h-[calc(100dvh-12rem)] min-h-[480px] sm:h-[640px] fade-up">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <span className="logo-premium inline-grid place-items-center w-9 h-9 rounded-xl text-accent-foreground font-black text-base">
            C
          </span>
          <div>
            <div className="font-bold text-sm flex items-center gap-2">
              CryptoLens AI
              <span className="pulse-dot" />
            </div>
            <div className="text-[10px] text-muted font-mono uppercase tracking-wider">
              Claude Haiku 4.5
            </div>
          </div>
        </div>
        <button
          onClick={() => setMessages([])}
          disabled={messages.length === 0 || streaming}
          className="text-xs text-muted hover:text-foreground disabled:opacity-30 transition-colors"
        >
          New chat
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="logo-premium w-16 h-16 rounded-2xl grid place-items-center text-accent-foreground font-black text-2xl mb-5">
              C
            </div>
            <h2 className="text-xl font-bold mb-2">How can I help you research?</h2>
            <p className="text-sm text-muted mb-8 max-w-md">
              I&apos;m tuned for spot trading questions — fundamentals,
              tokenomics, technical concepts, and risks. Pick a starter or ask
              anything.
            </p>
            <div className="grid sm:grid-cols-2 gap-2.5 w-full max-w-xl">
              {SUGGESTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.title}
                    onClick={() => sendMessage(s.prompt)}
                    className="text-left p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="icon-tile shrink-0"
                        style={{ width: 32, height: 32, color: s.iconColor }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold mb-1">
                          {s.title}
                        </div>
                        <div className="text-xs text-muted leading-relaxed line-clamp-2">
                          {s.prompt}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "flex justify-end gap-3"
                  : "flex justify-start gap-3"
              }
            >
              {m.role === "assistant" && (
                <span className="logo-premium shrink-0 inline-grid place-items-center w-8 h-8 rounded-lg text-accent-foreground font-black text-xs">
                  C
                </span>
              )}
              <div
                className={
                  m.role === "user"
                    ? "max-w-[80%] rounded-2xl rounded-tr-sm bg-accent text-accent-foreground px-4 py-3 text-sm font-medium"
                    : "max-w-[80%] rounded-2xl rounded-tl-sm bg-white/[0.04] border border-white/[0.06] px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed"
                }
              >
                {m.content || (
                  <span className="inline-flex gap-1 items-center text-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse" />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse"
                      style={{ animationDelay: "300ms" }}
                    />
                  </span>
                )}
              </div>
              {m.role === "user" && (
                <span className="shrink-0 inline-grid place-items-center w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08]">
                  <User className="w-4 h-4 text-muted" />
                </span>
              )}
            </div>
          ))
        )}
        {error && (
          <div className="rounded-xl border border-danger/30 bg-danger/[0.06] p-4 text-sm text-danger">
            <div className="font-semibold mb-1">Error</div>
            <div className="text-xs">{error}</div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-white/[0.06] p-3 flex gap-2"
      >
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a coin, concept, or trading topic…"
            disabled={streaming}
            className="w-full pl-4 pr-10 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-accent/50 focus:bg-white/[0.06] text-sm disabled:opacity-50 transition-colors"
          />
          <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        </div>
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="btn-primary inline-flex items-center gap-1.5 px-5 py-3 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">{streaming ? "…" : "Send"}</span>
        </button>
      </form>
    </div>
  );
}
