"use client";

import { useState } from "react";
import type { useOnlineGame } from "@/lib/use-online-game";
import { ROLE_INFO } from "@/lib/types";

type Game = ReturnType<typeof useOnlineGame>;

export default function NightActions({ game }: { game: Game }) {
  const { state, playerId, myRole } = game;
  const [selected, setSelected] = useState<string | null>(null);

  if (!state || !myRole) return null;

  const myPlayer = state.players.find(p => p.id === playerId);
  if (!myPlayer?.alive) {
    return <p className="text-[var(--muted)] text-sm">💀 사망하여 관전 중입니다.</p>;
  }

  const alivePlayers = state.players.filter(p => p.alive);

  const handleSelect = (action: string, targetId: string) => {
    setSelected(targetId);
    game.nightAction(action, targetId);
  };

  // 역할별 행동
  if (myRole === "mafia") {
    const targets = alivePlayers.filter(p => p.role !== "mafia");
    return (
      <ActionSelector
        title="🔪 마피아 - 처형할 대상"
        emoji="🔪"
        targets={targets}
        selected={selected}
        onSelect={(id) => handleSelect("mafia-kill", id)}
        playerId={playerId}
      />
    );
  }

  if (myRole === "doctor") {
    return (
      <ActionSelector
        title="💉 의사 - 보호할 대상"
        emoji="💉"
        targets={alivePlayers}
        selected={selected}
        onSelect={(id) => handleSelect("doctor-protect", id)}
        playerId={playerId}
      />
    );
  }

  if (myRole === "police") {
    return (
      <ActionSelector
        title="🔍 경찰 - 조사할 대상"
        emoji="🔍"
        targets={alivePlayers.filter(p => p.id !== playerId)}
        selected={selected}
        onSelect={(id) => handleSelect("police-investigate", id)}
        playerId={playerId}
      />
    );
  }

  // 시민
  return (
    <div className="text-center py-6">
      <p className="text-[var(--muted)]">😴 밤이 깊었습니다. 아침을 기다려주세요.</p>
    </div>
  );
}

function ActionSelector({
  title, emoji, targets, selected, onSelect, playerId,
}: {
  title: string;
  emoji: string;
  targets: { id: string; name: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
  playerId: string;
}) {
  return (
    <div>
      <p className="font-semibold mb-2">{title}</p>
      <div className="flex flex-wrap gap-2">
        {targets.map(p => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`px-3 py-2 rounded-lg text-sm ${
              selected === p.id
                ? "bg-[var(--primary)] font-bold"
                : "bg-[var(--bg)] border border-[var(--accent)]"
            }`}
          >
            {p.id === playerId ? `${p.name} (나)` : p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
