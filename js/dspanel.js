// ══ DSPANEL: 탭 공통 관리 ══

let dsCurrentTab=1;

function dstab(n){
  dsCurrentTab=n;
  document.querySelectorAll('.ds-tab').forEach((t,i)=>t.classList.toggle('on',i===n-1));
  document.querySelectorAll('.ds-tab-content').forEach((t,i)=>t.classList.toggle('on',i===n-1));
  // 각 탭 빌드
  if(n===1)buildTab1();
  if(n===2)buildTab2();
  if(n===3)buildTab3();
}

function initDsPanel(){
  buildTab1(); // 기본 1번 탭

  // courtCount 변경 감지 → 2번 탭 경기장 버튼 갱신
  let _prevCourtCount=parseInt(localStorage.getItem('sgp_courtCount')||'1');
  window.addEventListener('storage', e=>{
    if(e.key==='sgp_courtCount'){
      const newCount=parseInt(e.newValue||'1');
      if(newCount!==_prevCourtCount){
        _prevCourtCount=newCount;
        if(dsCurrentTab===2 && typeof buildTab2CourtBtns==='function') buildTab2CourtBtns();
      }
    }
  });
}
