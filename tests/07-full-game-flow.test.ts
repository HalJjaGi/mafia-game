// 게임 풀 플로우 테스트 (Socket.io 연결 필요)
import { io, Socket } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3000';

function createSocket(): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const socket = io(SERVER_URL);

    socket.on('connect', () => {
      console.log(`  ✅ Socket 연결됨: ${socket.id}`);
      resolve(socket);
    });

    socket.on('connect_error', (err) => {
      console.error(`  ❌ Socket 연결 실패: ${err.message}`);
      reject(err);
    });

    setTimeout(() => {
      if (!socket.connected) {
        socket.disconnect();
        reject(new Error('Socket 연결 타임아웃'));
      }
    }, 5000);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testFullGameFlow() {
  console.log('=== 게임 풀 플로우 테스트 (8인 게임) ===\n');

  const sockets: Socket[] = [];
  const playerIds: string[] = [];
  let roomCode = '';
  let gameState: any = null;

  try {
    // 1. 방 생성
    console.log('[1/12] 방 생성...');
    const hostSocket = await createSocket();
    sockets.push(hostSocket);

    const roomData = await new Promise<any>((resolve, reject) => {
      hostSocket.emit('room:create', '호스트');
      hostSocket.on('room:joined', resolve);
      hostSocket.on('error', (err) => reject(new Error(err.message)));
      setTimeout(() => reject(new Error('방 생성 타임아웃')), 3000);
    });

    roomCode = roomData.code;
    playerIds.push(roomData.playerId);
    console.log(`  ✅ 방 생성됨: ${roomCode}\n`);

    // 2. 플레이어 7명 추가 (총 8명)
    console.log('[2/12] 플레이어 7명 추가...');
    for (let i = 2; i <= 8; i++) {
      const socket = await createSocket();
      sockets.push(socket);

      const data = await new Promise<any>((resolve, reject) => {
        socket.emit('room:join', { code: roomCode, name: `플레이어${i}` });
        socket.on('room:joined', resolve);
        socket.on('error', (err) => reject(new Error(err.message)));
        setTimeout(() => reject(new Error(`플레이어${i} 참가 타임아웃`)), 3000);
      });

      playerIds.push(data.playerId);
      console.log(`  ✅ 플레이어${i} 참가`);
    }
    console.log();

    // 상태 업데이트 수신 설정
    hostSocket.on('state:update', (state) => {
      gameState = state;
    });

    // 3. 게임 시작
    console.log('[3/12] 게임 시작...');
    hostSocket.emit('game:start');
    await sleep(1000);

    if (!gameState || gameState.phase !== 'night') {
      throw new Error('게임 시작 실패');
    }
    console.log(`  ✅ 게임 시작됨 (페이즈: ${gameState.phase})`);
    console.log(`  플레이어 수: ${gameState.players.length}\n`);

    // 역할 정보 받기
    const roleData = await new Promise<any>((resolve) => {
      const timeout = setTimeout(() => resolve(null), 2000);
      hostSocket.on('role:assigned', (data) => {
        clearTimeout(timeout);
        resolve(data);
      });
    });
    console.log(`  호스트 역할: ${roleData?.role || '알 수 없음'}`);
    console.log(`  활성 역할: ${roleData?.activeRoles?.join(', ') || '알 수 없음'}\n`);

    // 4. 밤 페이즈 (타이머 대기)
    console.log('[4/12] 1밤 페이즈 대기 (30초)...');
    await sleep(31000);

    if (gameState.phase !== 'day-discussion') {
      throw new Error(`밤→낮 전환 실패: ${gameState.phase}`);
    }
    console.log(`  ✅ 낮-토론 페이즈 전환\n`);

    // 5. 토론 페이즈 (타이머 대기)
    console.log('[5/12] 1일차 토론 대기 (60초)...');
    await sleep(61000);

    if (gameState.phase !== 'day-voting') {
      throw new Error(`토론→투표 전환 실패: ${gameState.phase}`);
    }
    console.log(`  ✅ 투표 페이즈 전환\n`);

    // 6. 투표 페이즈 (타이머 대기)
    console.log('[6/12] 1일차 투표 대기 (20초)...');
    await sleep(21000);

    if (gameState.phase !== 'night') {
      throw new Error(`투표→밤 전환 실패: ${gameState.phase}`);
    }
    console.log(`  ✅ 2밤 페이즈 전환`);
    console.log(`  현재 생존: ${gameState.players.filter((p: any) => p.alive).length}명\n`);

    // 7. 밤 페이즈 (타이머 대기)
    console.log('[7/12] 2밤 페이즈 대기 (30초)...');
    await sleep(31000);

    if (gameState.phase !== 'day-discussion') {
      throw new Error(`밤→낮 전환 실패: ${gameState.phase}`);
    }
    console.log(`  ✅ 2일차 낮-토론 페이즈 전환\n`);

    // 8. 토론 페이즈 (타이머 대기)
    console.log('[8/12] 2일차 토론 대기 (60초)...');
    await sleep(61000);

    if (gameState.phase !== 'day-voting') {
      throw new Error(`토론→투표 전환 실패: ${gameState.phase}`);
    }
    console.log(`  ✅ 투표 페이즈 전환\n`);

    // 9. 투표 페이즈 (타이머 대기)
    console.log('[9/12] 2일차 투표 대기 (20초)...');
    await sleep(21000);

    if (gameState.phase !== 'night') {
      throw new Error(`투표→밤 전환 실패: ${gameState.phase}`);
    }
    console.log(`  ✅ 3밤 페이즈 전환`);
    console.log(`  현재 생존: ${gameState.players.filter((p: any) => p.alive).length}명\n`);

    // 10. 게임 흐름 확인 (로그 확인)
    console.log('[10/12] 게임 로그 확인...');
    gameState.log.forEach((log: any) => {
      console.log(`  ${log.day}일차 ${log.phase}: ${log.message}`);
    });
    console.log();

    // 11. 게임 상태 요약
    console.log('[11/12] 게임 상태 요약...');
    console.log(`  총 일차: ${gameState.day}`);
    console.log(`  현재 페이즈: ${gameState.phase}`);
    console.log(`  승리자: ${gameState.winner || '진행 중'}`);
    console.log(`  생존 플레이어: ${gameState.players.filter((p: any) => p.alive).map((p: any) => p.name).join(', ')}`);
    console.log();

    // 12. 테스트 결과
    console.log('[12/12] 테스트 결과');
    const aliveCount = gameState.players.filter((p: any) => p.alive).length;
    const logCount = gameState.log.length;

    console.log(`  ✅ 소켓 연결: 8개`);
    console.log(`  ✅ 게임 시작: 완료`);
    console.log(`  ✅ 페이즈 전환: 밤 → 낮 → 투표 → 밤 → 낮 → 투표 → 밤 (7회)`);
    console.log(`  ✅ 생존자 수: ${aliveCount}명`);
    console.log(`  ✅ 로그 수: ${logCount}개\n`);

    console.log('=== 게임 풀 플로우 테스트 완료 ===');

  } catch (error) {
    console.error(`❌ 테스트 실패: ${error}`);
    if (gameState) {
      console.log(`현재 페이즈: ${gameState.phase}`);
      console.log(`생존 플레이어: ${gameState.players.filter((p: any) => p.alive).length}명`);
    }
  } finally {
    // 모든 소켓 연결 종료
    sockets.forEach(socket => socket.disconnect());
  }
}

// 직접 실행 시 테스트 시작
if (require.main === module) {
  testFullGameFlow().catch(console.error);
}

export { testFullGameFlow };