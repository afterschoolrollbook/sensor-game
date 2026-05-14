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
  const hasGender=S.pts.some(p=>p.gender);

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
    if(hasGender&&hasDiv&&hasWeight) key=(p.gender||'미분류')+' / '+(p.division||'미분류')+' / '+(p.weight||'미분류');
    else if(hasGender&&hasDiv) key=(p.gender||'미분류')+' / '+(p.division||'미분류');
    else if(hasGender&&hasWeight) key=(p.gender||'미분류')+' / '+(p.weight||'미분류');
    else if(hasDiv&&hasWeight) key=(p.division||'미분류')+' / '+(p.weight||'미분류');
    else if(hasGender) key=p.gender||'미분류';
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
            ${p.gender?`<span style="font-size:9px;padding:0 4px;border-radius:3px;background:${p.gender==='남'?'rgba(76,201,240,0.2)':'rgba(255,100,150,0.2)'};color:${p.gender==='남'?'#4cc9f0':'#ff6496'}">${p.gender}</span>`:''}
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
  
  const isSel=typeof _linkSel!=='undefined'&&_linkSel&&_linkSel.ri===ri&&_linkSel.mi===mi;

  const r=document.createElementNS('http://www.w3.org/2000/svg','rect');
  r.setAttribute('x',x);r.setAttribute('y',y);r.setAttribute('width',mw);r.setAttribute('height',mh);
  r.setAttribute('rx','4');r.setAttribute('fill',isBye?'#0a0a14':'#0d0d1a');
  r.setAttribute('stroke',isSel?'#4cc9f0':isBye?'#444':'#ffffff');
  r.setAttribute('stroke-width',isSel?'3':'2');
  r.style.cursor='pointer';
  r.addEventListener('click',()=>typeof onMatchClick==='function'&&onMatchClick(ri,mi));
  if(isSel)r.setAttribute('filter','drop-shadow(0 0 6px rgba(76,201,240,.6))');
  svg.appendChild(r);

  const fs=Math.max(8,Math.floor(mh*0.38));
  if(isBye){
    // 부전승: 이름 왼쪽 정렬 + BYE 배지 이름 오른쪽
    const t=document.createElementNS('http://www.w3.org/2000/svg','text');
    t.setAttribute('x',x+6);t.setAttribute('y',cy+fs*0.35);t.setAttribute('text-anchor','start');
    t.setAttribute('fill','#d0d0d0');t.setAttribute('font-size',fs);
    t.setAttribute('font-family','Noto Sans KR,sans-serif');t.setAttribute('font-weight','600');
    t.style.cursor='pointer';
    t.addEventListener('click',()=>typeof onMatchClick==='function'&&onMatchClick(ri,mi));
    t.textContent=p1.name;svg.appendChild(t);
    const bye=document.createElementNS('http://www.w3.org/2000/svg','text');
    bye.setAttribute('x',x+mw-4);bye.setAttribute('y',cy+fs*0.35);bye.setAttribute('text-anchor','end');
    bye.setAttribute('fill','#4cc9f0');bye.setAttribute('font-size',Math.max(7,fs-2));
    bye.setAttribute('font-family','Share Tech Mono,monospace');
    bye.textContent='BYE';svg.appendChild(bye);
  } else {
    const mx=x+mw/2;
    const vl=document.createElementNS('http://www.w3.org/2000/svg','line');
    vl.setAttribute('x1',mx);vl.setAttribute('y1',y);vl.setAttribute('x2',mx);vl.setAttribute('y2',y+mh);
    vl.setAttribute('stroke','rgba(255,255,255,0.2)');vl.setAttribute('stroke-width','1');svg.appendChild(vl);
    const vs=document.createElementNS('http://www.w3.org/2000/svg','text');
    vs.setAttribute('x',mx);vs.setAttribute('y',cy+fs*0.35);vs.setAttribute('text-anchor','middle');
    vs.setAttribute('fill','#e63946');vs.setAttribute('font-size',fs);vs.setAttribute('font-family','Bebas Neue,cursive');
    vs.textContent='VS';svg.appendChild(vs);
    [['end',p1,mx-4],['start',p2,mx+4]].forEach(([anchor,p,tx])=>{
      const t=document.createElementNS('http://www.w3.org/2000/svg','text');
      t.setAttribute('x',tx);t.setAttribute('y',cy+fs*0.35);t.setAttribute('text-anchor',anchor);
      t.setAttribute('fill',p?'#d0d0d0':'#2a2a3e');t.setAttribute('font-size',fs);
      t.setAttribute('font-family','Noto Sans KR,sans-serif');t.setAttribute('font-weight','600');
      t.style.cursor='pointer';
      t.addEventListener('click',()=>typeof onMatchClick==='function'&&onMatchClick(ri,mi));
      t.textContent=p?p.name:'?';svg.appendChild(t);
    });
  }
  const num=document.createElementNS('http://www.w3.org/2000/svg','text');
  num.setAttribute('x',x+3);num.setAttribute('y',y+8);num.setAttribute('fill',isBye?'#4cc9f0':'#e63946');
  num.setAttribute('font-size','7');num.setAttribute('font-family','Share Tech Mono,monospace');
  num.textContent=`${ri+1}-${mi+1}`;svg.appendChild(num);
}

/* 세로형 박스 (B/C/E용): 이름을 한 글자씩 세로로 */
function _mboxV(svg,cx,cy,match,ri,mi,sz){
  const {mw,mh}=sz;
  const bw=Math.max(26,Math.floor(mh*1.4));
  const fs=Math.max(9,Math.floor(bw*0.52));
  const lh=fs+3;
  const p1=match.p1,p2=match.p2;
  const isBye=p1&&!p2;
  

  const n1=p1?p1.name:'?',n2=p2?p2.name:'?';

  if(isBye){
    // 부전승: 박스 하나만, 이름 세로, BYE 박스 하단
    const bh=n1.length*lh+24;
    const x1=cx-bw/2,y1=cy-bh/2;
    const r=document.createElementNS('http://www.w3.org/2000/svg','rect');
    r.setAttribute('x',x1);r.setAttribute('y',y1);r.setAttribute('width',bw);r.setAttribute('height',bh);
    r.setAttribute('rx','4');r.setAttribute('fill','#0a0a14');
    r.setAttribute('stroke','#555555');r.setAttribute('stroke-width','2');
    svg.appendChild(r);
    n1.split('').forEach((ch,i)=>{
      const t=document.createElementNS('http://www.w3.org/2000/svg','text');
      t.setAttribute('x',x1+bw/2);t.setAttribute('y',y1+10+i*lh+fs);
      t.setAttribute('text-anchor','middle');t.setAttribute('fill','#d0d0d0');
      t.setAttribute('font-size',fs);t.setAttribute('font-family','Noto Sans KR,sans-serif');t.setAttribute('font-weight','600');
      t.textContent=ch;svg.appendChild(t);
    });
    // BYE 배지 — 박스 하단 중앙 (이름 아래)
    const bye=document.createElementNS('http://www.w3.org/2000/svg','text');
    bye.setAttribute('x',x1+bw/2);bye.setAttribute('y',y1+bh-4);bye.setAttribute('text-anchor','middle');
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
  r1.setAttribute('stroke','#ffffff');r1.setAttribute('stroke-width','2');
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
  r2.setAttribute('stroke','#ffffff');r2.setAttribute('stroke-width','2');
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
  const LN=(x1,y1,x2,y2)=>{
    const l=document.createElementNS('http://www.w3.org/2000/svg','line');
    l.setAttribute('x1',x1);l.setAttribute('y1',y1);l.setAttribute('x2',x2);l.setAttribute('y2',y2);
    l.setAttribute('stroke','#ffffff');l.setAttribute('stroke-width','2');svg.appendChild(l);
  };
  rounds.forEach((matches,ri)=>{
    if(ri>=rounds.length-1)return;
    const nextRound=rounds[ri+1];
    const byeIdx=matches.findIndex(m=>m.bye);

    if(byeIdx>=0){
      // bye(0번)와 1번 매치가 다음 라운드 0번으로 연결
      const x=xFn(ri),nx=xFn(ri+1);
      const lx=dir==='right'?x+mw:x;
      const rlx=dir==='right'?nx:nx+mw;
      const midX=(lx+rlx)/2;
      const byeY=cyFn(ri,0);
      const m1Y=cyFn(ri,1);
      const toY=cyFn(ri+1,0);
      const midY=(byeY+m1Y)/2;
      // bye → midY
      LN(lx,byeY,midX,byeY);
      LN(midX,byeY,midX,m1Y);
      // 1번 → midY
      LN(lx,m1Y,midX,m1Y);
      // midY → 다음 라운드
      LN(midX,midY,rlx,midY);
      // 나머지 일반 매치들 (2,3), (4,5)...
      const normals=matches.slice(1); // bye 제외
      for(let i=1;i<normals.length;i+=2){
        const fromY0=cyFn(ri,i+1);
        const fromY1=cyFn(ri,i+2);
        const ntoY=cyFn(ri+1,Math.floor((i+1)/2));
        const nmidX=(lx+rlx)/2;
        const nmidY=(fromY0+fromY1)/2;
        LN(lx,fromY0,nmidX,fromY0);
        LN(lx,fromY1,nmidX,fromY1);
        LN(nmidX,fromY0,nmidX,fromY1);
        LN(nmidX,nmidY,rlx,nmidY);
      }
    } else {
      matches.forEach((match,mi)=>{
        const x=xFn(ri),nx=xFn(ri+1);
        const fromY=cyFn(ri,mi),toY=cyFn(ri+1,Math.floor(mi/2));
        const lx=dir==='right'?x+mw:x;
        const rlx=dir==='right'?nx:nx+mw;
        const midX=(lx+rlx)/2;
        LN(lx,fromY,midX,fromY);
        if(mi%2===1){
          const prevY=cyFn(ri,mi-1);
          LN(midX,prevY,midX,fromY);
          LN(midX,toY,rlx,toY);
        }
      });
    }
  });
}

/* 공통: 연결선 그리기 (수직, B/C/E용) */
function _drawLinksBC(svg,rounds,xFn,cyFn){
  const LN=(x1,y1,x2,y2)=>{
    const l=document.createElementNS('http://www.w3.org/2000/svg','line');
    l.setAttribute('x1',x1);l.setAttribute('y1',y1);
    l.setAttribute('x2',x2);l.setAttribute('y2',y2);
    l.setAttribute('stroke','#ffffff');l.setAttribute('stroke-width','2');
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

/* ── HTML flex 기반 공통 대진표 렌더러 ── */
function _renderBracketHTML(wrap, rounds, direction, reversed){
  const T=rounds.length;
  // 1라운드 매치 수 → 전체 슬롯 깊이 기준
  const r0len=rounds[0].length;
  // 슬롯 1개당 고정 높이 (px). 박스 높이 ~70px + 위아래 여백
  const SLOT_H=90;

  const outerWrap=document.createElement('div');
  outerWrap.style.cssText='position:relative;overflow:auto;padding-bottom:8px;';
  outerWrap.classList.add('sgp-scroll-root'); // _stripInnerScroll 제외 대상

  const container=document.createElement('div');
  // 전체 높이 = 1라운드 슬롯 수 × SLOT_H + 라벨 높이
  const totalH=r0len*SLOT_H+32;
  container.style.cssText=`display:flex;flex-direction:${reversed?'row-reverse':'row'};gap:40px;align-items:flex-start;padding:8px 8px 24px 8px;min-width:max-content;height:${totalH}px;`;

  // 재귀 cy 계산: fromA/fromB 우선, 없으면 mi*2 폴백
  const calcCy=(ri,mi)=>{
    if(ri===0)return mi*SLOT_H+SLOT_H/2;
    const m=rounds[ri][mi];
    let srcA,srcB;
    if(m&&m.fromA){
      const [fari,fami]=m.fromA.split('-').map(Number);
      srcA=fari===ri-1?fami:mi*2;
    } else { srcA=mi*2; }
    if(m&&m.fromB){
      const [fbri,fbmi]=m.fromB.split('-').map(Number);
      srcB=fbri===ri-1?fbmi:mi*2+1;
    } else { srcB=null; } // 직행(bye): fromB 없으면 null
    const cyA=calcCy(ri-1,srcA);
    if(srcB===null) return cyA; // 직행은 srcA와 같은 높이
    const cyB=srcB<rounds[ri-1].length?calcCy(ri-1,srcB):cyA;
    return(cyA+cyB)/2;
  };

  // direction별 col 세로 정렬 오프셋
  const totalSlotH=r0len*SLOT_H;

  rounds.forEach((matches,ri)=>{
    const col=document.createElement('div');
    col.dataset.col=ri;
    col.style.cssText=`display:flex;flex-direction:column;height:100%;width:180px;flex-shrink:0;`;

    // 라운드 라벨
    const lbl=document.createElement('div');
    const names=['1라운드','2라운드','3라운드','4라운드','5라운드'];
    const name=ri===T-1&&T>1?'결승':ri===T-2&&T>2?'준결승':names[ri]||`${ri+1}라운드`;
    lbl.style.cssText='font-size:9px;color:#aaaaaa;letter-spacing:2px;font-family:Share Tech Mono,monospace;text-align:center;margin-bottom:0;height:24px;line-height:24px;flex-shrink:0;';
    lbl.textContent=name;
    col.appendChild(lbl);

    const matchArea=document.createElement('div');
    matchArea.style.cssText=`flex:1;position:relative;`;

    matches.forEach((m,mi)=>{
      const isBye=m.p1&&!m.p2;
      const isSel=typeof _linkSel!=='undefined'&&_linkSel&&_linkSel.ri===ri&&_linkSel.mi===mi;
      const isCur=typeof isCurrentMatchIdx==='function'&&isCurrentMatchIdx(ri,mi);
      const p1=m.p1,p2=m.p2;

      // direction별 offset 적용
      const dirOff_=()=>{
        const usedH=matches.length*SLOT_H;
        if(direction==='bottom') return totalSlotH-usedH;
        if(direction==='center') return (totalSlotH-usedH)/2;
        return 0;
      };
      // calcCy는 matchArea 기준 상대값을 반환 (라벨 24px 이미 matchArea 밖)
      const slotCenterY=(ri===0?dirOff_():0)+calcCy(ri,mi);

      const box=document.createElement('div');
      box.dataset.ri=ri;box.dataset.mi=mi;
      let borderColor=isSel?'#4cc9f0':isCur?'#e63946':m.winner?'#1a4a2a':isBye?'#444444':'#ffffff';
      box.style.cssText=`
        position:absolute;left:0;right:0;
        transform:translateY(-50%);
        top:${slotCenterY}px;
        border-radius:6px;overflow:hidden;cursor:pointer;
        border:${isSel||isCur?'2.5px':'2px'} solid ${borderColor};
        width:180px;
        ${isSel?'box-shadow:0 0 8px rgba(76,201,240,.4);':isCur?'box-shadow:0 0 10px rgba(230,57,70,.25);':''}
      `;
      const _capturedMatch=m;
      const _matchId=`${ri}-${mi}-${Math.random().toString(36).slice(2,7)}`;
      box.dataset.matchId=_matchId;
      _capturedMatch._domId=_matchId;
      box.addEventListener('click',()=>typeof onMatchClick==='function'&&onMatchClick(ri,mi,_capturedMatch));

      // 헤더
      const header=document.createElement('div');
      header.style.cssText='display:flex;justify-content:center;align-items:center;gap:8px;padding:3px 6px;background:#080810;';

      // 경기 레이블: 그룹명(_groupLabel)이 있으면 "체급 N경기", 없으면 "N경기"
      const grpLabel=m._groupLabel||null;
      const grpIdx=(m._matchIdx!=null)?m._matchIdx:(mi+1);
      const gameCountLabel=grpLabel?`${grpLabel} ${grpIdx}경기`:`${mi+1}경기`;

      header.innerHTML=`<span style="font-size:9px;color:${isCur?'#e63946':'#aaaaaa'};font-weight:700;font-family:Share Tech Mono,monospace;">${ri+1}-${mi+1}</span><span style="font-size:9px;color:#ffffff;font-weight:700;font-family:Share Tech Mono,monospace;">${gameCountLabel}</span>`;
      box.appendChild(header);

      if(isBye){
        const row=document.createElement('div');
        row.style.cssText='display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 12px;background:#0a0a14;';
        if(p1&&p1.color){const dot=document.createElement('div');dot.style.cssText=`width:6px;height:6px;border-radius:50%;background:${p1.color};flex-shrink:0;`;row.appendChild(dot);}
        const nm=document.createElement('span');nm.style.cssText='font-size:13px;font-weight:600;color:#d0d0d0;text-align:center;white-space:nowrap;';
        const _hn=window._hideNames||false;
        nm.textContent=p1?((_hn?p1.name.replace(/\s*\(.+\)/,''):p1.name)):'?';
        row.appendChild(nm);
        // BYE 배지 — 이름 옆
        const byeBadge=document.createElement('span');
        byeBadge.style.cssText='font-size:9px;color:#4cc9f0;font-family:Share Tech Mono,monospace;flex-shrink:0;';
        byeBadge.textContent='BYE';
        row.appendChild(byeBadge);
        box.appendChild(row);
      } else {
        // 가로 한 줄: [dot] 이름1  VS  이름2 [dot]
        const row=document.createElement('div');
        row.style.cssText='display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 12px;background:#0d0d1a;width:100%;';

        const mkName=(p,isWin,isLose)=>{
          const span=document.createElement('span');
          span.style.cssText=`font-size:12px;font-weight:${isWin?'700':'500'};color:${p?(isWin?'#fff':isLose?'#555':'#d0d0d0'):'#2a2a3e'};white-space:nowrap;`;
          const _hn=window._hideNames||false;
          span.textContent=p?(_hn?p.name.replace(/\s*\(.+\)/,''):p.name):'?';
          return span;
        };

        const isW1=m.winner&&m.winner===p1,isW2=m.winner&&m.winner===p2;
        const vs=document.createElement('span');
        vs.style.cssText='font-size:11px;color:#e63946;font-family:Bebas Neue,cursive;letter-spacing:1px;flex-shrink:0;padding:0 2px;';
        vs.textContent='VS';

        const mk1=mkName(p1,isW1,!isW1&&!!m.winner);
        const mk2=mkName(p2,isW2,!isW2&&!!m.winner);

        // 컬러 닷
        if(p1&&p1.color){const d=document.createElement('span');d.style.cssText=`display:inline-block;width:6px;height:6px;border-radius:50%;background:${p1.color};margin-right:4px;vertical-align:middle;`;row.appendChild(d);}
        row.appendChild(mk1);
        row.appendChild(vs);
        if(p2&&p2.color){const d=document.createElement('span');d.style.cssText=`display:inline-block;width:6px;height:6px;border-radius:50%;background:${p2.color};margin-right:4px;vertical-align:middle;`;row.appendChild(d);}
        row.appendChild(mk2);
        box.appendChild(row);
      }
      matchArea.appendChild(box);
    });

    col.appendChild(matchArea);
    container.appendChild(col);
  });

  outerWrap.appendChild(container);
  wrap.appendChild(outerWrap);

  // 연결선: cy=재귀, left=DOM실측, direction 반영
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const LABEL_H=24,PAD=8,BOX_W=180;
    const W=container.scrollWidth,H=container.scrollHeight+40;

    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.style.cssText='position:absolute;top:0;left:0;pointer-events:none;overflow:visible;';
    svg.setAttribute('width',W);svg.setAttribute('height',H);

    const cr=container.getBoundingClientRect();

    // direction별 각 라운드 matchArea top offset
    const dirOff=(ri)=>{
      const usedH=rounds[ri].length*SLOT_H;
      if(direction==='bottom') return totalSlotH-usedH;
      if(direction==='center') return (totalSlotH-usedH)/2;
      return 0;
    };

    // cy 재귀: fromA/fromB 우선, 없으면 mi*2 폴백
    const getBoxCy=(ri,mi)=>{
      if(ri===0) return LABEL_H+PAD+dirOff(0)+mi*SLOT_H+SLOT_H/2;
      const m=rounds[ri][mi];
      let srcA,srcB;
      if(m&&m.fromA){
        const [fari,fami]=m.fromA.split('-').map(Number);
        srcA=fari===ri-1?fami:mi*2;
      } else { srcA=mi*2; }
      if(m&&m.fromB){
        const [fbri,fbmi]=m.fromB.split('-').map(Number);
        srcB=fbri===ri-1?fbmi:mi*2+1;
      } else { srcB=null; } // 직행(bye): fromB 없으면 null 표시
      const cyA=getBoxCy(ri-1,srcA);
      // fromB가 없는 직행이면 cyA만 사용 (srcA와 같은 높이에 배치)
      if(srcB===null) return cyA;
      const cyB=srcB<rounds[ri-1].length?getBoxCy(ri-1,srcB):cyA;
      return(cyA+cyB)/2;
    };

    const getBox=(ri,mi)=>{
      const colEl=container.querySelector(`[data-col="${ri}"]`);
      const colR=colEl?colEl.getBoundingClientRect():null;
      const left=colR?colR.left-cr.left:PAD+ri*220;
      const right=colR?colR.right-cr.left:left+BOX_W;
      // DOM 실측: 박스 중앙 y를 직접 읽어 선이 정확히 박스 중앙에 연결되도록
      const boxEl=colEl?colEl.querySelector(`[data-ri="${ri}"][data-mi="${mi}"]`):null;
      let cy;
      if(boxEl){
        const bR=boxEl.getBoundingClientRect();
        cy=bR.top-cr.top+(bR.height/2);
      } else {
        cy=getBoxCy(ri,mi);
      }
      return{left,right,cy};
    };

    const PATH=(d)=>{
      const p=document.createElementNS('http://www.w3.org/2000/svg','path');
      p.setAttribute('d',d);
      p.setAttribute('stroke','#ffffff');
      p.setAttribute('stroke-width','2');
      p.setAttribute('fill','none');
      p.setAttribute('stroke-linecap','square');
      p.setAttribute('stroke-linejoin','miter');
      svg.appendChild(p);
    };

    rounds.forEach((matches,ri)=>{
      if(ri>=rounds.length-1)return;
      const nextMatches=rounds[ri+1];
      nextMatches.forEach((nm,nmi)=>{
        // fromA/fromB 우선, 없으면 mi*2 폴백
        let srcA,srcB;
        if(nm.fromA){
          const [fari,fami]=nm.fromA.split('-').map(Number);
          srcA=fari===ri?fami:nmi*2;
        } else { srcA=nmi*2; }
        if(nm.fromB){
          const [fbri,fbmi]=nm.fromB.split('-').map(Number);
          srcB=fbri===ri?fbmi:nmi*2+1;
        } else { srcB=nmi*2+1; }
        const hasB=nm.fromB!=null && srcB<matches.length;
        const a=getBox(ri,srcA);
        const b=hasB?getBox(ri,srcB):null;
        const t=getBox(ri+1,nmi);
        if(!a||!t)return;

        if(reversed){
          // 선이 박스 왼쪽에서 나감
          const ax=a.left, bx=b?b.left:a.left;
          const tx=t.right;
          const ay=a.cy, ty=t.cy;
          const midX=(ax+tx)/2;
          if(b){
            const by=b.cy;
            const midY=(ay+by)/2;
            // ㄷ자: a ←── midX, b ←── midX, 세로선, midY → t.cy
            PATH(`M${ax},${ay} H${midX}`);
            PATH(`M${bx},${by} H${midX}`);
            PATH(`M${midX},${ay} V${by}`);
            PATH(`M${midX},${midY} H${tx}`);
          } else {
            // 직행(bye): ay와 ty가 같으면 직선, 다르면 꺾인선
            if(Math.abs(ay-ty)<1){
              PATH(`M${ax},${ay} H${tx}`);
            } else {
              PATH(`M${ax},${ay} H${midX} V${ty} H${tx}`);
            }
          }
        } else {
          // 선이 박스 오른쪽에서 나감
          const ax=a.right, bx=b?b.right:a.right;
          const tx=t.left;
          const ay=a.cy, ty=t.cy;
          const midX=(ax+tx)/2;
          if(b){
            const by=b.cy;
            const midY=(ay+by)/2;
            // ㄷ자: a ──→ midX, b ──→ midX, 세로선, midY → t.cy
            PATH(`M${ax},${ay} H${midX}`);
            PATH(`M${bx},${by} H${midX}`);
            PATH(`M${midX},${ay} V${by}`);
            PATH(`M${midX},${midY} H${tx}`);
          } else {
            // 직행(bye): ay와 ty가 같으면 직선, 다르면 꺾인선
            if(Math.abs(ay-ty)<1){
              PATH(`M${ax},${ay} H${tx}`);
            } else {
              PATH(`M${ax},${ay} H${midX} V${ty} H${tx}`);
            }
          }
        }
      });
    });

    outerWrap.appendChild(svg);
  }));
}


/* ────────────────────────────────────────────────
   가로 트리 렌더러 (B: 아래→위, C: 위→아래)
   1라운드가 가로로 나열, 다음 라운드가 위 or 아래로 쌓임
──────────────────────────────────────────────── */
function _renderBracketHoriz(wrap, rounds, direction){
  const BOX_W=160, BOX_H=52, ROW_GAP=48, COL_GAP=20, PAD=16, LABEL_H=20;
  const T=rounds.length;
  const r0len=rounds[0].length;

  // 각 매치의 중앙 X: fromA/fromB 우선, 없으면 mi*2 폴백
  const calcCx=(ri,mi)=>{
    if(ri===0) return PAD+mi*(BOX_W+COL_GAP)+BOX_W/2;
    const m=rounds[ri][mi];
    let srcA,srcB;
    if(m&&m.fromA){
      const [fari,fami]=m.fromA.split('-').map(Number);
      srcA=fari===ri-1?fami:mi*2;
    } else { srcA=mi*2; }
    if(m&&m.fromB){
      const [fbri,fbmi]=m.fromB.split('-').map(Number);
      srcB=fbri===ri-1?fbmi:mi*2+1;
    } else { srcB=mi*2+1; }
    const cxA=calcCx(ri-1,srcA);
    const cxB=srcB<rounds[ri-1].length?calcCx(ri-1,srcB):cxA;
    return(cxA+cxB)/2;
  };

  // 각 라운드의 top Y
  // bottom-up: ri=0이 맨 아래
  // top-down:  ri=0이 맨 위
  const rowY=(ri)=>{
    const labelOff=LABEL_H+8;
    if(direction==='bottom-up') return labelOff+(T-1-ri)*(BOX_H+ROW_GAP);
    return labelOff+ri*(BOX_H+ROW_GAP);
  };

  const totalW=PAD*2+r0len*(BOX_W+COL_GAP)-COL_GAP;
  const totalH=LABEL_H+8+T*(BOX_H+ROW_GAP)-ROW_GAP+16;

  const outerWrap=document.createElement('div');
  outerWrap.style.cssText='position:relative;overflow:auto;padding-bottom:8px;';

  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width',Math.max(totalW,300));
  svg.setAttribute('height',totalH);
  svg.style.cssText='display:block;overflow:visible;';

  const PATH=(d)=>{
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d',d);
    p.setAttribute('stroke','#ffffff');
    p.setAttribute('stroke-width','2');
    p.setAttribute('fill','none');
    svg.appendChild(p);
  };

  const names=['1라운드','2라운드','3라운드','4라운드','준결승','결승'];
  const getName=(ri)=>ri===T-1&&T>1?'결승':ri===T-2&&T>2?'준결승':names[ri]||`${ri+1}라운드`;

  rounds.forEach((matches,ri)=>{
    const ry=rowY(ri);

    // 라운드 라벨
    const lt=document.createElementNS('http://www.w3.org/2000/svg','text');
    lt.setAttribute('x',calcCx(ri,0));
    lt.setAttribute('y',direction==='bottom-up'?ry-6:ry-6);
    lt.setAttribute('text-anchor','middle');
    lt.setAttribute('fill','#444');lt.setAttribute('font-size','9');
    lt.setAttribute('font-family','Share Tech Mono,monospace');
    lt.textContent=getName(ri); svg.appendChild(lt);

    matches.forEach((m,mi)=>{
      const cx=calcCx(ri,mi);
      const x=cx-BOX_W/2, y=ry;
      const isBye=m.p1&&!m.p2;
      const isCur=typeof isCurrentMatchIdx==='function'&&isCurrentMatchIdx(ri,mi);

      // 박스
      const rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
      rect.setAttribute('x',x);rect.setAttribute('y',y);
      rect.setAttribute('width',BOX_W);rect.setAttribute('height',BOX_H);
      rect.setAttribute('rx','5');
      rect.setAttribute('fill',isBye?'#0a0a14':'#0d0d1a');
      rect.setAttribute('stroke',isCur?'#e63946':isBye?'#444':'#ffffff');
      rect.setAttribute('stroke-width',isCur?'2':'2');
      svg.appendChild(rect);

      // 매치 번호
      const num=document.createElementNS('http://www.w3.org/2000/svg','text');
      num.setAttribute('x',x+5);num.setAttribute('y',y+11);
      num.setAttribute('fill',isBye?'#4cc9f0':'#e63946');
      num.setAttribute('font-size','7');num.setAttribute('font-family','Share Tech Mono,monospace');
      num.textContent=`${ri+1}-${mi+1}`; svg.appendChild(num);

      const cy=y+BOX_H/2;
      if(isBye){
        const t=document.createElementNS('http://www.w3.org/2000/svg','text');
        t.setAttribute('x',cx-14);t.setAttribute('y',cy+5);
        t.setAttribute('text-anchor','middle');t.setAttribute('fill','#d0d0d0');
        t.setAttribute('font-size','12');t.setAttribute('font-weight','600');
        t.setAttribute('font-family','Noto Sans KR,sans-serif');
        t.textContent=m.p1?m.p1.name:'?'; svg.appendChild(t);
        // BYE 배지 — 이름 오른쪽
        const bye=document.createElementNS('http://www.w3.org/2000/svg','text');
        bye.setAttribute('x',x+BOX_W-5);bye.setAttribute('y',cy+5);
        bye.setAttribute('text-anchor','end');bye.setAttribute('fill','#4cc9f0');
        bye.setAttribute('font-size','9');bye.setAttribute('font-family','Share Tech Mono,monospace');
        bye.textContent='BYE'; svg.appendChild(bye);
      } else {
        const vl=document.createElementNS('http://www.w3.org/2000/svg','line');
        vl.setAttribute('x1',cx);vl.setAttribute('y1',y);
        vl.setAttribute('x2',cx);vl.setAttribute('y2',y+BOX_H);
        vl.setAttribute('stroke','rgba(255,255,255,0.15)');vl.setAttribute('stroke-width','1'); svg.appendChild(vl);
        const vs=document.createElementNS('http://www.w3.org/2000/svg','text');
        vs.setAttribute('x',cx);vs.setAttribute('y',cy+5);
        vs.setAttribute('text-anchor','middle');vs.setAttribute('fill','#e63946');
        vs.setAttribute('font-size','11');vs.setAttribute('font-family','Bebas Neue,cursive');
        vs.textContent='VS'; svg.appendChild(vs);
        [[cx-BOX_W/4,'end',m.p1],[cx+BOX_W/4,'start',m.p2]].forEach(([tx,anchor,p])=>{
          const t=document.createElementNS('http://www.w3.org/2000/svg','text');
          t.setAttribute('x',tx);t.setAttribute('y',cy+5);
          t.setAttribute('text-anchor',anchor);
          t.setAttribute('fill',p?'#d0d0d0':'#2a2a3e');
          t.setAttribute('font-size','11');t.setAttribute('font-weight','600');
          t.setAttribute('font-family','Noto Sans KR,sans-serif');
          t.textContent=p?p.name:'?'; svg.appendChild(t);
        });
      }

      // 연결선: 현재 박스 → 다음 라운드
      if(ri<T-1){
        // 다음 라운드에서 현재 박스(ri-mi)를 fromA/fromB로 참조하는 매치 찾기
        const curKey=`${ri}-${mi}`;
        const nextRound=rounds[ri+1];
        let nmi=nextRound.findIndex(nm=>nm.fromA===curKey||nm.fromB===curKey);
        if(nmi<0) nmi=Math.floor(mi/2); // 폴백
        const ncx=calcCx(ri+1,nmi);
        const nry=rowY(ri+1);
        // bottom-up: 박스 위에서 나가서 위쪽 행으로
        // top-down:  박스 아래에서 나가서 아래쪽 행으로
        const fromY=direction==='bottom-up'?y:y+BOX_H;
        const toY=direction==='bottom-up'?nry+BOX_H:nry;
        const midY=(fromY+toY)/2;
        PATH(`M${cx},${fromY} V${midY} H${ncx} V${toY}`);
      }
    });
  });

  outerWrap.appendChild(svg);
  wrap.appendChild(outerWrap);
}

/* ────────────────────────────────────────────────
   A: 세로 트리 (왼→오, 1라운드 위에서 아래로)
   B: 가로 트리 (1라운드 맨 아래 → 결승 맨 위)
   C: 가로 트리 (1라운드 맨 위 → 결승 맨 아래)
   D: 세로 트리 두 개가 양쪽에서 가운데 결승으로
   E: 가로 트리 두 개가 위아래에서 가운데 결승으로
──────────────────────────────────────────────── */
function renderBracketA(wrap){_renderBracketHTML(wrap,S.matches,'top');}
function renderBracketB(wrap){_renderBracketHoriz(wrap,S.matches,'bottom-up');}
function renderBracketC(wrap){_renderBracketHoriz(wrap,S.matches,'top-down');}

function renderBracketD(wrap){
  if(!S.matches||!S.matches.length)return;
  // 각 라운드를 절반으로 나눠 왼쪽/오른쪽 서브트리 구성
  const leftRounds=[], rightRounds=[];
  S.matches.forEach(round=>{
    const h=Math.ceil(round.length/2);
    leftRounds.push(round.slice(0,h));
    rightRounds.push(round.slice(h));
  });
  // 결승은 마지막 라운드 공유 — 왼쪽 마지막 라운드가 결승
  const outerWrap=document.createElement('div');
  outerWrap.style.cssText='display:flex;flex-direction:row;align-items:center;overflow:auto;padding-bottom:8px;';
  const lDiv=document.createElement('div');
  const rDiv=document.createElement('div');
  // 왼쪽: 정방향 (결승이 오른쪽)
  _renderBracketHTML(lDiv,leftRounds,'top',false);
  // 오른쪽: 역방향 (결승이 왼쪽)
  const rightReversed=[...rightRounds].reverse();
  _renderBracketHTML(rDiv,rightReversed,'top',true);
  outerWrap.appendChild(lDiv);
  outerWrap.appendChild(rDiv);
  wrap.appendChild(outerWrap);
}

function renderBracketE(wrap){
  if(!S.matches||!S.matches.length)return;
  // 각 라운드를 절반으로 나눠 위/아래 서브트리 구성
  const topRounds=[], botRounds=[];
  S.matches.forEach(round=>{
    const h=Math.ceil(round.length/2);
    topRounds.push(round.slice(0,h));
    botRounds.push(round.slice(h));
  });
  const outerWrap=document.createElement('div');
  outerWrap.style.cssText='display:flex;flex-direction:column;overflow:auto;padding-bottom:8px;';
  const tDiv=document.createElement('div');
  const bDiv=document.createElement('div');
  // 위쪽: top-down (결승이 아래)
  _renderBracketHoriz(tDiv,topRounds,'top-down');
  // 아래쪽: bottom-up 역순 (결승이 위)
  _renderBracketHoriz(bDiv,[...botRounds].reverse(),'bottom-up');
  outerWrap.appendChild(tDiv);
  outerWrap.appendChild(bDiv);
  wrap.appendChild(outerWrap);
}


/* ── 다음 라운드 추가 ── */
function addNextRound(){
  if(!S.matches||!S.matches.length){toast('대진표가 없어요','error');return;}
  const lastRound=S.matches[S.matches.length-1];
  const ri=S.matches.length-1;
  if(lastRound.length<=1){toast('더 이상 라운드를 추가할 수 없어요','info');return;}

  const next=[];
  const byeIdx=lastRound.findIndex(m=>m.bye);

  if(byeIdx>=0){
    next.push({
      p1:{name:`${ri+1}-0 승자`,tbd:true},
      p2:{name:`${ri+1}-1 승자`,tbd:true},
      bye:false
    });
    const normals=lastRound.filter((_,i)=>i!==byeIdx);
    for(let i=1;i<normals.length;i+=2){
      next.push({
        p1:{name:`${ri+1}-${i+1} 승자`,tbd:true},
        p2:normals[i+1]?{name:`${ri+1}-${i+2} 승자`,tbd:true}:null,
        bye:!normals[i+1]
      });
    }
  } else {
    for(let i=0;i<lastRound.length;i+=2){
      next.push({
        p1:{name:`${ri+1}-${i+1} 승자`,tbd:true},
        p2:lastRound[i+1]?{name:`${ri+1}-${i+2} 승자`,tbd:true}:null,
        bye:!lastRound[i+1]
      });
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
  let slotNum=1;

  if(isOdd){
    round1.push({p1:{name:`${slotNum++}번`,id:slotNum-1},p2:null,bye:true});
  }

  const rest=isOdd?players.slice(1):players;
  for(let i=0;i<rest.length;i+=2){
    round1.push({
      p1:{name:`${slotNum++}번`,id:slotNum-1},
      p2:{name:`${slotNum++}번`,id:slotNum-1},
      bye:false
    });
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
