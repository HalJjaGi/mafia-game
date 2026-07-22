// 스파이 위장 테스트
import { getInvestigatedRole, type Player } from '../lib/types';

function createPlayer(id: string, role: any): Player {
  return {
    id,
    name: `Player ${id}`,
    role,
    alive: true,
    isHost: false,
  };
}

function testSpyDisguise() {
  console.log('=== 스파이 위장 테스트 ===\n');

  // 모든 역할에 대한 조사 결과 확인
  const roles = ['citizen', 'police', 'doctor', 'mafia', 'spy', 'sniper', 'medium', 'terrorist'];

  console.log('경찰 조사 결과 확인:');
  for (const role of roles) {
    const player = createPlayer('1', role);
    const investigated = getInvestigatedRole(player);
    const isCorrect = investigated === role;
    const isDisguised = role === 'spy' && investigated === 'citizen';
    const isNormalDisguised = role !== 'spy' && investigated === role;
    const success = isDisguised || isNormalDisguised;

    console.log(`  ${role.padEnd(12)} → ${investigated.padEnd(12)} ${success ? '✅' : '❌'}`);

    if (role === 'spy' && investigated !== 'citizen') {
      console.log(`    ⚠️  스파이는 시민으로 위장되어야 합니다!`);
    }
  }

  console.log('\n=== 스파이 위장 테스트 완료 ===');
}

testSpyDisguise();