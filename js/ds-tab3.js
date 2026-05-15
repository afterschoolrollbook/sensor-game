// ══ DS TAB 3: 대진표 경기 운영 ══
// sgp_groupBrackets 직접 읽어서 경기장/라운드별 경기 목록 렌더
// 승자 선택 → 다음 라운드 자동 반영 → localStorage 저장 → 새창 대진표 동기화

let _t3CurrentMatch = null; // { gi, ri, mi, courtNum }
let _t3Data = [];           // S.groupBrackets 복사본 (직접 조작)

// ── 진입점: 탭3 클릭 시 ──
function buildTab3(){
  const container = document.getElementById('dst3');
  if(!container) return;

  container.innerHTML = '';
  container.style.cssText = 'display:flex;flex-direction:column;flex:1;min-height:0;padding:0;gap:0;';

  // 툴바
  const toolbar = document.createElement('div');
  toolbar.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--border);flex-shrink:0;background:var(--bg2);flex-wrap:wrap;';
  toolbar.innerHTML = `
    <span style="font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--red);letter-spacing:2px;">// BRACKET</span>
    <span style="font-size:11px;color:var(--text3);flex:1;">경기 선택 후 2번 전광판에 표시 · 승자 선택 시 다음 라운드 자동 반영</span>
    <button onclick="_t3Reload()" style="padding:3px 10px;background:transparent;border:1px solid var(--border);color:var(--text3);border-radius:6px;font-size:11px;cursor:pointer;">↺ 새로고침</button>
    <button onclick="window.open('bracket-view.html','sgp_bracket_view','width=1100,height=750,resizable=yes,scrollbars=no')" style="padding:3px 10px;background:rgba(230,57,70,.1);border:1px solid rgba(230,57,70,.3);color:var(--red);border-radius:6px;font-size:11px;cursor:pointer;">⤢ 크게 보기</button>
  `;
  container.appendChild(toolbar);

  // 경기 목록 영역
  const listWrap = document.createElement('div');
  listWrap.id = 'dst3-list';
  listWrap.style.cssText = 'flex:1;overflow:auto;padding:12px 14px;scrollbar-width:thin;scrollbar-color:var(--border2) var(--bg2);';
  container.appendChild(listWrap);

  _t3Load();
}

// ── 데이터 로드 ──
function _t3Load(){
  try {
    const temp = JSON.parse(localStorage.getItem('sgp_bracket_temp') || '{}');
    if(temp && temp.groupBrackets && temp.groupBrackets.length){
      _t3Data = temp.groupBrackets;
    } else {
      _t3Data = JSON.parse(localStorage.getItem('sgp_groupBrackets') || '[]');
    }
  } catch(e){ _t3Data = []; }
  _t3Render();
}

function _t3Reload(){ _t3Load(); }

// ── 오프셋 계산 (경기장+라운드 내 연번) ──
function _t3ComputeOffsets(){
  const courtRound = {};
  _t3Data.forEach(g => {
    const c = g.court || 1;
    if(!courtRound[c]) courtRound[c] = {};
    g._t3Offset = {};
    (g.matches || []).forEach((round, ri) => {
      if(!courtRound[c][ri]) courtRound[c][ri] = 0;
      g._t3Offset[ri] = courtRound[c][ri];
      courtRound[c][ri] += round.length;
    });
  });
}

// ── 메인 렌더 ──
function _t3Render(){
  const wrap = document.getElementById('dst3-list');
  if(!wrap) return;
  wrap.innerHTML = '';

  if(!_t3Data || !_t3Data.length){
    wrap.innerHTML = '<div style="color:var(--text3);padding:30px;text-align:center;font-size:13px;">저장된 대진표가 없습니다<br><span style="font-size:11px;">스텝4에서 대진표를 먼저 만들어주세요</span></div>';
    return;
  }

  _t3ComputeOffsets();

  // 경기장별 그룹핑
  const courts = {};
  _t3Data.forEach((g, gi) => {
    const c = g.court || 1;
    if(!courts[c]) courts[c] = [];
    courts[c].push({ g, gi });
  });

  const roundNames = ['1라운드','2라운드','3라운드','4라운드','5라운드','준결승','결승'];

  Object.keys(courts).map(Number).sort().forEach(courtNum => {
    const groups = courts[courtNum];
    const maxRi = Math.max(...groups.map(({g}) => g.matches ? g.matches.length : 0));

    // 경기장 헤더
    const courtSec = document.createElement('div');
    courtSec.style.cssText = 'margin-bottom:20px;';

    const courtHdr = document.createElement('div');
    courtHdr.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 12px;margin-bottom:10px;background:linear-gradient(90deg,rgba(76,201,240,.1) 0%,transparent 100%);border-left:3px solid var(--accent);border-radius:0 6px 6px 0;';
    courtHdr.innerHTML = `<span style="font-family:'Share Tech Mono',monospace;font-size:12px;font-weight:700;color:var(--accent);letter-spacing:2px;">경기장 ${courtNum}</span>`;
    courtSec.appendChild(courtHdr);

    // 라운드별 렌더
    for(let ri = 0; ri < maxRi; ri++){
      const hasMatches = groups.some(({g}) => g.matches && g.matches[ri] && g.matches[ri].length);
      if(!hasMatches) continue;

      const maxRiTotal = Math.max(...groups.map(({g}) => g.matches ? g.matches.length : 0));
      let rName;
      if(maxRiTotal === 1) rName = '1라운드';
      else if(ri === maxRiTotal - 1) rName = '결승';
      else if(ri === maxRiTotal - 2 && maxRiTotal > 2) rName = '준결승';
      else rName = roundNames[ri] || `${ri+1}라운드`;

      // 라운드 헤더
      const roundHdr = document.createElement('div');
      roundHdr.style.cssText = 'display:flex;align-items:center;gap:8px;padding:4px 8px;margin-bottom:6px;border-bottom:1px solid var(--border);';
      roundHdr.innerHTML = `<span style="font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--text3);letter-spacing:2px;">${rName.toUpperCase()}</span><span style="font-size:9px;color:var(--border2);font-family:'Share Tech Mono',monospace;">${courtNum}-${ri+1}-*</span>`;
      courtSec.appendChild(roundHdr);

      // 경기 행들
      groups.forEach(({g, gi}) => {
        if(!g.matches || !g.matches[ri]) return;
        g.matches[ri].forEach((m, mi) => {
          const seqNum = ((g._t3Offset && g._t3Offset[ri] != null) ? g._t3Offset[ri] : 0) + mi + 1;
          const label = `${courtNum}-${ri+1}-${seqNum}`;
          const shortLabel = g.label.split('/').map(s => s.trim()).map((p,pi) => pi===0 ? p : p.replace('부','')).join('·');
          courtSec.appendChild(_t3BuildRow(g, gi, ri, mi, m, label, shortLabel, courtNum));
        });
      });
    }

    wrap.appendChild(courtSec);
  });
}

// ── 경기 행 ──
function _t3BuildRow(g, gi, ri, mi, m, label, shortLabel, courtNum){
  const isCur = _t3CurrentMatch &&
    _t3CurrentMatch.gi === gi &&
    _t3CurrentMatch.ri === ri &&
    _t3CurrentMatch.mi === mi;
  const isDone = !!m.winner;
  const isBye = m.p1 && !m.p2;
  const p1tbd = m.p1 && m.p1.tbd;
  const p2tbd = m.p2 && m.p2.tbd;
  const isPending = !isDone && (p1tbd || p2tbd);
  const winnerN = m.winner && m.winner.name;
  const p1n = (m.p1 && m.p1.name) || '?';
  const p2n = (m.p2 && m.p2.name) || '?';

  const row = document.createElement('div');
  row.style.cssText = `
    display:flex;align-items:center;gap:8px;padding:7px 10px;
    border-radius:7px;margin-bottom:4px;cursor:pointer;
    border:1px solid ${isCur ? 'var(--red)' : isDone ? 'rgba(6,214,160,.4)' : isPending ? 'var(--border)' : 'var(--border)'};
    background:${isCur ? 'rgba(230,57,70,.1)' : isDone ? 'rgba(6,214,160,.05)' : 'var(--card)'};
    ${isCur ? 'box-shadow:0 0 0 1px var(--red);' : ''}
    ${isPending ? 'opacity:.6;' : ''}
    transition:background .1s;
  `;
  row.onmouseover = () => { if(!isCur) row.style.background = 'var(--card2)'; };
  row.onmouseout = () => { row.style.background = isCur ? 'rgba(230,57,70,.1)' : isDone ? 'rgba(6,214,160,.05)' : 'var(--card)'; };

  // 경기번호
  const lbl = document.createElement('span');
  lbl.style.cssText = `font-size:10px;font-weight:700;color:${isCur ? 'var(--red)' : isPending ? 'var(--text3)' : 'var(--accent)'};font-family:'Share Tech Mono',monospace;min-width:54px;flex-shrink:0;`;
  lbl.textContent = label;
  row.appendChild(lbl);

  // 체급
  const catLbl = document.createElement('span');
  catLbl.style.cssText = 'font-size:9px;color:var(--text3);min-width:70px;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
  catLbl.textContent = shortLabel;
  row.appendChild(catLbl);

  // 선수
  const players = document.createElement('span');
  players.style.cssText = 'font-size:11px;font-weight:600;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
  if(isBye){
    players.innerHTML = `<span style="color:#d0d0d0;">${p1n}</span> <span style="font-size:9px;color:var(--accent);">BYE</span>`;
  } else {
    const c1 = winnerN ? (winnerN === p1n ? 'var(--green)' : '#444') : (p1tbd ? 'var(--text3)' : '#d0d0d0');
    const c2 = winnerN ? (winnerN === p2n ? 'var(--green)' : '#444') : (p2tbd ? 'var(--text3)' : '#d0d0d0');
    players.innerHTML = `<span style="color:${c1};">${p1tbd ? '<span style="font-size:8px;margin-right:2px;color:var(--text3);">대기</span>' : ''}${p1n}</span><span style="color:var(--red);font-size:10px;margin:0 5px;font-family:'Bebas Neue',cursive;">VS</span><span style="color:${c2};">${p2tbd ? '<span style="font-size:8px;margin-right:2px;color:var(--text3);">대기</span>' : ''}${p2n}</span>`;
  }
  row.appendChild(players);

  // 상태 뱃지
  if(isCur){
    const b = document.createElement('span');
    b.style.cssText = 'font-size:8px;color:var(--red);border:1px solid var(--red);border-radius:3px;padding:1px 5px;font-family:"Share Tech Mono",monospace;flex-shrink:0;';
    b.textContent = 'LIVE';
    row.appendChild(b);
  } else if(isDone){
    const b = document.createElement('span');
    b.style.cssText = 'font-size:10px;color:var(--green);flex-shrink:0;font-weight:700;';
    b.textContent = '✓';
    row.appendChild(b);
  } else if(isPending){
    const b = document.createElement('span');
    b.style.cssText = 'font-size:8px;color:var(--text3);border:1px solid var(--border2);border-radius:3px;padding:1px 5px;font-family:"Share Tech Mono",monospace;flex-shrink:0;';
    b.textContent = '대기';
    row.appendChild(b);
  }

  row.onclick = (e) => _t3ShowModal(e, g, gi, ri, mi, m, label, shortLabel, courtNum);
  return row;
}

// ── 모달 ──
function _t3ShowModal(e, g, gi, ri, mi, m, label, shortLabel, courtNum){
  document.getElementById('t3-modal')?.remove();

  const isDone = !!m.winner;
  const isBye = m.p1 && !m.p2;
  const isPending = !isDone && (m.p1 && m.p1.tbd || m.p2 && m.p2.tbd);
  const isCur = _t3CurrentMatch && _t3CurrentMatch.gi===gi && _t3CurrentMatch.ri===ri && _t3CurrentMatch.mi===mi;
  const p1n = (m.p1 && m.p1.name) || '—';
  const p2n = (m.p2 && m.p2.name) || '—';
  const winnerN = m.winner && m.winner.name;

  const modal = document.createElement('div');
  modal.id = 't3-modal';
  modal.style.cssText = `
    position:fixed;z-index:9999;
    background:var(--card2);border:1px solid var(--border2);
    border-radius:14px;padding:0;min-width:260px;max-width:340px;
    box-shadow:0 12px 40px rgba(0,0,0,.8);
    overflow:hidden;
  `;

  // 모달 헤더
  const mhdr = document.createElement('div');
  mhdr.style.cssText = `padding:12px 16px 10px;border-bottom:1px solid var(--border);background:${isDone?'rgba(6,214,160,.06)':isCur?'rgba(230,57,70,.08)':'var(--bg2)'};`;
  mhdr.innerHTML = `
    <div style="font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--text3);letter-spacing:2px;margin-bottom:5px;">// ${label} · ${shortLabel}</div>
    ${!isBye ? `
    <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
      <span style="font-size:13px;font-weight:700;color:${winnerN===p1n?'var(--green)':'var(--text)'};flex:1;text-align:right;">${winnerN===p1n?'🏆 ':''}${p1n}</span>
      <span style="font-family:'Bebas Neue',cursive;font-size:15px;color:var(--red);flex-shrink:0;">VS</span>
      <span style="font-size:13px;font-weight:700;color:${winnerN===p2n?'var(--green)':'var(--text)'};flex:1;">${winnerN===p2n?'🏆 ':''}${p2n}</span>
    </div>` : `<div style="font-size:13px;font-weight:700;color:var(--text);">${p1n} <span style="font-size:9px;color:var(--accent);">BYE</span></div>`}
  `;
  modal.appendChild(mhdr);

  // 버튼 헬퍼
  const mkBtn = (icon, text, color, bgHover, fn, sub='') => {
    const b = document.createElement('button');
    b.style.cssText = `display:flex;align-items:center;gap:10px;padding:10px 14px;width:100%;border:none;background:transparent;color:${color};font-size:12px;font-weight:600;cursor:pointer;border-radius:0;font-family:'Noto Sans KR',sans-serif;text-align:left;transition:background .1s;`;
    b.onmouseover = () => b.style.background = bgHover;
    b.onmouseout = () => b.style.background = 'transparent';
    b.innerHTML = `<span style="font-size:16px;width:22px;text-align:center;flex-shrink:0;">${icon}</span><span>${text}${sub?`<span style="display:block;font-size:9px;color:var(--text3);font-weight:400;">${sub}</span>`:''}</span>`;
    b.onclick = () => { modal.remove(); fn(); };
    return b;
  };

  const mbody = document.createElement('div');
  mbody.style.cssText = 'padding:6px 0;';

  // ── 대기 중 ──
  if(isPending){
    const info = document.createElement('div');
    info.style.cssText = 'padding:14px 16px;font-size:12px;color:var(--text3);text-align:center;';
    info.textContent = '이전 경기가 끝나면 선수가 확정됩니다';
    mbody.appendChild(info);
  }

  // ── 현재 경기 선택 ──
  if(!isPending){
    mbody.appendChild(mkBtn('▶', '현재 경기 선택', 'var(--accent)', 'rgba(76,201,240,.1)', () => {
      _t3SetCurrentMatch(g, gi, ri, mi, m, shortLabel, courtNum);
    }, '미리보기 · 전광판 하이라이트'));
  }

  // ── 승자 선택 (미완료, 선수 확정) ──
  if(!isBye && !isDone && !isPending){
    const div = document.createElement('div');
    div.style.cssText = 'border-top:1px solid var(--border);margin:4px 0;padding-top:2px;';
    mbody.appendChild(div);
    const lbl2 = document.createElement('div');
    lbl2.style.cssText = 'padding:5px 14px 3px;font-size:9px;color:var(--text3);font-family:"Share Tech Mono",monospace;letter-spacing:1px;';
    lbl2.textContent = '// 경기 끝 · 승자 선택 → 다음 라운드 진출';
    mbody.appendChild(lbl2);
    if(m.p1) mbody.appendChild(mkBtn('🏆', `${p1n} 승리`, 'var(--green)', 'rgba(6,214,160,.1)', () => _t3RecordWinner(g, gi, ri, mi, 'p1', courtNum)));
    if(m.p2) mbody.appendChild(mkBtn('🏆', `${p2n} 승리`, 'var(--yellow)', 'rgba(255,214,10,.08)', () => _t3RecordWinner(g, gi, ri, mi, 'p2', courtNum)));
  }

  // ── 완료된 경기 ──
  if(isDone){
    const div2 = document.createElement('div');
    div2.style.cssText = 'border-top:1px solid var(--border);margin:4px 0;padding-top:2px;';
    mbody.appendChild(div2);
    const lbl3 = document.createElement('div');
    lbl3.style.cssText = 'padding:5px 14px 3px;font-size:9px;color:var(--text3);font-family:"Share Tech Mono",monospace;letter-spacing:1px;';
    lbl3.textContent = '// 승자 재선택';
    mbody.appendChild(lbl3);
    if(m.p1) mbody.appendChild(mkBtn('🏆', `${p1n} 승리`, 'var(--green)', 'rgba(6,214,160,.1)', () => _t3RecordWinner(g, gi, ri, mi, 'p1', courtNum)));
    if(m.p2) mbody.appendChild(mkBtn('🏆', `${p2n} 승리`, 'var(--yellow)', 'rgba(255,214,10,.08)', () => _t3RecordWinner(g, gi, ri, mi, 'p2', courtNum)));
    mbody.appendChild(mkBtn('↩', '결과 취소', 'var(--red)', 'rgba(230,57,70,.1)', () => _t3CancelWinner(g, gi, ri, mi)));
  }

  modal.appendChild(mbody);
  document.body.appendChild(modal);

  // 위치
  const rect = e.currentTarget.getBoundingClientRect();
  let top = rect.bottom + 4, left = rect.left;
  if(top + 280 > window.innerHeight) top = rect.top - 280;
  if(left + 270 > window.innerWidth) left = window.innerWidth - 275;
  if(top < 4) top = 4;
  modal.style.top = top + 'px';
  modal.style.left = left + 'px';

  setTimeout(() => {
    const close = (ev) => { if(!modal.contains(ev.target)){ modal.remove(); document.removeEventListener('click', close, true); }};
    document.addEventListener('click', close, true);
  }, 80);
}

// ── 현재 경기 선택 → 전광판/미리보기 하이라이트 ──
function _t3SetCurrentMatch(g, gi, ri, mi, m, shortLabel, courtNum){
  _t3CurrentMatch = { gi, ri, mi, courtNum };
  const p1n = (m.p1 && m.p1.name) || '—';
  const p2n = (m.p2 && m.p2.name) || '—';
  const domId = `t3_${gi}_${ri}_${mi}`;

  // BroadcastChannel → 전광판·미리보기 동기화
  try{
    const bc = new BroadcastChannel('sgp_cmd');
    bc.postMessage({ type:'set_match', p1:p1n, p2:p2n, label:shortLabel, court:courtNum, ri, mi, domId, groupLabel:g.label });
    bc.close();
  } catch(ex){}

  // localStorage → 새창 대진표 동기화
  try{
    localStorage.setItem(`sgp_display_vs_court_${courtNum}`, JSON.stringify({ p1:p1n, p2:p2n, label:shortLabel, court:courtNum, ri, mi, domId, groupLabel:g.label }));
  } catch(ex){}

  _t3Render();
}

// ── 승자 선택 → 다음 라운드 이름 반영 → 저장 ──
function _t3RecordWinner(g, gi, ri, mi, which, courtNum){
  const m = g.matches[ri][mi];
  const winner = which === 'p1' ? m.p1 : m.p2;
  if(!winner) return;

  // 승자 기록
  m.winner = { name: winner.name, id: winner.id };

  // 다음 라운드 해당 슬롯에 승자 이름 채우기
  const key = `${ri}-${mi}`;
  if(g.matches[ri + 1]){
    g.matches[ri + 1].forEach(nm => {
      if(nm.fromA === key && nm.p1){ nm.p1.name = winner.name; nm.p1.tbd = false; }
      if(nm.fromB === key && nm.p2){ nm.p2.name = winner.name; nm.p2.tbd = false; }
    });
  }

  // 현재경기였으면 해제
  if(_t3CurrentMatch && _t3CurrentMatch.gi===gi && _t3CurrentMatch.ri===ri && _t3CurrentMatch.mi===mi){
    _t3CurrentMatch = null;
  }

  // 저장
  _t3Save();

  // 전광판에 승자 알림
  try{
    const bc = new BroadcastChannel('sgp_cmd');
    bc.postMessage({ type:'winner', name:winner.name });
    bc.close();
  } catch(ex){}

  _t3Render();
}

// ── 결과 취소 ──
function _t3CancelWinner(g, gi, ri, mi){
  const m = g.matches[ri][mi];
  if(!m.winner) return;
  delete m.winner;

  // 다음 라운드 tbd 복원
  const key = `${ri}-${mi}`;
  if(g.matches[ri + 1]){
    g.matches[ri + 1].forEach(nm => {
      if(nm.fromA === key && nm.p1){ nm.p1.name = `${ri+1}-${mi+1} 승자`; nm.p1.tbd = true; }
      if(nm.fromB === key && nm.p2){ nm.p2.name = `${ri+1}-${mi+1} 승자`; nm.p2.tbd = true; }
    });
  }

  if(_t3CurrentMatch && _t3CurrentMatch.gi===gi && _t3CurrentMatch.ri===ri && _t3CurrentMatch.mi===mi){
    _t3CurrentMatch = null;
  }

  _t3Save();
  _t3Render();
}

// ── localStorage 저장 → 새창 대진표 자동 갱신 ──
function _t3Save(){
  try{
    const clean = _t3Data.map(g => ({
      ...g,
      matches: g.matches.map(round => round.map(m => {
        const { _t3Offset, _groupObj, ...rest } = m;
        return rest;
      }))
    }));
    localStorage.setItem('sgp_groupBrackets', JSON.stringify(clean));
    localStorage.setItem('sgp_bracket_temp', JSON.stringify({ groupBrackets: clean, savedAt: new Date().toLocaleTimeString() }));
  } catch(ex){ console.error('t3Save error', ex); }
}

// storage 변경 감지 → 다른 창에서 바뀌면 자동 갱신
window.addEventListener('storage', e => {
  if(e.key === 'sgp_groupBrackets' && document.getElementById('dst3-list')){
    try{
      const gb = JSON.parse(e.newValue || '[]');
      if(gb.length){ _t3Data = gb; _t3Render(); }
    } catch(ex){}
  }
});
