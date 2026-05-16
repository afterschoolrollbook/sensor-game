function isCurrentMatchIdx(){ return false; }

let _pts = [];
try { _pts = JSON.parse(localStorage.getItem('sgp_bw_pts') || '[]'); } catch(e) {}

// step4.js가 전역에서 참조하는 S 객체
let S = { pts:_pts, matches:[], groupBrackets:[], activeGroup:0, laps:1 };
window.S = S; // 팝업에서 window.opener.S로 접근 가능하게

function toast(msg, type='info'){
  const c=document.getElementById('tc');
  const d=document.createElement('div');
  d.className='tos '+(type||'');
  d.textContent=msg;
  c.appendChild(d);
  setTimeout(()=>d.remove(), 2500);
}

function showByeSelector(players, title, callback){ callback(players[0]); }

window.addEventListener('message', e=>{
  if(!e.data||e.data.type!=='sgp_pts_update') return;
  _pts=e.data.pts||[]; S.pts=_pts;
  autoDetectSortKeys();
  renderList();
  renderPtsOverview();
});

// 완전히 로드된 뒤 부모창에 "준비됨" 신호 → 부모가 데이터를 밀어줌
// (localStorage가 있으면 이미 renderList()로 표시되므로 추가 요청은 스킵)
window.addEventListener('load', ()=>{
  if(!_pts.length && window.opener){
    try{ window.opener.postMessage({type:'sgp_pts_request'},'*'); }catch(e){}
  }
});

let _sortKeys=[], _groups={}, _mode='tournament';
let _assignMode=false, _assignSlotNum=null, _linkSel=null;
let _byeAssigned=null; // {ri, mi} 부전승 배정된 경기
// _bracketLayout은 step4.js에서 선언됨 — 중복 선언 금지

function autoDetectSortKeys(){
  _sortKeys=[];
  if(S.pts.some(p=>p.gender&&p.gender.trim())) _sortKeys.push('gender');
  if(S.pts.some(p=>p.division&&p.division.trim())) _sortKeys.push('division');
  if(S.pts.some(p=>p.weight&&p.weight.trim())) _sortKeys.push('weight');
  if(S.pts.some(p=>p.team&&p.team.trim()) && !_sortKeys.length) _sortKeys.push('team');
  // 버튼 하이라이트 동기화
  ['gender','division','weight','team'].forEach(k=>{
    const btn=document.getElementById('sort-'+k);
    if(!btn) return;
    const on=_sortKeys.includes(k);
    btn.style.borderColor=on?'var(--accent)':'var(--border)';
    btn.style.background=on?'rgba(76,201,240,.12)':'transparent';
    btn.style.color=on?'var(--accent)':'var(--text3)';
  });
}


function show(stepId){
  ['pts-step1','pts-step2','pts-step3','pts-step4'].forEach(id=>{
    document.getElementById(id).classList.toggle('on', id===stepId);
  });
  if(stepId==='pts-step3'){
    const ci=document.getElementById('step3-court-info');
    if(ci) ci.textContent=`경기장 ${_courtCount||1}개`;
    ['A','B','C','D','E'].forEach(x=>{
      const btn=document.getElementById('popup-lay-'+x);
      if(!btn) return;
      const active=x===(_bracketLayout||'A');
      btn.style.borderColor=active?'var(--red)':'var(--border2)';
      btn.style.background=active?'rgba(230,57,70,.2)':'transparent';
      btn.style.color=active?'var(--red)':'var(--text2)';
    });
    // 스텝3: 항상 이름 없는 상태로 표시
    window._hideNames=true;
  }
  if(stepId==='pts-step4'){
    // 스텝4: 이름 보이기 상태로
    window._hideNames=false;
  }
}

function togglePtsSort(key){
  const idx=_sortKeys.indexOf(key);
  if(idx>=0) _sortKeys.splice(idx,1); else _sortKeys.push(key);
  const on=_sortKeys.includes(key);
  const btn=document.getElementById('sort-'+key);
  btn.style.borderColor=on?'var(--accent)':'var(--border)';
  btn.style.background=on?'rgba(76,201,240,.12)':'transparent';
  btn.style.color=on?'var(--accent)':'var(--text3)';
  renderList();
}

function renderList(){
  const list=document.getElementById('pts-popup-list');
  document.getElementById('win-title').textContent='참가자 명단 (총 '+S.pts.length+'명)';
  list.innerHTML='';

  // 요약 정보
  const summaryEl=document.getElementById('pts-summary');
  if(summaryEl){
    const parts=[];
    const genders=[...new Set(S.pts.map(p=>p.gender).filter(Boolean))];
    const divisions=[...new Set(S.pts.map(p=>p.division).filter(Boolean))];
    const weights=[...new Set(S.pts.map(p=>p.weight).filter(Boolean))];
    if(genders.length) parts.push('성별 '+genders.length);
    if(divisions.length) parts.push('부문 '+divisions.length);
    if(weights.length) parts.push('체급 '+weights.length);
    summaryEl.textContent=parts.join(' / ');
  }

  const groups={};
  if(!_sortKeys.length){
    groups['전체']=[...S.pts];
  } else {
    S.pts.forEach(p=>{
      const key=_sortKeys.map(k=>p[k]||'미분류').join(' / ');
      if(!groups[key]) groups[key]=[];
      groups[key].push(p);
    });
  }

  Object.entries(groups).sort((a,b)=>a[0].localeCompare(b[0],'ko')).forEach(([gname,members])=>{
    const sec=document.createElement('div');
    sec.style.cssText='margin-bottom:14px;';
    sec.innerHTML=`
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;padding-bottom:5px;border-bottom:1px solid var(--border);">
        <span style="font-size:11px;font-weight:700;">${gname}</span>
        <span style="font-size:10px;color:var(--text3);background:var(--card2);padding:1px 7px;border-radius:8px;">${members.length}명</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:4px;">
        ${members.map((p,i)=>`
          <div style="display:flex;align-items:center;gap:5px;padding:4px 7px;background:var(--card);border:1px solid var(--border);border-radius:5px;min-width:0;">
            <span style="font-size:9px;color:var(--text3);flex-shrink:0;">${i+1}</span>
            <div style="width:5px;height:5px;border-radius:50%;background:${p.color||'var(--text3)'};flex-shrink:0;"></div>
            ${p.gender?`<span style="font-size:8px;padding:0 3px;border-radius:2px;flex-shrink:0;background:${p.gender==='남'?'rgba(76,201,240,0.2)':'rgba(255,100,150,0.2)'};color:${p.gender==='남'?'#4cc9f0':'#ff6496'}">${p.gender}</span>`:''}
            <span style="font-size:11px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</span>
          </div>`).join('')}
      </div>`;
    list.appendChild(sec);
  });
}

function confirmPtsGroup(){
  if(!_sortKeys.length){ _groups={'전체':[...S.pts]}; }
  else {
    _groups={};
    S.pts.forEach(p=>{
      const k=_sortKeys.map(k2=>p[k2]||'미분류').join(' / ');
      if(!_groups[k]) _groups[k]=[];
      _groups[k].push(p);
    });
  }
  try {
    localStorage.setItem('sgp_groups', JSON.stringify(_groups));
    localStorage.setItem('sgp_sortKeys', JSON.stringify(_sortKeys));
    localStorage.setItem('sgp_pts', JSON.stringify(S.pts));
    localStorage.setItem('sgp_courtCount', String(_courtCount||1));
    localStorage.setItem('sgp_layout', _bracketLayout||'A');
  } catch(e){}
  toast('저장 완료!', 'success');
  show('pts-step2'); setPtsMode('tournament'); renderOrderArea();
  setCompType(_compType||'national');
  setCourtCount(_courtCount||1);
  _bracketLayout='A';
  setLayoutAndHighlight('A');
  requestAnimationFrame(_initLayoutTooltips);
  document.getElementById('bracket-preview-panel').style.display='block';
  updateBracketPreview();
  renderPtsOverview();
}
function goStep1(){ show('pts-step1'); }
