// ══ DS TAB 2: 현재경기 VS 화면 설정 ══

let _tab2Mode = 'court_1'; // 기본: 경기장 1

function buildTab2(){
  // ── [BUG FIX 2] 탭 전환 시 _tab2Mode가 항상 'court_1'로 리셋되는 버그 수정 ──
  // 저장된 모드를 복원한 뒤 UI 빌드
  try{
    const saved=localStorage.getItem('sgp_d2_mode');
    if(saved) _tab2Mode=saved;
  }catch(e){}
  buildDs2FontPicker();
  buildTab2CourtBtns();
  buildDs2VsColor();
  buildDs2Labels();
  updateDst2();
}

function buildDs2VsColor(){
  const w=document.getElementById('ds2-vs-color-wrap'); if(!w) return;
  const COLORS=[
    {n:'빨강',v:'#e63946'},{n:'흰색',v:'#f0f0f8'},{n:'노랑',v:'#ffd60a'},
    {n:'청록',v:'#4cc9f0'},{n:'초록',v:'#06d6a0'},{n:'보라',v:'#7b2fff'},
    {n:'주황',v:'#ff9f1c'},{n:'검정',v:'#000000'},
  ];
  const saved=localStorage.getItem('sgp_d2_vs_color')||'#e63946';
  w.innerHTML='';
  COLORS.forEach(c=>{
    const sw=document.createElement('div');
    sw.className='ds-swatch'+(saved===c.v?' on':'');
    sw.style.background=c.v;
    if(c.v==='#000000') sw.style.border='2px solid var(--border2)';
    sw.title=c.n;
    sw.onclick=()=>{
      try{ localStorage.setItem('sgp_d2_vs_color',c.v); }catch(e){}
      w.querySelectorAll('.ds-swatch').forEach(x=>x.classList.remove('on'));
      sw.classList.add('on');
      // 미리보기 반영
      const pvVs=document.querySelector('#pv2 .pv2-vs');
      if(pvVs) pvVs.style.color=c.v;
      // broadcast
      _broadcastD2Cfg({vs_color:c.v});
    };
    w.appendChild(sw);
  });
  // 미리보기 초기 반영
  const pvVs=document.querySelector('#pv2 .pv2-vs');
  if(pvVs) pvVs.style.color=saved;
}

function buildDs2Labels(){
  const courtShow=localStorage.getItem('sgp_d2_court_show')!=='false';
  const courtSize=parseInt(localStorage.getItem('sgp_d2_court_size')||'16');
  const infoShow=localStorage.getItem('sgp_d2_info_show')!=='false';
  const infoSize=parseInt(localStorage.getItem('sgp_d2_info_size')||'16');
  const nameShow=localStorage.getItem('sgp_d2_name_show')!=='false';
  const nameSize=parseInt(localStorage.getItem('sgp_d2_name_size')||'80');

  const el=(id,val)=>{ const e=document.getElementById(id); if(e) e[typeof val==='boolean'?'checked':'textContent']=val; };
  el('ds2-court-show',courtShow);
  el('ds2-court-size-val',courtSize);
  el('ds2-info-show',infoShow);
  el('ds2-info-size-val',infoSize);
  el('ds2-name-show',nameShow);
  el('ds2-name-size-val',nameSize);

  _applyD2CfgToPv2({courtShow,courtSize,infoShow,infoSize,nameShow,nameSize});
}

function buildDs2FontPicker(){
  const w=document.getElementById('ds2-fontpicker');if(!w)return;w.innerHTML='';
  if(typeof TITLE_FONTS==='undefined')return;
  TITLE_FONTS.forEach(f=>{
    const el=document.createElement('div');
    el.className='ds-font'+(S.vs2Font===f.id?' on':'');
    el.style.fontFamily=f.css;el.textContent=f.name;
    el.onclick=()=>{
      S.vs2Font=f.id;
      document.querySelectorAll('#ds2-fontpicker .ds-font').forEach(x=>x.classList.remove('on'));
      el.classList.add('on');
      ['pv2-p1','pv2-p2'].forEach(id=>{
        const e=document.getElementById(id);
        if(e)e.style.fontFamily=f.css;
      });
      const pv2vs=document.querySelector('#pv2 .pv2-vs');
      if(pv2vs)pv2vs.style.fontFamily=f.css;
      if(typeof saveCfgNow==='function') saveCfgNow();
    };
    w.appendChild(el);
  });
}

function buildTab2CourtBtns(){
  const wrap=document.getElementById('dst2-court-wrap');
  if(!wrap) return;

  const courtCount=parseInt(localStorage.getItem('sgp_courtCount')||'1');
  const savedSec=parseInt(localStorage.getItem('sgp_d2_random_interval')||'60');

  wrap.innerHTML='';
  wrap.style.cssText='display:flex;flex-direction:column;gap:8px;';

  // ── 버튼 행 ──
  const btnRow=document.createElement('div');
  btnRow.style.cssText='display:flex;flex-wrap:wrap;gap:6px;';

  // 랜덤 순환 버튼
  const randomBtn=document.createElement('button');
  randomBtn.className='ds-theme-card dst2-mode-btn'+(_tab2Mode==='random'?' on':'');
  randomBtn.dataset.mode='random';
  randomBtn.textContent='🔀 랜덤';
  randomBtn.title='경기장을 N초마다 번갈아가며 표시';
  randomBtn.onclick=()=>_setTab2Mode('random');
  btnRow.appendChild(randomBtn);

  if(courtCount>=2){
    for(let c=1;c<=courtCount;c++){
      const btn=document.createElement('button');
      btn.className='ds-theme-card dst2-mode-btn'+(_tab2Mode===`court_${c}`?' on':'');
      btn.dataset.mode=`court_${c}`;
      btn.textContent=`🏟️ ${c}번`;
      btn.title=`경기장 ${c}의 선택된 경기 표시`;
      btn.onclick=(()=>{const cc=c;return()=>_setTab2Mode(`court_${cc}`);})(c);
      btnRow.appendChild(btn);
    }
  } else {
    const note=document.createElement('p');
    note.style.cssText='font-size:10px;color:var(--text3);margin:2px 0 0;';
    note.textContent='경기장 2개 이상이면 각 경기장 버튼이 표시됩니다.';
    btnRow.appendChild(note);
  }
  wrap.appendChild(btnRow);

  // ── 인터벌 행 (랜덤 모드일 때만 표시) ──
  const ivRow=document.createElement('div');
  ivRow.id='dst2-interval-row';
  ivRow.style.cssText=`display:${_tab2Mode==='random'?'flex':'none'};align-items:center;gap:8px;
    background:var(--card);border:1px solid var(--border);border-radius:8px;padding:7px 11px;`;

  ivRow.innerHTML=`
    <span style="font-size:11px;color:var(--text3);white-space:nowrap;">🕐 전환 간격</span>
    <button id="dst2-iv-minus" style="width:24px;height:24px;border-radius:5px;background:var(--card2);border:1px solid var(--border);color:var(--text);font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;">−</button>
    <div style="flex:1;text-align:center;">
      <span id="dst2-iv-val" style="font-family:'Share Tech Mono',monospace;font-size:18px;font-weight:700;color:var(--text);">${savedSec}</span>
      <span style="font-size:10px;color:var(--text3);margin-left:2px;">초</span>
    </div>
    <button id="dst2-iv-plus" style="width:24px;height:24px;border-radius:5px;background:var(--card2);border:1px solid var(--border);color:var(--text);font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;">+</button>
  `;
  wrap.appendChild(ivRow);

  // ── 인터벌 버튼 이벤트 ──
  const STEPS=[5,10,15,20,30,60,90,120,180,300];
  function _getStepIdx(v){ let i=STEPS.findIndex(s=>s>=v); return i<0?STEPS.length-1:i; }
  let _ivSec=savedSec;

  function _applyIv(sec){
    _ivSec=Math.max(5,Math.min(300,sec));
    const el=document.getElementById('dst2-iv-val');
    if(el) el.textContent=_ivSec;
    try{ localStorage.setItem('sgp_d2_random_interval', String(_ivSec)); }catch(e){}
    // 실행 중인 display.html에 즉시 반영
    const payload={type:'sgp_d2_refresh_random'};
    try{ if(typeof _bc!=='undefined'&&_bc) _bc.postMessage(payload); }catch(e){}
    try{ const dw=_getDispWin(); if(dw&&!dw.closed) dw.postMessage(payload,'*'); }catch(e){}
  }

  document.getElementById('dst2-iv-minus').onclick=()=>{
    const idx=_getStepIdx(_ivSec);
    _applyIv(STEPS[Math.max(0,idx-1)]);
  };
  document.getElementById('dst2-iv-plus').onclick=()=>{
    const idx=_getStepIdx(_ivSec);
    const next=STEPS[Math.min(STEPS.length-1, _ivSec===STEPS[idx]?idx+1:idx)];
    _applyIv(next);
  };
}

function _setTab2Mode(mode){
  _tab2Mode=mode;
  // 버튼 active 상태 갱신
  document.querySelectorAll('.dst2-mode-btn').forEach(b=>{
    b.classList.toggle('on', b.dataset.mode===mode);
  });
  // 인터벌 행 표시/숨김
  const ivRow=document.getElementById('dst2-interval-row');
  if(ivRow) ivRow.style.display=(mode==='random')?'flex':'none';
  // display.html에 모드 전달
  const payload={type:'sgp_d2_mode', mode};
  try{ localStorage.setItem('sgp_d2_mode', mode); }catch(e){}
  try{
    const dispWin=_getDispWin();
    if(dispWin && !dispWin.closed) dispWin.postMessage(payload,'*');
  }catch(e){}
  try{
    if(typeof _bc!=='undefined' && _bc) _bc.postMessage(payload);
  }catch(e){}
  _updatePv2ForMode(mode);
}

function _getDispWin(){
  // step6.js에서 display.html을 window.open한 핸들이 있으면 반환
  try{ return window._dispWin||null; }catch(e){ return null; }
}

function _updatePv2ForMode(mode){
  const courtLbl=document.getElementById('pv2-court-lbl');
  if(mode==='random'){
    // 랜덤: 현재 첫 번째 경기장부터 표시
    const courtLbl=document.getElementById('pv2-court-lbl');
    if(courtLbl) courtLbl.textContent='// 경기장 1';
    _updatePv2ForCourt(1);
    updateDst2();
  } else if(mode.startsWith('court_')){
    const c=parseInt(mode.replace('court_',''));
    if(courtLbl) courtLbl.textContent=`// 경기장 ${c}`;
    _updatePv2ForCourt(c);
  } else {
    if(courtLbl) courtLbl.textContent='';
    updateDst2();
  }
}

// 해당 경기장의 선택된 경기를 미리보기(pv2)에 표시
function _updatePv2ForCourt(courtNum){
  const p1el=document.getElementById('pv2-p1');
  const p2el=document.getElementById('pv2-p2');
  const infoEl=document.getElementById('pv2-info');

  // 수동 선택된 경기 확인
  try{
    const manualStr=localStorage.getItem(`sgp_display_vs_court_${courtNum}`);
    if(manualStr){
      const mv=JSON.parse(manualStr);
      if(mv&&mv.p1&&mv.p2){
        if(p1el) p1el.textContent=mv.p1;
        if(p2el) p2el.textContent=mv.p2;
        if(infoEl) infoEl.textContent=mv.label||'';
        return;
      }
    }
  }catch(e){}

  // 선택된 경기 없음 → 대기 상태
  if(p1el) p1el.textContent='—';
  if(p2el) p2el.textContent='—';
  if(infoEl) infoEl.textContent='';
}

function updateDst2(){
  const el=document.getElementById('dst2-match');if(!el)return;
  if(S.matches&&S.matches.length){
    for(let ri=0;ri<S.matches.length;ri++){
      for(let mi=0;mi<S.matches[ri].length;mi++){
        const m=S.matches[ri][mi];
        if(!m.winner&&m.p1&&m.p2){
          el.textContent=m.p1.name+' VS '+m.p2.name;
          return;
        }
      }
    }
    el.textContent='모든 경기 완료';
  } else {
    el.textContent='— VS —';
  }
}

// VS 화면 배경 스타일 설정
function setVsBg(style){
  const BG={
    dark:'#040408',
    gradient:'linear-gradient(135deg,#0a0a1a 0%,#1a0a2e 100%)',
    blur:'rgba(10,10,20,0.95)',
    solid:'#0d1b2a',
  };
  S.vs2Bg=style;
  document.querySelectorAll('.ds2-bg-btn').forEach(b=>b.classList.toggle('on',b.dataset.style===style));
  // 미리보기 반영
  const pv2=document.getElementById('pv2');
  if(pv2) pv2.style.background=BG[style]||BG.dark;
  if(typeof saveCfgNow==='function') saveCfgNow();
  // display.html에 즉시 broadcast
  _broadcastD2Cfg({vs_bg:style});
}

// courtCount 변경 시 외부에서 호출 가능
function tab2RefreshCourtBtns(){
  buildTab2CourtBtns();
}

// ── D2 설정 저장 + broadcast ──
function _saveD2Cfg(){
  const courtShow=document.getElementById('ds2-court-show')?.checked??true;
  const courtSize=parseInt(document.getElementById('ds2-court-size-val')?.textContent||'16');
  const infoShow=document.getElementById('ds2-info-show')?.checked??true;
  const infoSize=parseInt(document.getElementById('ds2-info-size-val')?.textContent||'16');
  const nameShow=document.getElementById('ds2-name-show')?.checked??true;
  const nameSize=parseInt(document.getElementById('ds2-name-size-val')?.textContent||'80');
  try{ localStorage.setItem('sgp_d2_court_show',String(courtShow)); }catch(e){}
  try{ localStorage.setItem('sgp_d2_court_size',String(courtSize)); }catch(e){}
  try{ localStorage.setItem('sgp_d2_info_show',String(infoShow)); }catch(e){}
  try{ localStorage.setItem('sgp_d2_info_size',String(infoSize)); }catch(e){}
  try{ localStorage.setItem('sgp_d2_name_show',String(nameShow)); }catch(e){}
  try{ localStorage.setItem('sgp_d2_name_size',String(nameSize)); }catch(e){}
  const cfg={courtShow,courtSize,infoShow,infoSize,nameShow,nameSize};
  _broadcastD2Cfg(cfg);
  _applyD2CfgToPv2(cfg);
}

const _D2SIZES=[10,11,12,13,14,16,18,20,22,24,28,32,36,40];
function _stepSize(cur,d){
  let i=_D2SIZES.findIndex(s=>s>=cur); if(i<0)i=_D2SIZES.length-1;
  return _D2SIZES[Math.max(0,Math.min(_D2SIZES.length-1,i+d))];
}

function _chD2LblSize(d){
  const el=document.getElementById('ds2-court-size-val'); if(!el) return;
  el.textContent=_stepSize(parseInt(el.textContent)||16,d);
  _saveD2Cfg();
}
function _chD2InfoSize(d){
  const el=document.getElementById('ds2-info-size-val'); if(!el) return;
  el.textContent=_stepSize(parseInt(el.textContent)||16,d);
  _saveD2Cfg();
}
function _chD2NameSize(d){
  const el=document.getElementById('ds2-name-size-val'); if(!el) return;
  const NAME_SIZES=[20,24,28,32,36,40,48,56,64,72,80,88,96,110,120];
  let cur=parseInt(el.textContent)||80;
  let i=NAME_SIZES.findIndex(s=>s>=cur); if(i<0)i=NAME_SIZES.length-1;
  el.textContent=NAME_SIZES[Math.max(0,Math.min(NAME_SIZES.length-1,i+d))];
  _saveD2Cfg();
}

function _broadcastD2Cfg(extra){
  const msg=Object.assign({type:'d2_cfg'},extra);
  try{ if(typeof _bc!=='undefined'&&_bc) _bc.postMessage(msg); }catch(e){}
  try{ const dw=_getDispWin(); if(dw&&!dw.closed) dw.postMessage(msg,'*'); }catch(e){}
}

function _applyD2CfgToPv2(cfg){
  const pvCourtLbl=document.getElementById('pv2-court-lbl');
  const pvInfo=document.getElementById('pv2-info');
  // 상단 경기장 레이블
  if(pvCourtLbl){
    if(cfg.courtShow!==undefined) pvCourtLbl.style.display=cfg.courtShow?'':'none';
    if(cfg.courtSize) pvCourtLbl.style.fontSize=cfg.courtSize+'px';
  }
  // 하단 경기 정보
  if(pvInfo){
    if(cfg.infoShow!==undefined) pvInfo.style.display=cfg.infoShow?'':'none';
    if(cfg.infoSize) pvInfo.style.fontSize=cfg.infoSize+'px';
  }
  // 선수 이름
  document.querySelectorAll('#pv2 .pv2-pl').forEach(pl=>{
    if(cfg.nameShow!==undefined) pl.style.display=cfg.nameShow?'':'none';
  });
  ['pv2-p1','pv2-p2'].forEach(id=>{
    const nm=document.getElementById(id);
    if(nm && cfg.nameSize) nm.style.fontSize=cfg.nameSize+'px';
  });
}
