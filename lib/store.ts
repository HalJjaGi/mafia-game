import { create } from "zustand";
import type { GameState, Player, Phase, Role, GameLog } from "./types";
import { assignRoles, checkWinner } from "./types";

interface GameStore extends GameState {
  // 방 관리
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  startGame: () => void;
  
  // 밤 행동
  mafiaKill: (targetId: string) => void;
  doctorProtect: (targetId: string) => void;
  policeInvestigate: (targetId: string) => void;
  endNight: () => void;
  
  // 낮 행동
  vote: (voterId: string, targetId: string) => void;
  endVoting: () => void;
  
  // 유틸
  reset: () => void;
  addLog: (message: string) => void;
}

let playerIdCounter = 1;

export const useGameStore = create<GameStore>((set, get) => ({
  phase: "waiting",
  players: [],
  day: 0,
  winner: null,
  log: [],
  nightResult: null,
  votes: {},

  addPlayer: (name) => {
    const player: Player = {
      id: `p${playerIdCounter++}`,
      name,
      role: null,
      alive: true,
      isHost: get().players.length === 0,
    };
    set(state => ({ players: [...state.players, player] }));
  },

  removePlayer: (id) => {
    set(state => ({ players: state.players.filter(p => p.id !== id) }));
  },

  startGame: () => {
    const { players } = get();
    if (players.length < 4) return;
    
    const roles = assignRoles(players.length);
    const updatedPlayers = players.map((p, i) => ({ ...p, role: roles[i], alive: true }));
    
    set({
      players: updatedPlayers,
      phase: "night",
      day: 1,
      winner: null,
      nightResult: { killedId: null, protectedId: null, investigatedId: null, investigatedRole: null },
      votes: {},
    });
    
    get().addLog("🎮 게임이 시작되었습니다. 모든 플레이어에게 역할이 배정되었습니다.");
  },

  mafiaKill: (targetId) => {
    set(state => ({
      nightResult: { ...state.nightResult!, killedId: targetId },
    }));
  },

  doctorProtect: (targetId) => {
    set(state => ({
      nightResult: { ...state.nightResult!, protectedId: targetId },
    }));
  },

  policeInvestigate: (targetId) => {
    const target = get().players.find(p => p.id === targetId);
    if (!target?.role) return;
    
    set(state => ({
      nightResult: {
        ...state.nightResult!,
        investigatedId: targetId,
        investigatedRole: target.role,
      },
    }));
  },

  endNight: () => {
    const { nightResult, players, day } = get();
    if (!nightResult) return;
    
    let killedPlayer: Player | null = null;
    
    // 마피아 타겟이 의사에게 보호받지 않았으면 사망
    if (nightResult.killedId && nightResult.killedId !== nightResult.protectedId) {
      killedPlayer = players.find(p => p.id === nightResult.killedId) || null;
    }
    
    const newPlayers = killedPlayer
      ? players.map(p => p.id === killedPlayer!.id ? { ...p, alive: false } : p)
      : players;
    
    const winner = checkWinner(newPlayers);
    
    // 로그 추가
    if (killedPlayer) {
      get().addLog(`🌙 ${day}일차 밤: ${killedPlayer.name}님이 사망했습니다.`);
    } else {
      get().addLog(`🌙 ${day}일차 밤: 아무도 죽지 않았습니다.`);
    }
    
    set({
      players: newPlayers,
      phase: winner ? "result" : "day-discussion",
      winner,
      nightResult: null,
    });
  },

  vote: (voterId, targetId) => {
    set(state => ({
      votes: { ...state.votes, [voterId]: targetId },
    }));
  },

  endVoting: () => {
    const { votes, players, day } = get();
    
    // 투표 집계
    const voteCount: Record<string, number> = {};
    Object.values(votes).forEach(targetId => {
      voteCount[targetId] = (voteCount[targetId] || 0) + 1;
    });
    
    // 최다 득표자 찾기
    let maxVotes = 0;
    let eliminatedId: string | null = null;
    let tied = false;
    
    Object.entries(voteCount).forEach(([id, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        eliminatedId = id;
        tied = false;
      } else if (count === maxVotes) {
        tied = true;
      }
    });
    
    const newPlayers = [...players];
    if (eliminatedId && !tied) {
      const idx = newPlayers.findIndex(p => p.id === eliminatedId);
      if (idx >= 0) {
        newPlayers[idx] = { ...newPlayers[idx], alive: false };
        const eliminated = newPlayers[idx];
        get().addLog(`🗳️ ${day}일차 투표: ${eliminated.name}님이 추방되었습니다. (직업: ${eliminated.role})`);
      }
    } else {
      get().addLog(`🗳️ ${day}일차 투표: 동표로 인해 아무도 추방되지 않았습니다.`);
    }
    
    const winner = checkWinner(newPlayers);
    
    set({
      players: newPlayers,
      phase: winner ? "result" : "night",
      day: winner ? day : day + 1,
      winner,
      votes: {},
      nightResult: winner ? null : { killedId: null, protectedId: null, investigatedId: null, investigatedRole: null },
    });
  },

  reset: () => {
    playerIdCounter = 1;
    set({
      phase: "waiting",
      players: [],
      day: 0,
      winner: null,
      log: [],
      nightResult: null,
      votes: {},
    });
  },

  addLog: (message) => {
    const logEntry: GameLog = {
      day: get().day,
      phase: get().phase,
      message,
      timestamp: Date.now(),
    };
    set(state => ({ log: [...state.log, logEntry] }));
  },
}));
