// ══ DSPANEL: 탭 공통 관리 ══

let dsCurrentTab=1;

function dstab(n){
  dsCurrentTab=n;
  document.querySelectorAll('.ds-tab').forEach((t,i)=>t.classList.toggle('on',i===n-1));
  document.querySelectorAll('.ds-tab-content').forEach((t,i)=>t.classList.toggle('on',i===n-1));
  if(n===1)buildTab1();
  if(n===2)buildTab2();
  if(n===3)buildTab3();
}

function initDsPanel(){
  buildTab1(); // 기본 1번 탭

  // courtCount 변경 감지 → 2번 탭 경기장 버튼 갱신
  let _prevCourtCount=parseInt(localStorage.getItem('sgp_courtCount')||'1');

  window.addEventListener('storage', e=>{
    // ── courtCount 변경 ──
    if(e.key==='sgp_courtCount'){
      const newCount=parseInt(e.newValue||'1');
      if(newCount!==_prevCourtCount){
        _prevCourtCount=newCount;
        if(dsCurrentTab===2 && typeof buildTab2CourtBtns==='function') buildTab2CourtBtns();
      }
    }

    // ── [BUG FIX 3] 경기장별 선택 경기 변경 → pv2 즉시 반영 ──
    // bracket-view.html에서 경기 클릭 시 sgp_display_vs_court_N 키가 변경됨
    // 기존에는 sgp_display_vs만 감지하여 court_2 선택 시 pv2가 갱신되지 않았음
    if(e.key && e.key.startsWith('sgp_display_vs_court_')){
      try{
        const changedCourt=parseInt(e.key.replace('sgp_display_vs_court_',''));
        const currentMode=localStorage.getItem('sgp_d2_mode')||'court_1';
        if(currentMode===`court_${changedCourt}` || currentMode==='random'){
          if(typeof _updatePv2ForCourt==='function') _updatePv2ForCourt(changedCourt);
        }
      }catch(err){}
    }

    // ── sgp_groupBrackets 변경 → S 동기화 + pv3 iframe 갱신 ──
    if(e.key==='sgp_groupBrackets'){
      try{
        const gb=JSON.parse(e.newValue||'[]');
        if(typeof S!=='undefined') S.groupBrackets=gb;
      }catch(err){}
      // 탭3 iframe 새로고침
      _refreshTab3Iframe();
    }
  });

  // ── BroadcastChannel: bracket-view(별도창)에서 오는 경기 선택 이벤트 ──
  try{
    if(!window._dsPanelBc){
      window._dsPanelBc=new BroadcastChannel('sgp_cmd');
      window._dsPanelBc.onmessage=function(e){
        const cmd=e.data;
        if(!cmd) return;
        if(cmd.type==='set_match'){
          try{
            const courtNum=cmd.court||1;
            const currentMode=localStorage.getItem('sgp_d2_mode')||'court_1';
            if(currentMode===`court_${courtNum}` || currentMode==='random'){
              if(typeof _updatePv2ForCourt==='function') _updatePv2ForCourt(courtNum);
            }
          }catch(err){}
          // pv3 iframe 갱신
          _refreshTab3Iframe();
        }
      };
    }
  }catch(e){}
}

// pv3 및 탭3 iframe 새로고침
function _refreshTab3Iframe(){
  // pv3-wrap의 iframe
  const pvIframe=document.getElementById('pv3-iframe');
  if(pvIframe) try{ pvIframe.contentWindow.location.reload(); }catch(e){}
  // dst3의 embedded iframe
  const dst3Iframe=document.getElementById('dst3-bracket-iframe');
  if(dst3Iframe) try{ dst3Iframe.contentWindow.location.reload(); }catch(e){}
}
