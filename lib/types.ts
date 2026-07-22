// 게임 역할
export type Role = "mafia" | "citizen" | "police" | "doctor";

export const ROLE_INFO: Record<Role, { name: string; emoji: string; team: "mafia" | "citizen"; desc: string }> = {
  mafia:   { name: "마피아", emoji: "🔪", team: "mafia",   desc: "밤에 시민을 하나씩 제거합니다" },
  citizen: { name: "시민",   emoji: "👤", team: "citizen", desc: "낮에 토론과 투표로 마피아를 찾아냅니다" },
  police:  { name: "경찰",   emoji: "🔍", team: "citizen", desc: "밤에 한 명을 조사해 직업을 알 수 있습니다" },
  doctor:  { name: "의사",   emoji: "💉", team: "citizen", desc: "밤에 한 명을 보호할 수 있습니다" },
};

// 게임 단계
export type Phase = "waiting" | "night" | "day-discussion" | "day-voting" | "result";

export const PHASE_INFO: Record<Phase, { name: string; emoji: string; desc: string }> = {
  "waiting":         { name: "대기실",       emoji: "⏳", desc: "플레이어가 모이기를 기다리는 중" },
  "night":           { name: "밤",           emoji: "🌙", desc: "마피아가 움직입니다" },
  "day-discussion":  { name: "낮 - 토론",    emoji: "☀️", desc: "의심되는 사람을 찾아 토론하세요" },
  "day-voting":      { name: "낮 - 투표",    emoji: "🗳️", desc: "마피아로 의심되는 사람에게 투표하세요" },
  "result":          { name: "게임 종료",    emoji: "🏁", desc: "게임 결과를 확인하세요" },
};

// 플레이어
export interface Player {
  id: string;
  name: string;
  role: Role | null;
  alive: boolean;
  isHost: boolean;
}

// 게임 상태
export interface GameState {
  phase: Phase;
  players: Player[];
  day: number;
  winner: "mafia" | "citizen" | null;
  log: GameLog[];
  // 밤 행동 결과
  nightResult: {
    killedId: string | null;
    protectedId: string | null;
    investigatedId: string | null;
    investigatedRole: Role | null;
  } | null;
  // 투표
  votes: Record<string, string>; // voterId -> targetId
}

export interface GameLog {
  day: number;
  phase: Phase;
  message: string;
  timestamp: number;
}

// 역할 배정 (플레이어 수에 따라)
export function assignRoles(playerCount: number): Role[] {
  const roles: Role[] = [];
  
  // 기본 배정 규칙
  let mafiaCount = 1;
  if (playerCount >= 7) mafiaCount = 2;
  if (playerCount >= 11) mafiaCount = 3;
  
  const policeCount = playerCount >= 5 ? 1 : 0;
  const doctorCount = playerCount >= 6 ? 1 : 0;
  const citizenCount = playerCount - mafiaCount - policeCount - doctorCount;
  
  for (let i = 0; i < mafiaCount; i++) roles.push("mafia");
  if (policeCount) roles.push("police");
  if (doctorCount) roles.push("doctor");
  for (let i = 0; i < citizenCount; i++) roles.push("citizen");
  
  // 셔플
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }
  
  return roles;
}

// 승리 조건 확인
export function checkWinner(players: Player[]): "mafia" | "citizen" | null {
  const aliveMafia = players.filter(p => p.alive && p.role === "mafia").length;
  const aliveCitizen = players.filter(p => p.alive && p.role !== "mafia").length;
  
  if (aliveMafia === 0) return "citizen";
  if (aliveMafia >= aliveCitizen) return "mafia";
  return null;
}
