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

  if(S.matches&&S.matches.length){
    // 대진표가 있으면 항상 토너먼트/리그 트리 표시
    buildTournamentTree(treeWrap);
  } else if(S.proc==='ind-rec'){
    buildOrderList(treeWrap);
  } else if(S.proc==='team-rec'||S.proc==='team-ind'){
    buildTeamList(treeWrap);
  } else {
    // 대진표 없음 안내
    const msg=document.createElement('div');
    msg.style.cssText='color:var(--text3);font-size:13px;text-align:center;padding:24px;background:var(--card);border:1px solid var(--border);border-radius:10px;';
    msg.innerHTML='위 <b style="color:var(--text2)">👥 참가자 보기</b> 버튼을 눌러 대진표를 만들어주세요';
    treeWrap.appendChild(msg);
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
      <span style="font-size:9px;color:var(--text3);letter-spacing:1px;margin-right:2px;">레이아웃:</span>
      ${layouts.map(l=>`<button onclick="setBracketLayout('${l.id}')" style="padding:3px 9px;background:${_bracketLayout===l.id?'rgba(230,57,70,.25)':'rgba(255,255,255,.04)'};border:1px solid ${_bracketLayout===l.id?'var(--red)':'var(--border2)'};color:${_bracketLayout===l.id?'#e63946':'var(--text2)'};border-radius:5px;cursor:pointer;font-size:10px;font-weight:700;transition:all .15s;">${l.label}</button>`).join('')}
      <span style="width:1px;height:16px;background:var(--border);margin:0 2px;"></span>
      <button onclick="addNextRound()" style="padding:3px 9px;background:rgba(76,201,240,.08);border:1px solid var(--border2);color:var(--text2);border-radius:5px;cursor:pointer;font-size:10px;transition:all .15s;" onmouseover="this.style.borderColor='var(--accent)';this.style.color='var(--accent)'" onmouseout="this.style.borderColor='var(--border2)';this.style.color='var(--text2)'">➕ 라운드 추가</button>
      <button onclick="removeLastRound()" style="padding:3px 9px;background:rgba(230,57,70,.06);border:1px solid var(--border2);color:var(--text2);border-radius:5px;cursor:pointer;font-size:10px;transition:all .15s;" onmouseover="this.style.borderColor='var(--red)';this.style.color='var(--red)'" onmouseout="this.style.borderColor='var(--border2)';this.style.color='var(--text2)'">➖ 라운드 삭제</button>
      <button onclick="shuffleBracket()" style="padding:3px 9px;background:rgba(255,255,255,.04);border:1px solid var(--border2);color:var(--text2);border-radius:5px;cursor:pointer;font-size:10px;transition:all .15s;" onmouseover="this.style.borderColor='var(--border2)';this.style.color='var(--text)'" onmouseout="this.style.borderColor='var(--border2)';this.style.color='var(--text2)'">🔀 무작위</button>
      <button onclick="resetBracket()" style="padding:3px 9px;background:rgba(255,214,10,.06);border:1px solid var(--border2);color:var(--text3);border-radius:5px;cursor:pointer;font-size:10px;transition:all .15s;" onmouseover="this.style.borderColor='var(--yellow)';this.style.color='var(--yellow)'" onmouseout="this.style.borderColor='var(--border2)';this.style.color='var(--text3)'">✕ 초기화</button>
    </div>`;
  wrap.appendChild(hdr);
  const fns={A:renderBracketA,B:renderBracketB,C:renderBracketC,D:renderBracketD,E:renderBracketE};
  (fns[_bracketLayout]||renderBracketA)(wrap);
}

function setBracketLayout(mode){_bracketLayout=mode;buildProc();}

/* ── 팝업/패널 가용 너비 계산 ── */
function _getAvailW(wrap){
  // 팝업(pts-bracket-view) 또는 step4 패널 너비
  const popup=document.getElementById('pts-bracket-view');
  if(popup&&popup.offsetWidth>100)return popup.offsetWidth-36;
  return wrap.offsetWidth>100?wrap.offsetWidth-36:700;
}

/* ── 동적 크기 계산 ── */
function _calcSizes(rounds,availW){
  const T=rounds.length,r0=rounds[0].length;
  // 라운드 수 기반으로 박스 너비 결정 (가용폭을 라운드수+갭으로 나눔)
  const maxMW=200,minMW=80;
  const gap=Math.max(16,Math.floor(availW*0.06));
  const mw=Math.min(maxMW,Math.max(minMW,Math.floor((availW-40)/(T||1))-gap));
  const mh=Math.max(24,Math.floor(mw*0.18));
  const row=Math.max(mh+8,Math.floor(mh*1.6));
  return{mw,mh,gap,row};
}

/* 공통: Y 중심 계산 (상→하) */
function _cy_top(ri,mi,mh,row){
  if(ri===0)return 24+mh/2+mi*row;
  return (_cy_top(ri-1,mi*2,mh,row)+_cy_top(ri-1,mi*2+1,mh,row))/2;
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

/* 가로형 박스 (A/D용): "이름 VS 이름" 한 줄 */
function _mboxH(svg,x,cy,match,ri,mi,sz){
  const {mw,mh}=sz;
  const y=cy-mh/2,p1=match.p1,p2=match.p2;
  const isBye=p1&&!p2;
  const isCur=!isBye&&isCurrentMatchIdx(ri,mi);
  // 부전승이면 자동 승자 처리
  if(isBye&&!match.winner)match.winner=p1;

  const r=document.createElementNS('http://www.w3.org/2000/svg','rect');
  r.setAttribute('x',x);r.setAttribute('y',y);r.setAttribute('width',mw);r.setAttribute('height',mh);
  r.setAttribute('rx','4');r.setAttribute('fill',isBye?'#0a0a14':'#0d0d1a');
  r.setAttribute('stroke',isCur?'#e63946':isBye?'#1a1a28':'#1e1e30');
  r.setAttribute('stroke-width',isCur?'2':'1');
  if(isCur)r.setAttribute('filter','drop-shadow(0 0 6px rgba(230,57,70,.5))');
  svg.appendChild(r);

  const fs=Math.max(8,Math.floor(mh*0.38));
  if(isBye){
    // 부전승: 이름 + BYE 표시
    const t=document.createElementNS('http://www.w3.org/2000/svg','text');
    t.setAttribute('x',x+mw/2);t.setAttribute('y',cy+fs*0.35);t.setAttribute('text-anchor','middle');
    t.setAttribute('fill','#d0d0d0');t.setAttribute('font-size',fs);
    t.setAttribute('font-family','Noto Sans KR,sans-serif');t.setAttribute('font-weight','600');
    t.textContent=p1.name;svg.appendChild(t);
    const bye=document.createElementNS('http://www.w3.org/2000/svg','text');
    bye.setAttribute('x',x+mw-4);bye.setAttribute('y',y+8);bye.setAttribute('text-anchor','end');
    bye.setAttribute('fill','#4cc9f0');bye.setAttribute('font-size','7');
    bye.setAttribute('font-family','Share Tech Mono,monospace');
    bye.textContent='BYE';svg.appendChild(bye);
  } else {
    const mx=x+mw/2;
    const vl=document.createElementNS('http://www.w3.org/2000/svg','line');
    vl.setAttribute('x1',mx);vl.setAttribute('y1',y);vl.setAttribute('x2',mx);vl.setAttribute('y2',y+mh);
    vl.setAttribute('stroke','#1e1e30');vl.setAttribute('stroke-width','1');svg.appendChild(vl);
    const vs=document.createElementNS('http://www.w3.org/2000/svg','text');
    vs.setAttribute('x',mx);vs.setAttribute('y',cy+fs*0.35);vs.setAttribute('text-anchor','middle');
    vs.setAttribute('fill','#e63946');vs.setAttribute('font-size',fs);vs.setAttribute('font-family','Bebas Neue,cursive');
    vs.textContent='VS';svg.appendChild(vs);
    [['end',p1,mx-4],['start',p2,mx+4]].forEach(([anchor,p,tx])=>{
      const t=document.createElementNS('http://www.w3.org/2000/svg','text');
      t.setAttribute('x',tx);t.setAttribute('y',cy+fs*0.35);t.setAttribute('text-anchor',anchor);
      t.setAttribute('fill',p?'#d0d0d0':'#2a2a3e');t.setAttribute('font-size',fs);
      t.setAttribute('font-family','Noto Sans KR,sans-serif');t.setAttribute('font-weight','600');
      t.textContent=p?p.name:'?';svg.appendChild(t);
    });
  }
  const num=document.createElementNS('http://www.w3.org/2000/svg','text');
  num.setAttribute('x',x+3);num.setAttribute('y',y+8);num.setAttribute('fill',isBye?'#4cc9f0':'#e63946');
  num.setAttribute('font-size','7');num.setAttribute('font-family','Share Tech Mono,monospace');
  num.textContent=isBye?`${ri+1}-${mi+1} BYE`:`${ri+1}-${mi+1}`;svg.appendChild(num);
}

/* 세로형 박스 (B/C/E용): 이름을 한 글자씩 세로로 */
function _mboxV(svg,cx,cy,match,ri,mi,sz){
  const {mw,mh}=sz;
  const bw=Math.max(26,Math.floor(mh*1.4));
  const fs=Math.max(9,Math.floor(bw*0.52));
  const lh=fs+3;
  const p1=match.p1,p2=match.p2;
  const isBye=p1&&!p2;
  const isCur=!isBye&&isCurrentMatchIdx(ri,mi);
  if(isBye&&!match.winner)match.winner=p1;

  const n1=p1?p1.name:'?',n2=p2?p2.name:'?';

  if(isBye){
    // 부전승: 박스 하나만, 이름 세로
    const bh=n1.length*lh+20;
    const x1=cx-bw/2,y1=cy-bh/2;
    const r=document.createElementNS('http://www.w3.org/2000/svg','rect');
    r.setAttribute('x',x1);r.setAttribute('y',y1);r.setAttribute('width',bw);r.setAttribute('height',bh);
    r.setAttribute('rx','4');r.setAttribute('fill','#0a0a14');
    r.setAttribute('stroke','#1a1a28');r.setAttribute('stroke-width','1');
    svg.appendChild(r);
    n1.split('').forEach((ch,i)=>{
      const t=document.createElementNS('http://www.w3.org/2000/svg','text');
      t.setAttribute('x',x1+bw/2);t.setAttribute('y',y1+12+i*lh+fs);
      t.setAttribute('text-anchor','middle');t.setAttribute('fill','#d0d0d0');
      t.setAttribute('font-size',fs);t.setAttribute('font-family','Noto Sans KR,sans-serif');t.setAttribute('font-weight','600');
      t.textContent=ch;svg.appendChild(t);
    });
    const bye=document.createElementNS('http://www.w3.org/2000/svg','text');
    bye.setAttribute('x',x1+bw/2);bye.setAttribute('y',y1+6);bye.setAttribute('text-anchor','middle');
    bye.setAttribute('fill','#4cc9f0');bye.setAttribute('font-size','6');bye.setAttribute('font-family','Share Tech Mono,monospace');
    bye.textContent='BYE';svg.appendChild(bye);
    return;
  }

  const maxLen=Math.max(n1.length,n2.length,1);
  const bh=maxLen*lh+20;

  // p1 박스 (위)
  const x1=cx-bw-2,y1=cy-bh-4;
  const r1=document.createElementNS('http://www.w3.org/2000/svg','rect');
  r1.setAttribute('x',x1);r1.setAttribute('y',y1);r1.setAttribute('width',bw);r1.setAttribute('height',bh);
  r1.setAttribute('rx','4');r1.setAttribute('fill','#0d0d1a');
  r1.setAttribute('stroke',isCur?'#e63946':'#1e1e30');r1.setAttribute('stroke-width',isCur?'2':'1');
  if(isCur)r1.setAttribute('filter','drop-shadow(0 0 6px rgba(230,57,70,.5))');
  svg.appendChild(r1);
  n1.split('').forEach((ch,i)=>{
    const t=document.createElementNS('http://www.w3.org/2000/svg','text');
    t.setAttribute('x',x1+bw/2);t.setAttribute('y',y1+12+i*lh+fs);
    t.setAttribute('text-anchor','middle');t.setAttribute('fill',p1?'#d0d0d0':'#2a2a3e');
    t.setAttribute('font-size',fs);t.setAttribute('font-family','Noto Sans KR,sans-serif');t.setAttribute('font-weight','600');
    t.textContent=ch;svg.appendChild(t);
  });

  const vsEl=document.createElementNS('http://www.w3.org/2000/svg','text');
  vsEl.setAttribute('x',cx);vsEl.setAttribute('y',cy+4);vsEl.setAttribute('text-anchor','middle');
  vsEl.setAttribute('fill','#e63946');vsEl.setAttribute('font-size',Math.max(8,fs-1));vsEl.setAttribute('font-family','Bebas Neue,cursive');
  vsEl.textContent='VS';svg.appendChild(vsEl);

  // p2 박스 (아래)
  const x2=cx+2,y2=cy+4+6;
  const r2=document.createElementNS('http://www.w3.org/2000/svg','rect');
  r2.setAttribute('x',x2);r2.setAttribute('y',y2);r2.setAttribute('width',bw);r2.setAttribute('height',bh);
  r2.setAttribute('rx','4');r2.setAttribute('fill','#0d0d1a');
  r2.setAttribute('stroke',isCur?'#e63946':'#1e1e30');r2.setAttribute('stroke-width',isCur?'2':'1');
  if(isCur)r2.setAttribute('filter','drop-shadow(0 0 6px rgba(230,57,70,.5))');
  svg.appendChild(r2);
  n2.split('').forEach((ch,i)=>{
    const t=document.createElementNS('http://www.w3.org/2000/svg','text');
    t.setAttribute('x',x2+bw/2);t.setAttribute('y',y2+12+i*lh+fs);
    t.setAttribute('text-anchor','middle');t.setAttribute('fill',p2?'#d0d0d0':'#2a2a3e');
    t.setAttribute('font-size',fs);t.setAttribute('font-family','Noto Sans KR,sans-serif');t.setAttribute('font-weight','600');
    t.textContent=ch;svg.appendChild(t);
  });

  const num=document.createElementNS('http://www.w3.org/2000/svg','text');
  num.setAttribute('x',x1+2);num.setAttribute('y',y1+8);num.setAttribute('fill','#e63946');
  num.setAttribute('font-size','7');num.setAttribute('font-family','Share Tech Mono,monospace');
  num.textContent=`${ri+1}-${mi+1}`;svg.appendChild(num);
}

/* 공통: 연결선 그리기 (가로, A/D용) */
function _drawLinks(svg,rounds,xFn,cyFn,dir,sz){
  const {mw}=sz;
  rounds.forEach((matches,ri)=>{
    if(ri>=rounds.length-1)return;
    matches.forEach((match,mi)=>{
      const x=xFn(ri),nx=xFn(ri+1);
      const fromY=cyFn(ri,mi),toY=cyFn(ri+1,Math.floor(mi/2));
      const lx=dir==='right'?x+mw:x;
      const rlx=dir==='right'?nx:nx+mw;
      const midX=(lx+rlx)/2;
      const LN=(x1,y1,x2,y2)=>{
        const l=document.createElementNS('http://www.w3.org/2000/svg','line');
        l.setAttribute('x1',x1);l.setAttribute('y1',y1);l.setAttribute('x2',x2);l.setAttribute('y2',y2);
        l.setAttribute('stroke','#1e1e30');l.setAttribute('stroke-width','2');svg.appendChild(l);
      };
      LN(lx,fromY,midX,fromY);
      if(mi%2===1){
        const prevY=cyFn(ri,mi-1);
        LN(midX,prevY,midX,fromY);
        LN(midX,toY,rlx,toY);
      }
    });
  });
}

/* 공통: 연결선 그리기 (수직, B/C/E용) */
function _drawLinksBC(svg,rounds,xFn,cyFn){
  const LN=(x1,y1,x2,y2)=>{
    const l=document.createElementNS('http://www.w3.org/2000/svg','line');
    l.setAttribute('x1',x1);l.setAttribute('y1',y1);
    l.setAttribute('x2',x2);l.setAttribute('y2',y2);
    l.setAttribute('stroke','#1e1e30');l.setAttribute('stroke-width','2');
    svg.appendChild(l);
  };
  rounds.forEach((matches,ri)=>{
    if(ri>=rounds.length-1)return;
    for(let mi=0;mi<matches.length;mi+=2){
      const cx=xFn(ri);
      const ncx=xFn(ri+1);
      const y0=cyFn(ri,mi);
      const y1=mi+1<matches.length?cyFn(ri,mi+1):y0;
      const ny=cyFn(ri+1,Math.floor(mi/2));
      const midY=(y0+y1)/2;
      LN(cx,y0,cx,midY);
      if(mi+1<matches.length)LN(cx,y1,cx,midY);
      LN(cx,midY,ncx,midY);
      LN(ncx,midY,ncx,ny);
    }
  });
}

function _vtree_cy(ri,mi,baseY,rowH,dir){
  if(ri===0)return baseY+mi*rowH*(dir==='up'?-1:1);
  const y0=_vtree_cy(ri-1,mi*2,baseY,rowH,dir);
  const y1=_vtree_cy(ri-1,mi*2+1,baseY,rowH,dir);
  return (y0+y1)/2;
}

/* A: 좌→우 */
function renderBracketA(wrap){
  const rounds=S.matches,T=rounds.length,r0=rounds[0].length;
  const availW=_getAvailW(wrap);
  const sz=_calcSizes(rounds,availW);
  const {mw,mh,gap,row}=sz;
  const H=Math.max(200,r0*row+40),W=T*(mw+gap)+40;
  const cyFn=(ri,mi)=>_cy_top(ri,mi,mh,row);
  const xFn=(ri)=>ri*(mw+gap)+20;
  const svg=_mkSvg(W,H);
  _drawLinks(svg,rounds,xFn,cyFn,'right',sz);
  rounds.forEach((matches,ri)=>{
    _rlabel(svg,xFn(ri)+mw/2,12,ri,T);
    matches.forEach((m,mi)=>_mboxH(svg,xFn(ri),cyFn(ri,mi),m,ri,mi,sz));
  });
  _wrap(wrap,svg);
}

/* B: 아래→위, 이름 세로 */
function renderBracketB(wrap){
  const rounds=S.matches,T=rounds.length,r0=rounds[0].length;
  const availW=_getAvailW(wrap);
  const sz=_calcSizes(rounds,availW);
  const {mw,mh,gap,row}=sz;
  const bw=Math.max(26,Math.floor(mh*1.4));
  const colW=bw*2+20; // 세로박스 2개+VS 너비
  const colGap=Math.max(20,gap);
  const padY=mh+20;
  const H=Math.max(200,r0*row+padY*2);
  const W=T*(colW+colGap)+40;
  const svg=_mkSvg(W,H);
  const baseY=H-padY;
  const xFn=(ri)=>ri*(colW+colGap)+20+colW/2; // 중심 X
  const cyFn=(ri,mi)=>_vtree_cy(ri,mi,baseY,row,'up');
  _drawLinksBC(svg,rounds,xFn,cyFn);
  rounds.forEach((matches,ri)=>{
    _rlabel(svg,xFn(ri),12,ri,T);
    matches.forEach((m,mi)=>_mboxV(svg,xFn(ri),cyFn(ri,mi),m,ri,mi,sz));
  });
  _wrap(wrap,svg);
}

/* C: 위→아래, 이름 세로 */
function renderBracketC(wrap){
  const rounds=S.matches,T=rounds.length,r0=rounds[0].length;
  const availW=_getAvailW(wrap);
  const sz=_calcSizes(rounds,availW);
  const {mw,mh,gap,row}=sz;
  const bw=Math.max(26,Math.floor(mh*1.4));
  const colW=bw*2+20;
  const colGap=Math.max(20,gap);
  const padY=mh+20;
  const H=Math.max(200,r0*row+padY*2);
  const W=T*(colW+colGap)+40;
  const svg=_mkSvg(W,H);
  const baseY=padY;
  const xFn=(ri)=>ri*(colW+colGap)+20+colW/2;
  const cyFn=(ri,mi)=>_vtree_cy(ri,mi,baseY,row,'down');
  _drawLinksBC(svg,rounds,xFn,cyFn);
  rounds.forEach((matches,ri)=>{
    _rlabel(svg,xFn(ri),H-8,ri,T);
    matches.forEach((m,mi)=>_mboxV(svg,xFn(ri),cyFn(ri,mi),m,ri,mi,sz));
  });
  _wrap(wrap,svg);
}

/* D: 양쪽→가운데 */
function renderBracketD(wrap){
  const rounds=S.matches,T=rounds.length,r0=rounds[0].length;
  const availW=_getAvailW(wrap);
  const sz=_calcSizes(rounds,availW);
  const {mw,mh,gap,row}=sz;
  const lCount=Math.ceil(r0/2),rCount=Math.floor(r0/2);
  const H=Math.max(200,lCount*row+40);
  const W=(T*2-1)*(mw+gap)+40;
  const svg=_mkSvg(W,H);
  const lRounds=rounds.map(r=>r.slice(0,Math.ceil(r.length/2)));
  const rRounds=rounds.map(r=>r.slice(Math.ceil(r.length/2)));
  const lxFn=(ri)=>ri*(mw+gap)+20;
  const lcyFn=(ri,mi)=>_cy_top(ri,mi,mh,row);
  const rxFn=(ri)=>W-20-mw-ri*(mw+gap);
  const rcyFn=(ri,mi)=>_cy_top(ri,mi,mh,row);
  _drawLinks(svg,lRounds,lxFn,lcyFn,'right',sz);
  lRounds.forEach((matches,ri)=>{
    _rlabel(svg,lxFn(ri)+mw/2,12,ri,T);
    matches.forEach((m,mi)=>_mboxH(svg,lxFn(ri),lcyFn(ri,mi),m,ri,mi,sz));
  });
  if(rCount>0){
    _drawLinks(svg,rRounds,rxFn,rcyFn,'left',sz);
    rRounds.forEach((matches,ri)=>{
      if(!matches.length)return;
      _rlabel(svg,rxFn(ri)+mw/2,12,ri,T);
      matches.forEach((m,mi)=>_mboxH(svg,rxFn(ri),rcyFn(ri,mi),m,ri,mi,sz));
    });
  }
  _wrap(wrap,svg);
}

/* E: 위아래→가운데, 이름 세로 */
function renderBracketE(wrap){
  const rounds=S.matches,T=rounds.length,r0=rounds[0].length;
  const availW=_getAvailW(wrap);
  const sz=_calcSizes(rounds,availW);
  const {mw,mh,gap,row}=sz;
  const bw=Math.max(26,Math.floor(mh*1.4));
  const colW=bw*2+20;
  const colGap=Math.max(20,gap);
  const tCount=Math.ceil(r0/2),bCount=Math.floor(r0/2);
  const padY=mh+20;
  const halfH=Math.max(120,tCount*row+padY*2);
  const H=halfH*2;
  const W=T*(colW+colGap)+40;
  const svg=_mkSvg(W,H);
  const xFn=(ri)=>ri*(colW+colGap)+20+colW/2;
  const topRounds=rounds.map(r=>r.slice(0,Math.ceil(r.length/2)));
  const tcyFn=(ri,mi)=>_vtree_cy(ri,mi,padY,row,'down');
  const botRounds=rounds.map(r=>r.slice(Math.ceil(r.length/2)));
  const bcyFn=(ri,mi)=>_vtree_cy(ri,mi,H-padY,row,'up');
  _drawLinksBC(svg,topRounds,xFn,tcyFn);
  topRounds.forEach((matches,ri)=>{
    if(!matches.length)return;
    _rlabel(svg,xFn(ri),12,ri,T);
    matches.forEach((m,mi)=>_mboxV(svg,xFn(ri),tcyFn(ri,mi),m,ri,mi,sz));
  });
  if(bCount>0){
    _drawLinksBC(svg,botRounds,xFn,bcyFn);
    botRounds.forEach((matches,ri)=>{
      if(!matches.length)return;
      matches.forEach((m,mi)=>_mboxV(svg,xFn(ri),bcyFn(ri,mi),m,ri,mi,sz));
    });
  }
  _wrap(wrap,svg);
}

/* ── 다음 라운드 추가 ── */
function addNextRound(){
  if(!S.matches||!S.matches.length){toast('대진표가 없어요','error');return;}
  const lastRound=S.matches[S.matches.length-1];
  const allDone=lastRound.every(m=>m.winner);
  if(!allDone){toast('이번 라운드 모든 경기 승자를 먼저 결정해주세요','info');return;}

  const winners=lastRound.map(m=>m.winner);
  if(winners.length<=1){toast('더 이상 라운드를 추가할 수 없어요','info');return;}

  const next=[];
  // 부전승 승자가 있으면 다음 라운드 첫 번째 일반 승자와 짝지음
  const byeIdx=lastRound.findIndex(m=>m.bye);
  if(byeIdx>=0){
    const byeWinner=winners[byeIdx];
    const others=winners.filter((_,i)=>i!==byeIdx);
    // 부전승 승자 + 첫 번째 일반 승자
    next.push({p1:byeWinner,p2:others[0]||null,winner:null,bye:!others[0]});
    // 나머지 일반 승자들끼리
    for(let i=1;i<others.length;i+=2){
      const p1=others[i],p2=others[i+1]||null;
      next.push({p1,p2,winner:null,bye:!p2});
    }
  } else {
    for(let i=0;i<winners.length;i+=2){
      const p1=winners[i],p2=winners[i+1]||null;
      next.push({p1,p2,winner:null,bye:!p2});
    }
  }

  S.matches.push(next);
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

/* ── 브라켓 생성 ──
   5명 예시:
   1-0: E (부전승) ─────────────┐
   1-1: A vs B → 승자 ──────────┤→ 2-1: E vs 1-1승자
   1-2: C vs D → 승자 → 2-2 대기┘       → 결승
*/
function generateBracket(pts){
  const players=[...pts];
  const n=players.length;
  if(!n)return[[]];

  const round1=[];
  const isOdd=n%2===1;

  // 홀수면 첫 번째 선수를 1-0 부전승으로
  if(isOdd){
    round1.push({p1:players[0],p2:null,winner:null,bye:true});
  }

  // 나머지 선수들 1-1, 1-2... 배치
  const rest=isOdd?players.slice(1):players;
  for(let i=0;i<rest.length;i+=2){
    round1.push({p1:rest[i],p2:rest[i+1]||null,winner:null,bye:false});
  }

  return[round1];
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

/* ── 대진표 초기화 ── */
function resetBracket(){
  S.matches=null;
  S.matchProc=null;
  S.matchPts=null;
  S.curMatch=0;
  S.proc='ind-rec';
  buildProc();
  toast('대진표가 초기화되었어요','info');
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
