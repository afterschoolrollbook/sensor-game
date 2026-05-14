// ══ DS TAB 2: 현재경기 VS 화면 설정 ══

let _tab2Mode = 'single'; // 'single' | 'random' | 'court_N'

function buildTab2(){
  buildDs2FontPicker();
  buildTab2CourtBtns();
  updateDst2();
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

  wrap.innerHTML='';

  // 랜덤 버튼 (경기장 2개 이상일 때만 의미 있지만 항상 표시)
  const randomBtn=document.createElement('button');
  randomBtn.className='ds-theme-card dst2-mode-btn'+(_tab2Mode==='random'?' on':'');
  randomBtn.dataset.mode='random';
  randomBtn.innerHTML='🔀 랜덤 순환';
  randomBtn.title='경기장을 순서대로 돌아가며 자동 표시';
  randomBtn.onclick=()=>_setTab2Mode('random');
  wrap.appendChild(randomBtn);

  if(courtCount>=2){
    // 경기장 N개 버튼 동적 생성
    for(let c=1;c<=courtCount;c++){
      const btn=document.createElement('button');
      btn.className='ds-theme-card dst2-mode-btn'+(_tab2Mode===`court_${c}`?' on':'');
      btn.dataset.mode=`court_${c}`;
      btn.innerHTML=`🏟️ 경기장 ${c}`;
      btn.title=`경기장 ${c}의 현재 경기만 표시`;
      btn.onclick=(()=>{const cc=c;return()=>_setTab2Mode(`court_${cc}`);})(c);
      wrap.appendChild(btn);
    }
  }

  // 경기장 1개면 단일 버튼 표시
  if(courtCount<2){
    wrap.insertAdjacentHTML('afterbegin',
      `<p style="font-size:11px;color:var(--text3);margin:0 0 6px;">경기장이 2개 이상일 때 각 경기장 버튼이 표시됩니다.</p>`
    );
  }
}

function _setTab2Mode(mode){
  _tab2Mode=mode;
  // 버튼 active 상태 갱신
  document.querySelectorAll('.dst2-mode-btn').forEach(b=>{
    b.classList.toggle('on', b.dataset.mode===mode);
  });
  // display.html에 모드 전달 (BroadcastChannel + localStorage)
  const payload={type:'sgp_d2_mode', mode};
  try{ localStorage.setItem('sgp_d2_mode', mode); }catch(e){}
  try{
    const dispWin=_getDispWin();
    if(dispWin && !dispWin.closed) dispWin.postMessage(payload,'*');
  }catch(e){}
  // BroadcastChannel으로도 전달
  try{
    if(typeof _bc!=='undefined' && _bc) _bc.postMessage(payload);
  }catch(e){}
  // 미리보기 pv2도 업데이트
  _updatePv2ForMode(mode);
}

function _getDispWin(){
  // step6.js에서 display.html을 window.open한 핸들이 있으면 반환
  try{ return window._dispWin||null; }catch(e){ return null; }
}

function _updatePv2ForMode(mode){
  // 미리보기(pv2)에 모드 힌트 표시
  const pv2info=document.getElementById('pv2-info');
  if(!pv2info) return;
  if(mode==='random'){
    pv2info.textContent='🔀 경기장 순환 중...';
  } else if(mode.startsWith('court_')){
    const c=mode.replace('court_','');
    pv2info.textContent=`🏟️ 경기장 ${c} 고정`;
  } else {
    updateDst2(); // 원래 상태로
  }
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
  S.vs2Bg=style;
  document.querySelectorAll('.ds2-bg-btn').forEach(b=>b.classList.toggle('on',b.dataset.style===style));
  const pv2=document.getElementById('pv2');
  if(pv2) pv2.dataset.bg=style;
  if(typeof saveCfgNow==='function') saveCfgNow();
}

// courtCount 변경 시 외부에서 호출 가능
function tab2RefreshCourtBtns(){
  buildTab2CourtBtns();
}
