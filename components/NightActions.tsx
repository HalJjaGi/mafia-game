"use client";

import { useState, useEffect } from "react";
import type { useOnlineGame } from "@/lib/use-online-game";
import { ROLE_INFO } from "@/lib/types";

type Game = ReturnType<typeof useOnlineGame>;

export default function NightActions({ game }: { game: Game }) {
  const { state, playerId, myRole, sniperUsed, mafiaAllies } = game;
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setSelected(null);
  }, [state?.day, state?.phase]);

  if (!state || !myRole) return null;

  const myPlayer = state.players.find(p => p.id === playerId);
  if (!myPlayer) return null;

  if (!myPlayer.alive) {
    return (
      <div className="text-center py-6">
        <p className="text-4xl mb-2">👻</p>
        <p className="text-[var(--muted)] text-sm">사망하여 관전 중입니다.</p>
      </div>
    );
  }

  const alivePlayers = state.players.filter(p => p.alive);
  const deadPlayers = state.players.filter(p => !p.alive);

  const handleSelect = (action: string, targetId: string) => {
    setSelected(targetId);
    game.nightAction(action, targetId);
  };

  // 마피아 팀 동료 패널
  const mafiaPanel = (title: string, desc: string, extraNote?: string) => (
    <div className="mb-4 p-3 bg-red-900/20 border border-red-800/40 rounded-lg">
      <p className="text-sm font-semibold mb-1">{title}</p>
      <p className="text-xs text-[var(--muted)] mb-2">{desc}</p>
      {mafiaAllies.length > 0 ? (
        <div>
          <p className="text-xs mb-1">🔪 마피아 팀 동료:</p>
          <div className="flex flex-wrap gap-1">
            {mafiaAllies.map(p => (
              <span key={p.id} className="px-2 py-0.5 bg-red-900/40 rounded text-xs">
                {p.name}
                <span className="text-[var(--muted)] ml-1">
                  ({ROLE_INFO[p.role as keyof typeof ROLE_INFO]?.name})
                </span>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-red-300">마피아 동료가 없습니다.</p>
      )}
      {extraNote && <p className="text-xs text-yellow-400 mt-2">{extraNote}</p>}
    </div>
  );

  // === 🔪 마피아 ===
  if (myRole === "mafia") {
    const targets = alivePlayers.filter(p => p.role && ROLE_INFO[p.role].team !== "mafia");
    return (
      <div>
        {mafiaPanel("🔪 마피아", "밤마다 1명을 처형합니다. 마피아끼리 같이 논의하여 처형 대상을 정하세요.")}
        <ActionGrid
          title="🔪 처형할 대상"
          targets={targets}
          selected={selected}
          onSelect={(id) => handleSelect("mafia-kill", id)}
          playerId={playerId!}
        />
      </div>
    );
  }

  // === 🕵️ 스파이 ===
  if (myRole === "spy") {
    return (
      <div>
        {mafiaPanel(
          "🕵️ 스파이",
          "마피아 팀입니다. 경찰이 조사해도 시민으로 나타납니다.",
          "밤에 사용할 수 있는 능력이 없습니다. 낮에 시민처럼 행동하세요."
        )}
      </div>
    );
  }

  // === 💣 테러리스트 ===
  if (myRole === "terrorist") {
    return (
      <div>
        {mafiaPanel(
          "💣 테러리스트",
          "마피아 팀입니다. 처형/추방/저격당하면 자폭하여 시민 1명과 함께 죽습니다.",
          "밤에 사용할 수 있는 능력이 없습니다. 낮에 의심을 피하세요."
        )}
      </div>
    );
  }

  // === 🔍 경찰 ===
  if (myRole === "police") {
    const targets = alivePlayers.filter(p => p.id !== playerId);
    return (
      <div>
        <InfoPanel color="blue" title="🔍 경찰" desc="한 명을 조사하여 직업을 확인합니다. (스파이는 시민으로 위장)" />
        <ActionGrid
          title="조사할 대상"
          targets={targets}
          selected={selected}
          onSelect={(id) => handleSelect("police-investigate", id)}
          playerId={playerId!}
        />
        {game.investigationResult && (
          <ResultBox color="blue" emoji="🔍" title="조사 결과">
            {game.investigationResult.targetName} →{" "}
            <strong>
              {ROLE_INFO[game.investigationResult.role as keyof typeof ROLE_INFO]?.emoji}{" "}
              {ROLE_INFO[game.investigationResult.role as keyof typeof ROLE_INFO]?.name}
            </strong>
          </ResultBox>
        )}
      </div>
    );
  }

  // === 💉 의사 ===
  if (myRole === "doctor") {
    return (
      <div>
        <InfoPanel color="green" title="💉 의사" desc="한 명을 보호하여 마피아의 처형을 막습니다. 자기 자신도 가능." />
        <ActionGrid
          title="보호할 대상"
          targets={alivePlayers}
          selected={selected}
          onSelect={(id) => handleSelect("doctor-protect", id)}
          playerId={playerId!}
        />
        {selected && (
          <p className="mt-3 text-sm text-green-400 text-center">
            ✅ 보호 중: {alivePlayers.find(p => p.id === selected)?.name}
          </p>
        )}
      </div>
    );
  }

  // === 🎯 저격수 ===
  if (myRole === "sniper") {
    const targets = alivePlayers.filter(p => p.id !== playerId);
    const used = sniperUsed || myPlayer.abilities?.sniperUsed;
    return (
      <div>
        <InfoPanel color="yellow" title="🎯 저격수" desc={`게임 중 1회 저격 가능. 의사 보호 무시. (남은: ${used ? 0 : 1}회)`} />
        {used ? (
          <div className="p-4 bg-yellow-900/20 border border-yellow-700/40 rounded-lg text-center">
            <p className="text-yellow-400 font-bold">🎯 저격 사용 완료</p>
          </div>
        ) : (
          <ActionGrid
            title="저격할 대상"
            targets={targets}
            selected={selected}
            onSelect={(id) => handleSelect("sniper-shoot", id)}
            playerId={playerId!}
          />
        )}
      </div>
    );
  }

  // === 🔮 영매 ===
  if (myRole === "medium") {
    return (
      <div>
        <InfoPanel color="purple" title="🔮 영매" desc="죽은 사람의 직업을 확인할 수 있습니다." />
        {deadPlayers.length === 0 ? (
          <p className="text-center text-[var(--muted)] text-sm py-4">
            아직 죽은 사람이 없습니다.
          </p>
        ) : (
          <ActionGrid
            title="확인할 대상 (죽은 사람)"
            targets={deadPlayers}
            selected={selected}
            onSelect={(id) => handleSelect("medium-investigate", id)}
            playerId={playerId!}
          />
        )}
        {game.mediumResult && (
          <ResultBox color="purple" emoji="🔮" title="영매 결과">
            {game.mediumResult.targetName} →{" "}
            <strong>
              {ROLE_INFO[game.mediumResult.role as keyof typeof ROLE_INFO]?.emoji}{" "}
              {ROLE_INFO[game.mediumResult.role as keyof typeof ROLE_INFO]?.name}
            </strong>
          </ResultBox>
        )}
      </div>
    );
  }

  // === 👤 시민 ===
  return (
    <div className="text-center py-6">
      <p className="text-4xl mb-2">😴</p>
      <p className="text-[var(--muted)] text-sm">밤이 깊었습니다. 아침을 기다려주세요.</p>
    </div>
  );
}

// === 하위 컴포넌트 ===

function ActionGrid({
  title, targets, selected, onSelect, playerId,
}: {
  title: string;
  targets: { id: string; name: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
  playerId: string;
}) {
  return (
    <div>
      <p className="font-semibold mb-2">{title}</p>
      <div className="grid grid-cols-3 gap-2">
        {targets.map(p => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`px-2 py-2 rounded-lg text-sm transition-all ${
              selected === p.id
                ? "bg-[var(--primary)] font-bold scale-105"
                : "bg-[var(--bg)] border border-[var(--accent)] hover:border-[var(--primary)]"
            }`}
          >
            {p.id === playerId ? `${p.name} (나)` : p.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function InfoPanel({ color, title, desc }: { color: string; title: string; desc: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-900/20 border-blue-800/40",
    green: "bg-green-900/20 border-green-800/40",
    yellow: "bg-yellow-900/20 border-yellow-800/40",
    purple: "bg-purple-900/20 border-purple-800/40",
  };
  return (
    <div className={`mb-4 p-3 border rounded-lg ${colors[color] || ""}`}>
      <p className="text-sm font-semibold mb-1">{title}</p>
      <p className="text-xs text-[var(--muted)]">{desc}</p>
    </div>
  );
}

function ResultBox({ color, emoji, title, children }: { color: string; emoji: string; title: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-900/30 border-blue-700/40",
    purple: "bg-purple-900/30 border-purple-700/40",
  };
  return (
    <div className={`mt-3 p-3 border rounded-lg text-sm ${colors[color] || ""}`}>
      <p className="font-bold mb-1">{emoji} {title}</p>
      <p>{children}</p>
    </div>
  );
}
