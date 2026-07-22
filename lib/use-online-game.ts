"use client";

import { useEffect, useState, useCallback } from "react";
import type { GameState } from "./types";
import { getSocket } from "./socket";

export function useOnlineGame() {
  const [state, setState] = useState<GameState | null>(null);
  const [roomCode, setRoomCode] = useState<string>("");
  const [playerId, setPlayerId] = useState<string>("");
  const [myRole, setMyRole] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<{ playerId: string; name: string; message: string; timestamp: number }[]>([]);
  const [investigationResult, setInvestigationResult] = useState<{ targetName: string; role: string } | null>(null);
  const [mediumResult, setMediumResult] = useState<{ targetName: string; role: string } | null>(null);
  const [sniperUsed, setSniperUsed] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    socket.on("state:update", (newState: GameState) => {
      setState(newState);
    });

    socket.on("room:joined", ({ code, playerId }: { code: string; playerId: string }) => {
      setRoomCode(code);
      setPlayerId(playerId);
    });

    socket.on("role:assigned", ({ role }: { role: string }) => {
      setMyRole(role);
      setInvestigationResult(null);
      setMediumResult(null);
      setSniperUsed(false);
    });

    socket.on("police:result", ({ targetName, role }: { targetName: string; role: string }) => {
      setInvestigationResult({ targetName, role });
    });

    socket.on("medium:result", ({ targetName, role }: { targetName: string; role: string }) => {
      setMediumResult({ targetName, role });
    });

    socket.on("sniper:used", () => {
      setSniperUsed(true);
    });

    socket.on("chat:message", (msg: { playerId: string; name: string; message: string; timestamp: number }) => {
      setChatMessages(prev => [...prev, msg]);
    });

    socket.on("error", ({ message }: { message: string }) => {
      setError(message);
      setTimeout(() => setError(""), 3000);
    });

    return () => {
      socket.off("state:update");
      socket.off("room:joined");
      socket.off("role:assigned");
      socket.off("police:result");
      socket.off("medium:result");
      socket.off("sniper:used");
      socket.off("chat:message");
      socket.off("error");
    };
  }, []);

  const createRoom = useCallback((name: string) => {
    getSocket().emit("room:create", name);
  }, []);

  const joinRoom = useCallback((code: string, name: string) => {
    getSocket().emit("room:join", { code: code.toUpperCase(), name });
  }, []);

  const startGame = useCallback(() => {
    getSocket().emit("game:start");
  }, []);

  const nightAction = useCallback((action: string, targetId: string) => {
    getSocket().emit("night:action", { action, targetId });
  }, []);

  const endNight = useCallback(() => {
    getSocket().emit("night:end");
  }, []);

  const vote = useCallback((targetId: string) => {
    getSocket().emit("day:vote", { targetId });
  }, []);

  const endVoting = useCallback(() => {
    getSocket().emit("day:endvote");
  }, []);

  const toVote = useCallback(() => {
    getSocket().emit("day:tovote");
  }, []);

  const sendChat = useCallback((message: string) => {
    getSocket().emit("chat:send", { message });
  }, []);

  const resetGame = useCallback(() => {
    getSocket().emit("game:reset");
  }, []);

  return {
    state,
    roomCode,
    playerId,
    myRole,
    error,
    chatMessages,
    investigationResult,
    mediumResult,
    sniperUsed,
    createRoom,
    joinRoom,
    startGame,
    nightAction,
    endNight,
    vote,
    endVoting,
    toVote,
    sendChat,
    resetGame,
  };
}
