// ══ STEP 4: 진행방식 ══

/* ── PROC 선택 + 대진표 트리 ── */
function buildProc(){
  const w=document.getElementById('proclist');
  if(!w)return;
  w.innerHTML='';

  // 참가자가 없으면 안내
  if(!S.pts.length){
    const msg=document.createElement('div');
    msg.style.cssText='color:var(--text3);font-size:13px;text-align:center;padding:24px;';
    msg.textContent='참가자를 먼저 등록해주세요';
    w.appendChild(msg);
    return;
  }

  // 참가자 분류 표시 (체급/부문/팀 기준)
  const groupWrap=document.createElement('div');
  groupWrap.style.cssText='margin-top:16px;';
  buildParticipantGroups(groupWrap);
  w.appendChild(groupWrap);

  // 선택된 진행방식에 따라 매치 트리 렌더
  const treeWrap=document.createElement('div');
  treeWrap.id='proc-tree';
  treeWrap.style.cssText='margin-top:16px;border-top:1px solid var(--border);padding-top:16px;';
  w.appendChild(treeWrap);

  if(S.matches&&S.matches.length||(S.proc==='ind-tour'||S.proc==='team-tour')){
    buildTournamentTree(treeWrap);
  } else if(S.proc==='ind-rec'){
    buildOrderList(treeWrap);
  } else if(S.proc==='team-rec'||S.proc==='team-ind'){
    buildTeamList(treeWrap);
  }
}

/* ── 참가자 분류 표시 (체급/부문/팀 그룹핑) ── */
function buildParticipantGroups(wrap){
  const hasWeight=S.pts.some(p=>p.weight);
  const hasDiv=S.pts.some(p=>p.division);
  const hasTeam=S.pts.some(p=>p.team);

  // 헤더
  const hdr=document.createElement('div');
  hdr.style.cssText='display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;';
  hdr.innerHTML=`
    <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:var(--text3);text-transform:uppercase;">
      👥 참가자 현황 <span style="font-weight:400;color:var(--text3)">(총 ${S.pts.length}명)</span>
    </div>`;
  wrap.appendChild(hdr);

  // 그룹핑 기준 결정
  const groups={};
  S.pts.forEach(p=>{
    let key='';
    if(hasDiv&&hasWeight) key=(p.division||'미분류')+' / '+(p.weight||'미분류');
    else if(hasDiv) key=p.division||'미분류';
    else if(hasWeight) key=p.weight||'미분류';
    else if(hasTeam) key=p.team||'개인';
    else key='전체';
    if(!groups[key])groups[key]=[];
    groups[key].push(p);
  });

  // 그룹별 표시
  const grid=document.createElement('div');
  grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;';

  Object.entries(groups).forEach(([groupName,members])=>{
    const box=document.createElement('div');
    box.style.cssText='background:var(--card);border:1px solid var(--border);border-radius:8px;overflow:hidden;';
    box.innerHTML=`
      <div style="padding:7px 10px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">
        <span style="font-size:12px;font-weight:700;">${groupName}</span>
        <span style="font-size:10px;color:var(--text3);background:var(--card2);padding:2px 7px;border-radius:10px;">${members.length}명</span>
      </div>
      <div style="padding:6px 10px;max-height:120px;overflow-y:auto;">
        ${members.map((p,i)=>`
          <div style="display:flex;align-items:center;gap:6px;padding:3px 0;font-size:12px;">
            <span style="color:var(--text3);font-size:10px;width:16px;">${i+1}</span>
            <div style="width:5px;height:5px;border-radius:50%;background:${p.color||'var(--text3)'};flex-shrink:0;"></div>
            <span>${p.name}</span>
          </div>`).join('')}
      </div>`;
    grid.appendChild(box);
  });

  wrap.appendChild(grid);
}

/* ── 토너먼트 대진표 트리 (피라미드) ── */
let _bracketLayout='A';

function buildTournamentTree(wrap){
  const pts=[...S.pts];
  if(!pts.length)return;
  // 이미 대진표가 있으면 재생성하지 않음 (팝업에서 적용한 대진표 유지)
  if(!S.matches||!S.matches.length){
    S.matches=generateBracket(pts);
    S.matchProc='tournament';
    S.matchPts=pts.map(p=>p.id).join(',');
    S.curMatch=0;
    try{if(typeof updatePv==="function")updatePv();}catch(e){}
  }
  const layouts=[
    {id:'A',label:'A 좌→우'},
    {id:'B',label:'B 아래→위'},
    {id:'C',label:'C 위→아래'},
    {id:'D',label:'D 양쪽→가운데'},
    {id:'E',label:'E 위아래→가운데'},
  ];
  const hdr=document.createElement('div');
  hdr.style.cssText='display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;';
  hdr.innerHTML=`
    <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:var(--text3);text-transform:uppercase;">🏆 토너먼트 대진표</div>
    <div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap;">
      ${layouts.map(l=>`<button onclick="setBracketLayout('${l.id}')" style="padding:3px 9px;background:${_bracketLayout===l.id?'rgba(230,57,70,.2)':'transparent'};border:1px solid ${_bracketLayout===l.id?'#e63946':'#2a2a3e'};color:${_bracketLayout===l.id?'#e63946':'#666'};border-radius:5px;cursor:pointer;font-size:10px;font-weight:700;">${l.label}</button>`).join('')}
      <button onclick="addNextRound()" style="padding:3px 9px;background:transparent;border:1px solid #2a2a3e;color:#666;border-radius:5px;cursor:pointer;font-size:10px;">➕ 다음 라운드</button>
      <button onclick="removeLastRound()" style="padding:3px 9px;background:transparent;border:1px solid #2a2a3e;color:#666;border-radius:5px;cursor:pointer;font-size:10px;">➖ 라운드 삭제</button>
      <button onclick="shuffleBracket()" style="padding:3px 9px;background:transparent;border:1px solid #2a2a3e;color:#666;border-radius:5px;cursor:pointer;font-size:10px;">🔀 무작위</button>
    </div>`;
  wrap.appendChild(hdr);
  const fns={A:renderBracketA,B:renderBracketB,C:renderBracketC,D:renderBracketD,E:renderBracketE};
  (fns[_bracketLayout]||renderBracketA)(wrap);
}

function setBracketLayout(mode){_bracketLayout=mode;buildProc();}

/* 공통 상수 */
const _MW=200,_MH=36,_GAP=60,_ROW=56;

/* 공통: Y 중심 계산 (상→하, 1라운드=위) */
function _cy_top(ri,mi,svgH){
  if(ri===0)return 24+_MH/2+mi*_ROW;
  return (_cy_top(ri-1,mi*2,svgH)+_cy_top(ri-1,mi*2+1,svgH))/2;
}
/* 공통: Y 중심 계산 (하→상, 1라운드=아래) */
function _cy_bot(ri,mi,svgH){
  if(ri===0)return svgH-20-_MH/2-mi*_ROW;
  return (_cy_bot(ri-1,mi*2,svgH)+_cy_bot(ri-1,mi*2+1,svgH))/2;
}

/* 공통: SVG 생성 */
function _mkSvg(w,h){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width',w);svg.setAttribute('height',h);
  svg.style.cssText='display:block;overflow:visible;';
  return svg;
}
/* 공통: 스크롤 래퍼 */
function _wrap(wrap,svg){
  const d=document.createElement('div');
  d.style.cssText='overflow:auto;padding-bottom:8px;';
  d.appendChild(svg);wrap.appendChild(d);
}
/* 공통: 라운드 라벨 */
function _rlabel(svg,x,y,ri,total){
  const names=['1라운드','2라운드','3라운드','4라운드','5라운드'];
  const name=ri===total-1&&total>1?'결승':ri===total-2&&total>2?'준결승':names[ri]||`${ri+1}라운드`;
  const t=document.createElementNS('http://www.w3.org/2000/svg','text');
  t.setAttribute('x',x);t.setAttribute('y',y);t.setAttribute('text-anchor','middle');
  t.setAttribute('fill','#444');t.setAttribute('font-size','8');
  t.setAttribute('font-family','Share Tech Mono,monospace');t.setAttribute('letter-spacing','1');
  t.textContent=name;svg.appendChild(t);
}
/* 공통: 경기 박스 */
function _mbox(svg,x,cy,match,ri,mi){
  const y=cy-_MH/2,p1=match.p1,p2=match.p2;
  const isCur=isCurrentMatchIdx(ri,mi);
  const r=document.createElementNS('http://www.w3.org/2000/svg','rect');
  r.setAttribute('x',x);r.setAttribute('y',y);r.setAttribute('width',_MW);r.setAttribute('height',_MH);
  r.setAttribute('rx','5');r.setAttribute('fill','#0d0d1a');
  r.setAttribute('stroke',isCur?'#e63946':'#1e1e30');r.setAttribute('stroke-width',isCur?'2':'1');
  if(isCur)r.setAttribute('filter','drop-shadow(0 0 8px rgba(230,57,70,.5))');
  svg.appendChild(r);
  const mx=x+_MW/2;
  const vl=document.createElementNS('http://www.w3.org/2000/svg','line');
  vl.setAttribute('x1',mx);vl.setAttribute('y1',y);vl.setAttribute('x2',mx);vl.setAttribute('y2',y+_MH);
  vl.setAttribute('stroke','#1e1e30');vl.setAttribute('stroke-width','1');svg.appendChild(vl);
  const vs=document.createElementNS('http://www.w3.org/2000/svg','text');
  vs.setAttribute('x',mx);vs.setAttribute('y',cy+4);vs.setAttribute('text-anchor','middle');
  vs.setAttribute('fill','#e63946');vs.setAttribute('font-size','10');vs.setAttribute('font-family','Bebas Neue,cursive');
  vs.textContent='VS';svg.appendChild(vs);
  [['end',p1,mx-8],[' start',p2,mx+8]].forEach(([anchor,p,tx])=>{
    const t=document.createElementNS('http://www.w3.org/2000/svg','text');
    t.setAttribute('x',tx);t.setAttribute('y',cy+4);t.setAttribute('text-anchor',anchor.trim());
    t.setAttribute('fill',p?'#d0d0d0':'#2a2a3e');t.setAttribute('font-size','12');
    t.setAttribute('font-family','Noto Sans KR,sans-serif');t.setAttribute('font-weight','600');
    t.textContent=p?p.name:'?';svg.appendChild(t);
  });
  const num=document.createElementNS('http://www.w3.org/2000/svg','text');
  num.setAttribute('x',x+3);num.setAttribute('y',y+8);num.setAttribute('fill','#e63946');
  num.setAttribute('font-size','7');num.setAttribute('font-family','Share Tech Mono,monospace');
  num.textContent=`${ri+1}-${mi+1}`;svg.appendChild(num);
}
/* 공통: 연결선 그리기 (가로 연결) */
function _drawLinks(svg,rounds,xFn,cyFn,dir){
  // dir: 'right'=오른쪽으로, 'left'=왼쪽으로
  rounds.forEach((matches,ri)=>{
    if(ri>=rounds.length-1)return;
    matches.forEach((match,mi)=>{
      const x=xFn(ri),nx=xFn(ri+1);
      const fromY=cyFn(ri,mi),toY=cyFn(ri+1,Math.floor(mi/2));
      const lx=dir==='right'?x+_MW:x; // 박스 오른쪽 or 왼쪽
      const rlx=dir==='right'?nx:nx+_MW; // 다음 박스 왼쪽 or 오른쪽
      const midX=(lx+rlx)/2;
      const h1=document.createElementNS('http://www.w3.org/2000/svg','line');
      h1.setAttribute('x1',lx);h1.setAttribute('y1',fromY);h1.setAttribute('x2',midX);h1.setAttribute('y2',fromY);
      h1.setAttribute('stroke','#1e1e30');h1.setAttribute('stroke-width','2');svg.appendChild(h1);
      if(mi%2===1){
        const prevY=cyFn(ri,mi-1);
        const vl=document.createElementNS('http://www.w3.org/2000/svg','line');
        vl.setAttribute('x1',midX);vl.setAttribute('y1',prevY);vl.setAttribute('x2',midX);vl.setAttribute('y2',fromY);
        vl.setAttribute('stroke','#1e1e30');vl.setAttribute('stroke-width','2');svg.appendChild(vl);
        const h2=document.createElementNS('http://www.w3.org/2000/svg','line');
        h2.setAttribute('x1',midX);h2.setAttribute('y1',toY);h2.setAttribute('x2',rlx);h2.setAttribute('y2',toY);
        h2.setAttribute('stroke','#1e1e30');h2.setAttribute('stroke-width','2');svg.appendChild(h2);
      }
    });
  });
}

/* A: 좌→우 */
function renderBracketA(wrap){
  const rounds=S.matches,T=rounds.length;
  const r0=rounds[0].length,H=Math.max(200,r0*_ROW+40),W=T*(_MW+_GAP)+40;
  const cyFn=(ri,mi)=>_cy_top(ri,mi,H);
  const xFn=(ri)=>ri*(_MW+_GAP)+20;
  const svg=_mkSvg(W,H);
  _drawLinks(svg,rounds,xFn,cyFn,'right');
  rounds.forEach((matches,ri)=>{
    _rlabel(svg,xFn(ri)+_MW/2,12,ri,T);
    matches.forEach((m,mi)=>_mbox(svg,xFn(ri),cyFn(ri,mi),m,ri,mi));
  });
  _wrap(wrap,svg);
}

/* B: 아래→위 (1라운드 아래, 결승 위, 왼→오 진행) */
function renderBracketB(wrap){
  const rounds=S.matches,T=rounds.length;
  const r0=rounds[0].length,H=Math.max(200,r0*_ROW+40),W=T*(_MW+_GAP)+40;
  const cyFn=(ri,mi)=>_cy_bot(ri,mi,H);
  const xFn=(ri)=>ri*(_MW+_GAP)+20;
  const svg=_mkSvg(W,H);
  _drawLinks(svg,rounds,xFn,cyFn,'right');
  rounds.forEach((matches,ri)=>{
    _rlabel(svg,xFn(ri)+_MW/2,12,ri,T);
    matches.forEach((m,mi)=>_mbox(svg,xFn(ri),cyFn(ri,mi),m,ri,mi));
  });
  _wrap(wrap,svg);
}

/* C: 위→아래 (1라운드 위, 결승 아래, 왼→오 진행) */
function renderBracketC(wrap){
  const rounds=S.matches,T=rounds.length;
  const r0=rounds[0].length,H=Math.max(200,r0*_ROW+40),W=T*(_MW+_GAP)+40;
  const cyFn=(ri,mi)=>_cy_top(ri,mi,H);
  const xFn=(ri)=>(T-1-ri)*(_MW+_GAP)+20; // 결승이 왼쪽
  const svg=_mkSvg(W,H);
  _drawLinks(svg,rounds,xFn,cyFn,'left');
  rounds.forEach((matches,ri)=>{
    _rlabel(svg,xFn(ri)+_MW/2,12,ri,T);
    matches.forEach((m,mi)=>_mbox(svg,xFn(ri),cyFn(ri,mi),m,ri,mi));
  });
  _wrap(wrap,svg);
}

/* D: 양쪽→가운데 (좌우 대칭, 결승 가운데) */
function renderBracketD(wrap){
  const rounds=S.matches,T=rounds.length;
  const r0=rounds[0].length;
  const half=Math.ceil(r0/2);
  const H=Math.max(200,half*_ROW*2+40);
  const W=(T*2-1)*(_MW+_GAP)+40;
  const center=Math.floor(W/2);
  const svg=_mkSvg(W,H);

  // 왼쪽 절반 (1라운드 맨 왼쪽)
  const lRounds=rounds.map(r=>r.slice(0,Math.ceil(r.length/2)));
  const rRounds=rounds.map(r=>r.slice(Math.ceil(r.length/2)));

  const lxFn=(ri)=>ri*(_MW+_GAP)+20;
  const rxFn=(ri)=>W-20-_MW-ri*(_MW+_GAP);
  const lcyFn=(ri,mi)=>_cy_top(ri,mi,H);
  const rcyFn=(ri,mi)=>_cy_top(ri,mi,H);

  _drawLinks(svg,lRounds,lxFn,lcyFn,'right');
  lRounds.forEach((matches,ri)=>{
    _rlabel(svg,lxFn(ri)+_MW/2,12,ri,T);
    matches.forEach((m,mi)=>_mbox(svg,lxFn(ri),lcyFn(ri,mi),m,ri,mi));
  });

  if(rRounds[0].length>0){
    _drawLinks(svg,rRounds,rxFn,rcyFn,'left');
    rRounds.forEach((matches,ri)=>{
      if(!matches.length)return;
      _rlabel(svg,rxFn(ri)+_MW/2,12,ri,T);
      matches.forEach((m,mi)=>_mbox(svg,rxFn(ri),rcyFn(ri,mi),m,ri,mi));
    });
  }
  _wrap(wrap,svg);
}

/* E: 위아래→가운데 (상하 대칭, 결승 가운데) */
function renderBracketE(wrap){
  const rounds=S.matches,T=rounds.length;
  const r0=rounds[0].length;
  const H=Math.max(300,r0*_ROW+60);
  const W=T*(_MW+_GAP)+40;
  const svg=_mkSvg(W,H);

  // 위쪽 절반 (1라운드 맨 위)
  const topRounds=rounds.map(r=>r.slice(0,Math.ceil(r.length/2)));
  // 아래쪽 절반 (1라운드 맨 아래)
  const botRounds=rounds.map(r=>r.slice(Math.ceil(r.length/2)));

  const xFn=(ri)=>ri*(_MW+_GAP)+20;
  const tcyFn=(ri,mi)=>_cy_top(ri,mi,H/2);
  const bcyFn=(ri,mi)=>H-_cy_top(ri,mi,H/2);

  _drawLinks(svg,topRounds,xFn,tcyFn,'right');
  topRounds.forEach((matches,ri)=>{
    if(!matches.length)return;
    _rlabel(svg,xFn(ri)+_MW/2,12,ri,T);
    matches.forEach((m,mi)=>_mbox(svg,xFn(ri),tcyFn(ri,mi),m,ri,mi));
  });

  if(botRounds[0].length>0){
    _drawLinks(svg,botRounds,xFn,bcyFn,'right');
    botRounds.forEach((matches,ri)=>{
      if(!matches.length)return;
      matches.forEach((m,mi)=>_mbox(svg,xFn(ri),bcyFn(ri,mi),m,ri,mi));
    });
  }
  _wrap(wrap,svg);
}

/* ── 다음 라운드 추가 ── */
function addNextRound(){
  if(!S.matches||!S.matches.length){toast('대진표가 없어요','error');return;}
  const lastRound=S.matches[S.matches.length-1];
  const winners=lastRound.map(m=>m.winner||null);
  if(winners.every(w=>!w)){toast('1라운드 승자를 먼저 결정해주세요','info');return;}
  if(winners.length<=1){toast('더 이상 라운드를 추가할 수 없어요','info');return;}

  // 승자들로 다음 라운드 생성 (BYE 없이 실제 승자만)
  const nextPlayers=winners.filter(w=>w!==null);
  const matches=[];
  for(let i=0;i<nextPlayers.length;i+=2){
    matches.push({p1:nextPlayers[i],p2:nextPlayers[i+1]||null,winner:null});
  }
  S.matches.push(matches);
  buildProc();
  toast(`${S.matches.length}라운드 추가됨!`,'success');
}

/* ── 매치 카드 ── */
function buildMatchCard(match, ri, mi){
  const isCurrentMatch=isCurrentMatchIdx(ri,mi);
  const el=document.createElement('div');
  el.style.cssText=`
    background:var(--card);
    border:1px solid ${isCurrentMatch?'var(--red)':match.winner?'var(--green)':'var(--border)'};
    border-radius:8px;overflow:hidden;
    transition:all .2s;
    ${isCurrentMatch?'box-shadow:0 0 12px rgba(230,57,70,.2);':''}
  `;

  [match.p1,match.p2].forEach((p,pi)=>{
    const row=document.createElement('div');
    const isWinner=match.winner&&match.winner===p;
    const isLoser=match.winner&&match.winner!==p&&p;
    row.style.cssText=`
      display:flex;align-items:center;gap:8px;padding:8px 10px;
      ${pi===0?'border-bottom:1px solid var(--border)':''}
      ${isWinner?'background:rgba(6,214,160,.06)':''}
      ${isLoser?'opacity:.4':''}
    `;
    const dot=p?`<div style="width:6px;height:6px;border-radius:50%;background:${p.color||'var(--text3)'};flex-shrink:0;"></div>`:'';
    const name=p?p.name:'<span style="color:var(--border2)">— TBD —</span>';
    const badge=isWinner?'<span style="font-size:9px;color:var(--green);margin-left:auto;">✓</span>':'';
    row.innerHTML=`${dot}<span style="font-size:12px;font-weight:${isWinner?'700':'400'};flex:1;">${name}</span>${badge}`;
    el.appendChild(row);
  });

  return el;
}

/* ── 개별 기록 순서 리스트 ── */
function buildOrderList(wrap){
  const hasWeight=S.pts.some(p=>p.weight);
  const hasDiv=S.pts.some(p=>p.division);
  const hasTeam=S.pts.some(p=>p.team);
  const hasGroups=hasWeight||hasDiv||hasTeam;

  // 그룹이 있을 때 → 대진표 팝업 안내만 표시
  if(hasGroups){
    const msg=document.createElement('div');
    msg.style.cssText='padding:24px;text-align:center;';
    msg.innerHTML=`
      <div style="font-size:32px;margin-bottom:12px;">🏆</div>
      <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:8px;">그룹별 대진표를 만들어주세요</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:16px;">체급/부문별로 분류된 참가자가 있어요.<br>👥 참가자 보기에서 그룹별 토너먼트를 만들어주세요.</div>
      <button onclick="openPtsPopup()" style="padding:8px 20px;background:var(--red);border:none;color:#fff;border-radius:8px;cursor:pointer;font-size:13px;font-weight:700;">👥 참가자 보기 → 대진표 만들기</button>`;
    wrap.appendChild(msg);
    return;
  }

  // 그룹 없을 때(순수 개인전) → 도전 순서 리스트
  const hdr=document.createElement('div');
  hdr.style.cssText='display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;';
  hdr.innerHTML=`
    <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:var(--text3);text-transform:uppercase">🏁 도전 순서</div>
  `;
  wrap.appendChild(hdr);

  const list=document.createElement('div');
  list.style.cssText='display:flex;flex-direction:column;gap:6px;max-height:300px;overflow-y:auto;';

  S.pts.forEach((p,i)=>{
    const row=document.createElement('div');
    const isCur=i===(S.curOrderIdx||0);
    row.style.cssText=`display:flex;align-items:center;gap:10px;padding:9px 12px;background:var(--card);border:1px solid ${isCur?'var(--red)':'var(--border)'};border-radius:8px;transition:all .2s;`;
    row.innerHTML=`
      <div style="font-family:'Share Tech Mono',monospace;font-size:12px;color:var(--text3);width:24px;">${i+1}</div>
      <div style="width:7px;height:7px;border-radius:50%;background:${p.color||'var(--text3)'};flex-shrink:0;"></div>
      <div style="flex:1;font-size:13px;font-weight:${isCur?'700':'400'};">${p.name}</div>
      ${isCur?'<span style="font-size:10px;color:var(--red);letter-spacing:1px;">▶ 현재</span>':''}
    `;
    list.appendChild(row);
  });
  wrap.appendChild(list);
}

/* ── 팀 리스트 ── */
function buildTeamList(wrap){
  const hdr=document.createElement('div');
  hdr.style.cssText='margin-bottom:12px;font-size:11px;font-weight:700;letter-spacing:2px;color:var(--text3);text-transform:uppercase;';
  hdr.textContent='👥 팀 구성';
  wrap.appendChild(hdr);

  // 팀별로 그룹핑
  const teams={};
  S.pts.forEach(p=>{
    const key=p.team||'개인';
    if(!teams[key])teams[key]=[];
    teams[key].push(p);
  });

  Object.entries(teams).forEach(([teamName,members])=>{
    const group=document.createElement('div');
    group.style.cssText='margin-bottom:10px;background:var(--card);border:1px solid var(--border);border-radius:8px;overflow:hidden;';
    group.innerHTML=`<div style="padding:8px 12px;border-bottom:1px solid var(--border);font-weight:700;font-size:13px;">${teamName} <span style="color:var(--text3);font-size:11px;">(${members.length}명)</span></div>`;
    members.forEach(p=>{
      const row=document.createElement('div');
      row.style.cssText='display:flex;align-items:center;gap:8px;padding:7px 12px;border-bottom:1px solid rgba(255,255,255,.03);';
      row.innerHTML=`<div style="width:6px;height:6px;border-radius:50%;background:${p.color||'var(--text3)'}"></div><span style="font-size:12px;">${p.name}</span>`;
      group.appendChild(row);
    });
    wrap.appendChild(group);
  });
}

/* ── 브라켓 생성 (1라운드만, BYE 자동승자 없음) ── */
function generateBracket(pts){
  let players=[...pts];
  // 2의 거듭제곱으로 맞추기 (BYE 추가)
  let size=1;
  while(size<players.length)size*=2;
  while(players.length<size)players.push(null);

  // 1라운드만 생성
  const matches=[];
  for(let i=0;i<players.length;i+=2){
    matches.push({p1:players[i],p2:players[i+1],winner:null});
  }
  return [matches]; // 항상 1라운드만
}

/* ── 마지막 라운드 삭제 ── */
function removeLastRound(){
  if(!S.matches||S.matches.length<=1){toast('1라운드는 삭제할 수 없어요','info');return;}
  S.matches.pop();
  buildProc();
  toast('마지막 라운드 삭제됨','success');
}


function shuffleBracket(){
  const pts=[...S.pts].sort(()=>Math.random()-.5);
  S.matches=generateBracket(pts);
  S.curMatch=0;
  buildProc();
  toast('대진표 새로 배정됨','success');
}

/* ── 순서 섞기 ── */
function shuffleOrder(){
  S.pts=[...S.pts].sort(()=>Math.random()-.5);
  S.curOrderIdx=0;
  buildProc();
  toast('순서 섞기 완료','success');
}

/* ── 현재 매치 찾기 ── */
function getCurrentMatch(){
  if(!S.matches)return null;
  for(let ri=0;ri<S.matches.length;ri++){
    for(let mi=0;mi<S.matches[ri].length;mi++){
      const m=S.matches[ri][mi];
      if(!m.winner&&m.p1&&m.p2)return{...m,ri,mi};
    }
  }
  return null;
}

function isCurrentMatchIdx(ri,mi){
  const cur=getCurrentMatch();
  return cur&&cur.ri===ri&&cur.mi===mi;
}

/* ── 승자 기록 ── */
function recordWin(playerIdx){
  const cur=getCurrentMatch();
  if(!cur)return;
  const winner=playerIdx===0?cur.p1:cur.p2;
  S.matches[cur.ri][cur.mi].winner=winner;

  // localStorage로 display.html에 현재경기 전달
  const next=getCurrentMatch();
  if(next){
    try{localStorage.setItem('sgp_current_match',JSON.stringify({p1:next.p1?.name,p2:next.p2?.name}));}catch(e){}
  }

  buildProc();
  try{if(typeof updatePv==='function')updatePv();}catch(e){}
  toast(winner.name+' 승리!','success');
}

/* ══ 참가자 보기 팝업 ══
   openPtsPopup / closePtsPopup / renderPtsPopup / groupPts /
   makeLeague / makeTournament 는 setup.html 인라인 스크립트에서 정의합니다.
   (구버전 중복 함수 제거) */
