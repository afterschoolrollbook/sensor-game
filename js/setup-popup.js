/* ══ 참가자 팝업 ══ */
let _ptsSortKeys=[];
let _ptsGroups={};
let _ptsMode='tournament';

function openPtsPopup(){
  document.activeElement?.blur();
  if(!S.pts.length){toast('참가자를 먼저 등록해주세요','error');return;}
  // 1차: localStorage에 미리 저장 → bracket-window 로드 즉시 읽을 수 있음
  try{localStorage.setItem('sgp_bw_pts',JSON.stringify(S.pts));}catch(e){}
  if(window._ptsWin&&!window._ptsWin.closed){
    // 이미 열려 있으면 최신 데이터 전송 후 포커스
    window._ptsWin.postMessage({type:'sgp_pts_update',pts:S.pts},'*');
    window._ptsWin.focus();
    return;
  }
  // 2차: bracket-window가 load 완료 후 sgp_pts_request를 보내면
  //       setup.html의 message 리스너가 sgp_pts_update로 응답함 (확실한 흐름)
  window._ptsWin=window.open('bracket-window.html','sgp_bracket','width=1000,height=720,resizable=yes,scrollbars=no');
}

function closePtsPopup(){
  if(window._ptsWin&&!window._ptsWin.closed)window._ptsWin.close();
  document.getElementById('pts-popup').style.display='none';
}

function togglePtsSort(key){
  const idx=_ptsSortKeys.indexOf(key);
  if(idx>=0)_ptsSortKeys.splice(idx,1);else _ptsSortKeys.push(key);
  const on=_ptsSortKeys.includes(key);
  const btn=document.getElementById('sort-'+key);
  btn.style.borderColor=on?'var(--accent)':'var(--border)';
  btn.style.background=on?'rgba(76,201,240,.15)':'transparent';
  btn.style.color=on?'var(--accent)':'var(--text3)';
  renderPtsPopup();
}

function groupPts(keys){
  const groups={};
  S.pts.forEach(p=>{
    let key=!keys.length?'전체':keys.map(k=>
      k==='division'?p.division||'미분류':
      k==='weight'?p.weight||'미분류':
      k==='gender'?p.gender||'미분류':
      p.team||'개인'
    ).filter(Boolean).join(' / ');
    if(!groups[key])groups[key]=[];
    groups[key].push(p);
  });
  return groups;
}

function renderPtsPopup(){
  const list=document.getElementById('pts-popup-list');
  document.getElementById('pts-popup-title').textContent='참가자 명단 (총 '+S.pts.length+'명)';
  const groups=groupPts(_ptsSortKeys);
  list.innerHTML='';
  Object.entries(groups).sort((a,b)=>a[0].localeCompare(b[0],'ko')).forEach(([gname,members])=>{
    const sec=document.createElement('div');sec.style.cssText='margin-bottom:16px;';
    sec.innerHTML=`
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--border);">
        <span style="font-size:12px;font-weight:700;">${gname}</span>
        <span style="font-size:10px;color:var(--text3);background:var(--card2);padding:1px 8px;border-radius:10px;">${members.length}명</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:5px;">
        ${members.map((p,i)=>`
          <div style="display:flex;align-items:center;gap:6px;padding:6px 9px;background:var(--card);border:1px solid var(--border);border-radius:7px;">
            <span style="font-size:10px;color:var(--text3);width:14px;font-family:'Share Tech Mono',monospace;flex-shrink:0;">${i+1}</span>
            <div style="width:5px;height:5px;border-radius:50%;background:${p.color||'var(--text3)'};flex-shrink:0;"></div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
              ${p.gender?`<span style="font-size:9px;padding:0 4px;border-radius:3px;background:${p.gender==='남'?'rgba(76,201,240,0.2)':'rgba(255,100,150,0.2)'};color:${p.gender==='남'?'var(--accent)':'#ff6496'}">${p.gender}</span>`:''}
              ${p.weight||p.division?`<div style="font-size:9px;color:var(--text3);">${[p.division,p.weight].filter(Boolean).join(' / ')}</div>`:''}
            </div>
          </div>`).join('')}
      </div>`;
    list.appendChild(sec);
  });
}

function confirmPtsGroup(){
  _ptsGroups=groupPts(_ptsSortKeys);
  document.getElementById('pts-step1').style.display='none';
  document.getElementById('pts-step2').style.display='flex';
  document.getElementById('league-overlay').style.display='none';
  setPtsMode('tournament');
  renderOrderArea();
}

function goStep1Popup(){
  document.getElementById('pts-step1').style.display='flex';
  document.getElementById('pts-step2').style.display='none';
}

function setPtsMode(mode){
  _ptsMode=mode;
  document.querySelectorAll('.pts-mode-btn').forEach(b=>{b.style.borderColor='var(--border)';b.style.background='transparent';b.style.color='var(--text3)';});
  const btn=document.getElementById('mode-'+mode);
  btn.style.borderColor=mode==='tournament'?'var(--red)':'var(--accent)';
  btn.style.background=mode==='tournament'?'rgba(230,57,70,.15)':'rgba(76,201,240,.15)';
  btn.style.color=mode==='tournament'?'var(--red)':'var(--accent)';
  const overlay=document.getElementById('league-overlay');
  overlay.style.display=mode==='league'?'flex':'none';
  const genBtn=document.getElementById('btn-generate');
  genBtn.style.opacity=mode==='tournament'?'1':'0.4';
  genBtn.disabled=mode!=='tournament';
}

/* 순서 지정 영역 */
function renderOrderArea(){
  const area=document.getElementById('pts-order-area');
  area.innerHTML='';
  const entries=Object.entries(_ptsGroups).sort((a,b)=>a[0].localeCompare(b[0],'ko'));
  entries.forEach(([gname,members])=>{
    const sec=document.createElement('div');
    sec.style.cssText='margin-bottom:20px;';
    sec.innerHTML=`
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--border);">
        <span style="font-size:12px;font-weight:700;">${gname}</span>
        <span style="font-size:10px;color:var(--text3);background:var(--card2);padding:1px 8px;border-radius:10px;">${members.length}명</span>
        <span style="font-size:10px;color:var(--text3);margin-left:4px;">이름 클릭 → 번호 지정 · 드래그 → 순서 변경</span>
      </div>`;
    const grid=document.createElement('div');
    grid.style.cssText='display:flex;flex-direction:column;gap:4px;';
    grid.dataset.group=gname;
    members.forEach((p,i)=>{
      const row=buildOrderRow(p,i,gname,members);
      grid.appendChild(row);
    });
    initDragSort(grid,gname);
    sec.appendChild(grid);
    area.appendChild(sec);
  });
}

function buildOrderRow(p,i,gname,members){
  const row=document.createElement('div');
  row.draggable=true;
  row.dataset.pid=p.id;
  row.style.cssText='display:flex;align-items:center;gap:8px;padding:7px 10px;background:var(--card);border:1px solid var(--border);border-radius:7px;cursor:grab;user-select:none;transition:all .15s;';
  row.innerHTML=`
    <span class="order-num" style="font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--red);width:20px;font-weight:700;flex-shrink:0;">${i+1}</span>
    <div style="width:6px;height:6px;border-radius:50%;background:${p.color||'var(--text3)'};flex-shrink:0;"></div>
    <span style="flex:1;font-size:13px;font-weight:600;">${p.name}</span>
    ${p.gender?`<span style="font-size:10px;padding:1px 5px;border-radius:3px;background:${p.gender==='남'?'rgba(76,201,240,0.15)':'rgba(255,100,150,0.15)'};color:${p.gender==='남'?'var(--accent)':'#ff6496'}">${p.gender}</span>`:''}
    ${p.weight||p.division?`<span style="font-size:10px;color:var(--text3);">${[p.division,p.weight].filter(Boolean).join(' / ')}</span>`:''}
    <span style="font-size:10px;color:var(--text3);opacity:.5;">≡</span>`;
  // 이름 클릭 → 번호 입력
  row.onclick=e=>{
    if(e.target.tagName==='INPUT')return;
    const cur=parseInt(row.querySelector('.order-num').textContent);
    const input=document.createElement('input');
    input.type='number';input.min=1;input.max=members.length;input.value=cur;
    input.style.cssText='width:40px;font-size:12px;background:var(--bg);border:1px solid var(--accent);border-radius:4px;color:var(--text);text-align:center;padding:2px;';
    const numEl=row.querySelector('.order-num');
    numEl.replaceWith(input);
    input.focus();input.select();
    const apply=()=>{
      const newNum=Math.max(1,Math.min(members.length,parseInt(input.value)||cur));
      const group=_ptsGroups[gname];
      const fromIdx=group.findIndex(x=>x.id===p.id);
      const toIdx=newNum-1;
      group.splice(toIdx,0,group.splice(fromIdx,1)[0]);
      renderOrderArea();
    };
    input.onblur=apply;
    input.onkeydown=e2=>{if(e2.key==='Enter')apply();if(e2.key==='Escape'){renderOrderArea();}};
    e.stopPropagation();
  };
  return row;
}

/* 드래그 정렬 */
function initDragSort(grid,gname){
  let dragEl=null;
  grid.addEventListener('dragstart',e=>{
    dragEl=e.target.closest('[data-pid]');
    if(dragEl)setTimeout(()=>dragEl.style.opacity='.4',0);
  });
  grid.addEventListener('dragend',()=>{if(dragEl){dragEl.style.opacity='1';dragEl=null;}});
  grid.addEventListener('dragover',e=>{
    e.preventDefault();
    const over=e.target.closest('[data-pid]');
    if(!over||over===dragEl)return;
    const rows=[...grid.querySelectorAll('[data-pid]')];
    const fromIdx=rows.indexOf(dragEl);
    const toIdx=rows.indexOf(over);
    if(fromIdx<0||toIdx<0)return;
    const group=_ptsGroups[gname];
    group.splice(toIdx,0,group.splice(fromIdx,1)[0]);
    // DOM 재정렬
    group.forEach((p,i)=>{
      const r=grid.querySelector(`[data-pid="${p.id}"]`);
      if(r){r.querySelector('.order-num').textContent=i+1;grid.appendChild(r);}
    });
  });
}

function shuffleAllGroups(){
  Object.keys(_ptsGroups).forEach(k=>{_ptsGroups[k]=[..._ptsGroups[k]].sort(()=>Math.random()-.5);});
  renderOrderArea();
  toast('무작위로 섞었어요','success');
}

function generateAllBrackets(){
  if(_ptsMode!=='tournament'){toast('리그전은 준비중이에요','info');return;}
  const entries=Object.entries(_ptsGroups).sort((a,b)=>a[0].localeCompare(b[0],'ko'));
  S.groupBrackets=entries.map(([gname,members])=>({
    label:gname,
    matches:generateBracket([...members]),
    slots:buildSlots([...members]) // 슬롯 번호 부여
  }));
  S.activeGroup=0;
  _assignMode=false;
  try{localStorage.setItem('sgp_groupBrackets',JSON.stringify(S.groupBrackets));}catch(e){}
  document.getElementById('pts-step2').style.display='none';
  document.getElementById('pts-step3').style.display='flex';
  renderBracketTabs();
  renderBracketView(0);
}

function goStep2Popup(){
  document.getElementById('pts-step3').style.display='none';
  document.getElementById('pts-step2').style.display='flex';
}

/* 슬롯 생성 - 참가자에 번호 부여 */
function buildSlots(members){
  return members.map((p,i)=>({num:i+1, player:p}));
}

/* 슬롯 번호로 대진표 재생성 */
function slotsToMatches(slots){
  let players=slots.map(s=>s.player);
  return generateBracket(players);
}

let _assignMode=false;
let _assignSlotNum=null;

function toggleAssignMode(){
  _assignMode=!_assignMode;
  const btn=document.getElementById('btn-assign');
  btn.style.borderColor=_assignMode?'var(--accent)':'var(--border)';
  btn.style.background=_assignMode?'rgba(76,201,240,.15)':'transparent';
  btn.style.color=_assignMode?'var(--accent)':'var(--text3)';
  btn.textContent=_assignMode?'✏️ 지정중... (취소)':'✏️ 지정하기';
  renderBracketView(S.activeGroup);
}

function renderBracketTabs(){
  const tabs=document.getElementById('pts-bracket-tabs');
  const groups=S.groupBrackets||[];
  tabs.innerHTML='';
  if(groups.length<=1){tabs.style.display='none';return;}
  tabs.style.display='flex';
  groups.forEach((g,i)=>{
    const btn=document.createElement('button');
    const active=i===S.activeGroup;
    btn.style.cssText=`padding:4px 12px;border-radius:20px;border:1px solid ${active?'var(--red)':'var(--border)'};background:${active?'rgba(230,57,70,.15)':'transparent'};color:${active?'var(--red)':'var(--text3)'};font-size:11px;cursor:pointer;font-weight:${active?'700':'400'};`;
    btn.textContent=g.label+' ('+g.slots.length+'명)';
    btn.onclick=()=>{S.activeGroup=i;_assignMode=false;renderBracketTabs();renderBracketView(i);};
    tabs.appendChild(btn);
  });
}

function renderBracketView(groupIdx){
  const g=S.groupBrackets[groupIdx];
  const view=document.getElementById('pts-bracket-view');
  const label=document.getElementById('pts-bracket-label');
  label.textContent=g.label;
  view.innerHTML='';

  requestAnimationFrame(()=>{
  // 슬롯 지정하기 모드 패널
  if(_assignMode){
    const panel=document.createElement('div');
    panel.style.cssText='margin-bottom:16px;padding:12px 14px;background:rgba(76,201,240,.05);border:1px solid rgba(76,201,240,.2);border-radius:10px;';
    const slotMap2={};
    g.slots.forEach(s=>{if(s.player)slotMap2[s.player.id]=s.num;});
    panel.innerHTML=`
      <div style="font-size:11px;color:var(--accent);font-weight:700;letter-spacing:1px;margin-bottom:10px;">✏️ 슬롯을 클릭해서 참가자를 지정하세요</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:6px;">
        ${g.slots.map(s=>`
          <div onclick="selectSlot(${s.num})" style="display:flex;align-items:center;gap:7px;padding:7px 10px;background:var(--card);border:1px solid ${_assignSlotNum===s.num?'var(--accent)':'var(--border)'};border-radius:7px;cursor:pointer;transition:all .15s;">
            <span style="font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--red);font-weight:700;width:22px;">#${s.num}</span>
            <div style="width:5px;height:5px;border-radius:50%;background:${s.player.color||'var(--text3)'};flex-shrink:0;"></div>
            <span style="font-size:12px;font-weight:600;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.player.name}</span>
          </div>`).join('')}
      </div>
      ${_assignSlotNum?`
        <div style="margin-top:12px;padding:10px 12px;background:var(--card);border:1px solid var(--accent);border-radius:8px;">
          <div style="font-size:11px;color:var(--accent);margin-bottom:8px;font-weight:700;">#${_assignSlotNum} 슬롯에 배정할 참가자 선택:</div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;">
            ${g.slots.map(s=>`
              <button onclick="assignPlayerToSlot(${_assignSlotNum},${g.slots.indexOf(s)})" style="padding:4px 10px;background:${s.num===_assignSlotNum?'rgba(230,57,70,.2)':'var(--card2)'};border:1px solid ${s.num===_assignSlotNum?'var(--red)':'var(--border)'};color:var(--text);border-radius:6px;cursor:pointer;font-size:11px;">
                #${s.num} ${s.player.name}
              </button>`).join('')}
          </div>
        </div>`:''}`;
    view.appendChild(panel);
  }

  // try-finally로 S.matches 복원 보장
  const savedMatches=S.matches;
  try{
    S.matches=g.matches;
    const fns={A:renderBracketA,B:renderBracketB,C:renderBracketC,D:renderBracketD,E:renderBracketE};
    (fns[_bracketLayout]||renderBracketA)(view);
  }finally{
    S.matches=savedMatches;
  }
  }); // end requestAnimationFrame
}
function selectSlot(num){
  _assignSlotNum=_assignSlotNum===num?null:num;
  renderBracketView(S.activeGroup);
}

function assignPlayerToSlot(targetNum,fromIdx){
  const g=S.groupBrackets[S.activeGroup];
  const targetIdx=g.slots.findIndex(s=>s.num===targetNum);
  if(targetIdx<0)return;
  // 두 슬롯 스왑
  const tmp=g.slots[targetIdx].player;
  g.slots[targetIdx].player=g.slots[fromIdx].player;
  g.slots[fromIdx].player=tmp;
  // 대진표 재생성
  g.matches=slotsToMatches(g.slots);
  _assignSlotNum=null;
  renderBracketView(S.activeGroup);
  toast('슬롯 배정 완료!','success');
}

function shuffleGroupBracket(){
  const g=S.groupBrackets[S.activeGroup];
  g.slots=[...g.slots].sort(()=>Math.random()-.5).map((s,i)=>({...s,num:i+1}));
  g.matches=slotsToMatches(g.slots);
  renderBracketView(S.activeGroup);
  toast(g.label+' 무작위로 섞었어요','success');
}

/* ── 수동 연결 상태 ── */
let _linkSel=null; // {ri, mi} 첫번째 선택된 매치

function onMatchClick(ri,mi){
  const g=S.groupBrackets[S.activeGroup];
  if(!_linkSel){
    // 첫번째 선택 → 하이라이트 + 액션바 표시
    _linkSel={ri,mi};
    renderBracketView(S.activeGroup);
    _showLinkBar(ri,mi);
  } else {
    if(_linkSel.ri===ri&&_linkSel.mi===mi){
      // 같은거 클릭 → 취소
      _linkSel=null;
      _hideLinkBar();
      renderBracketView(S.activeGroup);
      return;
    }
    // 두번째 클릭 → 두 경기 연결
    const a=_linkSel,b={ri,mi};
    _linkSel=null;
    _hideLinkBar();

    if(a.ri!==b.ri){toast('같은 라운드 경기끼리만 연결할 수 있어요','error');renderBracketView(S.activeGroup);return;}

    const roundIdx=a.ri;
    if(!g.matches[roundIdx+1])g.matches.push([]);
    const nextRound=g.matches[roundIdx+1];

    const aKey=`${a.ri}-${a.mi}`,bKey=`${b.ri}-${b.mi}`;
    const already=nextRound.find(m=>m.fromA===aKey||m.fromA===bKey||m.fromB===aKey||m.fromB===bKey);
    if(already){toast('이미 연결된 경기입니다','error');renderBracketView(S.activeGroup);return;}

    nextRound.push({
      p1:{name:`${a.ri+1}-${a.mi+1} 승자`,tbd:true},
      p2:{name:`${b.ri+1}-${b.mi+1} 승자`,tbd:true},
      fromA:aKey,fromB:bKey,bye:false
    });

    renderBracketView(S.activeGroup);
    toast(`${a.ri+1}-${a.mi+1} 승자 vs ${b.ri+1}-${b.mi+1} 승자 연결됨!`,'success');
  }
}

/* 선택됐을 때 액션바 표시 */
function _showLinkBar(ri,mi){
  let bar=document.getElementById('link-action-bar');
  if(!bar){
    bar=document.createElement('div');
    bar.id='link-action-bar';
    bar.style.cssText='position:sticky;bottom:0;left:0;right:0;background:var(--bg);border-top:1px solid var(--border);padding:8px 14px;display:flex;align-items:center;gap:8px;z-index:10;';
    document.getElementById('pts-bracket-view').parentNode.appendChild(bar);
  }
  bar.innerHTML=`
    <span style="font-size:11px;color:var(--accent);font-weight:700;">${ri+1}-${mi+1} 선택됨</span>
    <span style="font-size:11px;color:var(--text3);">→ 다른 경기 클릭시 연결 / 또는:</span>
    <button onclick="advanceMatch(${ri},${mi})" style="padding:4px 12px;background:var(--green);border:none;color:#fff;border-radius:6px;cursor:pointer;font-size:11px;font-weight:700;">▶ 다음으로 직행</button>
    <button onclick="_linkSel=null;_hideLinkBar();renderBracketView(S.activeGroup);" style="padding:4px 10px;background:transparent;border:1px solid var(--border);color:var(--text3);border-radius:6px;cursor:pointer;font-size:11px;">취소</button>
  `;
}

function _hideLinkBar(){
  const bar=document.getElementById('link-action-bar');
  if(bar)bar.remove();
}

/* 선택된 경기 단독 다음 라운드 직행 (부전승) */
function advanceMatch(ri,mi){
  const g=S.groupBrackets[S.activeGroup];
  _linkSel=null;
  _hideLinkBar();

  const roundIdx=ri;
  if(!g.matches[roundIdx+1])g.matches.push([]);
  const nextRound=g.matches[roundIdx+1];

  const aKey=`${ri}-${mi}`;
  const already=nextRound.find(m=>m.fromA===aKey||m.fromB===aKey);
  if(already){toast('이미 연결된 경기입니다','error');renderBracketView(S.activeGroup);return;}

  nextRound.push({
    p1:{name:`${ri+1}-${mi+1} 승자`,tbd:true},
    p2:null,
    fromA:aKey,fromB:null,bye:true
  });

  renderBracketView(S.activeGroup);
  toast(`${ri+1}-${mi+1} 승자 다음 라운드 직행!`,'success');
}

function addRound(){
  toast('경기 박스를 클릭해서 연결하세요','info');
}

function removePopupLastRound(){
  const g=S.groupBrackets[S.activeGroup];
  if(!g||g.matches.length<=1){toast('1라운드는 삭제할 수 없어요','info');return;}
  g.matches.pop();
  renderBracketView(S.activeGroup);
  toast('마지막 라운드 삭제됨','success');
}

// 팝업 A~E 레이아웃: step4.js의 _bracketLayout 공유 사용
function setPopupBracketLayout(mode){
  _bracketLayout=mode; // step4.js 전역변수 공유
  ['A','B','C','D','E'].forEach(l=>{
    const btn=document.getElementById('popup-lay-'+l);
    if(!btn)return;
    const on=l===mode;
    btn.style.borderColor=on?'var(--red)':'var(--border2)';
    btn.style.background=on?'rgba(230,57,70,.2)':'transparent';
    btn.style.color=on?'var(--red)':'var(--text2)';
  });
  renderBracketView(S.activeGroup);
}

function countGroupMembers(matches){
  const ids=new Set();
  (matches||[]).forEach(round=>round.forEach(m=>{if(m.p1)ids.add(m.p1.id);if(m.p2)ids.add(m.p2.id);}));
  return ids.size;
}

function shuffleBracketPopup(){shuffleGroupBracket();}

function applyBracketToMain(){
  const g=S.groupBrackets[S.activeGroup];
  S.matches=g.matches;
  S.matchLabel=g.label;
  S.matchProc='tournament';
  S.proc='ind-tour';
  S.matchPts=g.slots.map(s=>s.player?.id).filter(Boolean).join(',');
  S.curMatch=0;
  buildProc();
  try{if(typeof updatePv==='function')updatePv();}catch(e){}
  closePtsPopup();
  toast(g.label+' 대진표 적용 완료!','success');
}

function makeLeague(members,label){
  const pts=members||S.pts;
  const matches=[];
  for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++)matches.push({p1:pts[i],p2:pts[j],winner:null});
  S.matches=[matches];S.matchProc='league';S.matchLabel=label||'전체';S.proc='ind-tour';
  S.matchPts=pts.map(p=>p.id).join(',');S.curMatch=0;
  buildProc();try{if(typeof updatePv==='function')updatePv();}catch(e){}
  toast((label||'전체')+' 리그전 생성! ('+matches.length+'경기)','success');
}

function makeTournament(members,label){
  const pts=members||S.pts;
  S.matches=generateBracket([...pts]);
  S.matchProc='tournament';S.matchLabel=label||'전체';S.proc='ind-tour';
  S.matchPts=pts.map(p=>p.id).join(',');S.curMatch=0;
  buildProc();try{if(typeof updatePv==='function')updatePv();}catch(e){}
  toast((label||'전체')+' 토너먼트 생성! ('+pts.length+'명)','success');
}

/* 드래그 이동 — 페이지 로드 시 1회만 초기화 */
function initPtsPopupDrag(){
  const hdr=document.getElementById('pts-popup-hdr');
  const box=document.getElementById('pts-popup-box');
  let ox=0,oy=0,bx=0,by=0,dragging=false;

  function onMove(e){
    if(!dragging)return;
    bx+=e.clientX-ox;by+=e.clientY-oy;ox=e.clientX;oy=e.clientY;
    const vw=window.innerWidth,vh=window.innerHeight;
    bx=Math.max(0,Math.min(bx,vw-box.offsetWidth));
    by=Math.max(0,Math.min(by,vh-box.offsetHeight));
    box.style.left=bx+'px';box.style.top=by+'px';
  }
  function onUp(){
    if(!dragging)return;
    dragging=false;
    hdr.style.cursor='grab';
    document.removeEventListener('mousemove',onMove);
    document.removeEventListener('mouseup',onUp);
  }
  hdr.addEventListener('mousedown',e=>{
    if(e.target.closest('button'))return;
    const r=box.getBoundingClientRect();
    box.style.transform='none';
    box.style.left=r.left+'px';
    box.style.top=r.top+'px';
    bx=r.left;by=r.top;ox=e.clientX;oy=e.clientY;
    dragging=true;
    hdr.style.cursor='grabbing';
    document.addEventListener('mousemove',onMove);
    document.addEventListener('mouseup',onUp);
  });
}


