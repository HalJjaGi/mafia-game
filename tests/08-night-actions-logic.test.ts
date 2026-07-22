// 밤 행동 로직 검증 테스트
function simulateNightActions(
  killedId: string | null,
  protectedId: string | null,
  snipedId: string | null,
  players: any[]
): { deadPlayers: string[], survivors: string[] } {
  const killedIds: string[] = [];

  // 마피아 처형 (의사 보호 있으면 생존)
  if (killedId && killedId !== protectedId) {
    killedIds.push(killedId);
  }

  // 저격수 저격 (보호 무시, 중복 방지)
  if (snipedId && !killedIds.includes(snipedId)) {
    killedIds.push(snipedId);
  }

  // 사망 처리
  const deadPlayers: string[] = [];
  const survivors: string[] = [];

  players.forEach(p => {
    if (killedIds.includes(p.id)) {
      p.alive = false;
      deadPlayers.push(p.name);
    } else {
      survivors.push(p.name);
    }
  });

  return { deadPlayers, survivors };
}

function testNightActionsLogic() {
  console.log('=== 밤 행동 로직 검증 테스트 ===\n');

  // 테스트 1: 마피아 처형 + 의사 보호 → 생존
  console.log('테스트 1: 마피아 처형 + 의사 보호 → 생존');
  const players1 = [
    { id: 'p1', name: '플레이어1', alive: true },
    { id: 'p2', name: '플레이어2', alive: true },
    { id: 'p3', name: '플레이어3', alive: true },
  ];
  const result1 = simulateNightActions('p1', 'p1', null, players1);
  console.log(`  사망: ${result1.deadPlayers.length > 0 ? result1.deadPlayers.join(', ') : '없음'}`);
  console.log(`  생존: ${result1.survivors.join(', ')}`);
  console.log(`  ${result1.deadPlayers.length === 0 ? '✅' : '❌'} 의사 보호로 생존\n`);

  // 테스트 2: 마피아 처형 (보호 없음) → 사망
  console.log('테스트 2: 마피아 처형 (보호 없음) → 사망');
  const players2 = [
    { id: 'p1', name: '플레이어1', alive: true },
    { id: 'p2', name: '플레이어2', alive: true },
    { id: 'p3', name: '플레이어3', alive: true },
  ];
  const result2 = simulateNightActions('p1', null, null, players2);
  console.log(`  사망: ${result2.deadPlayers.join(', ')}`);
  console.log(`  생존: ${result2.survivors.join(', ')}`);
  console.log(`  ${result2.deadPlayers.includes('플레이어1') ? '✅' : '❌'} 플레이어1 사망\n`);

  // 테스트 3: 저격수 저격 → 사망 (보호 무시)
  console.log('테스트 3: 저격수 저격 → 사망 (보호 무시)');
  const players3 = [
    { id: 'p1', name: '플레이어1', alive: true },
    { id: 'p2', name: '플레이어2', alive: true },
    { id: 'p3', name: '플레이어3', alive: true },
  ];
  const result3 = simulateNightActions(null, 'p2', 'p2', players3);
  console.log(`  보호 대상: 플레이어2, 저격 대상: 플레이어2`);
  console.log(`  사망: ${result3.deadPlayers.join(', ')}`);
  console.log(`  생존: ${result3.survivors.join(', ')}`);
  console.log(`  ${result3.deadPlayers.includes('플레이어2') ? '✅' : '❌'} 보호 무시하고 사망\n`);

  // 테스트 4: 마피아 + 저격수 동시 공격 (다른 대상)
  console.log('테스트 4: 마피아 + 저격수 동시 공격 (다른 대상)');
  const players4 = [
    { id: 'p1', name: '플레이어1', alive: true },
    { id: 'p2', name: '플레이어2', alive: true },
    { id: 'p3', name: '플레이어3', alive: true },
    { id: 'p4', name: '플레이어4', alive: true },
  ];
  const result4 = simulateNightActions('p1', null, 'p2', players4);
  console.log(`  사망: ${result4.deadPlayers.join(', ')}`);
  console.log(`  생존: ${result4.survivors.join(', ')}`);
  console.log(`  ${result4.deadPlayers.includes('플레이어1') && result4.deadPlayers.includes('플레이어2') ? '✅' : '❌'} 둘 다 사망\n`);

  // 테스트 5: 마피아 + 저격수 동시 공격 (같은 대상)
  console.log('테스트 5: 마피아 + 저격수 동시 공격 (같은 대상 - 중복 방지)');
  const players5 = [
    { id: 'p1', name: '플레이어1', alive: true },
    { id: 'p2', name: '플레이어2', alive: true },
    { id: 'p3', name: '플레이어3', alive: true },
  ];
  const result5 = simulateNightActions('p1', null, 'p1', players5);
  console.log(`  사망: ${result5.deadPlayers.join(', ')}`);
  console.log(`  생존: ${result5.survivors.join(', ')}`);
  console.log(`  ${result5.deadPlayers.length === 1 && result5.deadPlayers.includes('플레이어1') ? '✅' : '❌'} 중복 방지 (1명만 사망)\n`);

  // 테스트 6: 모두 행동 안 함 → 아무도 사망 안 함
  console.log('테스트 6: 모두 행동 안 함 → 아무도 사망 안 함');
  const players6 = [
    { id: 'p1', name: '플레이어1', alive: true },
    { id: 'p2', name: '플레이어2', alive: true },
    { id: 'p3', name: '플레이어3', alive: true },
  ];
  const result6 = simulateNightActions(null, null, null, players6);
  console.log(`  사망: ${result6.deadPlayers.length > 0 ? result6.deadPlayers.join(', ') : '없음'}`);
  console.log(`  생존: ${result6.survivors.join(', ')}`);
  console.log(`  ${result6.deadPlayers.length === 0 ? '✅' : '❌'} 아무도 사망 안 함\n`);

  console.log('=== 밤 행동 로직 검증 테스트 완료 ===');
}

testNightActionsLogic();