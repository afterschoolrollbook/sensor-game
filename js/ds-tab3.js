// ══ DS TAB 3: 대진표 화면 ══
// 기존 진행상태/표시설정/글씨체 UI 제거 → bracket-view.html 임베드

function buildTab3(){
  const container=document.getElementById('dst3');
  if(!container) return;

  // 이미 iframe이 있으면 reload만
  const existing=document.getElementById('dst3-bracket-iframe');
  if(existing){
    try{ existing.contentWindow.location.reload(); }catch(e){}
    return;
  }

  // dst3 내용 완전 교체
  container.innerHTML='';
  container.style.cssText='display:flex;flex-direction:column;flex:1;min-height:0;padding:0;gap:0;';

  // 상단 툴바
  const toolbar=document.createElement('div');
  toolbar.style.cssText='display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--border);flex-shrink:0;background:var(--bg2);';
  toolbar.innerHTML=`
    <span style="font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--red);letter-spacing:2px;">// BRACKET</span>
    <span style="font-size:11px;color:var(--text3);flex:1;">대진표 · 경기 선택 후 2번 전광판에 표시됩니다</span>
    <button onclick="_reloadDst3Iframe()" style="padding:3px 10px;background:transparent;border:1px solid var(--border);color:var(--text3);border-radius:6px;font-size:11px;cursor:pointer;" title="새로고침">↺</button>
    <button onclick="window.open('bracket-view.html','sgp_bracket_view','width=1100,height=750,resizable=yes,scrollbars=no')" style="padding:3px 10px;background:rgba(230,57,70,.1);border:1px solid rgba(230,57,70,.3);color:var(--red);border-radius:6px;font-size:11px;cursor:pointer;" title="별도 창으로 열기">⤢ 크게 보기</button>
  `;
  container.appendChild(toolbar);

  // iframe
  const iframe=document.createElement('iframe');
  iframe.id='dst3-bracket-iframe';
  iframe.src='bracket-view.html?embed=1';
  iframe.style.cssText='flex:1;width:100%;border:none;min-height:0;background:var(--bg);';
  iframe.allow='same-origin';
  container.appendChild(iframe);
}

function _reloadDst3Iframe(){
  const iframe=document.getElementById('dst3-bracket-iframe');
  if(iframe) try{ iframe.contentWindow.location.reload(); }catch(e){ iframe.src=iframe.src; }
}

// buildTab3 초기화 (dspanel.js에서 buildTab3() 재정의 방지)
