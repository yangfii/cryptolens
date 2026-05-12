import { MessageSquare } from "lucide-react";
import ChatWindow from "@/components/chat-window";

export const metadata = {
  title: "AI Chat — Ask About Crypto | CryptoLens",
  description:
    "Chat with Claude AI about crypto fundamentals, tokenomics, and research questions.",
};

export default function ChatPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <header className="mb-8 fade-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-tile" style={{ width: 44, height: 44, color: "#a78bfa" }}>
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-accent font-bold uppercase tracking-[0.15em]">
              AI Assistant
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Ask CryptoLens
            </h1>
          </div>
        </div>
        <p className="text-sm text-muted leading-relaxed max-w-2xl">
          Ask Claude Haiku 4.5 about any coin, concept, or trading topic.
          Streaming responses tuned for spot traders. For live prices, check
          the coin page — chat knowledge has a cutoff date.
        </p>
      </header>

      <ChatWindow />
    </div>
  );
}
