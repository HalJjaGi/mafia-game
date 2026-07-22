"use client";

import type { useOnlineGame } from "@/lib/use-online-game";
import { ROLE_INFO } from "@/lib/types";
import NightActions from "./NightActions";
import VotingPanel from "./VotingPanel";

type Game = ReturnType<typeof useOnlineGame>;

const PHASE_LABELS: Record<string, string> = {
  "night": "🌙 밤 - 능력 사용",
  "day-discussion": "☀️ 낮 - 토론",
  "day-voting": "🗳️ 낮 - 투표",
};

const PHASE_TIMES: Record<string, number> = {
  "night": 30,
  "day-discussion": 60,
  "day-voting": 20,
};

export default function GameRoom({ game }: { game: Game }) {
  const { state, playerId, myRole, timeLeft } = game;

  if (!state) return null;

  const myPlayer = state.players.find(p => p.id === playerId);
  const isHost = myPlayer?.isHost;
  const alivePlayers = state.players.filter(p => p.alive);
  const myRoleInfo = myRole ? ROLE_INFO[myRole as keyof typeof ROLE_INFO] : null;

  // 타이머 표시
  const showTimer = ["night", "day-discussion", "day-voting"].includes(state.phase);
  const maxTime = PHASE_TIMES[state.phase] || 0;
  const timerPercent = maxTime > 0 ? (timeLeft / maxTime) * 100 : 0;

  return (
    <div className="space-y-3">
      {/* 타이머 바 */}
      {showTimer && state.phase !== "result" && (
        <div className="bg-[var(--surface)] rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold">{PHASE_LABELS[state.phase]}</span>
            <span className={`text-lg font-bold font-mono ${timeLeft <= 5 ? "text-red-400" : ""}`}>
              {timeLeft}초
            </span>
          </div>
          <div className="w-full bg-[var(--bg)] rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all ${timeLeft <= 5 ? "bg-red-500" : "bg-[var(--primary)]"}`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* 게임 결과 */}
      {state.phase === "result" && state.winner && (
        <div className="bg-[var(--surface)] rounded-2xl p-8 text-center">
          <div className="text-6xl mb-3">
            {state.winner === "mafia" ? "🔪" : "🎉"}
          </div>
          <h2 className="text-2xl font-bold">
            {state.winner === "mafia" ? "마피아 팀 승리!" : "시민 팀 승리!"}
          </h2>

          {/* 최종 역할 공개 */}
          <div className="mt-4 grid grid-cols-2 gap-1 text-xs">
            {state.players.map(p => (
              <div key={p.id} className={`flex items-center justify-between px-2 py-1 rounded ${
                p.alive ? "bg-[var(--bg)]" : "bg-red-900/20 opacity-60"
              }`}>
                <span>{p.name}</span>
                <span>{p.role ? `${ROLE_INFO[p.role].emoji} ${ROLE_INFO[p.role].name}` : "?"}</span>
              </div>
            ))}
          </div>

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

      {/* 내 역할 + 능력 결과 */}
      {state.phase !== "waiting" && state.phase !== "result" && myRoleInfo && (
        <div className="bg-[var(--surface)] rounded-xl p-3 flex items-center gap-3">
          <span className="text-2xl">{myRoleInfo.emoji}</span>
          <div className="flex-1">
            <p className="font-bold text-sm">
              {myRoleInfo.name}
              <span className={`ml-2 text-xs ${myRoleInfo.team === "mafia" ? "text-red-400" : "text-blue-400"}`}>
                {myRoleInfo.team === "mafia" ? "마피아 팀" : "시민 팀"}
              </span>
            </p>
            <p className="text-xs text-[var(--muted)]">{myRoleInfo.desc}</p>
          </div>
          {game.investigationResult && (
            <div className="text-xs bg-[var(--accent)] px-2 py-1 rounded">
              🔍 {game.investigationResult.targetName}: {ROLE_INFO[game.investigationResult.role as keyof typeof ROLE_INFO]?.name}
            </div>
          )}
          {game.mediumResult && (
            <div className="text-xs bg-purple-900/40 px-2 py-1 rounded">
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
              <div key={p.id} className="flex items-center gap-2 bg-[var(--bg)] rounded-lg px-3 py-2 text-sm">
                <span>{p.isHost ? "👑" : "👤"}</span>
                <span>{p.name}</span>
                {p.id === playerId && <span className="text-[var(--primary)] text-xs">(나)</span>}
              </div>
            ))}
          </div>

          {isHost && state.players.length >= 4 ? (
            <button onClick={game.startGame} className="w-full py-3 bg-[var(--primary)] rounded-lg font-bold text-lg">
              게임 시작! ({state.players.length}명)
            </button>
          ) : (
            <p className="text-center text-[var(--muted)] text-sm">
              최소 4명 필요 (현재 {state.players.length}명)
            </p>
          )}
        </div>
      )}

      {/* 밤 */}
      {state.phase === "night" && myPlayer?.alive && (
        <div className="bg-[var(--surface)] rounded-2xl p-4">
          <h2 className="text-base font-bold mb-3">🌙 {state.day}일차 밤</h2>
          <NightActions game={game} />
        </div>
      )}

      {/* 밤 - 사망자 관전 */}
      {state.phase === "night" && !myPlayer?.alive && (
        <div className="bg-[var(--surface)] rounded-2xl p-6 text-center">
          <p className="text-[var(--muted)]">👻 사망하여 관전 중입니다.</p>
        </div>
      )}

      {/* 낮 - 토론 */}
      {state.phase === "day-discussion" && (
        <div className="bg-[var(--surface)] rounded-2xl p-4">
          <h2 className="text-base font-bold mb-3">☀️ {state.day}일차 토론</h2>
          <div className="grid grid-cols-2 gap-2">
            {alivePlayers.map(p => (
              <div key={p.id} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                p.id === playerId ? "bg-[var(--accent)]" : "bg-[var(--bg)]"
              }`}>
                <span>🗣️</span>
                <span>{p.name}</span>
              </div>
            ))}
          </div>
          {isHost && (
            <button onClick={game.toVote} className="w-full mt-3 py-2 bg-[var(--primary)] rounded-lg font-bold text-sm">
              🗳️ 지금 투표로
            </button>
          )}
        </div>
      )}

      {/* 낮 - 투표 */}
      {state.phase === "day-voting" && myPlayer?.alive && (
        <VotingPanel game={game} />
      )}
      {state.phase === "day-voting" && !myPlayer?.alive && (
        <div className="bg-[var(--surface)] rounded-2xl p-6 text-center">
          <p className="text-[var(--muted)]">👻 투표를 관전 중입니다.</p>
        </div>
      )}

      {/* 게임 로그 */}
      {state.log.length > 0 && (
        <div className="bg-[var(--surface)] rounded-xl p-3">
          <h3 className="text-xs font-bold mb-2">📜 기록</h3>
          <div className="space-y-1 text-xs text-[var(--muted)] max-h-28 overflow-y-auto">
            {state.log.slice().reverse().map((entry, i) => (
              <p key={i}>{entry.message}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
