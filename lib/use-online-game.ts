"use client";

import { useEffect, useState, useCallback } from "react";
import type { GameState, Role } from "./types";
import { getSocket } from "./socket";

export function useOnlineGame() {
  const [state, setState] = useState<GameState | null>(null);
  const [roomCode, setRoomCode] = useState<string>("");
  const [playerId, setPlayerId] = useState<string>("");
  const [myRole, setMyRole] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [investigationResult, setInvestigationResult] = useState<{ targetName: string; role: string } | null>(null);
  const [mediumResult, setMediumResult] = useState<{ targetName: string; role: string } | null>(null);
  const [sniperUsed, setSniperUsed] = useState(false);
  const [activeRoles, setActiveRoles] = useState<Role[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const socket = getSocket();

    socket.on("state:update", (newState: GameState) => setState(newState));

    socket.on("room:joined", ({ code, playerId }: { code: string; playerId: string }) => {
      setRoomCode(code);
      setPlayerId(playerId);
    });

    socket.on("role:assigned", ({ role, activeRoles: roles }: { role: string; activeRoles: Role[] }) => {
      setMyRole(role);
      setInvestigationResult(null);
      setMediumResult(null);
      setSniperUsed(false);
      if (roles) setActiveRoles(roles);
    });

    socket.on("police:result", ({ targetName, role }: { targetName: string; role: string }) => {
      setInvestigationResult({ targetName, role });
    });

    socket.on("medium:result", ({ targetName, role }: { targetName: string; role: string }) => {
      setMediumResult({ targetName, role });
    });

    socket.on("sniper:used", () => setSniperUsed(true));

    socket.on("timer:update", ({ timeLeft: t }: { timeLeft: number }) => {
      setTimeLeft(t);
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
      socket.off("timer:update");
      socket.off("error");
    };
  }, []);

  const createRoom = useCallback((name: string) => getSocket().emit("room:create", name), []);
  const joinRoom = useCallback((code: string, name: string) => getSocket().emit("room:join", { code: code.toUpperCase(), name }), []);
  const startGame = useCallback(() => getSocket().emit("game:start"), []);
  const nightAction = useCallback((action: string, targetId: string) => getSocket().emit("night:action", { action, targetId }), []);
  const endNight = useCallback(() => getSocket().emit("night:end"), []);
  const vote = useCallback((targetId: string) => getSocket().emit("day:vote", { targetId }), []);
  const endVoting = useCallback(() => getSocket().emit("day:endvote"), []);
  const toVote = useCallback(() => getSocket().emit("day:tovote"), []);
  const resetGame = useCallback(() => getSocket().emit("game:reset"), []);

  return {
    state, roomCode, playerId, myRole, error,
    investigationResult, mediumResult, sniperUsed,
    activeRoles, timeLeft,
    createRoom, joinRoom, startGame, nightAction, endNight,
    vote, endVoting, toVote, resetGame,
  };
}
