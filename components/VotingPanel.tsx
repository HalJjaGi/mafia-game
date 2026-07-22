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

  useEffect(() => {
    if (state.votes[playerId!]) {
      setMyVote(state.votes[playerId!]);
    }
  }, [state.votes, playerId]);

  const handleVote = (targetId: string) => {
    setMyVote(targetId);
    game.vote(targetId);
  };

  const totalVotes = Object.keys(state.votes).length;

  if (!myPlayer) {
    return (
      <div className="bg-[var(--surface)] rounded-2xl p-6 text-center">
        <p className="text-[var(--muted)]">👻 사망하여 투표를 관전 중입니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface)] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold">🗳️ 투표 ({state.day}일차)</h2>
        <span className="text-sm text-[var(--muted)]">{totalVotes}/{alivePlayers.length} 투표</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {alivePlayers.filter(p => p.id !== playerId).map(p => (
          <button
            key={p.id}
            onClick={() => handleVote(p.id)}
            className={`px-2 py-2 rounded-lg text-sm transition-all ${
              myVote === p.id
                ? "bg-[var(--primary)] font-bold scale-105"
                : "bg-[var(--bg)] border border-[var(--accent)] hover:border-[var(--primary)]"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {myVote && (
        <p className="text-sm text-green-400 mb-2">
          ✅ 투표 완료: {alivePlayers.find(p => p.id === myVote)?.name}
        </p>
      )}

      <div className="w-full bg-[var(--bg)] rounded-full h-2 mb-3 overflow-hidden">
        <div
          className="bg-[var(--primary)] h-full transition-all"
          style={{ width: `${(totalVotes / alivePlayers.length) * 100}%` }}
        />
      </div>

      {myPlayer.isHost && (
        <button
          onClick={game.endVoting}
          disabled={totalVotes < alivePlayers.length}
          className="w-full py-2 bg-[var(--primary)] rounded-lg font-bold text-sm disabled:opacity-30"
        >
          {totalVotes >= alivePlayers.length ? "투표 종료!" : "모두 투표 대기 중..."}
        </button>
      )}
    </div>
  );
}
