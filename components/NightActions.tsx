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
  const deadPlayers = state.players.filter(p => !p.alive);

  const handleSelect = (action: string, targetId: string) => {
    setSelected(targetId);
    game.nightAction(action, targetId);
  };

  // 역할별 행동
  if (myRole === "mafia") {
    const targets = alivePlayers.filter(p => p.role && ROLE_INFO[p.role].team !== "mafia");
    return (
      <ActionSelector
        title="🔪 마피아 - 처형할 대상"
        targets={targets}
        selected={selected}
        onSelect={(id) => handleSelect("mafia-kill", id)}
        playerId={playerId!}
      />
    );
  }

  if (myRole === "doctor") {
    return (
      <ActionSelector
        title="💉 의사 - 보호할 대상"
        targets={alivePlayers}
        selected={selected}
        onSelect={(id) => handleSelect("doctor-protect", id)}
        playerId={playerId!}
      />
    );
  }

  if (myRole === "police") {
    return (
      <ActionSelector
        title="🔍 경찰 - 조사할 대상"
        targets={alivePlayers.filter(p => p.id !== playerId)}
        selected={selected}
        onSelect={(id) => handleSelect("police-investigate", id)}
        playerId={playerId!}
      />
    );
  }

  // 🕵️ 스파이 (마피아 팀) - 마피아 동료 확인 + 경찰처럼 조사 가능하지만 거짓 정보 가능
  if (myRole === "spy") {
    const mafiaAllies = alivePlayers.filter(p => p.role === "mafia");
    return (
      <div>
        <div className="mb-4 p-3 bg-red-900/20 rounded-lg">
          <p className="text-sm font-semibold mb-1">🕵️ 스파이 정보</p>
          <p className="text-xs text-[var(--muted)]">당신은 마피아 팀입니다. 경찰이 조사해도 시민으로 나타납니다.</p>
          {mafiaAllies.length > 0 && (
            <div className="mt-2">
              <p className="text-xs">🔪 마피아 동료:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {mafiaAllies.map(p => (
                  <span key={p.id} className="px-2 py-0.5 bg-red-900/40 rounded text-xs">{p.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <p className="text-center text-[var(--muted)] text-sm">😴 다른 능력은 없습니다. 낮에 시민처럼 행동하세요.</p>
      </div>
    );
  }

  // 🎯 저격수
  if (myRole === "sniper") {
    const used = myPlayer.abilities?.sniperUsed;
    return (
      <div>
        <ActionSelector
          title={used ? "🎯 저격 완료 (사용함)" : "🎯 저격수 - 저격할 대상 (1회만)"}
          targets={alivePlayers.filter(p => p.id !== playerId)}
          selected={selected}
          onSelect={(id) => !used && handleSelect("sniper-shoot", id)}
          playerId={playerId!}
          disabled={used}
        />
        {used && (
          <p className="mt-2 text-xs text-yellow-400">⚠️ 저격을 이미 사용했습니다.</p>
        )}
      </div>
    );
  }

  // 🔮 영매
  if (myRole === "medium") {
    return (
      <div>
        <ActionSelector
          title="🔮 영매 - 죽은 자의 역할 확인"
          targets={deadPlayers}
          selected={selected}
          onSelect={(id) => handleSelect("medium-investigate", id)}
          playerId={playerId!}
        />
        {deadPlayers.length === 0 && (
          <p className="mt-2 text-xs text-[var(--muted)]">아직 죽은 사람이 없습니다.</p>
        )}
      </div>
    );
  }

  // 💣 테러리스트
  if (myRole === "terrorist") {
    return (
      <div className="text-center py-4">
        <p className="text-sm mb-2">💣 당신은 마피아 팀입니다.</p>
        <p className="text-xs text-[var(--muted)]">
          처형당하거나 투표로 추방될 때 자폭하여 한 명을 같이 죽입니다.
          밤에는 아무 행동도 할 수 없습니다.
        </p>
      </div>
    );
  }

  // 일반 시민
  return (
    <div className="text-center py-6">
      <p className="text-[var(--muted)]">😴 밤이 깊었습니다. 아침을 기다려주세요.</p>
    </div>
  );
}

function ActionSelector({
  title, targets, selected, onSelect, playerId, disabled,
}: {
  title: string;
  targets: { id: string; name: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
  playerId: string;
  disabled?: boolean;
}) {
  return (
    <div className={disabled ? "opacity-50 pointer-events-none" : ""}>
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
