"use client";

import { useState, useEffect, useRef } from "react";
import type { useOnlineGame } from "@/lib/use-online-game";

type Game = ReturnType<typeof useOnlineGame>;

export default function ChatPanel({ game }: { game: Game }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ name: string; message: string; timestamp: number }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(game.chatMessages);
  }, [game.chatMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    game.sendChat(input.trim());
    setInput("");
  };

  return (
    <div className="bg-[var(--surface)] rounded-2xl p-4 h-[500px] flex flex-col">
      <h3 className="text-sm font-bold mb-3">💬 채팅</h3>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
        {messages.length === 0 ? (
          <p className="text-xs text-[var(--muted)] text-center mt-8">
            메시지를 보내면 여기에 표시됩니다
          </p>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className="text-sm">
              <span className="text-[var(--primary)] font-semibold">{msg.name}</span>
              <span className="text-[var(--muted)] text-xs ml-1">
                {new Date(msg.timestamp).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <p className="mt-0.5">{msg.message}</p>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="메시지..."
          maxLength={200}
          className="flex-1 px-3 py-2 bg-[var(--bg)] rounded-lg border border-[var(--accent)] outline-none text-sm"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-[var(--accent)] rounded-lg text-sm font-bold"
        >
          전송
        </button>
      </div>
    </div>
  );
}
