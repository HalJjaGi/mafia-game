// 승리 조건 검증 테스트
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

function testWinnerCheck() {
  console.log('=== 승리 조건 검증 테스트 ===\n');

  // 테스트 1: 마피아 0명 → 시민 승리
  const players1: Player[] = [
    createPlayer('1', 'citizen'),
    createPlayer('2', 'police'),
    createPlayer('3', 'doctor'),
  ];
  const winner1 = checkWinner(players1);
  console.log(`테스트 1: 마피아 0명 → 예상: citizen, 실제: ${winner1} ${winner1 === 'citizen' ? '✅' : '❌'}`);

  // 테스트 2: 마피아 = 시민 → 마피아 승리
  const players2: Player[] = [
    createPlayer('1', 'mafia'),
    createPlayer('2', 'citizen'),
    createPlayer('3', 'police'),
  ];
  const winner2 = checkWinner(players2);
  console.log(`테스트 2: 마피아=시민 (1=1) → 예상: mafia, 실제: ${winner2} ${winner2 === 'mafia' ? '✅' : '❌'}`);

  // 테스트 3: 마피아 > 시민 → 마피아 승리
  const players3: Player[] = [
    createPlayer('1', 'mafia'),
    createPlayer('2', 'mafia'),
    createPlayer('3', 'citizen'),
  ];
  const winner3 = checkWinner(players3);
  console.log(`테스트 3: 마피아>시민 (2>1) → 예상: mafia, 실제: ${winner3} ${winner3 === 'mafia' ? '✅' : '❌'}`);

  // 테스트 4: 게임 중 → null
  const players4: Player[] = [
    createPlayer('1', 'mafia'),
    createPlayer('2', 'citizen'),
    createPlayer('3', 'police'),
    createPlayer('4', 'doctor'),
  ];
  const winner4 = checkWinner(players4);
  console.log(`테스트 4: 게임 중 (1마피아 vs 3시민) → 예상: null, 실제: ${winner4} ${winner4 === null ? '✅' : '❌'}`);

  // 테스트 5: 일부 사망 후 시민 승리
  const players5: Player[] = [
    createPlayer('1', 'citizen'),
    createPlayer('2', 'citizen'),
    createPlayer('3', 'mafia', false),
    createPlayer('4', 'police'),
  ];
  const winner5 = checkWinner(players5);
  console.log(`테스트 5: 마피아 사망 (0마피아 vs 3시민) → 예상: citizen, 실제: ${winner5} ${winner5 === 'citizen' ? '✅' : '❌'}`);

  // 테스트 6: 일부 사망 후 마피아 승리 (마피아=시민)
  const players6: Player[] = [
    createPlayer('1', 'mafia'),
    createPlayer('2', 'citizen'),
    createPlayer('3', 'citizen', false),
    createPlayer('4', 'citizen', false),
  ];
  const winner6 = checkWinner(players6);
  console.log(`테스트 6: 시민 감소 (1마피아 vs 1시민) → 예상: mafia, 실제: ${winner6} ${winner6 === 'mafia' ? '✅' : '❌'}`);

  // 테스트 7: 스파이 + 마피아 vs 시민 (스파이는 마피아 팀)
  const players7: Player[] = [
    createPlayer('1', 'mafia'),
    createPlayer('2', 'spy'),
    createPlayer('3', 'citizen'),
  ];
  const winner7 = checkWinner(players7);
  console.log(`테스트 7: 마피아+스파이 vs 시민 (2>1) → 예상: mafia, 실제: ${winner7} ${winner7 === 'mafia' ? '✅' : '❌'}`);

  // 테스트 8: 테러리스트 + 마피아 vs 시민
  const players8: Player[] = [
    createPlayer('1', 'mafia'),
    createPlayer('2', 'terrorist'),
    createPlayer('3', 'citizen'),
  ];
  const winner8 = checkWinner(players8);
  console.log(`테스트 8: 마피아+테러리스트 vs 시민 (2>1) → 예상: mafia, 실제: ${winner8} ${winner8 === 'mafia' ? '✅' : '❌'}`);

  // 테스트 9: 저격수 + 경찰 + 의사 vs 마피아
  const players9: Player[] = [
    createPlayer('1', 'sniper'),
    createPlayer('2', 'police'),
    createPlayer('3', 'doctor'),
    createPlayer('4', 'mafia'),
  ];
  const winner9 = checkWinner(players9);
  console.log(`테스트 9: 특수시민 vs 마피아 (3>1) → 예상: null, 실제: ${winner9} ${winner9 === null ? '✅' : '❌'}`);

  console.log('\n=== 승리 조건 검증 완료 ===');
}

testWinnerCheck();