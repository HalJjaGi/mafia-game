// 투표 시뮬레이션 테스트
interface VoteResult {
  eliminatedId: string | null;
  tied: boolean;
}

function processVotes(votes: Record<string, string>, players: any[]): VoteResult {
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
    return { eliminatedId, tied: false };
  } else {
    return { eliminatedId: null, tied: true };
  }
}

function testVotingSimulation() {
  console.log('=== 투표 시뮬레이션 테스트 ===\n');

  const players = [
    { id: 'p1', name: '플레이어1' },
    { id: 'p2', name: '플레이어2' },
    { id: 'p3', name: '플레이어3' },
    { id: 'p4', name: '플레이어4' },
  ];

  // 테스트 1: 최다 득표자 추방
  console.log('테스트 1: 최다 득표자 추방');
  const votes1: Record<string, string> = {
    'p1': 'p2',
    'p2': 'p2',
    'p3': 'p1',
    'p4': 'p2',
  };
  const result1 = processVotes(votes1, players);
  const eliminated1 = players.find(p => p.id === result1.eliminatedId);
  console.log(`  득표: p2(3), p1(1)`);
  console.log(`  추방: ${eliminated1?.name || '없음'} ${eliminated1?.name === '플레이어2' ? '✅' : '❌'}\n`);

  // 테스트 2: 동표 → 추방 없음
  console.log('테스트 2: 동표 → 추방 없음');
  const votes2: Record<string, string> = {
    'p1': 'p2',
    'p2': 'p1',
    'p3': 'p2',
    'p4': 'p1',
  };
  const result2 = processVotes(votes2, players);
  console.log(`  득표: p2(2), p1(2)`);
  console.log(`  추방: ${result2.eliminatedId ? '있음' : '없음'} ${result2.eliminatedId === null && result2.tied ? '✅' : '❌'}\n`);

  // 테스트 3: 3명 동표 → 추방 없음
  console.log('테스트 3: 3명 동표 → 추방 없음');
  const votes3: Record<string, string> = {
    'p1': 'p2',
    'p2': 'p3',
    'p3': 'p4',
    'p4': 'p2',
  };
  const result3 = processVotes(votes3, players);
  console.log(`  득표: p2(2), p3(1), p4(1)`);
  console.log(`  추방: ${result3.eliminatedId ? '있음' : '없음'} ${result3.eliminatedId === 'p2' && !result3.tied ? '✅' : '❌'}\n`);

  // 테스트 4: 한명에게 전부 투표
  console.log('테스트 4: 한명에게 전부 투표');
  const votes4: Record<string, string> = {
    'p1': 'p2',
    'p2': 'p2',
    'p3': 'p2',
    'p4': 'p2',
  };
  const result4 = processVotes(votes4, players);
  const eliminated4 = players.find(p => p.id === result4.eliminatedId);
  console.log(`  득표: p2(4)`);
  console.log(`  추방: ${eliminated4?.name || '없음'} ${eliminated4?.name === '플레이어2' ? '✅' : '❌'}\n`);

  // 테스트 5: 2-2 동표 (4명 게임)
  console.log('테스트 5: 2-2 동표');
  const votes5: Record<string, string> = {
    'p1': 'p2',
    'p2': 'p1',
    'p3': 'p2',
    'p4': 'p1',
  };
  const result5 = processVotes(votes5, players);
  console.log(`  득표: p2(2), p1(2)`);
  console.log(`  추방: ${result5.eliminatedId ? '있음' : '없음'} ${result5.eliminatedId === null && result5.tied ? '✅' : '❌'}\n`);

  // 테스트 6: 3-1 (3명 투표 참여)
  console.log('테스트 6: 3-1 (3명 투표 참여)');
  const votes6: Record<string, string> = {
    'p1': 'p2',
    'p2': 'p2',
    'p3': 'p1',
  };
  const result6 = processVotes(votes6, players);
  const eliminated6 = players.find(p => p.id === result6.eliminatedId);
  console.log(`  득표: p2(2), p1(1)`);
  console.log(`  추방: ${eliminated6?.name || '없음'} ${eliminated6?.name === '플레이어2' ? '✅' : '❌'}\n`);

  console.log('=== 투표 시뮬레이션 테스트 완료 ===');
}

testVotingSimulation();