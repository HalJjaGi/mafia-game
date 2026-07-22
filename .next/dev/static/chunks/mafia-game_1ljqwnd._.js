(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/mafia-game/lib/types.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// 게임 역할
__turbopack_context__.s([
    "PHASE_INFO",
    ()=>PHASE_INFO,
    "ROLE_INFO",
    ()=>ROLE_INFO,
    "assignRoles",
    ()=>assignRoles,
    "checkWinner",
    ()=>checkWinner
]);
const ROLE_INFO = {
    mafia: {
        name: "마피아",
        emoji: "🔪",
        team: "mafia",
        desc: "밤에 시민을 하나씩 제거합니다"
    },
    citizen: {
        name: "시민",
        emoji: "👤",
        team: "citizen",
        desc: "낮에 토론과 투표로 마피아를 찾아냅니다"
    },
    police: {
        name: "경찰",
        emoji: "🔍",
        team: "citizen",
        desc: "밤에 한 명을 조사해 직업을 알 수 있습니다"
    },
    doctor: {
        name: "의사",
        emoji: "💉",
        team: "citizen",
        desc: "밤에 한 명을 보호할 수 있습니다"
    }
};
const PHASE_INFO = {
    "waiting": {
        name: "대기실",
        emoji: "⏳",
        desc: "플레이어가 모이기를 기다리는 중"
    },
    "night": {
        name: "밤",
        emoji: "🌙",
        desc: "마피아가 움직입니다"
    },
    "day-discussion": {
        name: "낮 - 토론",
        emoji: "☀️",
        desc: "의심되는 사람을 찾아 토론하세요"
    },
    "day-voting": {
        name: "낮 - 투표",
        emoji: "🗳️",
        desc: "마피아로 의심되는 사람에게 투표하세요"
    },
    "result": {
        name: "게임 종료",
        emoji: "🏁",
        desc: "게임 결과를 확인하세요"
    }
};
function assignRoles(playerCount) {
    const roles = [];
    // 기본 배정 규칙
    let mafiaCount = 1;
    if (playerCount >= 7) mafiaCount = 2;
    if (playerCount >= 11) mafiaCount = 3;
    const policeCount = playerCount >= 5 ? 1 : 0;
    const doctorCount = playerCount >= 6 ? 1 : 0;
    const citizenCount = playerCount - mafiaCount - policeCount - doctorCount;
    for(let i = 0; i < mafiaCount; i++)roles.push("mafia");
    if (policeCount) roles.push("police");
    if (doctorCount) roles.push("doctor");
    for(let i = 0; i < citizenCount; i++)roles.push("citizen");
    // 셔플
    for(let i = roles.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [roles[i], roles[j]] = [
            roles[j],
            roles[i]
        ];
    }
    return roles;
}
function checkWinner(players) {
    const aliveMafia = players.filter((p)=>p.alive && p.role === "mafia").length;
    const aliveCitizen = players.filter((p)=>p.alive && p.role !== "mafia").length;
    if (aliveMafia === 0) return "citizen";
    if (aliveMafia >= aliveCitizen) return "mafia";
    return null;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/mafia-game/lib/store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useGameStore",
    ()=>useGameStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/mafia-game/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/mafia-game/lib/types.ts [app-client] (ecmascript)");
;
;
let playerIdCounter = 1;
const useGameStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        phase: "waiting",
        players: [],
        day: 0,
        winner: null,
        log: [],
        nightResult: null,
        votes: {},
        addPlayer: (name)=>{
            const player = {
                id: `p${playerIdCounter++}`,
                name,
                role: null,
                alive: true,
                isHost: get().players.length === 0
            };
            set((state)=>({
                    players: [
                        ...state.players,
                        player
                    ]
                }));
        },
        removePlayer: (id)=>{
            set((state)=>({
                    players: state.players.filter((p)=>p.id !== id)
                }));
        },
        startGame: ()=>{
            const { players } = get();
            if (players.length < 4) return;
            const roles = (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assignRoles"])(players.length);
            const updatedPlayers = players.map((p, i)=>({
                    ...p,
                    role: roles[i],
                    alive: true
                }));
            set({
                players: updatedPlayers,
                phase: "night",
                day: 1,
                winner: null,
                nightResult: {
                    killedId: null,
                    protectedId: null,
                    investigatedId: null,
                    investigatedRole: null
                },
                votes: {}
            });
            get().addLog("🎮 게임이 시작되었습니다. 모든 플레이어에게 역할이 배정되었습니다.");
        },
        mafiaKill: (targetId)=>{
            set((state)=>({
                    nightResult: {
                        ...state.nightResult,
                        killedId: targetId
                    }
                }));
        },
        doctorProtect: (targetId)=>{
            set((state)=>({
                    nightResult: {
                        ...state.nightResult,
                        protectedId: targetId
                    }
                }));
        },
        policeInvestigate: (targetId)=>{
            const target = get().players.find((p)=>p.id === targetId);
            if (!target?.role) return;
            set((state)=>({
                    nightResult: {
                        ...state.nightResult,
                        investigatedId: targetId,
                        investigatedRole: target.role
                    }
                }));
        },
        endNight: ()=>{
            const { nightResult, players, day } = get();
            if (!nightResult) return;
            let killedPlayer = null;
            // 마피아 타겟이 의사에게 보호받지 않았으면 사망
            if (nightResult.killedId && nightResult.killedId !== nightResult.protectedId) {
                killedPlayer = players.find((p)=>p.id === nightResult.killedId) || null;
            }
            const newPlayers = killedPlayer ? players.map((p)=>p.id === killedPlayer.id ? {
                    ...p,
                    alive: false
                } : p) : players;
            const winner = (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkWinner"])(newPlayers);
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
                nightResult: null
            });
        },
        vote: (voterId, targetId)=>{
            set((state)=>({
                    votes: {
                        ...state.votes,
                        [voterId]: targetId
                    }
                }));
        },
        endVoting: ()=>{
            const { votes, players, day } = get();
            // 투표 집계
            const voteCount = {};
            Object.values(votes).forEach((targetId)=>{
                voteCount[targetId] = (voteCount[targetId] || 0) + 1;
            });
            // 최다 득표자 찾기
            let maxVotes = 0;
            let eliminatedId = null;
            let tied = false;
            Object.entries(voteCount).forEach(([id, count])=>{
                if (count > maxVotes) {
                    maxVotes = count;
                    eliminatedId = id;
                    tied = false;
                } else if (count === maxVotes) {
                    tied = true;
                }
            });
            const newPlayers = [
                ...players
            ];
            if (eliminatedId && !tied) {
                const idx = newPlayers.findIndex((p)=>p.id === eliminatedId);
                if (idx >= 0) {
                    newPlayers[idx] = {
                        ...newPlayers[idx],
                        alive: false
                    };
                    const eliminated = newPlayers[idx];
                    get().addLog(`🗳️ ${day}일차 투표: ${eliminated.name}님이 추방되었습니다. (직업: ${eliminated.role})`);
                }
            } else {
                get().addLog(`🗳️ ${day}일차 투표: 동표로 인해 아무도 추방되지 않았습니다.`);
            }
            const winner = (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkWinner"])(newPlayers);
            set({
                players: newPlayers,
                phase: winner ? "result" : "night",
                day: winner ? day : day + 1,
                winner,
                votes: {},
                nightResult: winner ? null : {
                    killedId: null,
                    protectedId: null,
                    investigatedId: null,
                    investigatedRole: null
                }
            });
        },
        reset: ()=>{
            playerIdCounter = 1;
            set({
                phase: "waiting",
                players: [],
                day: 0,
                winner: null,
                log: [],
                nightResult: null,
                votes: {}
            });
        },
        addLog: (message)=>{
            const logEntry = {
                day: get().day,
                phase: get().phase,
                message,
                timestamp: Date.now()
            };
            set((state)=>({
                    log: [
                        ...state.log,
                        logEntry
                    ]
                }));
        }
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/mafia-game/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/mafia-game/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/mafia-game/lib/store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/mafia-game/lib/types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/mafia-game/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
function Home() {
    _s();
    const { phase, players, day, winner, log, nightResult, votes, addPlayer, removePlayer, startGame, mafiaKill, doctorProtect, policeInvestigate, endNight, vote, endVoting, reset } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGameStore"])();
    const [playerName, setPlayerName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [showRoles, setShowRoles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [revealedPlayers, setRevealedPlayers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const alivePlayers = players.filter((p)=>p.alive);
    const myPlayer = players[0]; // 싱글 화면 기준 첫 번째 플레이어 = 나
    const handleAddPlayer = ()=>{
        if (!playerName.trim()) return;
        addPlayer(playerName.trim());
        setPlayerName("");
    };
    const handleVote = (voterId, targetId)=>{
        vote(voterId, targetId);
    };
    const allVoted = alivePlayers.every((p)=>votes[p.id]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen p-4 md:p-8 max-w-4xl mx-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "text-center mb-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-4xl md:text-5xl font-bold mb-2",
                        children: "🎭 마피아 게임"
                    }, void 0, false, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[var(--muted)]",
                        children: [
                            __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PHASE_INFO"][phase].emoji,
                            " ",
                            __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PHASE_INFO"][phase].name,
                            " · ",
                            day,
                            "일차"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 41,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/mafia-game/app/page.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            phase === "result" && winner && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center bg-[var(--surface)] rounded-2xl p-8 mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-6xl mb-4",
                        children: winner === "mafia" ? "🔪" : "🎉"
                    }, void 0, false, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 49,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-3xl font-bold mb-2",
                        children: winner === "mafia" ? "마피아 승리!" : "시민 승리!"
                    }, void 0, false, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 52,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: reset,
                        className: "mt-4 px-6 py-2 bg-[var(--primary)] rounded-lg font-semibold hover:opacity-80",
                        children: "🔄 새 게임"
                    }, void 0, false, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 55,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/mafia-game/app/page.tsx",
                lineNumber: 48,
                columnNumber: 9
            }, this),
            phase === "waiting" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-[var(--surface)] rounded-2xl p-6 mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-bold mb-4",
                        children: "platz: 대기실"
                    }, void 0, false, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 67,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2 mb-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                value: playerName,
                                onChange: (e)=>setPlayerName(e.target.value),
                                onKeyDown: (e)=>e.key === "Enter" && handleAddPlayer(),
                                placeholder: "플레이어 이름",
                                className: "flex-1 px-4 py-2 bg-[var(--bg)] rounded-lg border border-[var(--accent)] outline-none"
                            }, void 0, false, {
                                fileName: "[project]/mafia-game/app/page.tsx",
                                lineNumber: 70,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleAddPlayer,
                                className: "px-4 py-2 bg-[var(--accent)] rounded-lg font-semibold hover:opacity-80",
                                children: "참가"
                            }, void 0, false, {
                                fileName: "[project]/mafia-game/app/page.tsx",
                                lineNumber: 78,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 69,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2 mb-4",
                        children: players.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between bg-[var(--bg)] rounded-lg px-4 py-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            p.isHost ? "👑 " : "👤 ",
                                            p.name
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/mafia-game/app/page.tsx",
                                        lineNumber: 89,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>removePlayer(p.id),
                                        className: "text-red-400 text-sm hover:text-red-300",
                                        children: "나가기"
                                    }, void 0, false, {
                                        fileName: "[project]/mafia-game/app/page.tsx",
                                        lineNumber: 90,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, p.id, true, {
                                fileName: "[project]/mafia-game/app/page.tsx",
                                lineNumber: 88,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 86,
                        columnNumber: 11
                    }, this),
                    players.length >= 4 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: startGame,
                        className: "w-full py-3 bg-[var(--primary)] rounded-lg font-bold text-lg hover:opacity-80",
                        children: [
                            "게임 시작! (",
                            players.length,
                            "명)"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 101,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-center text-[var(--muted)]",
                        children: [
                            "최소 4명이 필요합니다. (현재 ",
                            players.length,
                            "명)"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 108,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/mafia-game/app/page.tsx",
                lineNumber: 66,
                columnNumber: 9
            }, this),
            phase !== "waiting" && phase !== "result" && myPlayer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-[var(--surface)] rounded-2xl p-6 mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between mb-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-xl font-bold",
                                children: "내 역할"
                            }, void 0, false, {
                                fileName: "[project]/mafia-game/app/page.tsx",
                                lineNumber: 119,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setShowRoles(!showRoles),
                                className: "text-sm text-[var(--muted)] hover:text-white",
                                children: showRoles ? "숨기기" : "전체 보기"
                            }, void 0, false, {
                                fileName: "[project]/mafia-game/app/page.tsx",
                                lineNumber: 120,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 118,
                        columnNumber: 11
                    }, this),
                    showRoles && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 gap-2 mb-4",
                        children: players.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `flex items-center justify-between px-3 py-2 rounded-lg ${p.alive ? "bg-[var(--bg)]" : "bg-red-900/20 opacity-50"}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: p.name
                                    }, void 0, false, {
                                        fileName: "[project]/mafia-game/app/page.tsx",
                                        lineNumber: 138,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: p.role ? `${__TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ROLE_INFO"][p.role].emoji} ${__TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ROLE_INFO"][p.role].name}` : "?"
                                    }, void 0, false, {
                                        fileName: "[project]/mafia-game/app/page.tsx",
                                        lineNumber: 139,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, p.id, true, {
                                fileName: "[project]/mafia-game/app/page.tsx",
                                lineNumber: 132,
                                columnNumber: 17
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 130,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/mafia-game/app/page.tsx",
                lineNumber: 117,
                columnNumber: 9
            }, this),
            phase === "night" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-[var(--surface)] rounded-2xl p-6 mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-bold mb-4",
                        children: "🌙 밤이 되었습니다"
                    }, void 0, false, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 150,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NightAction, {
                        title: "🔪 마피아 - 타겟 선택",
                        players: alivePlayers.filter((p)=>p.role !== "mafia"),
                        onSelect: mafiaKill,
                        selected: nightResult?.killedId
                    }, void 0, false, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 153,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NightAction, {
                        title: "💉 의사 - 보호할 사람",
                        players: alivePlayers,
                        onSelect: doctorProtect,
                        selected: nightResult?.protectedId
                    }, void 0, false, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 161,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NightAction, {
                        title: "🔍 경찰 - 조사할 사람",
                        players: alivePlayers,
                        onSelect: (id)=>{
                            policeInvestigate(id);
                            const target = players.find((p)=>p.id === id);
                            if (target?.role) {
                                alert(`${target.name}님은 ${__TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ROLE_INFO"][target.role].name}입니다.`);
                            }
                        },
                        selected: nightResult?.investigatedId
                    }, void 0, false, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 169,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: endNight,
                        className: "w-full mt-4 py-3 bg-[var(--primary)] rounded-lg font-bold hover:opacity-80",
                        children: "☀️ 아침이 밝았다"
                    }, void 0, false, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 182,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/mafia-game/app/page.tsx",
                lineNumber: 149,
                columnNumber: 9
            }, this),
            phase === "day-discussion" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-[var(--surface)] rounded-2xl p-6 mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-bold mb-4",
                        children: "☀️ 토론 시간"
                    }, void 0, false, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 194,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[var(--muted)] mb-4",
                        children: "어젯밤에 일어난 일을 바탕으로 의심되는 사람을 찾아 토론하세요."
                    }, void 0, false, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 195,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2 mb-4",
                        children: alivePlayers.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3 bg-[var(--bg)] rounded-lg px-4 py-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-2xl",
                                        children: "🗣️"
                                    }, void 0, false, {
                                        fileName: "[project]/mafia-game/app/page.tsx",
                                        lineNumber: 201,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: p.name
                                    }, void 0, false, {
                                        fileName: "[project]/mafia-game/app/page.tsx",
                                        lineNumber: 202,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, p.id, true, {
                                fileName: "[project]/mafia-game/app/page.tsx",
                                lineNumber: 200,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 198,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGameStore"].setState({
                                phase: "day-voting"
                            }),
                        className: "w-full py-3 bg-[var(--primary)] rounded-lg font-bold hover:opacity-80",
                        children: "🗳️ 투표로 넘어가기"
                    }, void 0, false, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 206,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/mafia-game/app/page.tsx",
                lineNumber: 193,
                columnNumber: 9
            }, this),
            phase === "day-voting" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-[var(--surface)] rounded-2xl p-6 mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-bold mb-4",
                        children: "🗳️ 투표"
                    }, void 0, false, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 218,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2 mb-4",
                        children: alivePlayers.map((voter)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-[var(--bg)] rounded-lg p-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm mb-2",
                                        children: [
                                            voter.name,
                                            "의 투표:"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/mafia-game/app/page.tsx",
                                        lineNumber: 222,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-2",
                                        children: alivePlayers.filter((p)=>p.id !== voter.id).map((target)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>handleVote(voter.id, target.id),
                                                className: `px-3 py-1 rounded-lg text-sm ${votes[voter.id] === target.id ? "bg-[var(--primary)] font-bold" : "bg-[var(--surface)] border border-[var(--accent)]"}`,
                                                children: target.name
                                            }, target.id, false, {
                                                fileName: "[project]/mafia-game/app/page.tsx",
                                                lineNumber: 225,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/mafia-game/app/page.tsx",
                                        lineNumber: 223,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, voter.id, true, {
                                fileName: "[project]/mafia-game/app/page.tsx",
                                lineNumber: 221,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 219,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: endVoting,
                        disabled: !allVoted,
                        className: "w-full py-3 bg-[var(--primary)] rounded-lg font-bold hover:opacity-80 disabled:opacity-30",
                        children: allVoted ? "투표 결과 확인" : "모두 투표해야 합니다"
                    }, void 0, false, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 241,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/mafia-game/app/page.tsx",
                lineNumber: 217,
                columnNumber: 9
            }, this),
            log.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-[var(--surface)] rounded-2xl p-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-bold mb-3",
                        children: "📜 게임 기록"
                    }, void 0, false, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 254,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-1 text-sm text-[var(--muted)] max-h-48 overflow-y-auto",
                        children: log.slice().reverse().map((entry, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: entry.message
                            }, i, false, {
                                fileName: "[project]/mafia-game/app/page.tsx",
                                lineNumber: 257,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 255,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/mafia-game/app/page.tsx",
                lineNumber: 253,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/mafia-game/app/page.tsx",
        lineNumber: 35,
        columnNumber: 5
    }, this);
}
_s(Home, "re2qozQ4c9YJQuKGjaQS63or0ek=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$lib$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGameStore"]
    ];
});
_c = Home;
// 밤 행동 컴포넌트
function NightAction({ title, players, onSelect, selected }) {
    _s1();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mb-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setOpen(!open),
                className: "w-full text-left font-semibold mb-2",
                children: [
                    open ? "▼" : "▶",
                    " ",
                    title
                ]
            }, void 0, true, {
                fileName: "[project]/mafia-game/app/page.tsx",
                lineNumber: 279,
                columnNumber: 7
            }, this),
            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap gap-2",
                children: players.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>onSelect(p.id),
                        className: `px-3 py-1 rounded-lg text-sm ${selected === p.id ? "bg-[var(--primary)] font-bold" : "bg-[var(--bg)] border border-[var(--accent)]"}`,
                        children: p.name
                    }, p.id, false, {
                        fileName: "[project]/mafia-game/app/page.tsx",
                        lineNumber: 288,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/mafia-game/app/page.tsx",
                lineNumber: 286,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/mafia-game/app/page.tsx",
        lineNumber: 278,
        columnNumber: 5
    }, this);
}
_s1(NightAction, "dVkDIfRb5RN4FjtonjBYYwpg89o=");
_c1 = NightAction;
var _c, _c1;
__turbopack_context__.k.register(_c, "Home");
__turbopack_context__.k.register(_c1, "NightAction");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/mafia-game/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/mafia-game/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
                return "Activity";
            case REACT_VIEW_TRANSITION_TYPE:
                return "ViewTransition";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_CONTEXT_TYPE:
                return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
        try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
        } catch (x) {
            return "<...>";
        }
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
        return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.defineProperty(type, "_debugStack", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
            for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren]);
            Object.freeze && Object.freeze(children);
        } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
        else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
    }
    function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
    }
    function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    var React = __turbopack_context__.r("[project]/mafia-game/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
    };
    React = {
        react_stack_bottom_frame: function(callStackForError) {
            return callStackForError();
        }
    };
    var specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutKeySpread = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        if (trackActualOwner) {
            var previousStackTraceLimit = Error.stackTraceLimit;
            Error.stackTraceLimit = 10;
            var debugStackDEV = Error("react-stack-top-frame");
            Error.stackTraceLimit = previousStackTraceLimit;
        } else debugStackDEV = unknownOwnerDebugStack;
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStackDEV, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
}();
}),
"[project]/mafia-game/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/mafia-game/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/mafia-game/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}),
"[project]/mafia-game/node_modules/zustand/esm/vanilla.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createStore",
    ()=>createStore
]);
const createStoreImpl = (createState)=>{
    let state;
    const listeners = /* @__PURE__ */ new Set();
    const setState = (partial, replace)=>{
        const nextState = typeof partial === "function" ? partial(state) : partial;
        if (!Object.is(nextState, state)) {
            const previousState = state;
            state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
            listeners.forEach((listener)=>listener(state, previousState));
        }
    };
    const getState = ()=>state;
    const getInitialState = ()=>initialState;
    const subscribe = (listener)=>{
        listeners.add(listener);
        return ()=>listeners.delete(listener);
    };
    const api = {
        setState,
        getState,
        getInitialState,
        subscribe
    };
    const initialState = state = createState(setState, getState, api);
    return api;
};
const createStore = (createState)=>createState ? createStoreImpl(createState) : createStoreImpl;
;
}),
"[project]/mafia-game/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "create",
    ()=>create,
    "useStore",
    ()=>useStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/mafia-game/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$zustand$2f$esm$2f$vanilla$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/mafia-game/node_modules/zustand/esm/vanilla.mjs [app-client] (ecmascript)");
;
;
const identity = (arg)=>arg;
function useStore(api, selector = identity) {
    const slice = __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useSyncExternalStore(api.subscribe, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useCallback({
        "useStore.useSyncExternalStore[slice]": ()=>selector(api.getState())
    }["useStore.useSyncExternalStore[slice]"], [
        api,
        selector
    ]), __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useCallback({
        "useStore.useSyncExternalStore[slice]": ()=>selector(api.getInitialState())
    }["useStore.useSyncExternalStore[slice]"], [
        api,
        selector
    ]));
    __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useDebugValue(slice);
    return slice;
}
const createImpl = (createState)=>{
    const api = (0, __TURBOPACK__imported__module__$5b$project$5d2f$mafia$2d$game$2f$node_modules$2f$zustand$2f$esm$2f$vanilla$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createStore"])(createState);
    const useBoundStore = (selector)=>useStore(api, selector);
    Object.assign(useBoundStore, api);
    return useBoundStore;
};
const create = (createState)=>createState ? createImpl(createState) : createImpl;
;
}),
]);

//# sourceMappingURL=mafia-game_1ljqwnd._.js.map