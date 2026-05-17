/**
 * SGP 센서 릴레이 서버 (HTTP 모드 전용)
 * ─────────────────────────────────────
 * ESP32  →  GET /cmd?action=START  →  이 서버
 *                                        ↓  SSE
 *                                    브라우저 (setup.html)
 *
 * 실행 방법:
 *   node sensor-relay.js
 *   (Node.js 설치 필요 — https://nodejs.org)
 *
 * 포트 기본값: 8765  (setup.html에서 동일하게 설정)
 */

const http = require('http');
const PORT = 8765;

// SSE 클라이언트 목록
let clients = [];

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // ── CORS 헤더 (브라우저 접근 허용) ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── SSE 엔드포인트: 브라우저가 구독 ──
  if (url.pathname === '/events') {
    res.writeHead(200, {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    });
    res.write('data: CONNECTED\n\n');
    clients.push(res);
    console.log(`[SSE] 브라우저 연결됨 (총 ${clients.length}개)`);

    req.on('close', () => {
      clients = clients.filter(c => c !== res);
      console.log(`[SSE] 브라우저 연결 해제 (남은 ${clients.length}개)`);
    });
    return;
  }

  // ── 명령 엔드포인트: ESP32가 호출 ──
  if (url.pathname === '/cmd') {
    const action = (url.searchParams.get('action') || '').toUpperCase();
    if (action) {
      console.log(`[CMD] 수신: ${action}`);
      // 연결된 모든 브라우저에 SSE 전송
      clients.forEach(c => c.write(`data: ${action}\n\n`));
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');
    } else {
      res.writeHead(400);
      res.end('action 파라미터가 없습니다');
    }
    return;
  }

  // ── 상태 확인 ──
  if (url.pathname === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, clients: clients.length, port: PORT }));
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ┌─────────────────────────────────────────┐');
  console.log('  │   SGP 센서 릴레이 서버  (HTTP 모드)     │');
  console.log('  ├─────────────────────────────────────────┤');
  console.log(`  │   포트: ${PORT}                              │`);
  console.log('  │                                         │');
  console.log('  │   브라우저: http://localhost:' + PORT + '/events  │');
  console.log('  │   ESP32:    http://<PC-IP>:' + PORT + '/cmd      │');
  console.log('  │                                         │');
  console.log('  │   Ctrl+C 로 종료                        │');
  console.log('  └─────────────────────────────────────────┘');
  console.log('');
});
