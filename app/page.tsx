"use client";

import { useState } from "react";
import { useOnlineGame } from "@/lib/use-online-game";
import { ROLE_INFO, PHASE_INFO } from "@/lib/types";
import GameLobby from "@/components/GameLobby";
import GameRoom from "@/components/GameRoom";
import ChatPanel from "@/components/ChatPanel";

export default function Home() {
  const game = useOnlineGame();
  const [screen, setScreen] = useState<"menu" | "lobby">("menu");
  const [playerName, setPlayerName] = useState("");

  const handleCreate = () => {
    if (!playerName.trim()) return;
    game.createRoom(playerName.trim());
    setScreen("lobby");
  };

  const handleJoin = (code: string) => {
    if (!playerName.trim()) return;
    game.joinRoom(code, playerName.trim());
    setScreen("lobby");
  };

  // 게임 참가 후
  if (screen === "lobby" && game.state) {
    return (
      <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold">🎭 마피아 게임</h1>
          {game.roomCode && (
            <p className="text-[var(--muted)] mt-1">
              방 코드: <span className="font-mono font-bold text-[var(--primary)]">{game.roomCode}</span>
            </p>
          )}
        </header>

        {game.error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg px-4 py-2 mb-4 text-red-300 text-sm">
            ⚠️ {game.error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <GameRoom game={game} />
          </div>
          <div>
            <ChatPanel game={game} />
          </div>
        </div>

        <button
          onClick={() => {
            setScreen("menu");
            window.location.reload();
          }}
          className="mt-4 text-sm text-[var(--muted)] hover:text-white"
        >
          ← 나가기
        </button>
      </div>
    );
  }

  // 메인 메뉴
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-2">🎭 마피아 게임</h1>
        <p className="text-center text-[var(--muted)] mb-8">온라인 멀티플레이어</p>

        <input
          type="text"
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
          placeholder="닉네임"
          maxLength={12}
          className="w-full px-4 py-3 bg-[var(--bg)] rounded-lg border border-[var(--accent)] outline-none mb-4 text-center"
        />

        <button
          onClick={handleCreate}
          disabled={!playerName.trim()}
          className="w-full py-3 bg-[var(--primary)] rounded-lg font-bold mb-3 hover:opacity-80 disabled:opacity-30"
        >
          🏠 방 만들기
        </button>

        <div className="flex gap-2">
          <input
            type="text"
            id="joinCode"
            placeholder="방 코드"
            maxLength={6}
            className="flex-1 px-4 py-3 bg-[var(--bg)] rounded-lg border border-[var(--accent)] outline-none text-center uppercase font-mono"
          />
          <button
            onClick={() => {
              const input = document.getElementById("joinCode") as HTMLInputElement;
              handleJoin(input.value);
            }}
            disabled={!playerName.trim()}
            className="px-6 py-3 bg-[var(--accent)] rounded-lg font-bold hover:opacity-80 disabled:opacity-30"
          >
            참가
          </button>
        </div>

        {game.error && (
          <div className="mt-4 text-red-400 text-sm text-center">⚠️ {game.error}</div>
        )}
      </div>
    </div>
  );
}
