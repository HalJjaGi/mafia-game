"use client";

import type { useOnlineGame } from "@/lib/use-online-game";
import { ROLE_INFO, PHASE_INFO } from "@/lib/types";
import NightActions from "./NightActions";
import VotingPanel from "./VotingPanel";

type Game = ReturnType<typeof useOnlineGame>;

export default function GameRoom({ game }: { game: Game }) {
  const { state, playerId, myRole } = game;

  if (!state) return null;

  const myPlayer = state.players.find(p => p.id === playerId);
  const isHost = myPlayer?.isHost;
  const alivePlayers = state.players.filter(p => p.alive);
  const myRoleInfo = myRole ? ROLE_INFO[myRole as keyof typeof ROLE_INFO] : null;

  return (
    <div className="space-y-4">
      {/* 게임 결과 */}
      {state.phase === "result" && state.winner && (
        <div className="bg-[var(--surface)] rounded-2xl p-8 text-center">
          <div className="text-6xl mb-3">
            {state.winner === "mafia" ? "🔪" : "🎉"}
          </div>
          <h2 className="text-2xl font-bold">
            {state.winner === "mafia" ? "마피아 승리!" : "시민 승리!"}
          </h2>
          {isHost && (
            <button
              onClick={game.resetGame}
              className="mt-4 px-6 py-2 bg-[var(--primary)] rounded-lg font-bold"
            >
              🔄 새 게임
            </button>
          )}
        </div>
      )}

      {/* 내 역할 */}
      {state.phase !== "waiting" && state.phase !== "result" && myRoleInfo && (
        <div className="bg-[var(--surface)] rounded-2xl p-4 flex items-center gap-3">
          <span className="text-3xl">{myRoleInfo.emoji}</span>
          <div>
            <p className="font-bold">{myRoleInfo.name}</p>
            <p className="text-xs text-[var(--muted)]">{myRoleInfo.desc}</p>
          </div>
          {game.investigationResult && (
            <div className="ml-auto text-sm bg-[var(--accent)] px-3 py-1 rounded-lg">
              🔍 {game.investigationResult.targetName}: {ROLE_INFO[game.investigationResult.role as keyof typeof ROLE_INFO]?.name}
            </div>
          )}
          {game.mediumResult && (
            <div className="ml-auto text-sm bg-purple-900/40 px-3 py-1 rounded-lg">
              🔮 {game.mediumResult.targetName}: {ROLE_INFO[game.mediumResult.role as keyof typeof ROLE_INFO]?.name}
            </div>
          )}
        </div>
      )}

      {/* 대기실 */}
      {state.phase === "waiting" && (
        <div className="bg-[var(--surface)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">⏳ 대기 중</h2>
            <span className="text-[var(--muted)]">{state.players.length}/12명</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {state.players.map(p => (
              <div
                key={p.id}
                className="flex items-center gap-2 bg-[var(--bg)] rounded-lg px-3 py-2 text-sm"
              >
                <span>{p.isHost ? "👑" : "👤"}</span>
                <span>{p.name}</span>
                {p.id === playerId && <span className="text-[var(--primary)] text-xs">(나)</span>}
              </div>
            ))}
          </div>

          {isHost && state.players.length >= 4 && (
            <button
              onClick={game.startGame}
              className="w-full py-3 bg-[var(--primary)] rounded-lg font-bold text-lg"
            >
              게임 시작! ({state.players.length}명)
            </button>
          )}
          {state.players.length < 4 && (
            <p className="text-center text-[var(--muted)] text-sm">
              최소 4명이 필요합니다 (현재 {state.players.length}명)
            </p>
          )}
        </div>
      )}

      {/* 밤 */}
      {state.phase === "night" && myPlayer?.alive && (
        <div className="bg-[var(--surface)] rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-2">🌙 {state.day}일차 밤</h2>
          <NightActions game={game} />
          {isHost && (
            <button
              onClick={game.endNight}
              className="w-full mt-4 py-3 bg-[var(--primary)] rounded-lg font-bold"
            >
              ☀️ 아침으로
            </button>
          )}
        </div>
      )}

      {/* 낮 - 토론 */}
      {state.phase === "day-discussion" && (
        <div className="bg-[var(--surface)] rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-2">☀️ {state.day}일차 - 토론</h2>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {alivePlayers.map(p => (
              <div
                key={p.id}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  p.id === playerId ? "bg-[var(--accent)]" : "bg-[var(--bg)]"
                }`}
              >
                <span>🗣️</span>
                <span>{p.name}</span>
              </div>
            ))}
          </div>
          {isHost && (
            <button
              onClick={game.toVote}
              className="w-full py-3 bg-[var(--primary)] rounded-lg font-bold"
            >
              🗳️ 투표로 넘어가기
            </button>
          )}
        </div>
      )}

      {/* 낮 - 투표 */}
      {state.phase === "day-voting" && myPlayer?.alive && (
        <VotingPanel game={game} />
      )}

      {/* 게임 로그 */}
      {state.log.length > 0 && (
        <div className="bg-[var(--surface)] rounded-2xl p-4">
          <h3 className="text-sm font-bold mb-2">📜 기록</h3>
          <div className="space-y-1 text-xs text-[var(--muted)] max-h-32 overflow-y-auto">
            {state.log.slice().reverse().map((entry, i) => (
              <p key={i}>{entry.message}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
