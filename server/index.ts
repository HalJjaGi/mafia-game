import { createServer } from "http";
import { Server } from "socket.io";
import type { GameState, Player, Role } from "../lib/types";
import { assignRoles, checkWinner } from "../lib/types";

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
    }));
    room.state.phase = "night";
    room.state.day = 1;
    room.state.winner = null;
    room.state.nightResult = {
      killedId: null,
      protectedId: null,
      investigatedId: null,
      investigatedRole: null,
    };

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
          room.state.nightResult.investigatedRole = target?.role || null;
          // 경찰에게만 결과 전송
          socket.emit("police:result", {
            targetId,
            targetName: target?.name,
            role: target?.role,
          });
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

    let killedName: string | null = null;

    if (nightResult.killedId && nightResult.killedId !== nightResult.protectedId) {
      const killed = room.state.players.find(p => p.id === nightResult.killedId);
      if (killed) {
        killed.alive = false;
        killedName = killed.name;
      }
    }

    const winner = checkWinner(room.state.players);

    if (killedName) {
      addLog(room, `🌙 ${room.state.day}일차 밤: ${killedName}님이 사망했습니다.`);
    } else {
      addLog(room, `🌙 ${room.state.day}일차 밤: 아무도 죽지 않았습니다.`);
    }

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
      room.state.nightResult = {
        killedId: null,
        protectedId: null,
        investigatedId: null,
        investigatedRole: null,
      };
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
    room.state.players = Array.from(room.players.entries()).map(([id, info], i) => ({
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

    // 대기실에서만 즉시 제거, 게임 중이면 사망 처리
    if (room.state.phase === "waiting") {
      room.players.delete(currentPlayerId);
      room.state.players = room.state.players.filter(p => p.id !== currentPlayerId);
      
      // 방장이 나가면 다음 사람이 방장
      if (room.hostId === currentPlayerId && room.players.size > 0) {
        room.hostId = Array.from(room.players.keys())[0];
        const newHost = room.state.players.find(p => p.id === room.hostId);
        if (newHost) newHost.isHost = true;
      }
      
      // 빈 방이면 삭제
      if (room.players.size === 0) {
        rooms.delete(room.code);
      } else {
        broadcastState(room.code);
      }
    } else {
      // 게임 중엔 사망 처리
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
