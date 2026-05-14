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
  // 탭 전환 후 pv scale 재계산 (특히 pv3가 1280px 그대로 나오는 버그 방지)
  requestAnimationFrame(()=>{ if(typeof scalePvc==='function') scalePvc(); });
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

  // 3번탭일 때 resizer2 드래그 시 pv3 scale 실시간 반영
  const resizer2=document.getElementById('resizer2');
  if(resizer2){
    resizer2.addEventListener('mousedown', function(){
      function onMove(){ if(dsCurrentTab===3 && typeof scalePvc==='function') scalePvc(); }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', function cleanup(){
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', cleanup);
      }, {once:true});
    });
  }
}
