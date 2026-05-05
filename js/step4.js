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

  if(S.proc==='ind-tour'||S.proc==='team-tour'){
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

/* ── 토너먼트 대진표 트리 ── */
function buildTournamentTree(wrap){
  const pts=[...S.pts];
  if(!pts.length)return;

  // 저장된 대진표 or 새로 생성
  if(!S.matches||S.matchProc!==S.proc||S.matchPts!==pts.map(p=>p.id).join(',')){
    S.matches=generateBracket(pts);
    S.matchProc=S.proc;
    S.matchPts=pts.map(p=>p.id).join(',');
    S.curMatch=0;
    try{if(typeof updatePv==="function")updatePv();}catch(e){}
  }

  const rounds=S.matches;

  // 헤더
  const hdr=document.createElement('div');
  hdr.style.cssText='display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;';
  hdr.innerHTML=`
    <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:var(--text3);text-transform:uppercase">🏆 토너먼트 대진표</div>
    <button onclick="shuffleBracket()" style="padding:4px 10px;background:transparent;border:1px solid var(--border);color:var(--text3);border-radius:6px;cursor:pointer;font-size:11px;">🔀 무작위 배정</button>
  `;
  wrap.appendChild(hdr);

  // 대진표 가로 스크롤 컨테이너
  const container=document.createElement('div');
  container.style.cssText='display:flex;gap:12px;overflow-x:auto;padding-bottom:8px;';

  const roundNames=['1라운드','2라운드','준결승','결승','우승'];
  const totalRounds=rounds.length;

  rounds.forEach((matches,ri)=>{
    const col=document.createElement('div');
    col.style.cssText='display:flex;flex-direction:column;gap:8px;min-width:160px;flex-shrink:0;';

    // 라운드 제목
    const rname=ri===totalRounds-1?'결승':ri===totalRounds-2&&totalRounds>2?'준결승':roundNames[ri]||`${ri+1}라운드`;
    const rtitle=document.createElement('div');
    rtitle.style.cssText='font-size:10px;font-weight:700;letter-spacing:2px;color:var(--text3);text-align:center;padding:4px;border-bottom:1px solid var(--border);margin-bottom:4px;';
    rtitle.textContent=rname;
    col.appendChild(rtitle);

    // 매치들
    matches.forEach((match,mi)=>{
      const matchEl=buildMatchCard(match, ri, mi);
      col.appendChild(matchEl);
    });

    container.appendChild(col);
  });

  // 우승자 컬럼
  const winnerCol=document.createElement('div');
  winnerCol.style.cssText='display:flex;flex-direction:column;gap:8px;min-width:120px;flex-shrink:0;align-items:center;justify-content:center;';
  const lastRound=rounds[rounds.length-1];
  const winner=lastRound&&lastRound[0]&&lastRound[0].winner;
  winnerCol.innerHTML=`
    <div style="font-size:10px;font-weight:700;letter-spacing:2px;color:var(--yellow);text-align:center;margin-bottom:8px;">🏆 우승</div>
    <div style="background:rgba(255,214,10,.08);border:2px solid ${winner?'var(--yellow)':'var(--border)'};border-radius:10px;padding:14px 10px;text-align:center;min-width:100px;">
      <div style="font-family:'Bebas Neue',cursive;font-size:18px;color:${winner?'var(--yellow)':'var(--text3)'};">${winner?winner.name:'?'}</div>
    </div>`;
  container.appendChild(winnerCol);

  wrap.appendChild(container);

  // 현재 경기 안내
  const curMatchInfo=getCurrentMatch();
  if(curMatchInfo){
    const info=document.createElement('div');
    info.style.cssText='margin-top:14px;background:rgba(230,57,70,.06);border:1px solid rgba(230,57,70,.2);border-radius:10px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;';
    info.innerHTML=`
      <div>
        <div style="font-size:10px;letter-spacing:2px;color:var(--red);margin-bottom:4px;">▶ 현재 경기</div>
        <div style="font-size:15px;font-weight:700;">${curMatchInfo.p1?.name||'?'} <span style="color:var(--red)">VS</span> ${curMatchInfo.p2?.name||'?'}</div>
      </div>
      <div style="display:flex;gap:8px;">
        <button onclick="recordWin(0)" style="padding:7px 14px;background:rgba(76,201,240,.1);border:1px solid var(--accent);color:var(--accent);border-radius:7px;cursor:pointer;font-size:12px;font-weight:700;">${curMatchInfo.p1?.name||'?'} 승</button>
        <button onclick="recordWin(1)" style="padding:7px 14px;background:rgba(76,201,240,.1);border:1px solid var(--accent);color:var(--accent);border-radius:7px;cursor:pointer;font-size:12px;font-weight:700;">${curMatchInfo.p2?.name||'?'} 승</button>
      </div>`;
    wrap.appendChild(info);
  }
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
  const hdr=document.createElement('div');
  hdr.style.cssText='display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;';
  hdr.innerHTML=`
    <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:var(--text3);text-transform:uppercase">🏁 도전 순서</div>
    <button onclick="shuffleOrder()" style="padding:4px 10px;background:transparent;border:1px solid var(--border);color:var(--text3);border-radius:6px;cursor:pointer;font-size:11px;">🔀 순서 섞기</button>
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

/* ── 브라켓 생성 ── */
function generateBracket(pts){
  // 참가자 복사 (섞기)
  let players=[...pts];
  // 2의 거듭제곱으로 맞추기 (BYE 추가)
  let size=1;
  while(size<players.length)size*=2;
  while(players.length<size)players.push(null); // null = BYE

  const rounds=[];
  let current=players;

  while(current.length>1){
    const matches=[];
    for(let i=0;i<current.length;i+=2){
      const match={p1:current[i],p2:current[i+1],winner:null};
      // BYE 처리: 상대가 null이면 자동 진출
      if(!match.p2)match.winner=match.p1;
      else if(!match.p1)match.winner=match.p2;
      matches.push(match);
    }
    rounds.push(matches);
    // 다음 라운드: 승자들로 구성 (아직 미정은 null)
    current=matches.map(m=>m.winner||null);
  }

  return rounds;
}

/* ── 무작위 배정 ── */
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

  // 다음 라운드 해당 슬롯에 승자 배치
  if(cur.ri+1<S.matches.length){
    const nextMatchIdx=Math.floor(cur.mi/2);
    const isFirst=cur.mi%2===0;
    const nextMatch=S.matches[cur.ri+1][nextMatchIdx];
    if(isFirst)nextMatch.p1=winner;
    else nextMatch.p2=winner;
    // BYE 자동처리
    if(!nextMatch.p2&&nextMatch.p1)nextMatch.winner=nextMatch.p1;
    if(!nextMatch.p1&&nextMatch.p2)nextMatch.winner=nextMatch.p2;
  }

  // localStorage로 display.html에 현재경기 전달
  const next=getCurrentMatch();
  if(next){
    try{localStorage.setItem('sgp_current_match',JSON.stringify({p1:next.p1?.name,p2:next.p2?.name}));}catch(e){}
  }

  buildProc();
  try{if(typeof updatePv==='function')updatePv();}catch(e){}
  toast(winner.name+' 승리!','success');
}

/* ══ 참가자 보기 팝업 ══ */
let _ptsSort='all';

function openPtsPopup(){
  if(!S.pts.length){toast('참가자를 먼저 등록해주세요','error');return;}
  _ptsSort='all';
  document.getElementById('pts-popup').style.display='flex';
  renderPtsPopup();
}

function closePtsPopup(){
  document.getElementById('pts-popup').style.display='none';
}

function sortPtsPopup(by){
  _ptsSort=by;
  document.querySelectorAll('.pts-sort-btn').forEach(b=>{
    const isActive=b.id==='sort-'+by;
    b.style.borderColor=isActive?'var(--red)':'var(--border)';
    b.style.background=isActive?'rgba(230,57,70,.15)':'transparent';
    b.style.color=isActive?'var(--text)':'var(--text3)';
  });
  renderPtsPopup();
}

function renderPtsPopup(){
  const list=document.getElementById('pts-popup-list');
  const actions=document.getElementById('pts-popup-actions');
  const title=document.getElementById('pts-popup-title');
  title.textContent='참가자 명단 (총 '+S.pts.length+'명)';

  // 그룹핑
  const groups=groupPts(_ptsSort);
  list.innerHTML='';

  Object.entries(groups).forEach(([gname,members])=>{
    const sec=document.createElement('div');
    sec.style.cssText='margin-bottom:16px;';
    sec.innerHTML=`
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:var(--text3);text-transform:uppercase;">${gname}</div>
        <span style="font-size:10px;color:var(--text3);background:var(--card2);padding:1px 7px;border-radius:10px;">${members.length}명</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px;">
        ${members.map((p,i)=>`
          <div style="display:flex;align-items:center;gap:7px;padding:7px 10px;background:var(--card);border:1px solid var(--border);border-radius:7px;">
            <span style="font-size:10px;color:var(--text3);width:18px;font-family:'Share Tech Mono',monospace;">${i+1}</span>
            <div style="width:6px;height:6px;border-radius:50%;background:${p.color||'var(--text3)'};flex-shrink:0;"></div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
              ${p.weight||p.division?`<div style="font-size:10px;color:var(--text3);">${[p.division,p.weight].filter(Boolean).join(' / ')}</div>`:''}
            </div>
          </div>`).join('')}
      </div>`;
    list.appendChild(sec);
  });

  // 하단 액션 버튼 — 그룹별 리그/토너먼트
  actions.innerHTML='';
  const groupEntries=Object.entries(groups);

  if(groupEntries.length===1&&groupEntries[0][0]==='전체'){
    // 그룹 없을 때: 전체로 리그/토너먼트
    actions.innerHTML=`
      <button onclick="makeLeague(null);closePtsPopup();" style="padding:8px 16px;background:rgba(76,201,240,.1);border:1px solid var(--accent);color:var(--accent);border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;">📋 리그전 만들기</button>
      <button onclick="makeTournament(null);closePtsPopup();" style="padding:8px 16px;background:rgba(230,57,70,.1);border:1px solid var(--red);color:var(--red);border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;">🏆 토너먼트 만들기</button>`;
  } else {
    // 그룹별 버튼
    groupEntries.forEach(([gname,members])=>{
      const btn1=document.createElement('button');
      btn1.style.cssText='padding:6px 12px;background:rgba(76,201,240,.08);border:1px solid var(--accent);color:var(--accent);border-radius:7px;cursor:pointer;font-size:11px;font-weight:600;';
      btn1.innerHTML=`📋 ${gname} 리그`;
      btn1.onclick=()=>{makeLeague(members,gname);closePtsPopup();};
      actions.appendChild(btn1);

      const btn2=document.createElement('button');
      btn2.style.cssText='padding:6px 12px;background:rgba(230,57,70,.08);border:1px solid var(--red);color:var(--red);border-radius:7px;cursor:pointer;font-size:11px;font-weight:600;';
      btn2.innerHTML=`🏆 ${gname} 토너먼트`;
      btn2.onclick=()=>{makeTournament(members,gname);closePtsPopup();};
      actions.appendChild(btn2);
    });
  }
}

function groupPts(by){
  const groups={};
  S.pts.forEach(p=>{
    let key;
    if(by==='division') key=p.division||'미분류';
    else if(by==='weight') key=p.weight||'미분류';
    else if(by==='team') key=p.team||'개인';
    else key='전체';
    if(!groups[key])groups[key]=[];
    groups[key].push(p);
  });
  return groups;
}

function makeLeague(members,label){
  const pts=members||S.pts;
  // 리그전: 모든 참가자가 서로 한 번씩 대결 (라운드로빈)
  const matches=[];
  for(let i=0;i<pts.length;i++){
    for(let j=i+1;j<pts.length;j++){
      matches.push({p1:pts[i],p2:pts[j],winner:null});
    }
  }
  S.matches=[matches];
  S.matchProc='league';
  S.matchLabel=label||'전체';
  S.proc='ind-tour';
  S.matchPts=pts.map(p=>p.id).join(',');
  S.curMatch=0;
  buildProc();
  try{if(typeof updatePv==='function')updatePv();}catch(e){}
  toast((label||'전체')+' 리그전 생성! ('+matches.length+'경기)','success');
}

function makeTournament(members,label){
  const pts=members||S.pts;
  S.matches=generateBracket([...pts].sort(()=>Math.random()-.5));
  S.matchProc='tournament';
  S.matchLabel=label||'전체';
  S.proc='ind-tour';
  S.matchPts=pts.map(p=>p.id).join(',');
  S.curMatch=0;
  buildProc();
  try{if(typeof updatePv==='function')updatePv();}catch(e){}
  toast((label||'전체')+' 토너먼트 생성! ('+pts.length+'명)','success');
}
