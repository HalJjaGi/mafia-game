// 게임 역할
export type Role =
  | "mafia"
  | "citizen"
  | "police"
  | "doctor"
  | "spy"       // 스파이 (마피아 팀, 경찰 조사에 시민으로 나옴)
  | "sniper"    // 저격수 (시민 팀, 게임 중 1회 저격)
  | "medium"    // 영매 (시민 팀, 죽은 사람의 역할 확인)
  | "terrorist"; // 테러리스트 (마피아 팀, 죽을 때 같이 죽임)

export const ROLE_INFO: Record<Role, { name: string; emoji: string; team: "mafia" | "citizen"; desc: string }> = {
  mafia:      { name: "마피아",     emoji: "🔪", team: "mafia",   desc: "밤에 시민을 하나씩 제거합니다" },
  citizen:    { name: "시민",       emoji: "👤", team: "citizen", desc: "낮에 토론과 투표로 마피아를 찾아냅니다" },
  police:     { name: "경찰",       emoji: "🔍", team: "citizen", desc: "밤에 한 명을 조사해 직업을 알 수 있습니다" },
  doctor:     { name: "의사",       emoji: "💉", team: "citizen", desc: "밤에 한 명을 보호할 수 있습니다" },
  spy:        { name: "스파이",     emoji: "🕵️", team: "mafia",   desc: "마피아 팀이지만 경찰 조사에 시민으로 나옵니다" },
  sniper:     { name: "저격수",     emoji: "🎯", team: "citizen", desc: "게임 중 1회, 밤에 누구든 저격할 수 있습니다" },
  medium:     { name: "영매",       emoji: "🔮", team: "citizen", desc: "밤에 죽은 사람의 역할을 알아낼 수 있습니다" },
  terrorist:  { name: "테러리스트", emoji: "💣", team: "mafia",   desc: "처형/투표로 죽을 때 자신을 처형한 사람을 같이 죽입니다" },
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
  // 특수 능력 사용 추적
  abilities?: {
    sniperUsed?: boolean;       // 저격수 사용 여부
    mediumTargets?: string[];   // 영매가 확인한 대상
  };
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
    snipedId: string | null;         // 저격수 저격
    mediumInvestigatedId: string | null; // 영매 조사
    mediumInvestigatedRole: Role | null;
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

// 역할 배정 — 일반 시민 없음, 전원 특수 역할
// 4명: 마피아1 + 경찰 + 의사 + 저격수
// 5명: + 스파이
// 6명: + 영매
// 7명: 마피아2 + 경찰 + 의사 + 저격수 + 스파이 + 영매
// 8명: + 테러리스트
// 9~12명: 마피아 추가 + 남은 자리에 역할 중복 배정
export function assignRoles(playerCount: number): Role[] {
  const roles: Role[] = [];

  let mafiaCount = 1;
  if (playerCount >= 7) mafiaCount = 2;
  if (playerCount >= 11) mafiaCount = 3;

  // 특수 시민 역할 (항상 1개씩)
  const police = 1;
  const doctor = 1;
  const sniper = 1;

  // 추가 특수 역할
  let spy = 0, medium = 0, terrorist = 0;

  if (playerCount >= 5) spy = 1;
  if (playerCount >= 6) medium = 1;
  if (playerCount >= 8) terrorist = 1;

  const assigned = mafiaCount + police + doctor + sniper + spy + medium + terrorist;
  const extra = playerCount - assigned;

  // 남은 자리: 특수 역할 중복 배정 (마피아 추가 없음)
  const pool: Role[] = ["sniper", "medium", "spy", "terrorist", "police", "doctor"];
  for (let i = 0; i < Math.max(0, extra); i++) {
    roles.push(pool[i % pool.length]);
  }

  for (let i = 0; i < mafiaCount; i++) roles.push("mafia");
  roles.push("police", "doctor", "sniper");
  if (spy) roles.push("spy");
  if (medium) roles.push("medium");
  if (terrorist) roles.push("terrorist");

  // 만약 roles 수가 playerCount보다 많으면 자르기 (안전장치)
  // 만약 부족하면 풀에서 추가
  while (roles.length < playerCount) {
    roles.push(pool[roles.length % pool.length]);
  }
  roles.length = playerCount;

  // 셔플
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }

  return roles;
}

// 승리 조건 확인
export function checkWinner(players: Player[]): "mafia" | "citizen" | null {
  const aliveMafia = players.filter(p => p.alive && p.role && ROLE_INFO[p.role].team === "mafia").length;
  const aliveCitizen = players.filter(p => p.alive && p.role && ROLE_INFO[p.role].team === "citizen").length;

  if (aliveMafia === 0) return "citizen";
  if (aliveMafia >= aliveCitizen) return "mafia";
  return null;
}

// 경찰 조사 결과 (스파이는 시민으로 위장)
export function getInvestigatedRole(player: Player): Role {
  if (player.role === "spy") return "citizen"; // 위장
  return player.role!;
}
