// ══ DS TAB 3: 대진표 경기 운영 ══
// sgp_groupBrackets 직접 읽어서 경기장/라운드별 경기 목록 렌더
// 승자 선택 → 다음 라운드 자동 반영 → localStorage 저장 → 새창 대진표 동기화

const _t3CurrentMatch = {}; // { [courtNum]: { gi, ri, mi, courtNum } } — 경기장별 독립 선택
let _t3Data = [];           // S.groupBrackets 복사본 (직접 조작)

// ── 진입점: 탭3 클릭 시 ──
function buildTab3(){
  const container = document.getElementById('dst3');
  if(!container) return;

  container.innerHTML = '';
  container.style.cssText = 'flex-direction:column;flex:1;min-height:0;padding:0;gap:0;';

  // 툴바
  const toolbar = document.createElement('div');
  toolbar.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--border);flex-shrink:0;background:var(--bg2);flex-wrap:wrap;';
  toolbar.innerHTML = `
    <span style="font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--red);letter-spacing:2px;">// BRACKET</span>
    <span style="font-size:11px;color:var(--text3);flex:1;">경기 선택 후 2번 전광판에 표시 · 승자 선택 시 다음 라운드 자동 반영</span>
    <button id="t3-reload-btn" onclick="_t3Reload(this)" style="padding:3px 10px;background:transparent;border:1px solid var(--border);color:var(--text3);border-radius:6px;font-size:11px;cursor:pointer;">↺ 새로고침</button>
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
    // sgp_groupBrackets 1순위 — bracket-view가 sgp_bracket_temp를 덮을 수 있음
    const gb = JSON.parse(localStorage.getItem('sgp_groupBrackets') || '[]');
    if(gb && gb.length){
      _t3Data = gb;
    } else {
      // 폴백: sgp_bracket_temp
      const temp = JSON.parse(localStorage.getItem('sgp_bracket_temp') || '{}');
      _t3Data = (temp && temp.groupBrackets && temp.groupBrackets.length) ? temp.groupBrackets : [];
    }
  } catch(e){ _t3Data = []; }

  // 저장된 현재경기 선택 복원 (경기장별)
  for(let c = 1; c <= 8; c++){
    const saved = localStorage.getItem(`sgp_display_vs_court_${c}`);
    if(!saved) continue;
    try{
      const mv = JSON.parse(saved);
      if(mv.ri == null || mv.mi == null) continue;
      const gi = _t3Data.findIndex(g =>
        g.label === mv.groupLabel ||
        g.label.split('/').map(s=>s.trim()).map((p,pi)=>pi===0?p:p.replace('부','')).join('·') === mv.groupLabel
      );
      if(gi >= 0) _t3CurrentMatch[c] = { gi, ri: mv.ri, mi: mv.mi, courtNum: c };
    }catch(e){}
  }

  _t3Render();
}

function _t3Reload(btn){
  if(btn){ btn.textContent='⏳ 로딩중...'; btn.disabled=true; }
  _t3Load();
  _t3Save();
  setTimeout(()=>{
    if(btn){ btn.textContent='↺ 새로고침'; btn.disabled=false; }
  }, 600);
}

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

// ── 메인 렌더 (2열 경기장 레이아웃) ──
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
  const courtNums = Object.keys(courts).map(Number).sort();
  const totalCourts = courtNums.length;

  // 경기장이 1개면 100%, 2개면 50%씩, 3개 이상은 균등분할
  const colWidth = totalCourts === 1 ? '100%' : `${(100 / totalCourts).toFixed(2)}%`;

  // 전체 2열 그리드 컨테이너
  const grid = document.createElement('div');
  grid.style.cssText = `display:flex;gap:0;align-items:flex-start;width:100%;`;

  courtNums.forEach((courtNum, colIdx) => {
    const groups = courts[courtNum];
    const maxRi = Math.max(...groups.map(({g}) => g.matches ? g.matches.length : 0));

    // 경기장 컬럼
    const col = document.createElement('div');
    col.style.cssText = `flex:0 0 ${colWidth};width:${colWidth};min-width:0;box-sizing:border-box;${colIdx > 0 ? 'border-left:1px solid var(--border);' : ''}`;

    // 경기장 헤더
    const courtHdr = document.createElement('div');
    courtHdr.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 10px;background:linear-gradient(90deg,rgba(76,201,240,.12) 0%,transparent 100%);border-left:3px solid var(--accent);border-bottom:1px solid var(--border);margin-bottom:6px;position:sticky;top:0;z-index:5;background-color:var(--bg2);';
    courtHdr.innerHTML = `<span style="font-family:'Share Tech Mono',monospace;font-size:11px;font-weight:700;color:var(--accent);letter-spacing:2px;">경기장 ${courtNum}</span>`;
    col.appendChild(courtHdr);

    const courtBody = document.createElement('div');
    courtBody.style.cssText = 'padding:0 6px 12px;';

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
      roundHdr.style.cssText = 'display:flex;align-items:center;gap:6px;padding:6px 4px 4px;margin-top:8px;border-bottom:1px solid var(--border);margin-bottom:4px;';
      roundHdr.innerHTML = `<span style="font-family:'Share Tech Mono',monospace;font-size:9px;color:var(--text3);letter-spacing:2px;">${rName.toUpperCase()}</span><span style="font-size:9px;color:var(--border2);font-family:'Share Tech Mono',monospace;">${courtNum}-${ri+1}-*</span>`;
      courtBody.appendChild(roundHdr);

      // 경기 카드들 (2줄 구조)
      groups.forEach(({g, gi}) => {
        if(!g.matches || !g.matches[ri]) return;
        g.matches[ri].forEach((m, mi) => {
          const seqNum = ((g._t3Offset && g._t3Offset[ri] != null) ? g._t3Offset[ri] : 0) + mi + 1;
          const label = `${courtNum}-${ri+1}-${seqNum}`;
          const shortLabel = g.label.split('/').map(s => s.trim()).map((p,pi) => pi===0 ? p : p.replace('부','')).join('·');
          courtBody.appendChild(_t3BuildCard(g, gi, ri, mi, m, label, shortLabel, courtNum));
        });
      });
    }

    col.appendChild(courtBody);
    grid.appendChild(col);
  });

  wrap.appendChild(grid);
}

// ── 2줄 경기 카드 ──
function _t3BuildCard(g, gi, ri, mi, m, label, shortLabel, courtNum){
  const cur = _t3CurrentMatch[courtNum];
  const isCur = cur && cur.gi === gi && cur.ri === ri && cur.mi === mi;
  const isDone = !!m.winner;
  const isBye = m.p1 && !m.p2;
  const p1tbd = m.p1 && m.p1.tbd;
  const p2tbd = m.p2 && m.p2.tbd;
  const isPending = !isDone && (p1tbd || p2tbd);
  const winnerN = m.winner && m.winner.name;
  const p1n = (m.p1 && m.p1.name) || '?';
  const p2n = (m.p2 && m.p2.name) || '?';

  const card = document.createElement('div');
  card.style.cssText = `
    padding:6px 8px;border-radius:7px;margin-bottom:3px;cursor:pointer;
    border:1px solid ${isCur ? 'var(--red)' : isDone ? 'rgba(6,214,160,.35)' : 'var(--border)'};
    background:${isCur ? 'rgba(230,57,70,.1)' : isDone ? 'rgba(6,214,160,.04)' : 'var(--card)'};
    ${isCur ? 'box-shadow:0 0 0 1px var(--red);' : ''}
    ${isPending ? 'opacity:.55;' : ''}
    transition:background .1s;
  `;
  card.onmouseover = () => { if(!isCur) card.style.background = 'var(--card2)'; };
  card.onmouseout  = () => { card.style.background = isCur ? 'rgba(230,57,70,.1)' : isDone ? 'rgba(6,214,160,.04)' : 'var(--card)'; };

  // ── 1줄: 경기명 / 체급 / 상태뱃지 ──
  const row1 = document.createElement('div');
  row1.style.cssText = 'display:flex;align-items:center;gap:5px;margin-bottom:3px;';

  const lbl = document.createElement('span');
  lbl.style.cssText = `font-size:10px;font-weight:700;color:${isCur ? 'var(--red)' : isPending ? 'var(--text3)' : 'var(--accent)'};font-family:'Share Tech Mono',monospace;flex-shrink:0;`;
  lbl.textContent = label;
  row1.appendChild(lbl);

  const sep = document.createElement('span');
  sep.style.cssText = 'font-size:9px;color:var(--border2);flex-shrink:0;';
  sep.textContent = '/';
  row1.appendChild(sep);

  const cat = document.createElement('span');
  cat.style.cssText = 'font-size:9px;color:var(--text3);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
  cat.textContent = shortLabel;
  row1.appendChild(cat);

  // 상태 뱃지
  if(isCur){
    const b = document.createElement('span');
    b.style.cssText = 'font-size:8px;color:var(--red);border:1px solid var(--red);border-radius:3px;padding:1px 4px;font-family:"Share Tech Mono",monospace;flex-shrink:0;';
    b.textContent = 'LIVE';
    row1.appendChild(b);
  } else if(isDone){
    const b = document.createElement('span');
    b.style.cssText = 'font-size:10px;color:var(--green);flex-shrink:0;font-weight:700;';
    b.textContent = '✓';
    row1.appendChild(b);
  } else if(isPending){
    const b = document.createElement('span');
    b.style.cssText = 'font-size:8px;color:var(--text3);border:1px solid var(--border2);border-radius:3px;padding:1px 4px;font-family:"Share Tech Mono",monospace;flex-shrink:0;';
    b.textContent = '대기';
    row1.appendChild(b);
  }

  card.appendChild(row1);

  // ── 2줄: 선수 이름 (클릭 → 복장 색상 순환) ──
  const row2 = document.createElement('div');
  row2.style.cssText = 'display:flex;align-items:center;gap:4px;padding-left:2px;';

  const _T3_COLORS   = ['#d0d0d0','#e63946','#4cc9f0','#ffd60a'];
  const _T3_COLOR_BG = ['transparent','rgba(230,57,70,.18)','rgba(76,201,240,.18)','rgba(255,214,10,.18)'];

  const mkNameSpan = (name, slot, forceColor, forceWeight, prefix='') => {
    const span = document.createElement('span');
    const idx  = m[slot + 'ColorIdx'] || 0;
    const baseColor = forceColor || (idx > 0 ? _T3_COLORS[idx] : '#d0d0d0');
    span.style.cssText = `font-size:11px;font-weight:${forceWeight||'600'};color:${baseColor};cursor:pointer;border-radius:3px;padding:0 2px;transition:background .12s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`;
    if(!forceColor && idx > 0) span.style.background = _T3_COLOR_BG[idx];
    const dot = idx > 0 ? `<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${_T3_COLORS[idx]};margin-right:3px;vertical-align:middle;flex-shrink:0;"></span>` : '';
    span.innerHTML = `${prefix}${dot}${name}`;
    span.title = '클릭: 복장 색상 변경';
    span.onclick = (ev) => {
      ev.stopPropagation();
      m[slot + 'ColorIdx'] = ((m[slot + 'ColorIdx'] || 0) + 1) % 4;
      _t3Save();
      _t3Render();
    };
    return span;
  };

  if(isBye){
    const sp = mkNameSpan(p1n, 'p1', isDone ? 'var(--green)' : null, isDone ? '700' : '600');
    row2.appendChild(sp);
    const byeTag = document.createElement('span');
    byeTag.style.cssText = 'font-size:9px;color:var(--accent);margin-left:3px;flex-shrink:0;';
    byeTag.textContent = 'BYE';
    row2.appendChild(byeTag);
    if(isDone){
      const doneTag = document.createElement('span');
      doneTag.style.cssText = 'font-size:9px;color:var(--green);margin-left:4px;flex-shrink:0;';
      doneTag.textContent = '✓ 진출';
      row2.appendChild(doneTag);
    }
  } else {
    const isW1 = winnerN && winnerN === p1n;
    const isW2 = winnerN && winnerN === p2n;
    const c1 = winnerN ? (isW1 ? 'var(--green)' : '#555') : (p1tbd ? 'var(--text3)' : null);
    const c2 = winnerN ? (isW2 ? 'var(--green)' : '#555') : (p2tbd ? 'var(--text3)' : null);
    const sp1 = mkNameSpan(p1n, 'p1', c1, isW1 ? '700' : '600', isW1 ? '🏆 ' : (p1tbd ? '<span style="font-size:8px;color:var(--text3);">대기 </span>' : ''));
    const vsSpan = document.createElement('span');
    vsSpan.style.cssText = "font-size:9px;color:var(--red);font-family:'Bebas Neue',cursive;margin:0 3px;flex-shrink:0;";
    vsSpan.textContent = 'VS';
    const sp2 = mkNameSpan(p2n, 'p2', c2, isW2 ? '700' : '600', isW2 ? '🏆 ' : (p2tbd ? '<span style="font-size:8px;color:var(--text3);">대기 </span>' : ''));
    row2.appendChild(sp1);
    row2.appendChild(vsSpan);
    row2.appendChild(sp2);
  }

  card.appendChild(row2);
  card.onclick = (e) => _t3ShowModal(e, g, gi, ri, mi, m, label, shortLabel, courtNum);
  return card;
}



// ── 모달 ──
function _t3ShowModal(e, g, gi, ri, mi, m, label, shortLabel, courtNum){
  document.getElementById('t3-modal')?.remove();

  const isDone = !!m.winner;
  const isBye = m.p1 && !m.p2;
  const isPending = !isDone && (m.p1 && m.p1.tbd || m.p2 && m.p2.tbd);
  const _cur = _t3CurrentMatch[courtNum];
  const isCur = _cur && _cur.gi===gi && _cur.ri===ri && _cur.mi===mi;
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
  mhdr.style.cssText = `padding:12px 16px 10px;border-bottom:1px solid var(--border);background:${isDone?'rgba(6,214,160,.06)':isCur?'rgba(230,57,70,.08)':'var(--bg2)'};position:relative;`;
  mhdr.innerHTML = `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:4px;">
      <div style="font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--text3);letter-spacing:2px;margin-bottom:5px;">// ${label} · ${shortLabel}</div>
      <button id="t3-modal-close" style="background:transparent;border:none;color:var(--text3);font-size:16px;line-height:1;cursor:pointer;padding:0 0 0 8px;flex-shrink:0;margin-top:-2px;" title="닫기">✕</button>
    </div>
    ${!isBye ? `
    <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
      <span style="font-size:13px;font-weight:700;color:${winnerN===p1n?'var(--green)':'var(--text)'};flex:1;text-align:right;">${winnerN===p1n?'🏆 ':''}${p1n}</span>
      <span style="font-family:'Bebas Neue',cursive;font-size:15px;color:var(--red);flex-shrink:0;">VS</span>
      <span style="font-size:13px;font-weight:700;color:${winnerN===p2n?'var(--green)':'var(--text)'};flex:1;">${winnerN===p2n?'🏆 ':''}${p2n}</span>
    </div>` : `<div style="font-size:13px;font-weight:700;color:var(--text);">${p1n} <span style="font-size:9px;color:var(--accent);">BYE</span></div>`}
  `;
  modal.appendChild(mhdr);

  // X 버튼 클릭 → 모달 닫기
  modal.querySelector('#t3-modal-close').onclick = (ev) => {
    ev.stopPropagation();
    modal.remove();
  };

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
      _t3SetCurrentMatch(g, gi, ri, mi, m, shortLabel, label, courtNum);
    }, '미리보기 · 전광판 하이라이트'));
  }

  // ── BYE 부전승 진출 ──
  if(isBye && !isDone){
    const divBye = document.createElement('div');
    divBye.style.cssText = 'border-top:1px solid var(--border);margin:4px 0;padding-top:2px;';
    mbody.appendChild(divBye);
    const lblBye = document.createElement('div');
    lblBye.style.cssText = 'padding:5px 14px 3px;font-size:9px;color:var(--text3);font-family:"Share Tech Mono",monospace;letter-spacing:1px;';
    lblBye.textContent = '// 부전승 · 자동 진출';
    mbody.appendChild(lblBye);
    mbody.appendChild(mkBtn('⏩', `${p1n} 다음 라운드 진출`, 'var(--accent)', 'rgba(76,201,240,.1)', () => _t3AdvanceBye(g, gi, ri, mi, courtNum, label, shortLabel), '상대 없음 · 부전승 처리'));
  }

  // ── BYE 진출 취소 ──
  if(isBye && isDone){
    const divByeD = document.createElement('div');
    divByeD.style.cssText = 'border-top:1px solid var(--border);margin:4px 0;padding-top:2px;';
    mbody.appendChild(divByeD);
    mbody.appendChild(mkBtn('↩', '진출 취소', 'var(--red)', 'rgba(230,57,70,.1)', () => _t3CancelWinner(g, gi, ri, mi, courtNum)));
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
    if(m.p1) mbody.appendChild(mkBtn('🏆', `${p1n} 승리`, 'var(--green)', 'rgba(6,214,160,.1)', () => _t3RecordWinner(g, gi, ri, mi, 'p1', courtNum, label, shortLabel)));
    if(m.p2) mbody.appendChild(mkBtn('🏆', `${p2n} 승리`, 'var(--yellow)', 'rgba(255,214,10,.08)', () => _t3RecordWinner(g, gi, ri, mi, 'p2', courtNum, label, shortLabel)));
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
    if(m.p1) mbody.appendChild(mkBtn('🏆', `${p1n} 승리`, 'var(--green)', 'rgba(6,214,160,.1)', () => _t3RecordWinner(g, gi, ri, mi, 'p1', courtNum, label, shortLabel)));
    if(m.p2) mbody.appendChild(mkBtn('🏆', `${p2n} 승리`, 'var(--yellow)', 'rgba(255,214,10,.08)', () => _t3RecordWinner(g, gi, ri, mi, 'p2', courtNum, label, shortLabel)));
    mbody.appendChild(mkBtn('↩', '결과 취소', 'var(--red)', 'rgba(230,57,70,.1)', () => _t3CancelWinner(g, gi, ri, mi, courtNum)));
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
function _t3SetCurrentMatch(g, gi, ri, mi, m, shortLabel, matchLabel, courtNum){
  _t3CurrentMatch[courtNum] = { gi, ri, mi, courtNum };
  const _cn = n => n ? n.replace(/^\d+번\s*/,'').replace(/[()[\]]/g,'').trim() || n : '—';
  const p1n = _cn((m.p1 && m.p1.name) || '—');
  const p2n = _cn((m.p2 && m.p2.name) || '—');
  const domId = `t3_${gi}_${ri}_${mi}`;
  const seqNum = matchLabel ? matchLabel.split('-').pop() : '';
  const infoLabel = seqNum ? `${shortLabel} · ${seqNum}경기` : shortLabel;

  // localStorage → 새창 대진표 동기화
  try{
    localStorage.setItem(`sgp_display_vs_court_${courtNum}`, JSON.stringify({ p1:p1n, p2:p2n, label:infoLabel, matchLabel, court:courtNum, ri, mi, domId, groupLabel:g.label }));
  } catch(ex){}

  // 같은 창 내 pv3 미리보기 즉시 갱신:
  // _pv3SelectedMatches를 직접 세팅해 rAF 타이밍 문제 없이 하이라이트 유지
  // courtNum 키로 관리해 경기장별 독립 하이라이트 보존
  try{
    if(typeof _pv3SelectedMatches !== 'undefined'){
      // 같은 경기장의 기존 항목만 제거 (다른 경기장 항목은 유지)
      _pv3SelectedMatches = _pv3SelectedMatches.filter(s => s.courtNum !== courtNum);
      _pv3SelectedMatches.push({ groupLabel: shortLabel, ri, mi, courtNum });
    }
  } catch(ex){}

  // BroadcastChannel → 전광판·미리보기(새창) 동기화
  try{
    const bc = new BroadcastChannel('sgp_cmd');
    bc.postMessage({ type:'set_match', p1:p1n, p2:p2n, label:infoLabel, matchLabel, court:courtNum, ri, mi, domId, groupLabel:g.label });
    bc.close();
  } catch(ex){}

  _t3Render();
  // pv3 즉시 갱신 (_pv3SelectedMatches 이미 세팅돼 있으므로 타이밍 무관)
  try{ if(typeof updatePv3==='function') updatePv3(); }catch(ex){}
}

// ── 승자 선택 → 다음 라운드 이름 반영 → 저장 ──
function _t3RecordWinner(g, gi, ri, mi, which, courtNum, matchLabel, shortLabel){
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

  // 현재경기였으면 해당 경기장만 해제
  const cur = _t3CurrentMatch[courtNum];
  if(cur && cur.gi===gi && cur.ri===ri && cur.mi===mi){
    delete _t3CurrentMatch[courtNum];
  }

  // 전광판 하이라이트 제거: localStorage court 항목 삭제 → display.html refresh3() 자동 트리거
  try{ localStorage.removeItem(`sgp_display_vs_court_${courtNum}`); }catch(ex){}

  // pv3 미리보기 하이라이트도 제거
  try{
    if(typeof _pv3SelectedMatches !== 'undefined'){
      _pv3SelectedMatches = _pv3SelectedMatches.filter(s => s.courtNum !== courtNum);
    }
    if(typeof updatePv3 === 'function') updatePv3();
  }catch(ex){}

  // bracket-view(새창)에도 하이라이트 해제 알림
  try{
    const bc2 = new BroadcastChannel('sgp_cmd');
    bc2.postMessage({ type:'clear_match', court: courtNum });
    bc2.close();
  }catch(ex){}

  // 저장
  _t3Save();

  // 전광판에 승자 알림 (경기장·경기명·체급 포함)
  try{
    const seqNum = matchLabel ? matchLabel.split('-').pop() : '';
    const bc = new BroadcastChannel('sgp_cmd');
    bc.postMessage({
      type: 'winner',
      name: winner.name,
      court: courtNum,
      matchLabel: matchLabel || '',
      shortLabel: shortLabel || '',
      seqNum: seqNum
    });
    bc.close();
  } catch(ex){}

  _t3Render();
}

// ── 부전승 진출 처리 ──
function _t3AdvanceBye(g, gi, ri, mi, courtNum, matchLabel, shortLabel){
  const m = g.matches[ri][mi];
  if(!m.p1) return;
  m.winner = { name: m.p1.name, id: m.p1.id };

  // 다음 라운드 슬롯에 이름 채우기 (fromA/fromB 우선, 폴백 수학)
  const key = `${ri}-${mi}`;
  if(g.matches[ri + 1]){
    let updated = false;
    g.matches[ri + 1].forEach(nm => {
      if(nm.fromA === key && nm.p1){ nm.p1.name = m.p1.name; nm.p1.tbd = false; updated = true; }
      if(nm.fromB === key && nm.p2){ nm.p2.name = m.p1.name; nm.p2.tbd = false; updated = true; }
    });
    if(!updated){
      const nextMi = Math.floor(mi / 2);
      const nextMatch = g.matches[ri + 1][nextMi];
      if(nextMatch){
        if(mi % 2 === 0 && nextMatch.p1){ nextMatch.p1.name = m.p1.name; nextMatch.p1.tbd = false; }
        else if(nextMatch.p2){ nextMatch.p2.name = m.p1.name; nextMatch.p2.tbd = false; }
      }
    }
  }

  const cur = _t3CurrentMatch[courtNum];
  if(cur && cur.gi===gi && cur.ri===ri && cur.mi===mi) delete _t3CurrentMatch[courtNum];

  _t3Save();

  try{
    const seqNum = matchLabel ? matchLabel.split('-').pop() : '';
    const bc = new BroadcastChannel('sgp_cmd');
    bc.postMessage({ type:'winner', name: m.p1.name, court: courtNum, matchLabel: matchLabel||'', shortLabel: shortLabel||'', seqNum });
    bc.close();
  } catch(ex){}

  _t3Render();
}

// ── 결과 취소 (다음 라운드 cascade 취소 포함) ──
function _t3CancelWinner(g, gi, ri, mi, courtNum){
  const m = g.matches[ri][mi];
  if(!m.winner) return;
  const cancelledName = m.winner.name;
  delete m.winner;

  // 다음 라운드 tbd 복원 + cascade (다중 라운드 연쇄 취소)
  _t3CancelCascade(g, ri, mi, cancelledName);

  const cur = _t3CurrentMatch[courtNum];
  if(cur && cur.gi===gi && cur.ri===ri && cur.mi===mi){
    delete _t3CurrentMatch[courtNum];
  }

  _t3Save();
  _t3Render();
}

// ── cascade 취소: 취소된 선수가 다음 라운드에도 기록돼 있으면 재귀 제거 ──
function _t3CancelCascade(g, ri, mi, cancelledName){
  if(!g.matches[ri + 1]) return;
  const key = `${ri}-${mi}`;

  g.matches[ri + 1].forEach((nm, nextMi) => {
    let affected = false;

    // fromA/fromB 기반 매칭
    if(nm.fromA === key && nm.p1){
      nm.p1.name = `${ri+1}-${mi+1} 승자`; nm.p1.tbd = true; affected = true;
    }
    if(nm.fromB === key && nm.p2){
      nm.p2.name = `${ri+1}-${mi+1} 승자`; nm.p2.tbd = true; affected = true;
    }

    // fromA/fromB 없을 때 수학 폴백
    if(!nm.fromA && !nm.fromB){
      const expMi = Math.floor(mi / 2);
      if(nextMi === expMi){
        if(mi % 2 === 0 && nm.p1 && nm.p1.name === cancelledName){
          nm.p1.name = `${ri+1}-${mi+1} 승자`; nm.p1.tbd = true; affected = true;
        } else if(mi % 2 === 1 && nm.p2 && nm.p2.name === cancelledName){
          nm.p2.name = `${ri+1}-${mi+1} 승자`; nm.p2.tbd = true; affected = true;
        }
      }
    }

    // 다음 라운드 경기도 이 선수가 승자였다면 연쇄 취소
    if(affected && nm.winner && nm.winner.name === cancelledName){
      delete nm.winner;
      _t3CancelCascade(g, ri + 1, nextMi, cancelledName);
    }
  });
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

    // BroadcastChannel로도 즉시 전파 — storage 이벤트 누락/타이밍 오류 방지
    try{
      const bc = new BroadcastChannel('sgp_cmd');
      bc.postMessage({ type: 'brackets_update', groupBrackets: clean });
      bc.close();
    }catch(ex){}
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
