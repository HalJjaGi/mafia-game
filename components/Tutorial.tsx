"use client";

import { useState } from "react";
import { ROLE_INFO } from "@/lib/types";
import type { Role } from "@/lib/types";

const STEPS = [
  {
    emoji: "🎮",
    title: "마피아 게임에 오신 것을 환영합니다!",
    content: "시민 팀과 마피아 팀이 싸우는 게임입니다. 각자 자신의 역할을 확인하고, 밤에는 능력을 쓰고 낮에는 토론과 투표로 마피아를 찾아내세요!",
  },
  {
    emoji: "🌙",
    title: "밤 (30초)",
    content: "마피아가 처형 대상을 고르고, 의사는 보호, 경찰은 조사, 저격수는 저격, 영매는 죽은 자의 직업을 확인합니다. 시간 내에 능력을 사용하세요!",
  },
  {
    emoji: "☀️",
    title: "낮 - 토론 (60초)",
    content: "어젯밤에 일어난 일을 바탕으로 의심되는 사람을 찾아 토론하세요. 죽은 사람의 직업도 공개됩니다.",
  },
  {
    emoji: "🗳️",
    title: "낮 - 투표 (20초)",
    content: "가장 의심되는 사람에게 투표하세요. 최다 득표자가 추방됩니다. 시간 내에 투표하지 않으면 기권处理됩니다!",
  },
  {
    emoji: "🏆",
    title: "승리 조건",
    content: "시민 팀: 모든 마피아 처치 시 승리. 마피아 팀: 마피아 수가 시민 수 이상이면 승리.",
  },
];

export default function Tutorial({ activeRoles, onClose }: { activeRoles: Role[]; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length + 1; // 역할 설명이 마지막

  if (isLast) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-[var(--surface)] rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-center">🎭 이번 게임의 역할</h2>
          <div className="space-y-2 mb-4">
            {activeRoles.map(role => {
              const info = ROLE_INFO[role];
              return (
                <div key={role} className="flex items-start gap-3 bg-[var(--bg)] rounded-lg p-3">
                  <span className="text-2xl">{info.emoji}</span>
                  <div>
                    <p className="font-bold text-sm">
                      {info.name}
                      <span className={`ml-2 text-xs ${info.team === "mafia" ? "text-red-400" : "text-blue-400"}`}>
                        ({info.team === "mafia" ? "마피아 팀" : "시민 팀"})
                      </span>
                    </p>
                    <p className="text-xs text-[var(--muted)]">{info.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 bg-[var(--primary)] rounded-lg font-bold"
          >
            게임 시작! 🚀
          </button>
        </div>
      </div>
    );
  }

  const s = STEPS[step];
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--surface)] rounded-2xl p-6 max-w-md w-full">
        <div className="text-center mb-4">
          <span className="text-5xl">{s.emoji}</span>
        </div>
        <h2 className="text-lg font-bold mb-2 text-center">{s.title}</h2>
        <p className="text-sm text-[var(--muted)] mb-6 text-center leading-relaxed">{s.content}</p>

        {/* 진행 표시 */}
        <div className="flex justify-center gap-1 mb-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i === step ? "bg-[var(--primary)]" : "bg-gray-600"}`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-2 bg-[var(--bg)] rounded-lg font-semibold text-sm"
            >
              이전
            </button>
          )}
          <button
            onClick={() => setStep(step + 1)}
            className="flex-1 py-2 bg-[var(--primary)] rounded-lg font-semibold text-sm"
          >
            {step === STEPS.length - 1 ? "역할 확인 →" : "다음 →"}
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-2 py-1 text-xs text-[var(--muted)]"
        >
          건너뛰기
        </button>
      </div>
    </div>
  );
}
