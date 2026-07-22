import { createServer } from "http";
import { Server } from "socket.io";
import type { GameState, Player, Role } from "../lib/types";
import { assignRoles, checkWinner, getInvestigatedRole, ROLE_INFO } from "../lib/types";

interface Room {
  code: string;
  players: Map<string, { name: string; socketId: string }>;
  state: GameState;
  hostId: string;
}

const rooms = new Map<string, Room>();

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function createInitialState(): GameState {
  return {
    phase: "waiting",
    players: [],
    day: 0,
    winner: null,
    log: [],
    nightResult: null,
    votes: {},
  };
}

function createNightResult(): NonNullable<GameState["nightResult"]> {
  return {
    killedId: null,
    protectedId: null,
    investigatedId: null,
    investigatedRole: null,
    snipedId: null,
    mediumInvestigatedId: null,
    mediumInvestigatedRole: null,
  };
}

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log(`✅ Connected: ${socket.id}`);

  let currentRoom: string | null = null;
  let currentPlayerId: string | null = null;

  // 방 생성
  socket.on("room:create", (name: string) => {
    const code = generateCode();
    const playerId = `p${Date.now()}`;
    
    const room: Room = {
      code,
      players: new Map([[playerId, { name, socketId: socket.id }]]),
      state: createInitialState(),
      hostId: playerId,
    };
    
    room.state.players.push({
      id: playerId,
      name,
      role: null,
      alive: true,
      isHost: true,
    });

    rooms.set(code, room);
    currentRoom = code;
    currentPlayerId = playerId;
    socket.join(code);

    socket.emit("room:joined", { code, playerId, state: room.state });
    broadcastState(code);
  });

  // 방 참가
  socket.on("room:join", ({ code, name }: { code: string; name: string }) => {
    const room = rooms.get(code.toUpperCase());
    if (!room) {
      socket.emit("error", { message: "방을 찾을 수 없습니다" });
      return;
    }
    if (room.state.phase !== "waiting") {
      socket.emit("error", { message: "이미 게임이 시작되었습니다" });
      return;
    }
    if (room.players.size >= 12) {
      socket.emit("error", { message: "방이 가득 찼습니다 (최대 12명)" });
      return;
    }

    const playerId = `p${Date.now()}`;
    room.players.set(playerId, { name, socketId: socket.id });
    room.state.players.push({
      id: playerId,
      name,
      role: null,
      alive: true,
      isHost: false,
    });

    currentRoom = code.toUpperCase();
    currentPlayerId = playerId;
    socket.join(currentRoom);

    socket.emit("room:joined", { code: currentRoom, playerId, state: room.state });
    broadcastState(currentRoom);
  });

  // 게임 시작
  socket.on("game:start", () => {
    const room = rooms.get(currentRoom || "");
    if (!room || room.state.phase !== "waiting") return;
    if (currentPlayerId !== room.hostId) {
      socket.emit("error", { message: "방장만 시작할 수 있습니다" });
      return;
    }
    if (room.state.players.length < 4) {
      socket.emit("error", { message: "최소 4명이 필요합니다" });
      return;
    }

    const roles = assignRoles(room.state.players.length);
    room.state.players = room.state.players.map((p, i) => ({
      ...p,
      role: roles[i],
      alive: true,
      abilities: {},
    }));
    room.state.phase = "night";
    room.state.day = 1;
    room.state.winner = null;
    room.state.nightResult = createNightResult();

    // 각자 자기 역할만 전송
    room.players.forEach((playerInfo, pid) => {
      const player = room.state.players.find(p => p.id === pid);
      if (player) {
        io.to(playerInfo.socketId).emit("role:assigned", {
          role: player.role,
        });
      }
    });

    addLog(room, "🎮 게임이 시작되었습니다!");
    broadcastState(room.code);
  });

  // 밤 행동
  socket.on("night:action", ({ action, targetId }: { action: string; targetId: string }) => {
    const room = rooms.get(currentRoom || "");
    if (!room || room.state.phase !== "night") return;

    const player = room.state.players.find(p => p.id === currentPlayerId);
    if (!player || !player.alive || !player.role) return;

    if (!room.state.nightResult) return;

    switch (action) {
      case "mafia-kill":
        if (player.role === "mafia") {
          room.state.nightResult.killedId = targetId;
        }
        break;
      case "doctor-protect":
        if (player.role === "doctor") {
          room.state.nightResult.protectedId = targetId;
        }
        break;
      case "police-investigate":
        if (player.role === "police") {
          room.state.nightResult.investigatedId = targetId;
          const target = room.state.players.find(p => p.id === targetId);
          if (target) {
            // 스파이는 위장 (getInvestigatedRole 사용)
            const fakeRole = getInvestigatedRole(target);
            room.state.nightResult.investigatedRole = fakeRole;
            socket.emit("police:result", {
              targetId,
              targetName: target.name,
              role: fakeRole,
            });
          }
        }
        break;
      case "sniper-shoot":
        if (player.role === "sniper" && !player.abilities?.sniperUsed) {
          room.state.nightResult.snipedId = targetId;
          player.abilities = { ...player.abilities, sniperUsed: true };
          socket.emit("sniper:used", { targetId });
        }
        break;
      case "medium-investigate":
        if (player.role === "medium") {
          // 영매는 죽은 사람만 조사 가능
          const target = room.state.players.find(p => p.id === targetId);
          if (target && !target.alive) {
            room.state.nightResult.mediumInvestigatedId = targetId;
            room.state.nightResult.mediumInvestigatedRole = target.role;
            socket.emit("medium:result", {
              targetId,
              targetName: target.name,
              role: target.role,
            });
          }
        }
        break;
    }

    broadcastState(room.code);
  });

  // 밤 종료
  socket.on("night:end", () => {
    const room = rooms.get(currentRoom || "");
    if (!room || room.state.phase !== "night") return;
    if (currentPlayerId !== room.hostId) return;

    const { nightResult } = room.state;
    if (!nightResult) return;

    const killedIds: string[] = [];

    // 마피아 처형 (의사 보호 확인)
    if (nightResult.killedId && nightResult.killedId !== nightResult.protectedId) {
      killedIds.push(nightResult.killedId);
    }

    // 저격수 저격 (보호 대상과 무관)
    if (nightResult.snipedId && !killedIds.includes(nightResult.snipedId)) {
      killedIds.push(nightResult.snipedId);
    }

    // 사망 처리 + 테러리스트 반격
    const newlyDead: Player[] = [];
    for (const id of killedIds) {
      const victim = room.state.players.find(p => p.id === id);
      if (victim && victim.alive) {
        victim.alive = false;
        newlyDead.push(victim);
      }
    }

    // 테러리스트가 죽었으면 랜덤 타겋과 함께 죽임
    for (const dead of newlyDead) {
      if (dead.role === "terrorist") {
        // 테러리스트가 마피아 처형/저격으로 죽은 경우 → 공격자와 같이 죽임
        // 단순화: 살아있는 시민 중 랜덤 1명 (또는 가장 많이 투표받은 사람)
        const aliveCitizens = room.state.players.filter(p => p.alive && ROLE_INFO[p.role!].team === "citizen");
        if (aliveCitizens.length > 0) {
          const victim = aliveCitizens[Math.floor(Math.random() * aliveCitizens.length)];
          victim.alive = false;
          addLog(room, `💣 테러리스트 ${dead.name}의 자폭! ${victim.name}님이 함께 사망했습니다.`);
        }
      }
    }

    // 로그
    const killedNames = newlyDead.filter(d => d.role !== "terrorist").map(d => d.name);
    if (newlyDead.length === 0) {
      addLog(room, `🌙 ${room.state.day}일차 밤: 아무도 죽지 않았습니다.`);
    } else {
      for (const name of killedNames) {
        addLog(room, `🌙 ${room.state.day}일차 밤: ${name}님이 사망했습니다.`);
      }
    }

    const winner = checkWinner(room.state.players);
    room.state.phase = winner ? "result" : "day-discussion";
    room.state.winner = winner;
    room.state.nightResult = null;

    broadcastState(room.code);
  });

  // 투표
  socket.on("day:vote", ({ targetId }: { targetId: string }) => {
    const room = rooms.get(currentRoom || "");
    if (!room || room.state.phase !== "day-voting") return;

    const player = room.state.players.find(p => p.id === currentPlayerId);
    if (!player || !player.alive) return;

    room.state.votes[currentPlayerId!] = targetId;
    broadcastState(room.code);
  });

  // 투표 종료
  socket.on("day:endvote", () => {
    const room = rooms.get(currentRoom || "");
    if (!room || room.state.phase !== "day-voting") return;
    if (currentPlayerId !== room.hostId) return;

    const { votes, players } = room.state;

    const voteCount: Record<string, number> = {};
    Object.values(votes).forEach(tid => {
      voteCount[tid] = (voteCount[tid] || 0) + 1;
    });

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

    if (eliminatedId && !tied) {
      const eliminated = players.find(p => p.id === eliminatedId);
      if (eliminated) {
        eliminated.alive = false;
        addLog(room, `🗳️ ${room.state.day}일차 투표: ${eliminated.name}님이 추방되었습니다.`);

        // 테러리스트 투표 추방 시 자폭
        if (eliminated.role === "terrorist") {
          // 테러리스트를 가장 많이 투표한 사람... 은 알기 어려우니 랜덤 시민
          const aliveCitizens = players.filter(p => p.alive && ROLE_INFO[p.role!].team === "citizen");
          if (aliveCitizens.length > 0) {
            const victim = aliveCitizens[Math.floor(Math.random() * aliveCitizens.length)];
            victim.alive = false;
            addLog(room, `💣 테러리스트 ${eliminated.name}의 자폭! ${victim.name}님이 함께 사망했습니다.`);
          }
        }
      }
    } else {
      addLog(room, `🗳️ ${room.state.day}일차 투표: 동표로 아무도 추방되지 않았습니다.`);
    }

    const winner = checkWinner(players);
    room.state.phase = winner ? "result" : "night";
    room.state.winner = winner;
    room.state.votes = {};

    if (!winner) {
      room.state.day += 1;
      room.state.nightResult = createNightResult();
    }

    broadcastState(room.code);
  });

  // 토론 → 투표로 전환
  socket.on("day:tovote", () => {
    const room = rooms.get(currentRoom || "");
    if (!room || room.state.phase !== "day-discussion") return;
    if (currentPlayerId !== room.hostId) return;
    room.state.phase = "day-voting";
    broadcastState(room.code);
  });

  // 채팅
  socket.on("chat:send", ({ message }: { message: string }) => {
    const room = rooms.get(currentRoom || "");
    if (!room) return;
    const player = room.state.players.find(p => p.id === currentPlayerId);
    if (!player) return;

    io.to(room.code).emit("chat:message", {
      playerId: currentPlayerId,
      name: player.name,
      message,
      timestamp: Date.now(),
    });
  });

  // 게임 리셋
  socket.on("game:reset", () => {
    const room = rooms.get(currentRoom || "");
    if (!room) return;
    if (currentPlayerId !== room.hostId) return;

    room.state = createInitialState();
    room.state.players = Array.from(room.players.entries()).map(([id, info]) => ({
      id,
      name: info.name,
      role: null,
      alive: true,
      isHost: id === room.hostId,
    }));

    broadcastState(room.code);
  });

  // 연결 해제
  socket.on("disconnect", () => {
    console.log(`❌ Disconnected: ${socket.id}`);
    const room = rooms.get(currentRoom || "");
    if (!room || !currentPlayerId) return;

    const player = room.state.players.find(p => p.id === currentPlayerId);
    if (!player) return;

    if (room.state.phase === "waiting") {
      room.players.delete(currentPlayerId);
      room.state.players = room.state.players.filter(p => p.id !== currentPlayerId);
      
      if (room.hostId === currentPlayerId && room.players.size > 0) {
        room.hostId = Array.from(room.players.keys())[0];
        const newHost = room.state.players.find(p => p.id === room.hostId);
        if (newHost) newHost.isHost = true;
      }
      
      if (room.players.size === 0) {
        rooms.delete(room.code);
      } else {
        broadcastState(room.code);
      }
    } else {
      player.alive = false;
      addLog(room, `${player.name}님이 연결을 잃었습니다.`);
      broadcastState(room.code);
    }
  });
});

function addLog(room: Room, message: string) {
  room.state.log.push({
    day: room.state.day,
    phase: room.state.phase,
    message,
    timestamp: Date.now(),
  });
}

function broadcastState(code: string) {
  const room = rooms.get(code);
  if (!room) return;
  io.to(code).emit("state:update", room.state);
}

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🔌 Socket.io server running on port ${PORT}`);
});
