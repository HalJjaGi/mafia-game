// 역할 배정 검증 테스트
import { assignRoles, ROLE_INFO } from '../lib/types';

function testRoleAssignment() {
  console.log('=== 역할 배정 검증 테스트 ===\n');

  const testCases = [
    { count: 4, name: '4인 게임' },
    { count: 5, name: '5인 게임' },
    { count: 6, name: '6인 게임' },
    { count: 7, name: '7인 게임' },
    { count: 8, name: '8인 게임' },
    { count: 9, name: '9인 게임' },
    { count: 10, name: '10인 게임' },
    { count: 11, name: '11인 게임' },
    { count: 12, name: '12인 게임' },
  ];

  for (const testCase of testCases) {
    const roles = assignRoles(testCase.count);

    // 기본 검증
    if (roles.length !== testCase.count) {
      console.log(`❌ ${testCase.name}: 역할 수 불일치 (예상: ${testCase.count}, 실제: ${roles.length})`);
      continue;
    }

    // 팀별 인원수 확인
    const mafiaCount = roles.filter(r => ROLE_INFO[r].team === 'mafia').length;
    const citizenCount = roles.filter(r => ROLE_INFO[r].team === 'citizen').length;

    // 마피아 수 규칙 검증
    let expectedMafia = 1;
    if (testCase.count >= 7) expectedMafia = 2;
    if (testCase.count >= 11) expectedMafia = 3;

    if (mafiaCount !== expectedMafia) {
      console.log(`❌ ${testCase.name}: 마피아 수 불일치 (예상: ${expectedMafia}, 실제: ${mafiaCount})`);
      continue;
    }

    // 필수 역할 확인 (경찰, 의사)
    const hasPolice = roles.includes('police');
    const hasDoctor = roles.includes('doctor');

    if (!hasPolice || !hasDoctor) {
      console.log(`❌ ${testCase.name}: 필수 역할 누락 (경찰: ${hasPolice}, 의사: ${hasDoctor})`);
      continue;
    }

    // 중복 역할 확인 (저격수는 1명만)
    const sniperCount = roles.filter(r => r === 'sniper').length;
    if (sniperCount > 1) {
      console.log(`❌ ${testCase.name}: 저격수 중복 (${sniperCount}명)`);
      continue;
    }

    // 역할 배정 결과 출력
    const roleDistribution: Record<string, number> = {};
    roles.forEach(r => {
      roleDistribution[r] = (roleDistribution[r] || 0) + 1;
    });

    console.log(`✅ ${testCase.name}: 성공`);
    console.log(`   마피아: ${mafiaCount}, 시민팀: ${citizenCount}`);
    console.log(`   역할 분포: ${JSON.stringify(roleDistribution)}`);
    console.log();
  }
}

// 여러 번 테스트하여 랜덤성 확인
console.log('랜덤성 검증 (각 10번 반복):\n');
for (let i = 0; i < 10; i++) {
  const roles = assignRoles(8);
  const mafiaCount = roles.filter(r => ROLE_INFO[r].team === 'mafia').length;
  process.stdout.write(`${mafiaCount} `);
}
console.log('\n');

testRoleAssignment();