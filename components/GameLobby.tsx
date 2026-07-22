"use client";

import { useState } from "react";
import type { useOnlineGame } from "@/lib/use-online-game";

type Game = ReturnType<typeof useOnlineGame>;

export default function GameLobby({ game }: { game: Game }) {
  const [joinCode, setJoinCode] = useState("");

  return (
    <div className="bg-[var(--surface)] rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4">🏠 대기실</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={joinCode}
          onChange={e => setJoinCode(e.target.value.toUpperCase())}
          placeholder="방 코드 입력"
          maxLength={6}
          className="flex-1 px-4 py-2 bg-[var(--bg)] rounded-lg border border-[var(--accent)] outline-none font-mono uppercase"
        />
        <button
          onClick={() => game.joinRoom(joinCode, "")}
          className="px-4 py-2 bg-[var(--accent)] rounded-lg font-bold"
        >
          참가
        </button>
      </div>
    </div>
  );
}
