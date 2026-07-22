#!/bin/bash

echo "======================================="
echo "  마피아 게임 테스트 실행 스크립트"
echo "======================================="
echo ""

cd "$(dirname "$0")"

# 단위 테스트 (Socket.io 제외)
echo "[1/6] 역할 배정 검증 테스트..."
npx tsx tests/01-role-assignment.test.ts
echo ""

echo "[2/6] 승리 조건 검증 테스트..."
npx tsx tests/02-winner-condition.test.ts
echo ""

echo "[3/6] 스파이 위장 테스트..."
npx tsx tests/03-spy-disguise.test.ts
echo ""

echo "[4/6] 밤 행동 로직 검증 테스트..."
npx tsx tests/08-night-actions-logic.test.ts
echo ""

echo "[5/6] 투표 시뮬레이션 테스트..."
npx tsx tests/05-voting.test.ts
echo ""

echo "[6/6] 테러리스트 자폭 테스트..."
npx tsx tests/06-terrorist-explosion.test.ts
echo ""

echo "======================================="
echo "  단위 테스트 완료"
echo "======================================="
echo ""

# Socket.io 연결 테스트 (서버 실행 필요)
echo "Socket.io 연결 테스트는 서버가 실행 중일 때만 실행하세요."
echo "서버가 실행 중인 경우, 아래 명령어를 실행하세요:"
echo "  npx tsx tests/04-night-actions.test.ts"
echo "  npx tsx tests/07-full-game-flow.test.ts"
echo ""