/* ══ STEP 6: 게임 진행 ══ */
let g6_idx=0, g6_lapCount=0, g6_targetLaps=1, g6_rafId=null, g6_startTs=0, g6_elapsed=0, g6_laps=[], g6_running=false, g6_pendingWinner=null, g6_serialPort=null;

function g6Init(){
  g6_idx=0; g6_lapCount=0; g6_elapsed=0; g6_laps=[]; g6_running=false; g6_pendingWinner=null;
  g6_targetLaps=S.laps||1;
  g6Refresh();
}

function g6Refresh(){
  g6RenderQueue();
  g6RenderRank();
  g6SetParticipant(g6_idx);
  g6SwUpdateUI();
  // 토너먼트 대진 표시
  const hasTour=S.matches&&S.matches.length;
  const mb=document.getElementById('g6-match-box');
  if(mb)mb.style.display=hasTour?'':'none';
  if(hasTour)g6RenderMatch();
}

function g6SetParticipant(idx){
  if(!S.pts.length)return;
  g6_idx=((idx%S.pts.length)+S.pts.length)%S.pts.length;
  const p=S.pts[g6_idx];
  const el=document.getElementById('g6-cname');
  if(el)el.textContent=p?p.name:'—';
  // 미리보기 + 전광판 도전자 이름 동기화
  const pvChal=document.getElementById('pv-chal');
  if(pvChal)pvChal.textContent=p?p.name:'—';
  try{localStorage.setItem('sgp_display_player',p?p.name:'');}catch(e){}
  g6_lapCount=0;
  g6UpdateLapInfo();
  const ll=document.getElementById('g6-laplist');
  if(ll)ll.innerHTML='';
  g6RenderQueue();
}

function g6UpdateLapInfo(){
  const el=document.getElementById('g6-lapinfo');
  if(el)el.textContent=`바퀴 ${g6_lapCount} / ${g6_targetLaps}`;
}

function g6Tick(){
  if(!g6_running)return;
  g6_elapsed=performance.now()-g6_startTs;
  const el=document.getElementById('g6-time');
  if(el)el.textContent=g6FmtTime(g6_elapsed);
  const pvt=document.getElementById('pv-time');
  if(pvt)pvt.textContent=g6FmtTime(g6_elapsed);
  try{localStorage.setItem('sgp_display_time',g6FmtTime(g6_elapsed));}catch(e){}
  g6_rafId=requestAnimationFrame(g6Tick);
}

function pvcSwitchScreen(n){
  [1,2,3].forEach(i=>{
    const b=document.getElementById('pvc-scr-'+i);
    if(b) b.classList.toggle('active', i===n);
  });
  sendCmd('screen_'+n);
}

// ── 비프음 ──
function _beep(freq,dur,vol){
  try{
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.connect(g);g.connect(ctx.destination);
    o.frequency.value=freq;o.type='sine';
    g.gain.setValueAtTime(vol||0.4,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+(dur||0.15));
    o.start(ctx.currentTime);o.stop(ctx.currentTime+(dur||0.15));
  }catch(e){}
}

// ── 공용 3,2,1 카운트다운 (미리보기 안에서만 + 소리) ──
function _runCountdown(cb){
  let n=3;
  const pvOv=document.getElementById('pv-countdown-ov');
  const pvNm=pvOv?pvOv.querySelector('.pv-cdn'):null;
  if(pvOv){pvOv.style.display='flex';if(pvNm)pvNm.textContent=n;}
  // 전광판에만 직접 전송 (sendCmd 통하면 _pvHandleCmd 루프 발생)
  const cdPayload={type:'countdown',ts:Date.now()};
  try{localStorage.setItem('sgp_display_cmd',JSON.stringify(cdPayload));}catch(e){}
  try{if(_bc)_bc.postMessage(cdPayload);}catch(e){}
  _beep(660,0.12,0.5);
  const iv=setInterval(()=>{
    n--;
    if(n>0){
      if(pvNm)pvNm.textContent=n;
      _beep(660,0.12,0.5);
    } else {
      clearInterval(iv);
      if(pvOv)pvOv.style.display='none';
      _beep(880,0.5,0.7);
      if(cb)cb();
    }
  },900);
}
function g6StopwatchReset(){
  g6_running=false;cancelAnimationFrame(g6_rafId);
  g6_elapsed=0;g6_lapCount=0;g6_laps=[];
  const pvt=document.getElementById('pv-time');
  if(pvt){pvt.textContent='00:00.000';pvt.className='';}
  try{localStorage.setItem('sgp_display_time','00:00.000');}catch(e){}
  sendCmd('timer_reset');
  document.getElementById('g6-start').disabled=false;
  document.getElementById('g6-stop').disabled=true;
  const lapBtn=document.getElementById('g6-sw-lap');
  if(lapBtn) lapBtn.disabled=true;
}

// ── 카운트다운 타이머 모드 ──
let g6_cdMode=1, g6_cdNumIdx=1, g6_cdRecords=[], g6_cdRunning=false;

function g6CdTab(n){
  g6_cdMode=n;
  [1,2,3].forEach(i=>document.getElementById('g6-cd-tab-'+i)?.classList.toggle('active',i===n));
  document.getElementById('g6-cd-mode2').style.display=n===2?'':'none';
  // 초 설정 옆 인라인 요소
  const ptEl=document.getElementById('g6-cd-ptcount');
  const cntEl=document.getElementById('g6-cd-mode3-inline');
  if(ptEl) ptEl.style.display=n===2?'':'none';
  if(cntEl) cntEl.style.display=n===3?'flex':'none';
  const lapBtn=document.getElementById('g6-cd-lap');
  if(lapBtn) lapBtn.style.display=(n===2||n===3)?'':'none';
  const rrBtn=document.getElementById('g6-cd-rankreset-btn');
  if(rrBtn) rrBtn.style.display=(n===2||n===3)?'':'none';
  g6_cdNumIdx=1; g6_cdRecords=[];
  g6CdUpdateUI();
  g6TimerReset();
}

function g6CdUpdateUI(){
  const cnt=document.getElementById('g6-cd-ptcount');
  if(cnt) cnt.textContent=`참가자 ${S.pts.length}명 — ${g6_idx+1}번째`;
  const ci=document.getElementById('g6-cd-countinfo');
  if(ci) ci.textContent=`${g6_cdNumIdx}번째`;
  const rk=document.getElementById('g6-cd-ranking');
  const sb=document.getElementById('g6-cd-save-btn');
  if(!rk) return;
  if(!g6_cdRecords.length){
    rk.style.display='none';
    if(sb) sb.style.display='none';
    return;
  }
  rk.style.display='flex';
  if(sb) sb.style.display='';
  const sorted=[...g6_cdRecords].sort((a,b)=>b.time-a.time); // 남은시간 많을수록 빠름
  rk.innerHTML=sorted.map((r,i)=>{
    const medal=['🥇','🥈','🥉'][i]||(i+1)+'위';
    return`<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:6px;background:var(--card2);font-size:12px;">
      <span style="width:28px;text-align:center;">${medal}</span>
      <span style="flex:1;font-weight:700;">${r.name}</span>
      <span style="font-family:'Share Tech Mono',monospace;color:var(--accent);">${g6FmtTime(r.time)}</span>
    </div>`;
  }).join('');
}

function g6CdLap(){
  if(!g6_cdRunning) return;
  const elapsed=performance.now()-_pvCdStart;
  const remain=Math.max(0,_pvCdDur-elapsed);
  if(g6_cdMode===2){
    const p=S.pts[g6_idx];
    if(p){
      g6_cdRecords.push({name:p.name,time:remain});
      toast(`${p.name}: ${g6FmtTime(remain)}`,'success');
      g6SetParticipant((g6_idx+1)%S.pts.length);
      g6CdUpdateUI();
    }
  } else if(g6_cdMode===3){
    const total=parseInt(document.getElementById('g6-cd-count')?.value||10);
    g6_cdRecords.push({name:`${g6_cdNumIdx}번`,time:remain});
    toast(`${g6_cdNumIdx}번: ${g6FmtTime(remain)}`,'success');
    if(g6_cdNumIdx<total){ g6_cdNumIdx++; } else { toast('전원 기록 완료!','success'); }
    g6CdUpdateUI();
  }
}

function g6CdRankReset(){
  document.getElementById('g6-modal-cd-reset').style.display='flex';
}
function g6CdRankResetConfirm(){
  document.getElementById('g6-modal-cd-reset').style.display='none';
  g6_cdRecords=[]; g6_cdNumIdx=1; g6_idx=0;
  g6CdUpdateUI();
  if(g6_cdMode===2&&S.pts.length) g6SetParticipant(0);
  toast('기록 초기화','info');
}

function g6CdSaveExcel(){
  if(!g6_cdRecords.length){toast('저장할 기록이 없습니다','error');return;}
  document.getElementById('g6-modal-cd-save').style.display='flex';
}
function g6CdSaveExcelConfirm(){
  document.getElementById('g6-modal-cd-save').style.display='none';
  const fname=(document.getElementById('g6-cd-save-filename')?.value.trim()||'카운트다운_기록')+'.xlsx';
  const sorted=[...g6_cdRecords].sort((a,b)=>b.time-a.time);
  const rows=[['순위','이름','남은시간'],...sorted.map((r,i)=>[i+1,r.name,g6FmtTime(r.time)])];
  try{
    const wb=XLSX.utils.book_new();
    const ws=XLSX.utils.aoa_to_sheet(rows);
    ws['!cols']=[{wch:6},{wch:16},{wch:12}];
    XLSX.utils.book_append_sheet(wb,ws,'기록');
    XLSX.writeFile(wb,fname);
    toast('저장 완료: '+fname,'success');
  }catch(e){toast('저장 실패: '+e.message,'error');}
}

function g6TimerSetPreview(){
  const sec=parseInt(document.getElementById('g6-timer-sec')?.value||60);
  // 미리보기 시간 표시
  const pvt=document.getElementById('pv-time');
  const m=Math.floor(sec/60), s=sec%60;
  const formatted=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.000`;
  if(pvt){pvt.textContent=formatted;pvt.className='';}
  // 전광판에도 시간 세팅
  try{localStorage.setItem('sgp_display_time',formatted);}catch(e){}
  sendCmd('timer_set',{sec,formatted});
  toast(`${sec}초 설정됨`,'success');
}

function g6TimerStart(){
  const sec=parseInt(document.getElementById('g6-timer-sec')?.value||60);
  _runCountdown(()=>{
    g6_cdRunning=true;
    sendCmd('timer_start',{duration:sec});
    _pvStartCountdown(sec);
    document.getElementById('g6-cd-start').disabled=true;
    document.getElementById('g6-cd-stop').disabled=false;
    const lapBtn=document.getElementById('g6-cd-lap');
    if(lapBtn&&(g6_cdMode===2||g6_cdMode===3)) lapBtn.disabled=false;
  });
}
function g6TimerStop(){
  g6_cdRunning=false;
  sendCmd('timer_stop');
  _pvStopCountdown();
  document.getElementById('g6-cd-start').disabled=false;
  document.getElementById('g6-cd-stop').disabled=true;
  const lapBtn=document.getElementById('g6-cd-lap');
  if(lapBtn) lapBtn.disabled=true;
}
function g6TimerReset(){
  g6_cdRunning=false;
  _pvStopCountdown();
  const pvt=document.getElementById('pv-time');
  if(pvt){pvt.textContent='00:00.000';pvt.className='';}
  try{localStorage.setItem('sgp_display_time','00:00.000');}catch(e){}
  sendCmd('timer_reset');
  const startBtn=document.getElementById('g6-cd-start');
  const stopBtn=document.getElementById('g6-cd-stop');
  const lapBtn=document.getElementById('g6-cd-lap');
  if(startBtn) startBtn.disabled=false;
  if(stopBtn) stopBtn.disabled=true;
  if(lapBtn) lapBtn.disabled=true;
}

let _pvCdRaf=null,_pvCdStart=null,_pvCdDur=0;
function _pvStartCountdown(sec){
  _pvStopCountdown();
  _pvCdDur=sec*1000;_pvCdStart=performance.now();
  const pvt=document.getElementById('pv-time');
  if(pvt)pvt.className='running';
  function tick(){
    const remain=_pvCdDur-(performance.now()-_pvCdStart);
    if(remain<=0){
      if(pvt){pvt.textContent='00:00.000';pvt.className='stopped';}
      try{localStorage.setItem('sgp_display_time','00:00.000');}catch(e){}
      _pvCdRaf=null;return;
    }
    const fmt=_pvFmtCd(remain);
    if(pvt)pvt.textContent=fmt;
    try{localStorage.setItem('sgp_display_time',fmt);}catch(e){}
    _pvCdRaf=requestAnimationFrame(tick);
  }
  _pvCdRaf=requestAnimationFrame(tick);
}
function _pvStopCountdown(){
  if(_pvCdRaf){cancelAnimationFrame(_pvCdRaf);_pvCdRaf=null;}
}
function _pvFmtCd(ms){
  const t=Math.floor(ms/1000),m=Math.floor(t/60),s=t%60,cs=Math.floor((ms%1000)/10);
  return`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}0`;
}

// ── 섹션 접기/펼치기 ──
function g6ToggleSection(id){
  const header=document.getElementById('g6-'+id+'-header');
  const body=document.getElementById('g6-'+id+'-body');
  if(!header||!body)return;
  const isCollapsed=body.classList.contains('collapsed');
  body.classList.toggle('collapsed',!isCollapsed);
  header.classList.toggle('collapsed',!isCollapsed);
}

// ── 휴식시간 카운트다운 타이머 ──
let g6_rtMode=1, g6_rtNumIdx=1, g6_rtRecords=[], g6_rtRunning=false;
let _pvRtRaf=null, _pvRtStart=null, _pvRtDur=0;

function g6RtTab(n){
  g6_rtMode=n;
  [1,2,3].forEach(i=>document.getElementById('g6-rt-tab-'+i)?.classList.toggle('active',i===n));
  const m2=document.getElementById('g6-rt-mode2');if(m2)m2.style.display=n===2?'':'none';
  const ptEl=document.getElementById('g6-rt-ptcount');if(ptEl)ptEl.style.display=n===2?'inline':'none';
  const cntEl=document.getElementById('g6-rt-mode3-inline');if(cntEl)cntEl.style.display=n===3?'flex':'none';
  const lapBtn=document.getElementById('g6-rt-lap');if(lapBtn)lapBtn.style.display=(n===2||n===3)?'':'none';
  const rrBtn=document.getElementById('g6-rt-rankreset-btn');if(rrBtn)rrBtn.style.display=(n===2||n===3)?'':'none';
  g6_rtNumIdx=1;g6_rtRecords=[];g6RtUpdateUI();g6RtReset();
}
function g6RtFmt(ms){const t=Math.max(0,ms);const m=Math.floor(t/60000);const s=Math.floor((t%60000)/1000);const d=Math.floor(t%1000);return`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(d).padStart(3,'0')}`;}
function g6RtUpdateUI(){
  const ci=document.getElementById('g6-rt-countinfo');if(ci)ci.textContent=`${g6_rtNumIdx}번째`;
  const rk=document.getElementById('g6-rt-ranking');const sb=document.getElementById('g6-rt-save-btn');
  if(!rk)return;
  if(!g6_rtRecords.length){rk.style.display='none';if(sb)sb.style.display='none';return;}
  rk.style.display='flex';if(sb)sb.style.display='';
  const sorted=[...g6_rtRecords].sort((a,b)=>b.time-a.time);
  rk.innerHTML=sorted.map((r,i)=>{const medal=['🥇','🥈','🥉'][i]||(i+1)+'위';return`<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:6px;background:var(--card2);font-size:12px;"><span style="width:28px;text-align:center;">${medal}</span><span style="flex:1;font-weight:700;">${r.name}</span><span style="font-family:'Share Tech Mono',monospace;color:var(--accent);">${g6RtFmt(r.time)}</span></div>`;}).join('');
}
function g6RtLap(){
  if(!g6_rtRunning)return;
  const remain=Math.max(0,_pvRtDur-(performance.now()-_pvRtStart));
  if(g6_rtMode===2&&S&&S.pts){const p=S.pts[g6_idx]||{name:`참가자`};g6_rtRecords.push({name:p.name,time:remain});toast(`${p.name}: ${g6RtFmt(remain)}`,'success');g6RtUpdateUI();}
  else if(g6_rtMode===3){const total=parseInt(document.getElementById('g6-rt-count')?.value||10);g6_rtRecords.push({name:`${g6_rtNumIdx}번`,time:remain});toast(`${g6_rtNumIdx}번: ${g6RtFmt(remain)}`,'success');if(g6_rtNumIdx<total)g6_rtNumIdx++;else toast('전원 기록 완료!','success');g6RtUpdateUI();}
}
function g6RtRankReset(){if(!confirm('휴식시간 기록을 초기화할까요?'))return;g6_rtRecords=[];g6_rtNumIdx=1;g6RtUpdateUI();toast('기록 초기화','info');}
function g6RtSaveExcel(){
  if(!g6_rtRecords.length){toast('저장할 기록이 없습니다','error');return;}
  const rows=[['순위','이름','남은시간'],...[...g6_rtRecords].sort((a,b)=>b.time-a.time).map((r,i)=>[i+1,r.name,g6RtFmt(r.time)])];
  try{const wb=XLSX.utils.book_new();const ws=XLSX.utils.aoa_to_sheet(rows);ws['!cols']=[{wch:6},{wch:16},{wch:12}];XLSX.utils.book_append_sheet(wb,ws,'기록');XLSX.writeFile(wb,'휴식시간_기록.xlsx');toast('저장 완료','success');}catch(e){toast('저장 실패: '+e.message,'error');}
}
function g6RtSetPreview(){
  const sec=parseInt(document.getElementById('g6-rt-sec')?.value||60);
  const m=Math.floor(sec/60),s=sec%60;
  const formatted=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.000`;
  const pvt=document.getElementById('pv-time');
  if(pvt){pvt.textContent=formatted;pvt.className='';}
  try{localStorage.setItem('sgp_display_time',formatted);}catch(e){}
  sendCmd('timer_set',{sec,formatted});
  toast(`휴식 ${sec}초 설정됨`,'success');
}
function _pvRtTick(){
  const remain=_pvRtDur-(performance.now()-_pvRtStart);
  const pvt=document.getElementById('pv-time');
  if(remain<=0){
    g6_rtRunning=false;
    if(pvt){pvt.textContent='00:00.000';pvt.className='stopped';}
    try{localStorage.setItem('sgp_display_time','00:00.000');}catch(e){}
    sendCmd('timer_stop');
    const s=document.getElementById('g6-rt-start');const st=document.getElementById('g6-rt-stop');
    const l=document.getElementById('g6-rt-lap');
    if(s)s.disabled=false;if(st)st.disabled=true;if(l)l.disabled=true;
    toast('휴식시간 종료!','info');_pvRtRaf=null;return;
  }
  const fmt=_pvFmtCd(remain);
  if(pvt)pvt.textContent=fmt;
  try{localStorage.setItem('sgp_display_time',fmt);}catch(e){}
  _pvRtRaf=requestAnimationFrame(_pvRtTick);
}
function g6RtStart(){
  const sec=parseInt(document.getElementById('g6-rt-sec')?.value||60);
  _runCountdown(()=>{
    g6_rtRunning=true;_pvRtDur=sec*1000;_pvRtStart=performance.now();
    sendCmd('timer_start',{duration:sec});
    _pvStopCountdown(); // cd 카운트다운이 돌고 있으면 중지
    const pvt=document.getElementById('pv-time');
    if(pvt)pvt.className='running';
    const s=document.getElementById('g6-rt-start');const st=document.getElementById('g6-rt-stop');const l=document.getElementById('g6-rt-lap');
    if(s)s.disabled=true;if(st)st.disabled=false;if(l&&(g6_rtMode===2||g6_rtMode===3))l.disabled=false;
    if(_pvRtRaf)cancelAnimationFrame(_pvRtRaf);
    _pvRtRaf=requestAnimationFrame(_pvRtTick);
    toast(`휴식 ${sec}초 시작!`,'success');
  });
}
function g6RtStop(){
  g6_rtRunning=false;if(_pvRtRaf){cancelAnimationFrame(_pvRtRaf);_pvRtRaf=null;}
  sendCmd('timer_stop');
  const pvt=document.getElementById('pv-time');
  if(pvt)pvt.className='stopped';
  const s=document.getElementById('g6-rt-start');const st=document.getElementById('g6-rt-stop');const l=document.getElementById('g6-rt-lap');
  if(s)s.disabled=false;if(st)st.disabled=true;if(l)l.disabled=true;
}
function g6RtReset(){
  g6_rtRunning=false;if(_pvRtRaf){cancelAnimationFrame(_pvRtRaf);_pvRtRaf=null;}
  sendCmd('timer_reset');
  const pvt=document.getElementById('pv-time');
  if(pvt){pvt.textContent='00:00.000';pvt.className='';}
  try{localStorage.setItem('sgp_display_time','00:00.000');}catch(e){}
  const s=document.getElementById('g6-rt-start');const st=document.getElementById('g6-rt-stop');const l=document.getElementById('g6-rt-lap');
  if(s)s.disabled=false;if(st)st.disabled=true;if(l)l.disabled=true;
}

// ── 스톱워치 모드 (1:일반 2:명단 3:인원수) ──
let g6_swMode=1;
let g6_swNumIdx=1; // 인원수 모드 현재 순번

function g6SwTab(n){
  g6_swMode=n;
  [1,2,3].forEach(i=>{
    document.getElementById('g6-sw-tab-'+i)?.classList.toggle('active',i===n);
  });
  document.getElementById('g6-sw-mode2').style.display=n===2?'':'none';
  document.getElementById('g6-sw-mode3').style.display=n===3?'':'none';
  const lapBtn=document.getElementById('g6-sw-lap');
  if(lapBtn) lapBtn.style.display=(n===2||n===3)?'':'none';
  const rrBtn=document.getElementById('g6-sw-rankreset-btn');
  if(rrBtn) rrBtn.style.display=(n===2||n===3)?'':'none';
  g6_swNumIdx=1;
  g6_swRecords=[];
  g6SwUpdateUI();
  g6StopwatchReset();
}

function g6SwLap(){
  if(!g6_running)return;
  const lapTime=g6_elapsed;
  if(g6_swMode===2){
    const p=S.pts[g6_idx];
    if(p){
      g6_swRecords.push({name:p.name,time:lapTime});
      toast(`${p.name}: ${g6FmtTime(lapTime)}`,'success');
      const next=(g6_idx+1)%S.pts.length;
      g6SetParticipant(next);
      g6SwUpdateUI();
    }
  } else if(g6_swMode===3){
    const total=parseInt(document.getElementById('g6-sw-count')?.value||10);
    g6_swRecords.push({name:`${g6_swNumIdx}번`,time:lapTime});
    toast(`${g6_swNumIdx}번: ${g6FmtTime(lapTime)}`,'success');
    if(g6_swNumIdx<total){
      g6_swNumIdx++;
      g6SwUpdateUI();
    } else {
      toast('전원 기록 완료!','success');
      g6SwUpdateUI();
    }
  }
}



// ── 스톱워치 개인전 기록 ──
let g6_swRecords=[];

function g6SwUpdateUI(){
  // 탭2: 명단
  const cnt=document.getElementById('g6-sw-ptcount');
  if(cnt) cnt.textContent=`참가자 ${S.pts.length}명 — ${g6_idx+1}번째`;
  // 탭3: 인원수
  const ci=document.getElementById('g6-sw-countinfo');
  if(ci) ci.textContent=`${g6_swNumIdx}번째`;
  // 기록 리스트
  const rk=document.getElementById('g6-sw-ranking');
  if(!rk) return;
  if(!g6_swRecords.length){
    rk.style.display='none';
    const sb=document.getElementById('g6-sw-save-btn');
    if(sb) sb.style.display='none';
    return;
  }
  rk.style.display='flex';
  const sb=document.getElementById('g6-sw-save-btn');
  if(sb) sb.style.display='';
  const sorted=[...g6_swRecords].sort((a,b)=>a.time-b.time);
  rk.innerHTML=sorted.map((r,i)=>{
    const medal=['🥇','🥈','🥉'][i]||(i+1)+'위';
    return`<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:6px;background:var(--card2);font-size:12px;">
      <span style="width:28px;text-align:center;">${medal}</span>
      <span style="flex:1;font-weight:700;">${r.name}</span>
      <span style="font-family:'Share Tech Mono',monospace;color:var(--accent);">${g6FmtTime(r.time)}</span>
    </div>`;
  }).join('');
}

function g6RankReset(){
  document.getElementById('g6-modal-reset').style.display='flex';
}
function g6RankResetConfirm(){
  document.getElementById('g6-modal-reset').style.display='none';
  g6_swRecords=[];
  g6_idx=0;g6_swNumIdx=1;
  g6SwUpdateUI();
  if(g6_swMode===2&&S.pts.length) g6SetParticipant(0);
  const saveBtn=document.getElementById('g6-sw-save-btn');
  if(saveBtn) saveBtn.style.display='none';
  toast('기록 초기화','info');
}

function g6SaveExcel(){
  if(!g6_swRecords.length){toast('저장할 기록이 없습니다','error');return;}
  document.getElementById('g6-modal-save').style.display='flex';
}
function g6SaveExcelConfirm(){
  document.getElementById('g6-modal-save').style.display='none';
  const fname=(document.getElementById('g6-save-filename')?.value.trim()||'스톱워치_기록')+'.xlsx';
  const sorted=[...g6_swRecords].sort((a,b)=>a.time-b.time);
  const rows=[['순위','이름','기록'],...sorted.map((r,i)=>[i+1,r.name,g6FmtTime(r.time)])];
  try{
    const wb=XLSX.utils.book_new();
    const ws=XLSX.utils.aoa_to_sheet(rows);
    ws['!cols']=[{wch:6},{wch:16},{wch:12}];
    XLSX.utils.book_append_sheet(wb,ws,'기록');
    XLSX.writeFile(wb,fname);
    toast('저장 완료: '+fname,'success');
  }catch(e){toast('저장 실패: '+e.message,'error');}
}

function g6ShowWinner(){
  const top=g6_swRecords.length?[...g6_swRecords].sort((a,b)=>a.time-b.time)[0]:null;
  const name=top?top.name:(S.pts[g6_idx]?.name||'—');
  const time=top?g6FmtTime(top.time):null;
  sendCmd('winner',{name,time});
}

// ══ 카운트다운 연출 (반복 / 커스텀) ══
let g6_cdirMode = 'repeat';
let g6_cdirRunning = false;
let g6_cdirLoopTimer = null;
let g6_cdirSeq = [];
let g6_cdirSrcsR = new Set([1]); // 반복 모드 선택 소스

// 탭 전환
function g6CdirTab(mode) {
  g6_cdirMode = mode;
  ['repeat','custom'].forEach(m => {
    document.getElementById('g6-cdir-tab-' + m)?.classList.toggle('active', m === mode);
    const el = document.getElementById('g6-cdir-mode-' + m);
    if (el) el.style.display = m === mode ? 'block' : 'none';
  });
  _g6CdirUpdateStatus();
}

// 소스 토글 (반복 모드: 버튼 on/off 스타일)
function g6CdirToggleSrc(mode, n) {
  const srcs = g6_cdirSrcsR;
  const btn  = document.getElementById(`g6-cdir-${mode}-src-${n}`);
  const isOn = srcs.has(n);
  if (isOn && srcs.size <= 1) { toast('최소 1개는 선택해야 해요', 'error'); return; }
  if (isOn) {
    srcs.delete(n);
    if (btn) { btn.style.borderColor='var(--border2)'; btn.style.background='var(--card2)'; btn.style.color='var(--text3)'; }
  } else {
    srcs.add(n);
    const clr = n === 1 ? 'var(--red)' : 'var(--accent)';
    const bg  = n === 1 ? 'rgba(230,57,70,.15)' : 'rgba(76,201,240,.1)';
    if (btn) { btn.style.borderColor=clr; btn.style.background=bg; btn.style.color=clr; }
  }
  _g6CdirUpdateStatus();
}

// 시간 입력 → 메인 타이머 입력 동기화
function g6CdirSyncSec(mode, n) {
  const val = document.getElementById(`g6-cdir-${mode}-sec-${n}`)?.value;
  if (!val) return;
  const el = document.getElementById(n === 1 ? 'g6-timer-sec' : 'g6-rt-sec');
  if (el) el.value = val;
}

// 커스텀 반복 토글
function g6CdirToggleCLoop() {
  const on = document.getElementById('g6-cdir-c-loop')?.checked;
  const w  = document.getElementById('g6-cdir-c-loop-wrap');
  if (w) w.style.display = on ? 'flex' : 'none';
}

// 커스텀 시퀀스
function g6CdirSeqAdd(type) { g6_cdirSeq.push(type); _g6CdirRenderSeq(); }
function g6CdirSeqClear()   { g6_cdirSeq = [];       _g6CdirRenderSeq(); }
function _g6CdirRenderSeq() {
  const el = document.getElementById('g6-cdir-seq-list');
  if (!el) return;
  if (!g6_cdirSeq.length) {
    el.style.display = '';
    el.style.flexWrap = '';
    el.style.gap = '';
    el.innerHTML = '<span style="color:var(--text3);font-size:11px;">아래 버튼으로 순서를 추가하세요</span>';
    return;
  }
  const items = g6_cdirSeq.map((s, i) => {
    const label = s === 1 ? '①경기' : s === 2 ? '②휴식' : '🔔종';
    const clr   = s === 1 ? 'var(--red)' : s === 2 ? 'var(--accent)' : 'var(--yellow)';
    return `<div style="display:inline-flex;align-items:center;gap:3px;padding:4px 10px;background:var(--card);border:1px solid ${clr};border-radius:6px;font-size:12px;font-weight:700;color:${clr};flex-shrink:0;">${label
      }<span onclick="g6_cdirSeq.splice(${i},1);_g6CdirRenderSeq();" style="cursor:pointer;color:var(--text3);margin-left:4px;font-size:11px;">✕</span></div>`;
  });
  el.style.display = 'flex';
  el.style.flexWrap = 'wrap';
  el.style.gap = '5px';
  el.style.alignItems = 'center';
  el.innerHTML = items.join('<span style="color:var(--text3);font-size:11px;">→</span>');
}

// 상태 표시
function _g6CdirUpdateStatus(msg) {
  const el = document.getElementById('g6-cdir-status');
  if (!el) return;
  if (msg) { el.textContent = msg; return; }
  el.textContent = g6_cdirMode === 'repeat' ? '// [반복] 대기중' : '// [커스텀] 대기중';
}

// 시작
function g6CdirStart() {
  const pfx = g6_cdirMode === 'repeat' ? 'r' : 'c';
  g6CdirSyncSec(pfx, 1);
  g6CdirSyncSec(pfx, 2);

  let seq = [];
  let loopCnt = 1;

  if (g6_cdirMode === 'repeat') {
    [...g6_cdirSrcsR].sort().forEach(s => seq.push(s));
    if (document.getElementById('g6-cdir-r-bell')?.checked) seq.push('bell');
    loopCnt = Math.max(1, parseInt(document.getElementById('g6-cdir-r-cnt')?.value || 2));
  } else {
    seq = [...g6_cdirSeq];
    if (document.getElementById('g6-cdir-c-bell-inline')?.checked) seq.push('bell');
    if (document.getElementById('g6-cdir-c-loop')?.checked)
      loopCnt = Math.max(1, parseInt(document.getElementById('g6-cdir-c-cnt')?.value || 2));
  }

  if (!seq.length) { toast('시퀀스가 비어있어요', 'error'); return; }

  g6_cdirRunning = true;
  document.getElementById('g6-cdir-start').disabled = true;
  document.getElementById('g6-cdir-stop').disabled = false;
  _g6CdirRunSeq(seq, 0, loopCnt);
}

// 시퀀스 실행 엔진
function _g6CdirRunSeq(seq, stepIdx, loopRemain) {
  if (!g6_cdirRunning) return;
  if (stepIdx >= seq.length) {
    loopRemain--;
    if (loopRemain > 0) {
      _g6CdirUpdateStatus(`// 반복 중... 남은 ${loopRemain}회`);
      g6_cdirLoopTimer = setTimeout(() => _g6CdirRunSeq(seq, 0, loopRemain), 1000);
    } else {
      g6_cdirRunning = false;
      document.getElementById('g6-cdir-start').disabled = false;
      document.getElementById('g6-cdir-stop').disabled = true;
      _g6CdirUpdateStatus('// ✅ 완료!');
    }
    return;
  }
  const step = seq[stepIdx];
  const next = () => _g6CdirRunSeq(seq, stepIdx + 1, loopRemain);
  if (step === 'bell') {
    _g6CdirRingBell();
    _g6CdirUpdateStatus('// 🔔 땡~');
    g6_cdirLoopTimer = setTimeout(next, 2000);
    return;
  }
  const sec   = Math.max(1, parseInt(document.getElementById(step === 1 ? 'g6-timer-sec' : 'g6-rt-sec')?.value || 60));
  const label = step === 1 ? '⚔️경기①' : '💤휴식②';
  _g6CdirUpdateStatus(`// ${label} ${sec}초 (${seq.length - stepIdx}스텝 남음)`);
  if (step === 1) {
    // 경기용: 3초 카운트다운 포함
    g6TimerStart();
    g6_cdirLoopTimer = setTimeout(() => { if (!g6_cdirRunning) return; next(); }, (3 + sec) * 1000 + 1500);
  } else {
    // 휴식시간: 카운트다운 없이 바로 시작
    _g6RtStartDirect(sec);
    g6_cdirLoopTimer = setTimeout(() => { if (!g6_cdirRunning) return; next(); }, sec * 1000 + 800);
  }
}

// 휴식시간 카운트다운 없이 바로 시작 (카운트다운 연출 전용)
function _g6RtStartDirect(sec) {
  g6_rtRunning = true;
  _pvRtDur = sec * 1000;
  _pvRtStart = performance.now();
  sendCmd('timer_start', { duration: sec });
  _pvStopCountdown();
  const pvt = document.getElementById('pv-time');
  if (pvt) pvt.className = 'running';
  const s = document.getElementById('g6-rt-start');
  const st = document.getElementById('g6-rt-stop');
  const l = document.getElementById('g6-rt-lap');
  if (s) s.disabled = true;
  if (st) st.disabled = false;
  if (l && (g6_rtMode === 2 || g6_rtMode === 3)) l.disabled = false;
  if (_pvRtRaf) cancelAnimationFrame(_pvRtRaf);
  _pvRtRaf = requestAnimationFrame(_pvRtTick);
}

// 종소리
function _g6CdirRingBell() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine'; o.frequency.value = 880;
    g.gain.setValueAtTime(0.7, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    o.start(ctx.currentTime); o.stop(ctx.currentTime + 1.5);
  } catch(e) {}
  sendCmd('bell');
  toast('🔔 땡~', 'success');
}

// 정지
function g6CdirStop() {
  g6_cdirRunning = false;
  if (g6_cdirLoopTimer) { clearTimeout(g6_cdirLoopTimer); g6_cdirLoopTimer = null; }
  g6TimerStop(); g6RtStop();
  document.getElementById('g6-cdir-start').disabled = false;
  document.getElementById('g6-cdir-stop').disabled = true;
  _g6CdirUpdateStatus('// 정지됨');
}

// 퓨즈
function g6CdirFuse() {
  const pfx = g6_cdirMode === 'repeat' ? 'r' : 'c';
  g6CdirSyncSec(pfx, 1); g6CdirSyncSec(pfx, 2);
  sendCmd('fuse');
  _g6CdirUpdateStatus('// 💥 퓨즈 점화!');
  _runCountdown(() => {
    const srcs = g6_cdirMode === 'repeat' ? g6_cdirSrcsR : new Set([1,2]);
    const secCd = Math.max(1, parseInt(document.getElementById('g6-timer-sec')?.value || 60));
    const secRt = Math.max(1, parseInt(document.getElementById('g6-rt-sec')?.value || 60));
    [...srcs].sort().forEach(s => {
      if (s === 1) g6TimerStart();         // 경기용: _runCountdown 포함(이미 호출됨)
      else _g6RtStartDirect(secRt);        // 휴식: 카운트 없이 바로
    });
    setTimeout(() => _g6CdirUpdateStatus('// 타이머 진행 중...'), 100);
  });
}

// 초기화
function g6CdirReset() {
  g6_cdirRunning = false;
  if (g6_cdirLoopTimer) { clearTimeout(g6_cdirLoopTimer); g6_cdirLoopTimer = null; }
  g6TimerReset(); g6RtReset();
  document.getElementById('g6-cdir-start').disabled = false;
  document.getElementById('g6-cdir-stop').disabled = true;
  _g6CdirUpdateStatus();
}

function g6Start(){
  _runCountdown(()=>g6DoStart());
}

function g6DoStart(){
  g6_lapCount=0;g6_laps=[];
  g6UpdateLapInfo();
  const ll=document.getElementById('g6-laplist');if(ll)ll.innerHTML='';
  const te=document.getElementById('g6-time');
  if(te){te.textContent='00:00.000';te.className='g6-time running';}
  g6_startTs=performance.now();g6_elapsed=0;g6_running=true;
  cancelAnimationFrame(g6_rafId);g6_rafId=requestAnimationFrame(g6Tick);
  document.getElementById('g6-start').disabled=true;
  document.getElementById('g6-stop').disabled=false;
  const lapBtn=document.getElementById('g6-sw-lap');
  if(lapBtn&&(g6_swMode===2||g6_swMode===3)) lapBtn.disabled=false;
  const oldLap=document.getElementById('g6-lap');
  if(oldLap) oldLap.disabled=(g6_targetLaps<=1);
}

function g6Stop(){
  if(!g6_running)return;
  g6_running=false;cancelAnimationFrame(g6_rafId);
  const te=document.getElementById('g6-time');if(te)te.className='g6-time stopped';
  document.getElementById('g6-start').disabled=false;
  document.getElementById('g6-stop').disabled=true;
  const lapBtn=document.getElementById('g6-sw-lap');
  if(lapBtn) lapBtn.disabled=true;
  const lapBtn3=document.getElementById('g6-lap');if(lapBtn3)lapBtn3.disabled=true;

  if(g6_swMode===1){
    // 일반: 기록만 표시
    toast(g6FmtTime(g6_elapsed),'success');
  } else if(g6_swMode===2){
    // 명단 모드
    const p=S.pts[g6_idx];
    if(p){
      g6_swRecords.push({name:p.name,time:g6_elapsed});
      toast(`${p.name}: ${g6FmtTime(g6_elapsed)}`,'success');
      const next=(g6_idx+1)%S.pts.length;
      setTimeout(()=>{
        g6SetParticipant(next);
        g6SwUpdateUI();
        const te2=document.getElementById('g6-time');
        if(te2){te2.textContent='00:00.000';te2.className='g6-time';}
        document.getElementById('g6-start').disabled=false;
      },1200);
    }
  } else if(g6_swMode===3){
    // 인원수 모드
    const total=parseInt(document.getElementById('g6-sw-count')?.value||10);
    g6_swRecords.push({name:`${g6_swNumIdx}번`,time:g6_elapsed});
    toast(`${g6_swNumIdx}번: ${g6FmtTime(g6_elapsed)}`,'success');
    if(g6_swNumIdx<total){
      g6_swNumIdx++;
      setTimeout(()=>{
        g6SwUpdateUI();
        const te2=document.getElementById('g6-time');
        if(te2){te2.textContent='00:00.000';te2.className='g6-time';}
        document.getElementById('g6-start').disabled=false;
      },1200);
    } else {
      toast('전원 기록 완료!','success');
      g6SwUpdateUI();
    }
  }
  try{if(typeof updatePv==='function')updatePv();}catch(e){}
}

function g6Lap(){
  const lapTs=performance.now();
  const lapTime=g6_laps.length?lapTs-g6_startTs-g6_laps.reduce((a,b)=>a+b,0):lapTs-g6_startTs;
  g6_laps.push(lapTime);
  g6_lapCount++;
  g6UpdateLapInfo();
  const best=g6_laps.length>1?Math.min(...g6_laps):null;
  const isBest=best&&lapTime===best;
  const item=document.createElement('div');item.className='g6-lapitem';
  item.innerHTML=`<span class="g6-lapnum">LAP ${g6_lapCount}</span><span class="g6-laptime ${isBest?'g6-lapbest':''}">${g6FmtTime(lapTime)}</span><span style="font-size:10px;color:var(--text3);">${g6FmtTime(g6_elapsed)}</span>${isBest?'<span style="font-size:9px;color:var(--green);margin-left:auto;">BEST</span>':''}`;
  const ll=document.getElementById('g6-laplist');if(ll)ll.prepend(item);
  if(g6_lapCount>=g6_targetLaps)g6Stop();
}

function g6FmtTime(ms){
  const t=Math.max(0,ms);
  const m=Math.floor(t/60000);
  const s=Math.floor((t%60000)/1000);
  const ms2=Math.floor(t%1000);
  return`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms2).padStart(3,'0')}`;
}

function g6RenderQueue(){
  const el=document.getElementById('g6-queue');if(!el)return;
  el.innerHTML=S.pts.map((p,i)=>`<div class="g6-qtag${i===g6_idx?' cur':''}" onclick="g6SetParticipant(${i})" style="${p.color?`border-color:${p.color};`:''}">${p.name}</div>`).join('');
}

function g6RenderRank(){
  const el=document.getElementById('g6-rank-list');if(!el)return;
  const cnt=document.getElementById('g6-rank-count');
  try{
    const st=App.getState();
    const recs=st.records||{};
    const ranked=S.pts.map(p=>{
      const pr=recs[p.id]||[];
      const best=pr.length?Math.min(...pr.map(r=>r.time)):null;
      return{p,best};
    }).filter(x=>x.best!==null).sort((a,b)=>a.best-b.best);
    if(cnt)cnt.textContent=ranked.length+'명';
    if(!ranked.length){el.innerHTML='<div style="color:var(--text3);font-size:12px;">아직 기록이 없어요</div>';return;}
    el.innerHTML=ranked.map((x,i)=>{
      const isCur=S.pts[g6_idx]?.id===x.p.id;
      return`<div class="g6-rank-item${i===0?' r1':''}${isCur?' cur':''}"><div class="g6-rno">${['🥇','🥈','🥉'][i]??i+1}</div><div style="width:6px;height:6px;border-radius:50%;background:${x.p.color||'var(--text3)'};flex-shrink:0;"></div><div class="g6-rnm">${x.p.name}</div><div class="g6-rtm">${g6FmtTime(x.best)}</div></div>`;
    }).join('');
  }catch(e){el.innerHTML='<div style="color:var(--text3);font-size:12px;">기록 없음</div>';}
}

function g6RenderMatch(){
  if(!S.matches||!S.matches.length)return;
  // 현재 미결 매치 찾기
  let cur=null;
  outer:for(let ri=0;ri<S.matches.length;ri++){
    for(let mi=0;mi<S.matches[ri].length;mi++){
      const m=S.matches[ri][mi];
      if(!m.winner&&m.p1&&m.p2&&!m.bye){cur={m,ri,mi};break outer;}
    }
  }
  if(!cur){
    const mb=document.getElementById('g6-match-box');
    if(mb)mb.innerHTML='<div style="text-align:center;padding:16px;font-size:24px;">🏆 토너먼트 완료!</div>';
    return;
  }
  const{m,ri,mi}=cur;
  const rb=document.getElementById('g6-round-badge');const mp=document.getElementById('g6-match-progress');
  const rnames=['1라운드','2라운드','3라운드','4라운드','결승'];
  if(rb)rb.textContent=ri===S.matches.length-1&&S.matches.length>1?'결승':rnames[ri]||`${ri+1}라운드`;
  if(mp)mp.textContent=`매치 ${mi+1}/${S.matches[ri].length}`;
  const p1n=document.getElementById('g6-p1-name');const p2n=document.getElementById('g6-p2-name');
  const p1t=document.getElementById('g6-p1-time');const p2t=document.getElementById('g6-p2-time');
  const getTime=p=>{try{const st=App.getState();const recs=(st.records||{})[p?.id]||[];const best=recs.length?Math.min(...recs.map(r=>r.time)):null;return best?g6FmtTime(best):'기록없음';}catch(e){return'—';}};
  if(p1n)p1n.textContent=m.p1?.name||'TBD';if(p2n)p2n.textContent=m.p2?.name||'TBD';
  if(p1t)p1t.textContent=getTime(m.p1);if(p2t)p2t.textContent=getTime(m.p2);
  document.getElementById('g6-p1').dataset.ri=ri;document.getElementById('g6-p1').dataset.mi=mi;document.getElementById('g6-p1').dataset.slot='p1';
  document.getElementById('g6-p2').dataset.ri=ri;document.getElementById('g6-p2').dataset.mi=mi;document.getElementById('g6-p2').dataset.slot='p2';
  g6_pendingWinner=null;
  ['g6-p1','g6-p2'].forEach(id=>{const el=document.getElementById(id);if(el){el.className='g6-player';}});
  // 현재 매치 p1을 도전자로 자동 설정
  if(m.p1){const idx=S.pts.findIndex(p=>p.id===m.p1.id||p.name===m.p1.name);if(idx>=0)g6SetParticipant(idx);}
}

function g6SelectWinner(slot){
  g6_pendingWinner=slot;
  document.getElementById('g6-p1').className='g6-player'+(slot==='p1'?' winner':' loser');
  document.getElementById('g6-p2').className='g6-player'+(slot==='p2'?' winner':' loser');
}

function g6ConfirmWinner(){
  if(!g6_pendingWinner){toast('승자를 선택하세요','error');return;}
  const p1el=document.getElementById('g6-p1');
  const ri=parseInt(p1el.dataset.ri),mi=parseInt(p1el.dataset.mi);
  const m=S.matches[ri][mi];
  const winner=g6_pendingWinner==='p1'?m.p1:m.p2;
  S.matches[ri][mi].winner=winner;
  // 다음 라운드에 승자 배치
  if(!S.matches[ri+1])S.matches.push([]);
  const nextRound=S.matches[ri+1];
  const paired=nextRound.find(nm=>nm.tbd_from_ri===ri&&Math.floor(nm.tbd_mi_a/2)===Math.floor(mi/2));
  if(paired){if(mi%2===0)paired.p1=winner;else paired.p2=winner;}
  else{nextRound.push({p1:mi%2===0?winner:null,p2:mi%2===1?winner:null,tbd_from_ri:ri,tbd_mi_a:mi,winner:null,bye:false});}
  toast(winner.name+' 승리!','success');
  try{if(typeof updatePv==='function')updatePv();}catch(e){}
  setTimeout(g6RenderMatch,300);
}

function g6OpenBracket(){
  try{
    localStorage.setItem('sgp_pts',JSON.stringify(S.pts));
    localStorage.setItem('sgp_bw_pts',JSON.stringify(S.pts));
    if(S.groupBrackets&&S.groupBrackets.length){
      localStorage.setItem('sgp_groupBrackets',JSON.stringify(S.groupBrackets));
    }
  }catch(e){}
  window.open('bracket-view.html','sgp_bracket_view','width=1100,height=750,resizable=yes,scrollbars=no');
}

function g6OpenDisplay(){
  window.open('display.html','sgp_display','width=1280,height=720');
  toast('전광판 창을 HDMI 화면으로 드래그 후 F11 전체화면!','info');
}

function g6ResetGame(){
  if(!confirm('현재 게임 기록을 초기화할까요?'))return;
  try{const st=App.getState();App.setState({...st,records:{}});}catch(e){}
  g6_idx=0;g6_lapCount=0;g6_elapsed=0;g6_laps=[];g6_running=false;
  cancelAnimationFrame(g6_rafId);
  const te=document.getElementById('g6-time');if(te){te.textContent='00:00.000';te.className='g6-time';}
  document.getElementById('g6-start').disabled=false;
  document.getElementById('g6-stop').disabled=true;
  document.getElementById('g6-lap').disabled=true;
  g6Refresh();
  toast('게임 초기화됨','info');
}

async function g6ConnectSerial(){
  try{
    g6_serialPort=await navigator.serial.requestPort();
    await g6_serialPort.open({baudRate:9600});
    document.getElementById('g6-dot-a').classList.add('active');
    document.getElementById('g6-sensor-status').textContent='Arduino 연결됨';
    toast('Arduino 연결 성공!','success');
  }catch(e){toast('Arduino 연결 실패: '+e.message,'error');}
}

document.getElementById('pts-popup').addEventListener('click',e=>{if(e.target===document.getElementById('pts-popup'))closePtsPopup();});

// bracket-window.html과의 메시지 통신
window.addEventListener('message',e=>{
  if(!e.data) return;
  // bracket-window가 열리자마자 데이터 재요청하는 경우 응답
  if(e.data.type==='sgp_pts_request'){
    if(window._ptsWin&&!window._ptsWin.closed){
      window._ptsWin.postMessage({type:'sgp_pts_update',pts:S.pts},'*');
    }
  }
  // bracket-window에서 대진표 확정 & 적용 시 수신
  if(e.data.type==='sgp_apply_bracket'){
    S.matches=e.data.matches||[];
    S.matchLabel=e.data.label||'';
    S.matchProc='tournament';
    S.proc='ind-tour';
    S.matchPts=e.data.matchPts||'';
    S.curMatch=0;
    if(e.data.groupBrackets&&e.data.groupBrackets.length){S.groupBrackets=e.data.groupBrackets;}
    try{if(typeof buildProc==='function')buildProc();}catch(err){}
    try{if(typeof updatePv==='function')updatePv();}catch(err){}
    toast((e.data.label||'대진표')+' 적용 완료!','success');
  }
});

// bracket-view 경기 선택 → 2번 + 3번 미리보기 즉시 업데이트
window.addEventListener('storage', e=>{
  if(e.key!=='sgp_display_vs') return;
  try{
    const vs=JSON.parse(e.newValue||'{}');
    const p1el=document.getElementById('pv2-p1');
    const p2el=document.getElementById('pv2-p2');
    const infoEl=document.getElementById('pv2-info');
    if(p1el) p1el.textContent=cleanName(vs.p1||'—');
    if(p2el) p2el.textContent=cleanName(vs.p2||'—');
    if(infoEl) infoEl.textContent=vs.label||'진행 중';
  }catch(err){}
  try{ updatePv3(); }catch(err){}
});
