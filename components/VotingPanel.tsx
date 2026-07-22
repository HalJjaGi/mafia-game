"use client";

import { useState, useEffect } from "react";
import type { useOnlineGame } from "@/lib/use-online-game";

type Game = ReturnType<typeof useOnlineGame>;

export default function VotingPanel({ game }: { game: Game }) {
  const { state, playerId } = game;
  const [myVote, setMyVote] = useState<string | null>(null);

  if (!state) return null;

  const alivePlayers = state.players.filter(p => p.alive);
  const myPlayer = alivePlayers.find(p => p.id === playerId);

  // 내 투표 동기화
  useEffect(() => {
    if (state.votes[playerId!]) {
      setMyVote(state.votes[playerId!]);
    }
  }, [state.votes, playerId]);

  const handleVote = (targetId: string) => {
    setMyVote(targetId);
    game.vote(targetId);
  };

  const aliveVoters = alivePlayers;
  const votedCount = Object.keys(state.votes).filter(id =>
    alivePlayers.some(p => p.id === id)
  ).length;

  if (!myPlayer) {
    return <p className="text-[var(--muted)]">💀 사망하여 관전 중입니다.</p>;
  }

  // 투표 현황
  const voteCount: Record<string, number> = {};
  Object.values(state.votes).forEach(tid => {
    voteCount[tid] = (voteCount[tid] || 0) + 1;
  });

  return (
    <div className="bg-[var(--surface)] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">🗳️ 투표 ({state.day}일차)</h2>
        <span className="text-sm text-[var(--muted)]">{votedCount}/{aliveVoters.length} 투표</span>
      </div>

      {/* 투표 대상 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {alivePlayers.filter(p => p.id !== playerId).map(p => {
          const count = voteCount[p.id] || 0;
          return (
            <button
              key={p.id}
              onClick={() => handleVote(p.id)}
              className={`relative px-3 py-2 rounded-lg text-sm transition-all ${
                myVote === p.id
                  ? "bg-[var(--primary)] font-bold scale-105"
                  : "bg-[var(--bg)] border border-[var(--accent)]"
              }`}
            >
              {p.name}
              {count > 0 && (
                <span className="ml-1 text-xs opacity-70">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 내 투표 표시 */}
      {myVote && (
        <p className="text-sm text-[var(--muted)] mb-3">
          ✅ 투표 완료: {alivePlayers.find(p => p.id === myVote)?.name}
        </p>
      )}

      {/* 투표 진행 바 */}
      <div className="w-full bg-[var(--bg)] rounded-full h-2 mb-4 overflow-hidden">
        <div
          className="bg-[var(--primary)] h-full transition-all"
          style={{ width: `${(votedCount / aliveVoters.length) * 100}%` }}
        />
      </div>

      {/* 방장 종료 버튼 */}
      {myPlayer.isHost && (
        <button
          onClick={game.endVoting}
          disabled={votedCount < aliveVoters.length}
          className="w-full py-3 bg-[var(--primary)] rounded-lg font-bold disabled:opacity-30"
        >
          {votedCount >= aliveVoters.length ? "투표 종료!" : "모두 투표 대기 중..."}
        </button>
      )}
    </div>
  );
}
