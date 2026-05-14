// ══ DS TAB 3: 대진표 화면 설정 ══

function buildTab3(){
  updateDst3();
  // 탭3 열 때 pv3 최신 선택경기 반영
  try{ if(typeof updatePv3==='function') updatePv3(); }catch(e){}
}

function updateDst3(){
  const el=document.getElementById('dst3-status');if(!el)return;
  if(!S.matches||!S.matches.length){
    el.textContent='진행방식에서 토너먼트 선택 후 표시됩니다';
    return;
  }
  // 현재 라운드 상태
  let totalMatches=0,completed=0;
  S.matches.forEach(round=>{
    round.forEach(m=>{
      if(m.p1&&m.p2){totalMatches++;if(m.winner)completed++;}
    });
  });
  el.textContent=`진행중: ${completed}/${totalMatches} 경기 완료`;
}

function saveDst3Cfg(){
  try{
    const cfg=JSON.parse(localStorage.getItem('sgp_display_config')||'{}');
    cfg.bracketShowWaitList=document.getElementById('dst3-waitlist')?.checked;
    cfg.bracketShowBye=document.getElementById('dst3-bye')?.checked;
    cfg.bracketAutoScroll=document.getElementById('dst3-autoscroll')?.checked;
    cfg.bracket3Font=S.bracket3Font||null;
    localStorage.setItem('sgp_display_config',JSON.stringify(cfg));
  }catch(e){}
}

function buildDs3FontPicker(){
  const w=document.getElementById('ds3-fontpicker');if(!w)return;w.innerHTML='';
  if(typeof TITLE_FONTS==='undefined')return;
  TITLE_FONTS.forEach(f=>{
    const el=document.createElement('div');
    el.className='ds-font'+(S.bracket3Font===f.id?' on':'');
    el.style.fontFamily=f.css;el.textContent=f.name;
    el.onclick=()=>{
      S.bracket3Font=f.id;
      document.querySelectorAll('#ds3-fontpicker .ds-font').forEach(x=>x.classList.remove('on'));
      el.classList.add('on');
      // pv3 미리보기 적용
      document.querySelectorAll('#pv3 .pv3-pl').forEach(x=>x.style.fontFamily=f.css);
      saveDst3Cfg();
      // display.html에도 즉시 전달
      if(typeof saveCfgNow==='function') saveCfgNow();
    };
    w.appendChild(el);
  });
}

// buildTab3 업데이트
const _buildTab3=buildTab3;
buildTab3=function(){_buildTab3();buildDs3FontPicker();};
