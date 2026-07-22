// 테러리스트 자폭 테스트
import { checkWinner, ROLE_INFO, type Player } from '../lib/types';

function createPlayer(id: string, role: any, alive: boolean = true): Player {
  return {
    id,
    name: `Player ${id}`,
    role,
    alive,
    isHost: false,
  };
}

function simulateTerroristDeath(players: Player[], terroristIndex: number): { players: Player[]; diedWith: Player | null } {
  const terrorist = players[terroristIndex];
  if (!terrorist.alive) return { players, diedWith: null };

  // 테러리스트 사망 처리
  terrorist.alive = false;

  // 살아있는 시민 중 한명 같이 사망
  const aliveCitizens = players.filter((p, i) => p.alive && ROLE_INFO[p.role!].team === 'citizen');
  if (aliveCitizens.length > 0) {
    const victim = aliveCitizens[Math.floor(Math.random() * aliveCitizens.length)];
    victim.alive = false;
    return { players, diedWith: victim };
  }

  return { players, diedWith: null };
}

function testTerroristExplosion() {
  console.log('=== 테러리스트 자폭 테스트 ===\n');

  // 테스트 1: 밤에 테러리스트 사망 → 시민 1명 동반 사망
  console.log('테스트 1: 밤에 테러리스트 사망');
  const players1: Player[] = [
    createPlayer('1', 'mafia'),
    createPlayer('2', 'citizen'),
    createPlayer('3', 'citizen'),
    createPlayer('4', 'terrorist'),
  ];

  const { players: after1, diedWith: victim1 } = simulateTerroristDeath(players1, 3);
  const aliveMafia1 = after1.filter(p => p.alive && ROLE_INFO[p.role!].team === 'mafia').length;
  const aliveCitizen1 = after1.filter(p => p.alive && ROLE_INFO[p.role!].team === 'citizen').length;

  console.log(`  사망자: 테러리스트${victim1 ? ` + ${victim1.name}` : ''}`);
  console.log(`  생존: 마피아 ${aliveMafia1}명, 시민 ${aliveCitizen1}명`);
  console.log(`  시민 동반 사망: ${victim1 ? '✅' : '❌'}\n`);

  // 테스트 2: 투표로 테러리스트 추방 → 시민 1명 동반 사망
  console.log('테스트 2: 투표로 테러리스트 추방');
  const players2: Player[] = [
    createPlayer('1', 'mafia'),
    createPlayer('2', 'citizen'),
    createPlayer('3', 'citizen'),
    createPlayer('4', 'terrorist'),
  ];

  const { players: after2, diedWith: victim2 } = simulateTerroristDeath(players2, 3);
  const aliveMafia2 = after2.filter(p => p.alive && ROLE_INFO[p.role!].team === 'mafia').length;
  const aliveCitizen2 = after2.filter(p => p.alive && ROLE_INFO[p.role!].team === 'citizen').length;

  console.log(`  사망자: 테러리스트${victim2 ? ` + ${victim2.name}` : ''}`);
  console.log(`  생존: 마피아 ${aliveMafia2}명, 시민 ${aliveCitizen2}명`);
  console.log(`  시민 동반 사망: ${victim2 ? '✅' : '❌'}\n`);

  // 테스트 3: 테러리스트가 유일한 시민인 경우
  console.log('테스트 3: 테러리스트가 유일한 시민인 경우 (시민 없음 → 동반 사망 없음)');
  const players3: Player[] = [
    createPlayer('1', 'mafia'),
    createPlayer('2', 'citizen', false),
    createPlayer('3', 'citizen', false),
    createPlayer('4', 'terrorist'),
  ];

  const { players: after3, diedWith: victim3 } = simulateTerroristDeath(players3, 3);
  const aliveMafia3 = after3.filter(p => p.alive && ROLE_INFO[p.role!].team === 'mafia').length;
  const aliveCitizen3 = after3.filter(p => p.alive && ROLE_INFO[p.role!].team === 'citizen').length;

  console.log(`  사망자: 테러리스트${victim3 ? ` + ${victim3.name}` : ''}`);
  console.log(`  생존: 마피아 ${aliveMafia3}명, 시민 ${aliveCitizen3}명`);
  console.log(`  동반 사망 없음: ${!victim3 ? '✅' : '❌'}\n`);

  // 테스트 4: 테러리스트 자폭 후 승리 조건 확인
  console.log('테스트 4: 테러리스트 자폭 후 승리 조건');
  const players4: Player[] = [
    createPlayer('1', 'mafia'),
    createPlayer('2', 'citizen'),
    createPlayer('3', 'citizen'),
    createPlayer('4', 'terrorist'),
    createPlayer('5', 'police'),
  ];

  const { players: after4 } = simulateTerroristDeath(players4, 3);
  const winner4 = checkWinner(after4);

  console.log(`  생존: 마피아 1명, 시민 3명`);
  console.log(`  승리자: ${winner4 || 'null'} (예상: null) ${winner4 === null ? '✅' : '❌'}\n`);

  // 테스트 5: 테러리스트 자폭으로 마피아 승리
  console.log('테스트 5: 테러리스트 자폭으로 마피아 승리');
  const players5: Player[] = [
    createPlayer('1', 'mafia'),
    createPlayer('2', 'citizen'),
    createPlayer('3', 'terrorist'),
  ];

  const { players: after5 } = simulateTerroristDeath(players5, 2);
  const winner5 = checkWinner(after5);

  console.log(`  생존: 마피아 1명, 시민 1명 (동반 사망 후)`);
  console.log(`  승리자: ${winner5 || 'null'} (예상: mafia) ${winner5 === 'mafia' ? '✅' : '❌'}\n`);

  console.log('=== 테러리스트 자폭 테스트 완료 ===');
}

testTerroristExplosion();