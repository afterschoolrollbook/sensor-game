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

  // ── pv2 초기 설정 적용: 탭2 첫 클릭 전에도 저장된 값을 미리보기에 반영
  // (CSS .pv2-nm의 기본 font-size와 localStorage 저장값이 달라 탭 클릭 시 크기가 바뀌는 버그 방지)
  if(typeof _applyD2CfgToPv2==='function'){
    _applyD2CfgToPv2({
      nameShow:  localStorage.getItem('sgp_d2_name_show')  !== 'false',
      nameSize:  parseInt(localStorage.getItem('sgp_d2_name_size')  || '80'),
      courtShow: localStorage.getItem('sgp_d2_court_show') !== 'false',
      courtSize: parseInt(localStorage.getItem('sgp_d2_court_size') || '16'),
      infoShow:  localStorage.getItem('sgp_d2_info_show')  !== 'false',
      infoSize:  parseInt(localStorage.getItem('sgp_d2_info_size')  || '16'),
    });
  }

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

  // resizer2 드래그 시: 3번탭 iframe pointer-events:none으로 mousemove 가로채기 방지
  // + 3번탭일 때 scalePvc 실시간 호출
  const resizer2=document.getElementById('resizer2');
  if(resizer2){
    resizer2.addEventListener('mousedown', function(){
      // iframe 이벤트 차단
      const iframe=document.getElementById('dst3-bracket-iframe');
      if(iframe) iframe.style.pointerEvents='none';

      function onMove(){
        if(dsCurrentTab===3 && typeof scalePvc==='function') scalePvc();
      }
      function onUp(){
        // iframe 이벤트 복원
        const iframe=document.getElementById('dst3-bracket-iframe');
        if(iframe) iframe.style.pointerEvents='';
        document.removeEventListener('mousemove', onMove);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp, {once:true});
    });
  }
}
