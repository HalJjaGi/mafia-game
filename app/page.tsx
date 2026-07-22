"use client";

import { useGameStore } from "@/lib/store";
import { ROLE_INFO, PHASE_INFO } from "@/lib/types";
import { useState } from "react";

export default function Home() {
  const {
    phase, players, day, winner, log, nightResult, votes,
    addPlayer, removePlayer, startGame,
    mafiaKill, doctorProtect, policeInvestigate, endNight,
    vote, endVoting, reset,
  } = useGameStore();

  const [playerName, setPlayerName] = useState("");
  const [showRoles, setShowRoles] = useState(false);
  const [revealedPlayers, setRevealedPlayers] = useState<Set<string>>(new Set());

  const alivePlayers = players.filter(p => p.alive);
  const myPlayer = players[0]; // 싱글 화면 기준 첫 번째 플레이어 = 나

  const handleAddPlayer = () => {
    if (!playerName.trim()) return;
    addPlayer(playerName.trim());
    setPlayerName("");
  };

  const handleVote = (voterId: string, targetId: string) => {
    vote(voterId, targetId);
  };

  const allVoted = alivePlayers.every(p => votes[p.id]);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      {/* 헤더 */}
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          🎭 마피아 게임
        </h1>
        <p className="text-[var(--muted)]">
          {PHASE_INFO[phase].emoji} {PHASE_INFO[phase].name} · {day}일차
        </p>
      </header>

      {/* 결과 화면 */}
      {phase === "result" && winner && (
        <div className="text-center bg-[var(--surface)] rounded-2xl p-8 mb-6">
          <div className="text-6xl mb-4">
            {winner === "mafia" ? "🔪" : "🎉"}
          </div>
          <h2 className="text-3xl font-bold mb-2">
            {winner === "mafia" ? "마피아 승리!" : "시민 승리!"}
          </h2>
          <button
            onClick={reset}
            className="mt-4 px-6 py-2 bg-[var(--primary)] rounded-lg font-semibold hover:opacity-80"
          >
            🔄 새 게임
          </button>
        </div>
      )}

      {/* 대기실 */}
      {phase === "waiting" && (
        <div className="bg-[var(--surface)] rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">platz: 대기실</h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddPlayer()}
              placeholder="플레이어 이름"
              className="flex-1 px-4 py-2 bg-[var(--bg)] rounded-lg border border-[var(--accent)] outline-none"
            />
            <button
              onClick={handleAddPlayer}
              className="px-4 py-2 bg-[var(--accent)] rounded-lg font-semibold hover:opacity-80"
            >
              참가
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {players.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-[var(--bg)] rounded-lg px-4 py-2">
                <span>{p.isHost ? "👑 " : "👤 "}{p.name}</span>
                <button
                  onClick={() => removePlayer(p.id)}
                  className="text-red-400 text-sm hover:text-red-300"
                >
                  나가기
                </button>
              </div>
            ))}
          </div>

          {players.length >= 4 ? (
            <button
              onClick={startGame}
              className="w-full py-3 bg-[var(--primary)] rounded-lg font-bold text-lg hover:opacity-80"
            >
              게임 시작! ({players.length}명)
            </button>
          ) : (
            <p className="text-center text-[var(--muted)]">
              최소 4명이 필요합니다. (현재 {players.length}명)
            </p>
          )}
        </div>
      )}

      {/* 내 역할 카드 */}
      {phase !== "waiting" && phase !== "result" && myPlayer && (
        <div className="bg-[var(--surface)] rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">내 역할</h2>
            <button
              onClick={() => setShowRoles(!showRoles)}
              className="text-sm text-[var(--muted)] hover:text-white"
            >
              {showRoles ? "숨기기" : "전체 보기"}
            </button>
          </div>
          
          {/* 전체 역할 표시 (호스트용/테스트용) */}
          {showRoles && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {players.map(p => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                    p.alive ? "bg-[var(--bg)]" : "bg-red-900/20 opacity-50"
                  }`}
                >
                  <span>{p.name}</span>
                  <span>{p.role ? `${ROLE_INFO[p.role].emoji} ${ROLE_INFO[p.role].name}` : "?"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 밤 행동 */}
      {phase === "night" && (
        <div className="bg-[var(--surface)] rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🌙 밤이 되었습니다</h2>
          
          {/* 마피아 행동 */}
          <NightAction
            title="🔪 마피아 - 타겟 선택"
            players={alivePlayers.filter(p => p.role !== "mafia")}
            onSelect={mafiaKill}
            selected={nightResult?.killedId}
          />

          {/* 의사 행동 */}
          <NightAction
            title="💉 의사 - 보호할 사람"
            players={alivePlayers}
            onSelect={doctorProtect}
            selected={nightResult?.protectedId}
          />

          {/* 경찰 행동 */}
          <NightAction
            title="🔍 경찰 - 조사할 사람"
            players={alivePlayers}
            onSelect={(id) => {
              policeInvestigate(id);
              const target = players.find(p => p.id === id);
              if (target?.role) {
                alert(`${target.name}님은 ${ROLE_INFO[target.role].name}입니다.`);
              }
            }}
            selected={nightResult?.investigatedId}
          />

          <button
            onClick={endNight}
            className="w-full mt-4 py-3 bg-[var(--primary)] rounded-lg font-bold hover:opacity-80"
          >
            ☀️ 아침이 밝았다
          </button>
        </div>
      )}

      {/* 낮 - 토론 */}
      {phase === "day-discussion" && (
        <div className="bg-[var(--surface)] rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">☀️ 토론 시간</h2>
          <p className="text-[var(--muted)] mb-4">
            어젯밤에 일어난 일을 바탕으로 의심되는 사람을 찾아 토론하세요.
          </p>
          <div className="space-y-2 mb-4">
            {alivePlayers.map(p => (
              <div key={p.id} className="flex items-center gap-3 bg-[var(--bg)] rounded-lg px-4 py-2">
                <span className="text-2xl">🗣️</span>
                <span>{p.name}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => useGameStore.setState({ phase: "day-voting" })}
            className="w-full py-3 bg-[var(--primary)] rounded-lg font-bold hover:opacity-80"
          >
            🗳️ 투표로 넘어가기
          </button>
        </div>
      )}

      {/* 낮 - 투표 */}
      {phase === "day-voting" && (
        <div className="bg-[var(--surface)] rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🗳️ 투표</h2>
          <div className="space-y-2 mb-4">
            {alivePlayers.map(voter => (
              <div key={voter.id} className="bg-[var(--bg)] rounded-lg p-3">
                <p className="text-sm mb-2">{voter.name}의 투표:</p>
                <div className="flex flex-wrap gap-2">
                  {alivePlayers.filter(p => p.id !== voter.id).map(target => (
                    <button
                      key={target.id}
                      onClick={() => handleVote(voter.id, target.id)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        votes[voter.id] === target.id
                          ? "bg-[var(--primary)] font-bold"
                          : "bg-[var(--surface)] border border-[var(--accent)]"
                      }`}
                    >
                      {target.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={endVoting}
            disabled={!allVoted}
            className="w-full py-3 bg-[var(--primary)] rounded-lg font-bold hover:opacity-80 disabled:opacity-30"
          >
            {allVoted ? "투표 결과 확인" : "모두 투표해야 합니다"}
          </button>
        </div>
      )}

      {/* 게임 로그 */}
      {log.length > 0 && (
        <div className="bg-[var(--surface)] rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-3">📜 게임 기록</h2>
          <div className="space-y-1 text-sm text-[var(--muted)] max-h-48 overflow-y-auto">
            {log.slice().reverse().map((entry, i) => (
              <p key={i}>{entry.message}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 밤 행동 컴포넌트
function NightAction({
  title, players, onSelect, selected,
}: {
  title: string;
  players: { id: string; name: string }[];
  onSelect: (id: string) => void;
  selected?: string | null;
}) {
  const [open, setOpen] = useState(true);
  
  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left font-semibold mb-2"
      >
        {open ? "▼" : "▶"} {title}
      </button>
      {open && (
        <div className="flex flex-wrap gap-2">
          {players.map(p => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`px-3 py-1 rounded-lg text-sm ${
                selected === p.id
                  ? "bg-[var(--primary)] font-bold"
                  : "bg-[var(--bg)] border border-[var(--accent)]"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
