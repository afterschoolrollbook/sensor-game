/* ── DATA ── */
const REGMODES=[
  {id:'ind',    icon:'🧑', name:'개인전',       sub:'개인별 기록'},
  {id:'weight', icon:'⚖️', name:'체급 개인전',   sub:'체급별 분류'},
  {id:'divind', icon:'🏷️', name:'부문+체급 개인',sub:'부문·체급 혼합'},
  {id:'team',   icon:'👥', name:'팀전',         sub:'팀 단위 기록'},
  {id:'teamwt', icon:'🏅', name:'체급 팀전',     sub:'팀+체급'},
  {id:'divteam',icon:'🎖️', name:'부문+체급 팀',  sub:'부문·팀·체급'},
];
const PROCS=[
  {id:'ind-rec',  icon:'🏁',name:'개별 기록',    desc:'모든 참가자가 각자 기록. 시간·점수 기준 자동 순위.'},
  {id:'ind-tour', icon:'🏆',name:'개별 토너먼트', desc:'1:1 대진표로 승자가 다음 라운드 진출.'},
  {id:'team-rec', icon:'📊',name:'팀 기록',       desc:'팀원 기록 합산 또는 평균으로 순위 결정.'},
  {id:'team-ind', icon:'🎽',name:'팀 개별 기록',  desc:'팀 내 개인 기록 따로 집계, 팀 점수도 합산.'},
  {id:'team-tour',icon:'🥇',name:'팀 토너먼트',   desc:'팀 대 팀 대진표. 승자 다음 라운드 진출.'},
];
const DITEMS=[
  {k:'eventname',l:'행사명',  def:true},
  {k:'subtitle', l:'부제목',  def:false},
  {k:'gamename', l:'종목명',  def:false},
  {k:'date',     l:'일시',    def:false},
  {k:'place',    l:'장소',    def:false},
  {k:'sponsor',  l:'후원',    def:false},
  {k:'slogan1',  l:'슬로건1', def:false},
  {k:'slogan2',  l:'슬로건2', def:false},
];
const SGAMES=[
  {id:'timelap', icon:'🏁',name:'타임랩',   desc:'출발~결승 시간 측정. 바퀴·랩타임 자동 기록.',tag:'속도/시간',cat:'speed',  ac:'#e63946'},
  {id:'reaction',icon:'⚡',name:'반응속도', desc:'신호 후 버튼 누르는 속도 측정. 여러 명 동시 대결.',tag:'속도/시간',cat:'speed',  ac:'#ff6b35'},
  {id:'balance', icon:'🎯',name:'균형 버티기',desc:'압력 패드 위에서 균형 유지 시간. 흔들리면 탈락.',tag:'속도/시간',cat:'speed',  ac:'#4cc9f0'},
  {id:'jump',    icon:'🤸',name:'점프력',   desc:'패드에서 뛰어오른 공중 체공 시간 측정.',tag:'속도/시간',cat:'speed',  ac:'#4cc9f0'},
  {id:'distance',icon:'📏',name:'멀리뛰기', desc:'초음파 센서로 착지 거리 자동 측정.',tag:'속도/시간',cat:'speed',  ac:'#06d6a0'},
  {id:'weight',  icon:'⚖️',name:'무게 맞추기',desc:'목표 무게에 얼마나 가까운지 정확도 경쟁.',tag:'힘/무게',  cat:'strength',ac:'#7b2fff'},
  {id:'strength',icon:'💪',name:'악력/힘 측정',desc:'최대 힘 측정 후 순위. 3회 평균 또는 최고값.',tag:'힘/무게',  cat:'strength',ac:'#e63946'},
  {id:'weightacc',icon:'🏋️',name:'무게 정확도',desc:'100g 단위로 정확하게 물건 올리기.',tag:'힘/무게',  cat:'strength',ac:'#ff6b35'},
  {id:'oddeven', icon:'🎲',name:'홀짝 게임', desc:'통과 횟수 카운트 후 홀짝 자동 판정.',tag:'운/재미',  cat:'fun',     ac:'#06d6a0'},
  {id:'roulette',icon:'🎰',name:'랜덤 룰렛', desc:'버튼 누르면 랜덤 미션/점수 지정.',tag:'운/재미',  cat:'fun',     ac:'#7b2fff'},
  {id:'count',   icon:'🔢',name:'카운트 대결',desc:'제한 시간 안에 센서를 몇 번 통과하는지 대결.',tag:'운/재미',  cat:'fun',     ac:'#ffd60a'},
  {id:'sound',   icon:'🔊',name:'소리 크기', desc:'가장 크게 소리지르기. 팀 응원 소리 크기 측정.',tag:'운/재미',  cat:'fun',     ac:'#ff6b35'},
];
const PGAMES=[
  {id:'athletics', icon:'🏃',name:'육상',       desc:'트랙·필드·도로. 타이머·거리 기록.',tag:'육상/체조',cat:'athletics',ac:'#e63946'},
  {id:'gymnastics',icon:'🤸',name:'체조',       desc:'기계체조·리듬체조·트램폴린. 심판 채점.',tag:'육상/체조',cat:'athletics',ac:'#ff6b35'},
  {id:'weightlift',icon:'🏋️',name:'역도',       desc:'용상·인상. 체급별 기록 측정.',tag:'육상/체조',cat:'athletics',ac:'#7b2fff'},
  {id:'soccer',    icon:'⚽',name:'축구',       desc:'팀전. 득점 기록 및 토너먼트.',tag:'구기',cat:'ball',ac:'#06d6a0'},
  {id:'baseball',  icon:'⚾',name:'야구',       desc:'이닝별 점수 기록. 토너먼트 지원.',tag:'구기',cat:'ball',ac:'#e63946'},
  {id:'softball',  icon:'🥎',name:'소프트볼',   desc:'이닝별 점수 기록.',tag:'구기',cat:'ball',ac:'#ff6b35'},
  {id:'basketball',icon:'🏀',name:'농구',       desc:'쿼터별 점수 기록. 토너먼트 지원.',tag:'구기',cat:'ball',ac:'#ffd60a'},
  {id:'volleyball',icon:'🏐',name:'배구',       desc:'세트별 점수 기록. 토너먼트 지원.',tag:'구기',cat:'ball',ac:'#4cc9f0'},
  {id:'handball',  icon:'🤾',name:'핸드볼',     desc:'전·후반 득점 기록.',tag:'구기',cat:'ball',ac:'#7b2fff'},
  {id:'rugby',     icon:'🏉',name:'럭비',       desc:'전·후반 득점 기록. 토너먼트 지원.',tag:'구기',cat:'ball',ac:'#06d6a0'},
  {id:'hockey',    icon:'🏑',name:'하키',       desc:'전·후반 득점 기록.',tag:'구기',cat:'ball',ac:'#e63946'},
  {id:'tabletennis',icon:'🏓',name:'탁구',      desc:'세트 점수 입력. 토너먼트 지원.',tag:'구기',cat:'ball',ac:'#4cc9f0'},
  {id:'badminton', icon:'🏸',name:'배드민턴',   desc:'세트 점수. 단식·복식 지원.',tag:'구기',cat:'ball',ac:'#ffd60a'},
  {id:'tennis',    icon:'🎾',name:'테니스',     desc:'세트·게임 점수. 단식·복식 지원.',tag:'구기',cat:'ball',ac:'#06d6a0'},
  {id:'softtennis',icon:'🎾',name:'소프트테니스',desc:'세트·게임 점수 입력.',tag:'구기',cat:'ball',ac:'#ff6b35'},
  {id:'squash',    icon:'🎱',name:'스쿼시',     desc:'게임 점수 입력. 토너먼트 지원.',tag:'구기',cat:'ball',ac:'#7b2fff'},
  {id:'bowling',   icon:'🎳',name:'볼링',       desc:'프레임별 점수. 스트라이크·스페어 자동 계산.',tag:'구기',cat:'ball',ac:'#4cc9f0'},
  {id:'golf',      icon:'⛳',name:'골프',       desc:'홀별 타수 입력. 스트로크·매치플레이 지원.',tag:'구기',cat:'ball',ac:'#06d6a0'},
  {id:'curling',   icon:'🥌',name:'컬링',       desc:'엔드별 점수 기록.',tag:'구기',cat:'ball',ac:'#4cc9f0'},
  {id:'boxing',    icon:'🥊',name:'복싱',       desc:'라운드 타이머 + 판정·점수. 체급별 지원.',tag:'무술/격투',cat:'martial',ac:'#e63946'},
  {id:'taekwondo', icon:'🦵',name:'태권도',     desc:'경기 타이머 + 겨루기 승패·품새 점수.',tag:'무술/격투',cat:'martial',ac:'#4cc9f0'},
  {id:'judo',      icon:'🥋',name:'유도',       desc:'경기 타이머 + 판정(한판·절반). 체급별.',tag:'무술/격투',cat:'martial',ac:'#7b2fff'},
  {id:'wrestling', icon:'🤼',name:'레슬링',     desc:'경기 타이머 + 포인트. 체급별 지원.',tag:'무술/격투',cat:'martial',ac:'#ff6b35'},
  {id:'fencing',   icon:'🤺',name:'펜싱',       desc:'경기 타이머 + 득점 기록.',tag:'무술/격투',cat:'martial',ac:'#ffd60a'},
  {id:'ssireum',   icon:'🏅',name:'씨름',       desc:'경기 타이머 + 승패. 체급별 토너먼트.',tag:'무술/격투',cat:'martial',ac:'#ff6b35'},
  {id:'hapkido',   icon:'🥋',name:'합기도',     desc:'시범 타이머 + 심판 채점.',tag:'무술/격투',cat:'martial',ac:'#7b2fff'},
  {id:'jujitsu',   icon:'🤼',name:'주짓수',     desc:'경기 타이머 + 체급별 포인트.',tag:'무술/격투',cat:'martial',ac:'#e63946'},
  {id:'muaythai',  icon:'🥊',name:'무에타이',   desc:'라운드 타이머 + 판정 점수.',tag:'무술/격투',cat:'martial',ac:'#ff6b35'},
  {id:'kickboxing',icon:'🥊',name:'킥복싱',     desc:'라운드 타이머 + 판정 점수.',tag:'무술/격투',cat:'martial',ac:'#e63946'},
  {id:'wushu',     icon:'🐉',name:'우슈',       desc:'경기 타이머 + 심판 채점.',tag:'무술/격투',cat:'martial',ac:'#ffd60a'},
  {id:'sambo',     icon:'🥋',name:'삼보',       desc:'경기 타이머 + 포인트·판정.',tag:'무술/격투',cat:'martial',ac:'#7b2fff'},
  {id:'swimming',  icon:'🏊',name:'수영',       desc:'종목별 타임 기록. 부문별 지원.',tag:'수영/수상',cat:'aqua',ac:'#4cc9f0'},
  {id:'diving',    icon:'🤽',name:'다이빙',     desc:'심판 채점 입력.',tag:'수영/수상',cat:'aqua',ac:'#4cc9f0'},
  {id:'waterpolo', icon:'🤽',name:'수구',       desc:'쿼터별 득점 기록.',tag:'수영/수상',cat:'aqua',ac:'#4cc9f0'},
  {id:'waterski',  icon:'🏄',name:'수상스키',   desc:'타임·채점 기록.',tag:'수영/수상',cat:'aqua',ac:'#06d6a0'},
  {id:'rowing',    icon:'🚣',name:'조정',       desc:'종목별 타임 기록.',tag:'수영/수상',cat:'aqua',ac:'#4cc9f0'},
  {id:'canoeing',  icon:'🛶',name:'카누',       desc:'종목별 타임 기록.',tag:'수영/수상',cat:'aqua',ac:'#4cc9f0'},
  {id:'sailing',   icon:'⛵',name:'요트',       desc:'레이스 순위 기록.',tag:'수영/수상',cat:'aqua',ac:'#06d6a0'},
  {id:'cycling',   icon:'🚴',name:'자전거',     desc:'타임·랩 기록. 도로·트랙·MTB 지원.',tag:'사이클',cat:'cycle',ac:'#ffd60a'},
  {id:'shooting',  icon:'🔫',name:'사격',       desc:'과녁 점수 입력. 종목별 설정 가능.',tag:'표적/정확도',cat:'target',ac:'#ffd60a'},
  {id:'archery',   icon:'🏹',name:'양궁',       desc:'라운드별 점수 합산. 실내·실외 지원.',tag:'표적/정확도',cat:'target',ac:'#06d6a0'},
  {id:'darts',     icon:'🎯',name:'다트',       desc:'라운드별 점수 입력.',tag:'표적/정확도',cat:'target',ac:'#06d6a0'},
  {id:'billiards', icon:'🎱',name:'당구',       desc:'점수·이닝 기록. 3쿠션·포켓볼 지원.',tag:'표적/정확도',cat:'target',ac:'#7b2fff'},
  {id:'iceskating',icon:'⛸️',name:'빙상',       desc:'타임 기록. 쇼트트랙·스피드스케이팅.',tag:'빙상/설상',cat:'winter',ac:'#4cc9f0'},
  {id:'figureskate',icon:'⛸️',name:'피겨스케이팅',desc:'심판 채점 입력.',tag:'빙상/설상',cat:'winter',ac:'#4cc9f0'},
  {id:'icehockey', icon:'🏒',name:'아이스하키', desc:'피리어드별 득점 기록.',tag:'빙상/설상',cat:'winter',ac:'#4cc9f0'},
  {id:'skiing',    icon:'⛷️',name:'스키',       desc:'타임 기록. 알파인·크로스컨트리 지원.',tag:'빙상/설상',cat:'winter',ac:'#4cc9f0'},
  {id:'biathlon',  icon:'🎿',name:'바이애슬론', desc:'타임+사격 점수 기록.',tag:'빙상/설상',cat:'winter',ac:'#4cc9f0'},
  {id:'equestrian',icon:'🏇',name:'승마',       desc:'심판 채점·타임 기록.',tag:'기타',cat:'etc',ac:'#ff6b35'},
  {id:'triathlon', icon:'🏅',name:'트라이애슬론',desc:'수영+자전거+달리기 타임 기록.',tag:'기타',cat:'etc',ac:'#06d6a0'},
  {id:'climbing',  icon:'🧗',name:'스포츠클라이밍',desc:'타임·난이도·볼더링 점수.',tag:'기타',cat:'etc',ac:'#ff6b35'},
  {id:'cheerleading',icon:'📣',name:'치어리딩', desc:'심판 채점 입력.',tag:'기타',cat:'etc',ac:'#e63946'},
  {id:'dancesport',icon:'💃',name:'댄스스포츠', desc:'심판 채점 입력. 종목별 지원.',tag:'기타',cat:'etc',ac:'#ff6b35'},
  {id:'esports',   icon:'🎮',name:'e스포츠',    desc:'라운드별 승패 기록. 토너먼트 지원.',tag:'기타',cat:'etc',ac:'#7b2fff'},
];
const ALLG=[...SGAMES,...PGAMES];
const BLKITEMS=[
  {k:'header',     icon:'🏷️', name:'행사 헤더',    desc:'행사명 + LIVE 표시',      bid:'pvh'},
  {k:'timer',      icon:'⏱️', name:'타이머',        desc:'현재 도전자 + 시간',      bid:'pvt'},
  {k:'challenger', icon:'🧑', name:'도전자 이름',   desc:'개인전 시 도전자 표시',   bid:'pv-chal'},
  {k:'vs',         icon:'⚔️', name:'현재경기 VS',   desc:'선수1 VS 선수2 표시',     bid:'pvvs'},
  {k:'rank',       icon:'🏆', name:'실시간 순위판', desc:'상위 N명 순위 표시',      bid:'pvr'},
  {k:'footer',     icon:'📌', name:'하단 정보',     desc:'게임명 + 시계',           bid:'pvf'},
  {k:'ticker',     icon:'📢', name:'티커',          desc:'하단 흐르는 텍스트',      bid:'pvtk'},
];
const TITLE_FONTS=[
  {id:'bebas',   name:'Bebas Neue',     css:"'Bebas Neue',cursive"},
  {id:'rajdhani',name:'Rajdhani',       css:"'Rajdhani',sans-serif"},
  {id:'mono',    name:'Share Tech Mono',css:"'Share Tech Mono',monospace"},
  {id:'noto',    name:'Noto Sans KR',   css:"'Noto Sans KR',sans-serif"},
  {id:'serif',   name:'Serif',          css:'Georgia,serif'},
];
const TC=['#e63946','#4cc9f0','#06d6a0','#ffd60a','#7b2fff','#ff6b35','#f72585','#4361ee'];

/* ── STATE ── */
let cs=1;
const SL=['기본정보','게임모드','참가자','진행방식','확인/시작','게임 진행'];
let S={
  en:'',sub:'',gl:'',dt:'',pl:'',sp:'',s1:'',s2:'',
  di:{eventname:true},
  blk:{header:true,timer:true,challenger:true,vs:true,rank:true,footer:true,ticker:true},
  titleFont:'bebas',rankCount:6,
  theme:null,pointColor:null,accentColor:null,
  vs2Font:'bebas',vs2Bg:'dark',
  bracket3Font:'bebas',
  gtab:'sensor',selG:'timelap',cat:'all',laps:1,
  rm:'ind',pts:[],proc:'ind-rec',
};

/* ── INIT ── */
window.addEventListener('DOMContentLoaded',()=>{
  try{
    const a=App.getState();
    if(a.event?.name&&a.event.name!=='게임 행사'){
      S.en=a.event.name;
      S.sub=a.event.subtitle||'';
    }
    if(a.participants?.length)S.pts=[...a.participants];
    if(a.gameType)S.selG=a.gameType;
    if(a.mode){const modeMap={'individual':'ind','team':'team'};S.rm=modeMap[a.mode]||a.mode;}
    if(a.settings){
      if(a.settings.laps)S.laps=a.settings.laps;
      if(a.settings.proc)S.proc=a.settings.proc;
      if(a.settings.rm)S.rm=a.settings.rm;
      if(a.settings.gl)S.gl=a.settings.gl;
      if(a.settings.dt)S.dt=a.settings.dt;
      if(a.settings.pl)S.pl=a.settings.pl;
      if(a.settings.sp)S.sp=a.settings.sp;
      if(a.settings.s1)S.s1=a.settings.s1;
      if(a.settings.s2)S.s2=a.settings.s2;
      if(a.settings.di)S.di={...S.di,...a.settings.di};
      if(a.settings.blk)S.blk={...S.blk,...a.settings.blk};
      if(a.settings.titleFont)S.titleFont=a.settings.titleFont;
      if(a.settings.rankCount)S.rankCount=a.settings.rankCount;
      if(a.settings.theme)S.theme=a.settings.theme;
      if(a.settings.pointColor)S.pointColor=a.settings.pointColor;
      if(a.settings.matches)S.matches=a.settings.matches;
      if(a.settings.groupBrackets)S.groupBrackets=a.settings.groupBrackets;
    }
  }catch(e){}
  DITEMS.forEach(d=>{if(S.di[d.k]===undefined)S.di[d.k]=d.def;});
  buildNav();buildChips();buildGG();buildMG();buildProc();renderPA();updateNav();updatePv();startClk();initResizer();initDsPanel();initPtsPopupDrag();
  // pv3 또는 iframe 안 경기 박스 클릭 → bracket-view(새창/iframe) 하이라이트 연동
  window.onMatchClick = function(ri, mi, matchObj){
    if(!matchObj||(!matchObj.p1&&!matchObj.p2)) return;
    const cleanN = n => n ? n.replace(/^\d+번\s*/,'').replace(/[()[\]]/g,'').trim()||n : '—';
    const p1 = cleanN(matchObj.p1?.name || String(matchObj.p1||''));
    const p2 = cleanN(matchObj.p2?.name || String(matchObj.p2||''));
    const grpObj = matchObj._groupObj || null;
    const court = grpObj?.court || 1;
    const label = matchObj._groupLabel || '';
    const vsData = {p1, p2, label, court};
    try{ localStorage.setItem('sgp_display_vs', JSON.stringify(vsData)); }catch(e){}
    try{ localStorage.setItem('sgp_display_vs_court_'+court, JSON.stringify(vsData)); }catch(e){}
    const cmd = {type:'set_match', p1, p2, label, court, ts:Date.now()};
    try{ localStorage.setItem('sgp_display_cmd', JSON.stringify(cmd)); }catch(e){}
    try{
      if(!window._pv3Bc) window._pv3Bc = new BroadcastChannel('sgp_cmd');
      window._pv3Bc.postMessage(cmd);
    }catch(e){}
    try{ if(typeof updatePv2==='function') updatePv2(); }catch(e){}
    try{ if(typeof updatePv3==='function') updatePv3(); }catch(e){}
  };
  // scalePvc 지연 호출: DOMContentLoaded 시점엔 aspect-ratio 요소의 크기가 미확정
  // rAF 두 번 + setTimeout으로 브라우저 렌더링이 완전히 끝난 후 실행
  requestAnimationFrame(()=>{ requestAnimationFrame(()=>{ setTimeout(scalePvc, 0); }); });
  // window load(폰트/이미지 포함) 후 한 번 더 보정
  window.addEventListener('load', ()=>{ requestAnimationFrame(scalePvc); }, {once:true});
  // URL 파라미터로 스텝 지정 or 마지막 저장 스텝으로 이동
  const urlParams=new URLSearchParams(location.search);
  const targetStep=parseInt(urlParams.get('step')||localStorage.getItem('sgp_last_step')||'1');
  if(targetStep>1)goS(targetStep);
  if(targetStep===6)try{g6Init();}catch(e){}
  // pvcw 크기 바뀔 때마다 scale 재계산
  // pvcw도 감시: buildTab2 등으로 dspanel flex 재계산 시 pvcw 너비 변화를 즉시 반영
  ['pvcw','pvc-wrap','pv2-wrap','pv3-wrap'].forEach(id=>{const el=document.getElementById(id);if(el)new ResizeObserver(scalePvc).observe(el);});
  // restore
  document.getElementById('f-en').value=S.en;
  document.getElementById('f-sub').value=S.sub;
  document.getElementById('f-gl').value=S.gl;
  document.getElementById('f-dt').value=S.dt;
  document.getElementById('f-pl').value=S.pl;
  document.getElementById('f-sp').value=S.sp;
  document.getElementById('f-s1').value=S.s1;
  document.getElementById('f-s2').value=S.s2;
});

/* ── NAV ── */
function buildNav(){
  const w=document.getElementById('navsteps');w.innerHTML='';
  const maxStep=cs===6?6:5;
  for(let i=1;i<=maxStep;i++){
    if(i>1){const sep=document.createElement('span');sep.className='nsi-sep';sep.textContent='›';w.appendChild(sep);}
    const d=document.createElement('div');
    d.className='nsi'+(i===cs?' active':i<cs?' done':'');
    if(i!==cs)d.onclick=()=>goS(i);
    d.innerHTML=`<span class="nsi-num">${String(i).padStart(2,'0')}</span><span class="nsi-label">${SL[i-1]}</span>`;
    w.appendChild(d);
  }
}
function goS(n){
  document.getElementById('s'+cs).classList.remove('active');
  cs=Math.max(1,Math.min(6,n));
  document.getElementById('s'+cs).classList.add('active');
  buildNav();updateNav();
  if(cs===3)buildMG();
  if(cs===4)buildProc();
  if(cs===5)buildConfirm();
  if(cs===6)g6Refresh();
  updatePv();
}
function saveAndNext(){
  saveCurrentStep();
  if(cs<5)goS(cs+1);
}
function prevS(){if(cs>1)goS(cs-1);}
function updateNav(){
  buildStepSummary(cs);
  document.getElementById('bprev').style.display=(cs===1)?'none':'';
  const bn=document.getElementById('bnext');
  const badge=document.getElementById('saved-badge');
  const bstart=document.querySelector('.bstart');
  if(cs===6){
    bn.style.display='none';
    if(badge)badge.style.display='none';
    if(bstart)bstart.style.display='none';
  } else if(cs===5){
    bn.style.display='none';
    if(badge)badge.style.display='none';
    if(bstart)bstart.style.display='';
  } else {
    bn.style.display='';
    if(bstart)bstart.style.display='none';
    const lb=['','💾 저장 후 다음 (게임 모드)','💾 저장 후 다음 (참가자)','💾 저장 후 다음 (진행방식)','💾 저장 후 다음 (확인&시작)'];
    bn.textContent=lb[cs]||'💾 저장 후 다음';
    const saved=App.getState();
    const isSaved=saved.event?.name&&saved.event.name!=='게임 행사';
    if(badge){badge.style.display=isSaved?'flex':'none';}
  }
}



/* ── 스텝 저장 ── */
function saveCurrentStep(){
  // 스텝1 입력값 동기화
  const enEl=document.getElementById('f-en');
  if(enEl)S.en=enEl.value;
  const subEl=document.getElementById('f-sub');
  if(subEl)S.sub=subEl.value;
  const glEl=document.getElementById('f-gl');
  if(glEl)S.gl=glEl.value;
  const dtEl=document.getElementById('f-dt');
  if(dtEl)S.dt=dtEl.value;
  const plEl=document.getElementById('f-pl');
  if(plEl)S.pl=plEl.value;
  const spEl=document.getElementById('f-sp');
  if(spEl)S.sp=spEl.value;
  const s1El=document.getElementById('f-s1');
  if(s1El)S.s1=s1El.value;
  const s2El=document.getElementById('f-s2');
  if(s2El)S.s2=s2El.value;

  // 전체 저장
  App.setState({
    eventId: S.eventId||null,
    event:{
      name:S.en||'',
      subtitle:S.sub||'',
      logo:null,
      theme:'dark-racing',
      primaryColor:'#e63946',
      accentColor:'#4cc9f0',
      sound:true,
    },
    gameType:S.selG,
    mode:S.rm,
    participants:S.pts,
    settings:{
      laps:S.laps||1,
      proc:S.proc,
      rm:S.rm,
      gl:S.gl,
      dt:S.dt,
      pl:S.pl,
      sp:S.sp,
      s1:S.s1,
      s2:S.s2,
      di:S.di,
    }
  });

  // 저장 뱃지 표시
  const badge=document.getElementById('saved-badge');
  if(badge){
    badge.style.display='flex';
    badge.textContent='✓ 저장됨';
  }
  // sgp_history 동기화
  if(S.en&&S.en!=='게임 행사'){
    try{
      const history=JSON.parse(localStorage.getItem('sgp_history')||'[]');
      if(!S.eventId)S.eventId='ev_'+Date.now();
      const entry={id:S.eventId,name:S.en,date:S.dt||new Date().toLocaleDateString('ko-KR'),game:S.selG||'',mode:S.rm||'ind',participants:S.pts.length};
      const idx=history.findIndex(h=>h.id===S.eventId);
      if(idx>=0)history[idx]=entry;else history.push(entry);
      localStorage.setItem('sgp_history',JSON.stringify(history));
    }catch(e){}
  }
  // 마지막 저장 스텝 기록 — 다음 스텝으로, 뒤로 가도 덮어쓰지 않음
  try{const next=Math.min(cs+1,6);const cur=parseInt(localStorage.getItem('sgp_last_step')||'1');if(next>cur)localStorage.setItem('sgp_last_step',String(next));}catch(e){}
  toast('저장 완료!','success',1500);
}

/* ── RESIZER ── */
function initResizer(){
  function bind(rId,getEl,minW,maxRatio,onMove){
    const bar=document.getElementById(rId);
    if(!bar)return;
    bar.addEventListener('mousedown',function(e){
      e.preventDefault();
      const el=getEl();
      const startX=e.clientX;
      const startW=el.offsetWidth;
      bar.classList.add('drag');
      document.body.style.cursor='col-resize';
      document.body.style.userSelect='none';
      function move(e){
        const total=document.getElementById('split').offsetWidth;
        const w=Math.min(Math.max(startW+(e.clientX-startX),minW),total*maxRatio);
        el.style.flex='0 0 '+w+'px';
        el.style.width=w+'px';
        if(onMove) onMove();
      }
      function up(){
        bar.classList.remove('drag');
        document.body.style.cursor='';
        document.body.style.userSelect='';
        document.removeEventListener('mousemove',move);
        document.removeEventListener('mouseup',up);
        if(onMove) onMove();
      }
      document.addEventListener('mousemove',move);
      document.addEventListener('mouseup',up);
    });
  }
  bind('resizer', ()=>document.getElementById('left'), 220, 0.6);
  // pvcw: 드래그 중 scalePvc 실시간 호출, maxRatio 0.75로 오른쪽 더 넓게
  bind('resizer2', ()=>document.getElementById('pvcw'), 180, 0.75, ()=>{ if(typeof scalePvc==='function') scalePvc(); });
}

/* ── DSPANEL ── */
function buildBlkChips(){
  const w=document.getElementById('blkchips');if(!w)return;w.innerHTML='';
  let dragSrc=null;
  BLKITEMS.forEach((b,idx)=>{
    const item=document.createElement('div');
    item.className='blk-item'+(S.blk[b.k]?'':' disabled');
    item.draggable=true;
    item.dataset.idx=idx;
    item.innerHTML=`
      <span class="blk-handle">⠿</span>
      <span class="blk-icon">${b.icon}</span>
      <div class="blk-info"><div class="blk-name">${b.name}</div><div class="blk-desc">${b.desc}</div></div>
      <label class="blk-tog">
        <input type="checkbox" ${S.blk[b.k]?'checked':''}>
        <span class="blk-sld"></span>
      </label>`;
    // 토글
    item.querySelector('input').onchange=function(){
      S.blk[b.k]=this.checked;
      item.classList.toggle('disabled',!this.checked);
      const t=document.getElementById(b.bid);
      if(t)t.classList.toggle('pv-hidden',!this.checked);
      updateRankLayout();
      saveCfgNow(); // 실시간 전광판 반영
    };
    // 드래그
    item.addEventListener('dragstart',e=>{dragSrc=idx;item.classList.add('dragging');e.dataTransfer.effectAllowed='move';});
    item.addEventListener('dragend',()=>{item.classList.remove('dragging');w.querySelectorAll('.blk-item').forEach(d=>d.classList.remove('dragover'));});
    item.addEventListener('dragover',e=>{e.preventDefault();item.classList.add('dragover');});
    item.addEventListener('dragleave',()=>item.classList.remove('dragover'));
    item.addEventListener('drop',e=>{
      e.preventDefault();item.classList.remove('dragover');
      if(dragSrc===null||dragSrc===idx)return;
      const moved=BLKITEMS.splice(dragSrc,1)[0];
      BLKITEMS.splice(idx,0,moved);
      dragSrc=null;
      buildBlkChips();
      saveCfgNow(); // 순서 변경도 반영
      toast('순서 변경됨','success');
    });
    w.appendChild(item);
  });
}
function buildFontPicker(){
  const w=document.getElementById('fontpicker');if(!w)return;w.innerHTML='';
  TITLE_FONTS.forEach(f=>{
    const el=document.createElement('div');
    el.className='ds-font'+(S.titleFont===f.id?' on':'');
    el.style.fontFamily=f.css;el.textContent=f.name;
    el.onclick=()=>{
      S.titleFont=f.id;
      document.querySelectorAll('#fontpicker .ds-font').forEach(x=>x.classList.remove('on'));
      el.classList.add('on');
      // 1번 미리보기 초시계에만 적용
      const pvTime=document.getElementById('pv-time');
      if(pvTime) pvTime.style.fontFamily=f.css;
      saveCfgNow();
    };
    w.appendChild(el);
  });
}

const TIMER_SIZES=[40,48,56,64,72,80,88,96,100,110,120,140,160];
function chTimerSize(d){
  const el=document.getElementById('ds-timersize-val');if(!el)return;
  let cur=parseInt(el.textContent)||100;
  let i=TIMER_SIZES.findIndex(s=>s>=cur);if(i<0)i=TIMER_SIZES.length-1;
  const nv=TIMER_SIZES[Math.max(0,Math.min(TIMER_SIZES.length-1,i+d))];
  el.textContent=nv;
  const pvTime=document.getElementById('pv-time');
  if(pvTime) pvTime.style.fontSize=nv+'px';
  saveCfgNow();
}

const UI_SIZES=[8,9,10,11,12,13,14,15,16,17,18,20,22,24];
function chFtrSize(d){
  const el=document.getElementById('ds-ftrsize-val');if(!el)return;
  let cur=parseInt(el.textContent)||13;
  let i=UI_SIZES.findIndex(s=>s>=cur);if(i<0)i=UI_SIZES.length-1;
  const nv=UI_SIZES[Math.max(0,Math.min(UI_SIZES.length-1,i+d))];
  el.textContent=nv;
  // 미리보기 즉시 반영
  const pvFtr=document.getElementById('pv-gname');
  if(pvFtr) pvFtr.style.fontSize=nv+'px';
  saveCfgNow();
}
function chTkSize(d){
  const el=document.getElementById('ds-tksize-val');if(!el)return;
  let cur=parseInt(el.textContent)||12;
  let i=UI_SIZES.findIndex(s=>s>=cur);if(i<0)i=UI_SIZES.length-1;
  const nv=UI_SIZES[Math.max(0,Math.min(UI_SIZES.length-1,i+d))];
  el.textContent=nv;
  // 미리보기 즉시 반영
  const pvTk=document.getElementById('pv-tk');
  if(pvTk) pvTk.style.fontSize=nv+'px';
  saveCfgNow();
}

function buildTimerColorPicker(){
  const w=document.getElementById('ds1-timer-color-wrap');if(!w)return;
  const COLORS=[
    {n:'청록',v:'#4cc9f0'},{n:'흰색',v:'#f0f0f8'},{n:'노랑',v:'#ffd60a'},
    {n:'초록',v:'#06d6a0'},{n:'빨강',v:'#e63946'},{n:'주황',v:'#ff9f1c'},
    {n:'보라',v:'#7b2fff'},{n:'분홍',v:'#ff2d9f'},
  ];
  const saved=S.timerColor||'#4cc9f0';
  w.innerHTML='';
  COLORS.forEach(c=>{
    const sw=document.createElement('div');
    sw.className='ds-swatch'+(saved===c.v?' on':'');
    sw.style.background=c.v;sw.title=c.n;
    sw.onclick=()=>{
      S.timerColor=c.v;
      w.querySelectorAll('.ds-swatch').forEach(x=>x.classList.remove('on'));
      sw.classList.add('on');
      // 미리보기 즉시 반영
      const pvTime=document.getElementById('pv-time');
      if(pvTime) pvTime.style.color=c.v;
      saveCfgNow();
    };
    w.appendChild(sw);
  });
}
function chRank(d){S.rankCount=Math.max(1,Math.min(10,(S.rankCount||6)+d));document.getElementById('ds-rankval').textContent=S.rankCount;buildRanks();saveCfgNow();}
function setDsPlayer(){const v=document.getElementById('ds-cplayer').value.trim();if(!v)return;try{localStorage.setItem('sgp_display_player',v);}catch(e){}toast('도전자: '+v,'success');document.getElementById('ds-cplayer').value='';}
function sendCmd(t,extra){
  const payload={type:t,ts:Date.now(),...(extra||{})};
  try{localStorage.setItem('sgp_display_cmd',JSON.stringify(payload));}catch(e){}
  try{if(_bc)_bc.postMessage(payload);}catch(e){}
  toast('전송: '+t,'success');
  // 미리보기 동기화
  _pvHandleCmd(payload);
}

function _pvHandleCmd(cmd){
  if(!cmd) return;
  const pvTime=document.getElementById('pv-time');

  if(cmd.type==='timer_start'){
    if(cmd.duration){
      _pvStartCountdown(cmd.duration);
    } else {
      // 출발형 타이머 — g6Tick이 이미 처리
    }
    if(pvTime) pvTime.className='running';
  }
  if(cmd.type==='timer_stop'){
    _pvStopCountdown();
    if(pvTime) pvTime.className='stopped';
  }
  if(cmd.type==='timer_reset'){
    _pvStopCountdown();
    if(pvTime){pvTime.textContent='00:00.000';pvTime.className='';}
  }
  if(cmd.type==='countdown'){
    _runCountdown(null);
  }
  if(cmd.type==='clear_rank'){
    updatePv();
  }
  if(cmd.type==='winner'){
    const ov=document.getElementById('pv-winner-ov');
    const nm=document.getElementById('pv-winner-name');
    const tm=document.getElementById('pv-winner-time');
    if(ov&&nm){
      nm.textContent=cmd.name||'—';
      if(tm) tm.textContent=cmd.time?cmd.time:'';
      ov.style.display='flex';
      clearTimeout(ov._t);
      ov._t=setTimeout(()=>{ ov.style.display='none'; },5000);
    }
  }
}
function saveDsCfg(){try{const cfg=JSON.parse(localStorage.getItem('sgp_display_config')||'{}');cfg.autoSwitch=document.getElementById('ds-autoswitch')?.checked;cfg.switchInterval=parseInt(document.getElementById('ds-interval')?.value||8);localStorage.setItem('sgp_display_config',JSON.stringify(cfg));}catch(e){}}

/* ── 실시간 config 저장 (전광판 즉시 반영용) ── */
function saveCfgNow(){
  try{
    const existingCfg=JSON.parse(localStorage.getItem('sgp_display_config')||'{}');
    const cfg=Object.assign(existingCfg,{
      eventName:S.en,subtitle:S.sub,gameLabel:S.gl,
      dt:S.dt,pl:S.pl,
      slogan1:S.s1,slogan2:S.s2,sponsor:S.sp,
      displayItems:S.di,
      blk:S.blk,
      titleFont:S.titleFont,
      rankCount:S.rankCount,
      theme:S.theme||null,
      pointColor:S.pointColor||null,
      accentColor:S.accentColor||null,
      vs2Font:S.vs2Font||null,
      bracket3Font:S.bracket3Font||null,
      vs2Bg:S.vs2Bg||'dark',
      timerSize:parseInt(document.getElementById('ds-timersize-val')?.textContent||'0')||null,
      timerColor:S.timerColor||null,
      ftrSize:parseInt(document.getElementById('ds-ftrsize-val')?.textContent||'0')||null,
      tkSize:parseInt(document.getElementById('ds-tksize-val')?.textContent||'0')||null,
    });
    localStorage.setItem('sgp_display_config',JSON.stringify(cfg));
  }catch(e){}
}
/* ── BroadcastChannel: storage 이벤트 보완 ── */
let _bc=null;
try{_bc=new BroadcastChannel('sgp_cmd');}catch(e){}
window.addEventListener('pagehide',()=>{ try{_bc&&_bc.close();}catch(e){} });
// 3번탭 현재경기 선택 수신 → pv3 하이라이트 갱신
if(_bc){
  _bc.onmessage = function(e){
    const cmd = e.data;
    if(!cmd || cmd.type !== 'set_match') return;
    requestAnimationFrame(()=>{
      try{ if(typeof updatePv3==='function') updatePv3(); }catch(err){}
    });
  };
}
// storage 이벤트로도 pv3 갱신 (같은 창 내 ds-tab3 → setup-core 연동)
window.addEventListener('storage', function(e){
  if(e.key && e.key.startsWith('sgp_display_vs_court_')){
    try{ if(typeof updatePv3==='function') updatePv3(); }catch(err){}
  }
});

/* ── CHIPS ── */
function buildChips(){
  buildBlkChips();buildFontPicker();buildTimerColorPicker();
  // 저장값 복원
  const _cfg=JSON.parse(localStorage.getItem('sgp_display_config')||'{}');
  const _sv=(id,val)=>{ if(val){ const e=document.getElementById(id);if(e)e.textContent=val; }};
  _sv('ds-timersize-val', _cfg.timerSize);
  _sv('ds-ftrsize-val', _cfg.ftrSize);
  _sv('ds-tksize-val', _cfg.tkSize);
  if(_cfg.timerColor){ S.timerColor=_cfg.timerColor; buildTimerColorPicker(); }
  document.getElementById('ds-rankval').textContent=S.rankCount||6;
  const w=document.getElementById('dtchips');w.innerHTML='';
  DITEMS.forEach(d=>{
    const el=document.createElement('div');
    el.className='dtc'+(S.di[d.k]?' on':'');
    el.innerHTML=`<div class="dtc-dot"></div>${d.l}`;
    el.onclick=()=>{S.di[d.k]=!S.di[d.k];el.classList.toggle('on');updatePv();};
    w.appendChild(el);
  });
}
function fc(){
  S.en=document.getElementById('f-en').value;
  S.sub=document.getElementById('f-sub').value;
  S.gl=document.getElementById('f-gl').value;
  S.dt=document.getElementById('f-dt').value;
  S.pl=document.getElementById('f-pl').value;
  S.sp=document.getElementById('f-sp').value;
  S.s1=document.getElementById('f-s1').value;
  S.s2=document.getElementById('f-s2').value;
  updatePv();
}


/* ── STEP3 요약 ── */

function buildStepSummary(step){
  const g=ALLG.find(x=>x.id===S.selG);
  const rm=REGMODES.find(x=>x.id===S.rm);
  const allItems=[
    {k:'행사명', v:S.en, icon:'📋'},
    {k:'종목',   v:S.gl, icon:'🏅'},
    {k:'게임',   v:g?g.name:'', icon:'🎮'},
    {k:'일시',   v:S.dt, icon:'📅'},
    {k:'장소',   v:S.pl, icon:'📍'},
  ].filter(x=>x.v);

  // 스텝2: 기본정보 요약
  const s2el=document.getElementById('s2-summary');
  if(s2el&&step===2){
    const items=allItems.filter(x=>['행사명','일시','장소'].includes(x.k));
    s2el.innerHTML=items.length?`
      <div class="s3-sum-box">
        <div class="s3sum-title">📌 기본 정보</div>
        <div class="s3sum-row">${items.map(x=>`<div class="s3sum-tag"><span class="s3k">${x.k}</span><span class="s3v">${x.v}</span></div>`).join('')}</div>
      </div>`:'';
  }

  // 스텝3: 기본정보 + 게임모드 요약
  const s3el=document.getElementById('s3-summary');
  if(s3el&&step===3){
    s3el.innerHTML=allItems.length?`
      <div class="s3-sum-box">
        <div class="s3sum-title">📌 이전 설정 요약</div>
        <div class="s3sum-row">${allItems.map(x=>`<div class="s3sum-tag"><span class="s3k">${x.k}</span><span class="s3v">${x.v}</span></div>`).join('')}</div>
      </div>`:'';
    buildS3Sample();
  }

  // 스텝4: 기본정보 + 게임 + 참가방식 요약
  const s4el=document.getElementById('s4-summary');
  if(s4el&&step===4){
    const items=[...allItems];
    if(rm)items.push({k:'참가방식',v:rm.name,icon:'👥'});
    items.push({k:'참가자',v:S.pts.length+'명',icon:'🧑'});
    s4el.innerHTML=`
      <div class="s3-sum-box">
        <div class="s3sum-title">📌 이전 설정 요약</div>
        <div class="s3sum-row">${items.filter(x=>x.v).map(x=>`<div class="s3sum-tag"><span class="s3k">${x.k}</span><span class="s3v">${x.v}</span></div>`).join('')}</div>
      </div>`;
  }
}

function buildS3Summary(){
  const el=document.getElementById('s3-summary');if(!el)return;
  const g=ALLG.find(x=>x.id===S.selG);
  const items=[
    {k:'행사명', v:S.en||'—', icon:'📋'},
    {k:'종목',   v:S.gl||(g?g.name:'—'), icon:'🏅'},
    {k:'게임',   v:g?g.name:'—', icon:'🎮'},
    {k:'일시',   v:S.dt||'—', icon:'📅'},
    {k:'장소',   v:S.pl||'—', icon:'📍'},
  ].filter(x=>x.v&&x.v!=='—');
  el.innerHTML=`
    <div class="s3sum-title">📌 이전 설정 요약</div>
    <div class="s3sum-row">
      ${items.map(x=>`<div class="s3sum-tag"><span>${x.icon}</span><span class="s3k">${x.k}</span><span class="s3v">${x.v}</span></div>`).join('')}
    </div>`;
}

/* ── STEP3 샘플 다운로드 ── */
const SAMPLE_COLS={
  ind:    ['이름'],
  weight: ['이름','체급'],
  divind: ['이름','부문','체급'],
  team:   ['팀명','이름'],
  teamwt: ['팀명','이름','체급'],
  divteam:['팀명','이름','부문','체급'],
};
function buildS3Sample(){
  const el=document.getElementById('s3-sample');if(!el)return;
  const rm=REGMODES.find(x=>x.id===S.rm)||REGMODES[0];
  const cols=SAMPLE_COLS[S.rm]||['이름'];
  el.innerHTML=`
    <div class="s3sample-title">📥 엑셀 샘플 다운로드</div>
    <button class="s3sample-btn" onclick="dlSample()">⬇️ ${rm.name} 샘플 (.xlsx)</button>
    <span style="font-size:10px;color:var(--text3)">컬럼: ${cols.join(', ')}</span>`;
}
function dlSample(){
  const rm=S.rm||'ind';
  const rm_obj=REGMODES.find(x=>x.id===rm)||{name:'샘플'};
  const fileMap={
    ind:     'samples/SGP_개인전_샘플.xlsx',
    weight:  'samples/SGP_체급개인전_샘플.xlsx',
    divind:  'samples/SGP_부문체급개인전_샘플.xlsx',
    team:    'samples/SGP_팀전_샘플.xlsx',
    teamwt:  'samples/SGP_체급팀전_샘플.xlsx',
    divteam: 'samples/SGP_부문체급팀전_샘플.xlsx',
  };
  const url=fileMap[rm]||fileMap['ind'];
  const a=document.createElement('a');
  a.href=url;
  a.download=url.split('/').pop();
  a.click();
  toast(rm_obj.name+' 샘플 다운로드!','success');
}

/* 엑셀 업로드 (CSV/xlsx 파싱) */
function impXlsNew(){
  const input=document.createElement('input');
  input.type='file';input.accept='.csv,.xlsx,.xls';
  input.onchange=e=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      let rows=[];
      const isCsv=file.name.endsWith('.csv');
      if(isCsv){
        // CSV 파싱
        const text=ev.target.result.replace(/^\uFEFF/,'');
        const lines=text.split('\n').filter(l=>l.trim());
        rows=lines.map(l=>l.split(',').map(v=>v.replace(/"/g,'').trim()));
      } else {
        // XLSX 파싱
        const data=new Uint8Array(ev.target.result);
        const wb=XLSX.read(data,{type:'array'});
        const ws=wb.Sheets[wb.SheetNames[0]];
        rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
      }
      if(!rows.length)return;
      const headers=rows[0].map(h=>String(h).trim().toLowerCase());
      const nameIdx=headers.findIndex(h=>h==='이름'||h==='name');
      const teamIdx=headers.findIndex(h=>h==='팀명'||h==='team');
      const weightIdx=headers.findIndex(h=>h==='체급'||h==='weight');
      const divIdx=headers.findIndex(h=>h==='부문'||h==='division');
      const genderIdx=headers.findIndex(h=>h==='성별'||h==='gender');
      if(nameIdx<0){toast('이름 컬럼을 찾을 수 없어요','error');return;}
      let added=0;
      rows.slice(1).forEach((cols,i)=>{
        const name=String(cols[nameIdx]||'').trim();
        if(!name)return;
        S.pts.push({
          id:'p_'+Date.now()+'_'+i,
          name,
          team:teamIdx>=0?String(cols[teamIdx]||'').trim():'',
          weight:weightIdx>=0?String(cols[weightIdx]||'').trim():'',
          division:divIdx>=0?String(cols[divIdx]||'').trim():'',
          gender:genderIdx>=0?String(cols[genderIdx]||'').trim():'',
          color:TC[S.pts.length%TC.length]
        });
        added++;
      });
      renderPL();updatePv();
      try{App.setState({participants:S.pts});}catch(e2){}
      toast(added+'명 불러오기 완료!','success');
    };
    if(file.name.endsWith('.csv')) reader.readAsText(file,'UTF-8');
    else reader.readAsArrayBuffer(file);
  };
  input.click();
}

/* ── GAME GRID ── */
function buildGG(){
  const games=S.gtab==='sensor'?SGAMES:PGAMES;
  const cats=[...new Set(games.map(g=>g.cat))];
  const cl={speed:'속도/시간',power:'힘/순간',target:'정확도',field:'육상',aqua:'수상',cycle:'사이클',martial:'무술'};
  const fw=document.getElementById('gfilters');fw.innerHTML='';
  const a=document.createElement('span');a.className='gfb'+(S.cat==='all'?' active':'');a.textContent='전체';a.onclick=()=>{S.cat='all';buildGG();};fw.appendChild(a);
  cats.forEach(c=>{const b=document.createElement('span');b.className='gfb'+(S.cat===c?' active':'');b.textContent=cl[c]||c;b.onclick=()=>{S.cat=c;buildGG();};fw.appendChild(b);});
  const gw=document.getElementById('ggrid');gw.innerHTML='';
  const filtered=S.cat==='all'?games:games.filter(g=>g.cat===S.cat);
  filtered.forEach(g=>{
    const d=document.createElement('div');
    d.className='gc'+(S.selG===g.id?' sel':'');
    if(S.selG===g.id)d.style.setProperty('--red',g.ac);
    d.innerHTML=`<div class="gc-icon">${g.icon}</div><div class="gc-name">${g.name}</div><div class="gc-desc">${g.desc}</div><div class="gc-tag">${g.tag}</div>`;
    d.onclick=()=>{S.selG=g.id;buildGG();updatePv();};
    gw.appendChild(d);
  });
  if(document.getElementById('lapv'))document.getElementById('lapv').textContent=S.laps;
}
function switchTab(t){S.gtab=t;S.cat='all';document.getElementById('tab-s').classList.toggle('active',t==='sensor');document.getElementById('tab-p').classList.toggle('active',t==='sport');buildGG();}
function chLaps(d){S.laps=Math.max(1,Math.min(20,S.laps+d));if(document.getElementById('lapv'))document.getElementById('lapv').textContent=S.laps;updatePv();}

/* ── MODE GRID ── */
function buildMG(){
  buildS3Summary();buildS3Sample();
  const w=document.getElementById('mgrid');w.innerHTML='';
  REGMODES.forEach(m=>{
    const d=document.createElement('div');
    d.className='mc'+(S.rm===m.id?' sel':'');
    d.innerHTML=`<div class="mc-icon">${m.icon}</div><div class="mc-name">${m.name}</div><div class="mc-sub">${m.sub}</div>`;
    d.onclick=()=>{S.rm=m.id;buildMG();renderPA();try{const a=App.getState();App.setState(Object.assign({},a,{mode:S.rm,settings:Object.assign({},a.settings||{},{rm:S.rm})}));}catch(e){}};
    w.appendChild(d);
  });
}

/* ── PARTICIPANT AREA ── */
function renderPA(){
  const isT=S.rm.startsWith('team')||S.rm==='divteam';
  document.getElementById('ptarea').innerHTML=`
    <div class="pa">
      <div class="par">
        <input class="fi" id="pti" placeholder="${isT?'팀 이름':'참가자 이름'} 입력" onkeydown="if(event.key==='Enter')addPt()">
        <select id="ptg" style="padding:8px 10px;border-radius:7px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:13px;cursor:pointer;">
          <option value="">성별</option>
          <option value="남">남</option>
          <option value="여">여</option>
        </select>
        <button class="badd" onclick="addPt()">+ 추가</button>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
        <span style="font-size:11px;color:var(--text3);font-weight:700;letter-spacing:1px;" id="pt-count"></span>
        <button onclick="clearAllPts()" style="font-size:11px;color:#e63946;background:transparent;border:1px solid #e63946;border-radius:4px;padding:2px 8px;cursor:pointer;">전체 삭제</button>
      </div>
      <div class="plist" id="plist"></div>
      <button class="bxls" onclick="impXlsNew()">📂 CSV/엑셀에서 불러오기</button>
    </div>`;
  renderPL();
}
function renderPL(){
  const l=document.getElementById('plist');if(!l)return;l.innerHTML='';
  const cnt=document.getElementById('pt-count');if(cnt)cnt.textContent=S.pts.length?S.pts.length+'명':'';
  S.pts.forEach((p,i)=>{
    const d=document.createElement('div');d.className='ptag';
    const tags=[];
    if(p.gender&&p.gender.trim())tags.push(`<span style="font-size:10px;background:${p.gender==='남'?'rgba(76,201,240,0.2)':'rgba(255,100,150,0.2)'};border-radius:3px;padding:1px 5px;color:${p.gender==='남'?'var(--accent)':'#ff6496'}">${p.gender}</span>`);
    if(p.weight&&p.weight.trim())tags.push(`<span style="font-size:10px;background:rgba(255,255,255,.1);border-radius:3px;padding:1px 5px;color:var(--text2)">${p.weight}</span>`);
    if(p.division&&p.division.trim())tags.push(`<span style="font-size:10px;background:rgba(255,255,255,.1);border-radius:3px;padding:1px 5px;color:var(--text2)">${p.division}</span>`);
    if(p.team&&p.team.trim())tags.push(`<span style="font-size:10px;background:rgba(255,255,255,.07);border-radius:3px;padding:1px 5px;color:var(--text3)">${p.team}</span>`);
    d.innerHTML=`<div class="pt-clr" style="background:${p.color||TC[i%TC.length]}"></div><div class="pt-nm">${p.name}</div>${tags.join('')}<div class="pt-x" onclick="delPt('${p.id}')">×</div>`;
    l.appendChild(d);
  });
}
function addPt(){
  const inp=document.getElementById('pti');if(!inp)return;
  const nm=inp.value.trim();if(!nm){toast('이름을 입력해주세요.','error');return;}
  const gender=(document.getElementById('ptg')||{value:''}).value;
  S.pts.push({id:'p_'+Date.now()+'_'+Math.random().toString(36).slice(2,5),name:nm,gender,color:TC[S.pts.length%TC.length]});
  inp.value='';inp.focus();renderPL();updatePv();
  try{App.setState({participants:S.pts});}catch(e){}
}
function delPt(id){S.pts=S.pts.filter(p=>p.id!==id);renderPL();updatePv();try{App.setState({participants:S.pts});}catch(e){}}
function clearAllPts(){if(!S.pts.length)return;if(!confirm('참가자 전체를 삭제할까요?'))return;S.pts=[];renderPL();updatePv();try{App.setState({participants:S.pts});}catch(e){}}
function impXls(){
  try{if(typeof ExcelIO!=='undefined'&&ExcelIO.importExcel){ExcelIO.importExcel(rows=>{rows.forEach((r,i)=>{if(r.name)S.pts.push({id:'p_'+Date.now()+'_'+i,name:r.name,color:TC[S.pts.length%TC.length]});});renderPL();updatePv();try{App.setState({participants:S.pts});}catch(e){}});}else toast('엑셀 기능 준비 중','info');}
  catch(e){toast('엑셀 오류','error');}
}

/* ── PROC ── */
// buildProc은 step4.js에서 정의됨

/* ── CONFIRM ── */
function buildConfirm(){
  const g=ALLG.find(x=>x.id===S.selG)||{name:S.selG};
  const pr=PROCS.find(x=>x.id===S.proc)||{name:S.proc};
  const modeIdMap={'individual':'ind','team':'team'};
  const rmId=modeIdMap[S.rm]||S.rm;
  const rm=REGMODES.find(x=>x.id===rmId)||REGMODES[0];
  const items=[
    {k:'행사명',v:S.en||'—'},{k:'종목명',v:S.gl||g.name||'—'},
    {k:'일시',v:S.dt||'—'},{k:'장소',v:S.pl||'—'},
    {k:'게임',v:g.name||'—'},
    {k:'참가방식',v:rm.name},
  ];
  const cg=document.getElementById('cgrid');cg.innerHTML='';
  items.forEach(x=>{const d=document.createElement('div');d.className='cbox';d.innerHTML=`<div class="ck">${x.k}</div><div class="cv${x.v==='—'?' empty':''}">${x.v}</div>`;cg.appendChild(d);});
  const pb=document.getElementById('ptbadges');pb.innerHTML='';
  if(!S.pts.length){pb.innerHTML='<div style="color:var(--text3);font-size:13px">참가자 없음</div>';}
  else{try{buildParticipantGroups(pb);}catch(e){S.pts.slice(0,20).forEach(p=>{const d=document.createElement('div');d.className='ptbadge';d.innerHTML=`<div style="width:7px;height:7px;border-radius:50%;background:${p.color}"></div>${p.name}`;pb.appendChild(d);});if(S.pts.length>20){const m=document.createElement('div');m.className='ptbadge';m.textContent=`+${S.pts.length-20}명`;pb.appendChild(m);}}}
  // start button
  const nav=document.getElementById('snav');
  if(!nav.querySelector('.bstart')){
    const a=document.createElement('button');a.className='bstart';
    a.onclick=()=>{saveCurrentStep();saveAll();localStorage.setItem('sgp_last_step','6');goS(6);g6Init();};
    a.innerHTML='🚀 게임 시작';nav.appendChild(a);
  }
}
function saveAll(){
  try{
    const prev=App.getState();
    App.setState({
      event:{name:S.en||'SGP 행사',subtitle:S.sub,primaryColor:S.pointColor||'#e63946',accentColor:'#4cc9f0'},
      gameType:S.selG,
      mode:S.rm,
      participants:S.pts,
      settings:{
        ...((prev&&prev.settings)||{}),
        laps:S.laps||1,
        proc:S.proc,
        rm:S.rm,
        gl:S.gl||'',
        dt:S.dt||'',
        pl:S.pl||'',
        sp:S.sp||'',
        s1:S.s1||'',
        s2:S.s2||'',
        di:S.di,
        blk:S.blk,
        titleFont:S.titleFont,
        rankCount:S.rankCount,
        theme:S.theme||null,
        pointColor:S.pointColor||null,
        matches:S.matches||null,
        groupBrackets:S.groupBrackets||null,
      }
    });
    const existingCfg=JSON.parse(localStorage.getItem('sgp_display_config')||'{}');
    const cfg=Object.assign(existingCfg,{
      eventName:S.en,subtitle:S.sub,gameLabel:S.gl,
      dt:S.dt,pl:S.pl,
      slogan1:S.s1,slogan2:S.s2,sponsor:S.sp,
      displayItems:S.di,
      blk:S.blk,
      titleFont:S.titleFont,
      rankCount:S.rankCount,
      theme:S.theme||null,
      pointColor:S.pointColor||null,
    });
    localStorage.setItem('sgp_display_config',JSON.stringify(cfg));
  }catch(e){}
}

/* ── PREVIEW UPDATE ── */
function updatePv(){
  const sh=k=>S.di[k];
  const _en=document.getElementById('pv-ename');
  _en.textContent=(sh('eventname')&&S.en)||'SGP 행사';
  const _tf=TITLE_FONTS.find(f=>f.id===S.titleFont)||TITLE_FONTS[0];
  // 초시계 글씨체 → pv-time에만 적용
  const pvTime=document.getElementById('pv-time');
  if(pvTime) pvTime.style.fontFamily=_tf.css;
  // 초시계 크기/색상 미리보기 반영
  const timerSz=parseInt(document.getElementById('ds-timersize-val')?.textContent||'100');
  if(pvTime && timerSz) pvTime.style.fontSize=timerSz+'px';
  if(pvTime && S.timerColor) pvTime.style.color=S.timerColor;
  // 하단정보/티커 크기 미리보기 반영
  const ftrSz=parseInt(document.getElementById('ds-ftrsize-val')?.textContent||'0');
  const tkSz=parseInt(document.getElementById('ds-tksize-val')?.textContent||'0');
  const pvFtr=document.getElementById('pv-gname');
  const pvTk=document.getElementById('pv-tk');
  if(pvFtr && ftrSz) pvFtr.style.fontSize=ftrSz+'px';
  if(pvTk && tkSz) pvTk.style.fontSize=tkSz+'px';
  document.getElementById('pv-sub').textContent=(sh('subtitle')&&S.sub)||'';
  document.getElementById('pv-chal').textContent=(S.matches&&S.matches.length&&S.pts.length)?S.pts[0].name:'—';
  document.getElementById('pv-lap').textContent=`LAP 1 / ${S.laps}`;
  buildRanks();
  const g=ALLG.find(x=>x.id===S.selG);
  document.getElementById('pv-gname').textContent=(sh('gamename')&&(S.gl||g?.name))||g?.name||'SGP PLATFORM';
  buildTicker();
  updatePvVs();updatePv2();updatePv3();updateRankLayout();
  // 기존 config 유지하면서 병합 저장
  try{
    const existingCfg=JSON.parse(localStorage.getItem('sgp_display_config')||'{}');
    const cfg=Object.assign(existingCfg,{
      eventName:S.en,subtitle:S.sub,gameLabel:S.gl,
      dt:S.dt,pl:S.pl,
      slogan1:S.s1,slogan2:S.s2,sponsor:S.sp,
      displayItems:S.di,
      blk:S.blk,
      titleFont:S.titleFont,
      timerSize:timerSz||null,
      timerColor:S.timerColor||null,
      rankCount:S.rankCount,
      theme:S.theme||null,
      pointColor:S.pointColor||null,
      accentColor:S.accentColor||null,
      vs2Font:S.vs2Font||null,
      bracket3Font:S.bracket3Font||null,
      vs2Bg:S.vs2Bg||'dark',
    });
    localStorage.setItem('sgp_display_config',JSON.stringify(cfg));
  }catch(e){}
}
function buildRanks(){
  const w=document.getElementById('pvr');w.innerHTML='';
  const medals=['🥇','🥈','🥉'];
  const cnt=S.rankCount||6;
  for(let i=0;i<cnt;i++){
    const p=(S.matches&&S.matches.length)?S.pts[i]:null;
    const d=document.createElement('div');
    d.className='rrow'+(i===0?' r1':'')+(p?'':' empty');
    const rn=i<3?medals[i]:`<span style="color:var(--text3)">${i+1}</span>`;
    const clr=p?p.color:'var(--border2)';
    d.innerHTML=`<div class="rno">${rn}</div><div class="rdot" style="background:${clr}"></div><div class="rnm">${p?p.name:'—'}</div><div class="rtm">${p?'—:--':'——'}</div>`;
    w.appendChild(d);
  }
}

function updatePvVs(){
  const hasMatches=S.matches&&S.matches.length>0;
  const p1=hasMatches?S.pts[0]:null,p2=hasMatches?S.pts[1]:null;
  const e1=document.getElementById('pvvs-p1');
  const e2=document.getElementById('pvvs-p2');
  if(e1)e1.textContent=p1?p1.name:'—';
  if(e2)e2.textContent=p2?p2.name:'—';
}
function updateRankLayout(){
  const pvm=document.getElementById('pvm');
  if(!pvm)return;
  pvm.classList.toggle('rank-off',!S.blk.rank);
  pvm.classList.toggle('vs-off',!S.blk.vs);
  // 도전자 이름 표시/숨김 (개인전 토글)
  const chalEl=document.getElementById('pv-chal');
  const chalLbl=chalEl?chalEl.previousElementSibling:null;
  if(chalEl) chalEl.style.display=S.blk.challenger!==false?'':'none';
  if(chalLbl&&chalLbl.classList.contains('tvlbl')) chalLbl.style.display=S.blk.challenger!==false?'':'none';
}
function buildTicker(){
  const sh=k=>S.di[k];
  const parts=[];
  if(sh('eventname')&&S.en) parts.push('★ '+S.en);
  if(sh('slogan1')&&S.s1) parts.push('▶ '+S.s1);
  if(sh('slogan2')&&S.s2) parts.push('▶ '+S.s2);
  if(sh('date')&&S.dt) parts.push('📅 '+S.dt);
  if(sh('place')&&S.pl) parts.push('📍 '+S.pl);
  if(sh('sponsor')&&S.sp) parts.push('🤝 '+S.sp);
  if(!parts.length) parts.push('SGP PLATFORM','⚡ SENSOR GAME PLATFORM','★ READY');
  const t=parts.join('          ');
  document.getElementById('pvtki').textContent=t+'          '+t;
}

/* ── BLOCK TOGGLE ── */
function togBlk(id,el){
  el.classList.toggle('on');
  document.getElementById(id).classList.toggle('pv-hidden',!el.classList.contains('on'));
}


/* ── 2번/3번 화면 ── */
const cleanName=n=>n?n.replace(/^\d+번\s*/,'').replace(/[()[\]]/g,'').trim()||n:'—';
function updatePv2(){
  const mode=typeof _tab2Mode!=='undefined'?_tab2Mode:'court_1';

  // pv2-court-lbl 세팅
  const courtLbl=document.getElementById('pv2-court-lbl');
  if(courtLbl){
    if(mode.startsWith('court_')){
      const n=parseInt(mode.replace('court_',''));
      courtLbl.textContent=`// 경기장 ${n}`;
    } else if(mode==='random'){
      courtLbl.textContent='// 랜덤';
    } else {
      courtLbl.textContent='';
    }
  }

  // 경기장 N 모드: 해당 경기장의 수동 선택 경기만 표시
  if(mode.startsWith('court_')){
    const courtNum=parseInt(mode.replace('court_',''));
    try{
      const courtStr=localStorage.getItem(`sgp_display_vs_court_${courtNum}`);
      if(courtStr){
        const mv=JSON.parse(courtStr);
        if(mv&&mv.p1){
          document.getElementById('pv2-p1').textContent=cleanName(mv.p1);
          document.getElementById('pv2-p2').textContent=cleanName(mv.p2||'—');
          document.getElementById('pv2-info').textContent=mv.label||'';
          return;
        }
      }
    }catch(e){}
    // 선택된 경기 없음 → 대기
    document.getElementById('pv2-p1').textContent='—';
    document.getElementById('pv2-p2').textContent='—';
    document.getElementById('pv2-info').textContent='';
    return;
  }

  // 랜덤 모드: 경기장 1 경기 표시
  if(mode==='random'){
    try{
      const courtStr=localStorage.getItem('sgp_display_vs_court_1');
      if(courtStr){
        const mv=JSON.parse(courtStr);
        if(mv&&mv.p1){
          document.getElementById('pv2-p1').textContent=cleanName(mv.p1);
          document.getElementById('pv2-p2').textContent=cleanName(mv.p2||'—');
          document.getElementById('pv2-info').textContent=mv.label||'';
          return;
        }
      }
    }catch(e){}
  }

  // fallback: 매치 자동 탐색 (경기장 모드 미설정 시)
  let p1=null,p2=null,matchInfo='';
  if(S.matches&&S.matches.length){
    let found=null,totalM=0,completedM=0;
    for(let ri=0;ri<S.matches.length;ri++){
      for(let mi=0;mi<S.matches[ri].length;mi++){
        const m=S.matches[ri][mi];
        if(m.p1&&m.p2){totalM++;if(m.winner)completedM++;else if(!found)found=m;}
      }
    }
    if(found){p1=found.p1;p2=found.p2;}
    else if(!totalM){matchInfo='';}
  }
  document.getElementById('pv2-p1').textContent=p1?cleanName(p1.name):'—';
  document.getElementById('pv2-p2').textContent=p2?cleanName(p2.name):'—';
  document.getElementById('pv2-info').textContent=matchInfo;
}
function _d3DrawBracket(view, groups, layout, courtCount, curGroupLabel, curRi, curMi){
  function stripScroll(div){
    div.querySelectorAll('*').forEach(el=>{
      if(el.style.overflow==='auto'||el.style.overflowX==='auto') el.style.overflow='visible';
    });
  }
  window.isCurrentMatchIdx=function(ri,mi){
    if(curRi<0||curMi<0) return false;
    const curGrp=S.matches?.[0]?.[0]?._groupLabel||'';
    return ri===curRi&&mi===curMi&&curGrp===curGroupLabel;
  };
  const saved=S.matches;
  view.innerHTML='';
  view.style.overflow='auto';
  if(layout==='D'&&courtCount>=2){
    const lGroups=groups.filter(g=>g.court===1);
    const rGroups=groups.filter(g=>g.court===2);
    const rowCount=Math.max(lGroups.length,rGroups.length);
    const outerWrap=document.createElement('div');
    outerWrap.style.cssText='display:flex;flex-direction:column;gap:0;min-width:100%;padding:12px;';
    const hdrRow=document.createElement('div');hdrRow.style.cssText='display:flex;flex-direction:row;gap:0;margin-bottom:6px;';
    const mkLbl=(txt,align)=>{const d=document.createElement('div');d.style.cssText=`font-size:10px;color:var(--accent);font-family:"Share Tech Mono",monospace;letter-spacing:2px;text-align:${align};`;d.textContent=txt;return d;};
    const hL=document.createElement('div');hL.style.cssText='padding-right:24px;flex-shrink:0;';hL.appendChild(mkLbl('// 경기장 1','left'));
    const hSp=document.createElement('div');hSp.style.cssText='flex:1;min-width:40px;';
    const hR=document.createElement('div');hR.style.cssText='padding-left:24px;flex-shrink:0;display:flex;justify-content:flex-end;';
    if(rGroups.length) hR.appendChild(mkLbl('// 경기장 2','right'));
    hdrRow.appendChild(hL);hdrRow.appendChild(hSp);hdrRow.appendChild(hR);
    outerWrap.appendChild(hdrRow);
    const mkSection=(g,reversed)=>{
      const shortLabel=g.label.split('/').map((p,pi)=>pi===0?p.trim():p.trim().replace('부','')).join('·');
      const sec=document.createElement('div');sec.style.cssText='display:flex;flex-direction:column;flex-shrink:0;min-width:max-content;';
      const hdr=document.createElement('div');hdr.style.cssText='font-size:9px;color:#555;font-family:"Share Tech Mono",monospace;letter-spacing:1px;margin-bottom:4px;margin-top:8px;flex-shrink:0;white-space:nowrap;';
      hdr.textContent=shortLabel;sec.appendChild(hdr);
      const groupWrap=document.createElement('div');groupWrap.style.cssText='min-width:max-content;';
      const taggedMatches=g.matches.map((round,ri)=>round.map((m,mi)=>({...m,_groupObj:g,_origMi:mi,_origRi:ri,_groupLabel:shortLabel})));
      S.matches=taggedMatches;
      try{_renderBracketHTML(groupWrap,taggedMatches,'top',reversed);stripScroll(groupWrap);}catch(e){}
      sec.appendChild(groupWrap);return sec;
    };
    for(let i=0;i<rowCount;i++){
      const row=document.createElement('div');row.style.cssText='display:flex;flex-direction:row;align-items:stretch;gap:0;margin-bottom:20px;';
      const cL=document.createElement('div');cL.style.cssText='padding-right:24px;flex-shrink:0;min-width:max-content;';
      if(lGroups[i]) cL.appendChild(mkSection(lGroups[i],false));
      const sp=document.createElement('div');sp.style.cssText='flex:1;min-width:40px;';
      const cR=document.createElement('div');cR.style.cssText='padding-left:24px;flex-shrink:0;min-width:max-content;display:flex;flex-direction:column;align-items:flex-end;';
      if(rGroups[i]) cR.appendChild(mkSection(rGroups[i],true));
      row.appendChild(cL);row.appendChild(sp);row.appendChild(cR);
      outerWrap.appendChild(row);
    }
    view.appendChild(outerWrap);
  } else {
    const outerWrap=document.createElement('div');outerWrap.style.cssText='padding:8px;min-width:max-content;';
    groups.forEach(g=>{
      const shortLabel=g.label.split('/').map((p,pi)=>pi===0?p.trim():p.trim().replace('부','')).join('·');
      const hdr=document.createElement('div');hdr.style.cssText='font-size:9px;color:#555;font-family:"Share Tech Mono",monospace;letter-spacing:1px;margin-bottom:4px;margin-top:8px;';
      hdr.textContent=shortLabel;outerWrap.appendChild(hdr);
      const groupWrap=document.createElement('div');groupWrap.style.cssText='margin-bottom:16px;position:relative;';
      const taggedMatches=g.matches.map((round,ri)=>round.map((m,mi)=>({...m,_groupObj:g,_origMi:mi,_origRi:ri,_groupLabel:shortLabel})));
      S.matches=taggedMatches;
      try{
        const fns={A:renderBracketA,B:renderBracketB,C:renderBracketC,E:renderBracketE};
        (fns[layout]||renderBracketA)(groupWrap);
        stripScroll(groupWrap);
      }catch(e){groupWrap.innerHTML='<div style="color:red;font-size:11px;">오류:'+e.message+'</div>';}
      outerWrap.appendChild(groupWrap);
    });
    view.appendChild(outerWrap);
  }
  S.matches=saved;
}


// pv3 전용 렌더러: 그룹 렌더 시 _pv3CurrentGroupLabel을 세팅해 isCurrentMatchIdx가 정확히 동작
// (기존 _d3DrawBracket은 S.matches를 루프마다 덮어써서 마지막 그룹 label로 고정되는 버그 있음)
function _d3DrawBracketPv3(view, groups, layout, courtCount){
  function stripScroll(div){
    div.querySelectorAll('*').forEach(el=>{
      if(el.style.overflow==='auto'||el.style.overflowX==='auto') el.style.overflow='visible';
    });
  }
  const saved=S.matches;
  view.innerHTML='';
  view.style.overflow='auto';

  // layout D: 경기장1 왼쪽 / 경기장2 오른쪽
  if(layout==='D'&&courtCount>=2){
    const lGroups=groups.filter(g=>g.court===1);
    const rGroups=groups.filter(g=>g.court===2);
    const rowCount=Math.max(lGroups.length,rGroups.length);
    const outerWrap=document.createElement('div');
    outerWrap.style.cssText='display:flex;flex-direction:column;gap:0;min-width:100%;padding:12px;';
    const hdrRow=document.createElement('div');hdrRow.style.cssText='display:flex;flex-direction:row;gap:0;margin-bottom:6px;';
    const mkLbl=(txt,align)=>{const d=document.createElement('div');d.style.cssText='font-size:10px;color:var(--accent);font-family:"Share Tech Mono",monospace;letter-spacing:2px;text-align:'+align+';';d.textContent=txt;return d;};
    const hL=document.createElement('div');hL.style.cssText='padding-right:24px;flex-shrink:0;';hL.appendChild(mkLbl('// 경기장 1','left'));
    const hSp=document.createElement('div');hSp.style.cssText='flex:1;min-width:40px;';
    const hR=document.createElement('div');hR.style.cssText='padding-left:24px;flex-shrink:0;display:flex;justify-content:flex-end;';
    if(rGroups.length) hR.appendChild(mkLbl('// 경기장 2','right'));
    hdrRow.appendChild(hL);hdrRow.appendChild(hSp);hdrRow.appendChild(hR);
    outerWrap.appendChild(hdrRow);
    const mkSection=(g, reversed)=>{
      const shortLabel=g.label.split('/').map((p,pi)=>pi===0?p.trim():p.trim().replace('부','')).join('·');
      window._pv3CurrentGroupLabel=shortLabel;
      const taggedMatches=g.matches.map((round,ri)=>round.map((m,mi)=>({...m,_groupObj:g,_origMi:mi,_origRi:ri,_groupLabel:shortLabel})));
      S.matches=taggedMatches;
      const groupWrap=document.createElement('div');groupWrap.style.cssText='min-width:max-content;';
      try{_renderBracketHTML(groupWrap,taggedMatches,'top',reversed);stripScroll(groupWrap);}catch(e){}
      const sec=document.createElement('div');sec.style.cssText='display:flex;flex-direction:column;flex-shrink:0;min-width:max-content;';
      const lbl=document.createElement('div');lbl.style.cssText='font-size:9px;color:#555;font-family:"Share Tech Mono",monospace;letter-spacing:1px;margin-bottom:4px;margin-top:8px;flex-shrink:0;white-space:nowrap;';
      lbl.textContent=shortLabel;sec.appendChild(lbl);sec.appendChild(groupWrap);
      return sec;
    };
    for(let i=0;i<rowCount;i++){
      const row=document.createElement('div');row.style.cssText='display:flex;flex-direction:row;align-items:stretch;gap:0;margin-bottom:20px;';
      const cL=document.createElement('div');cL.style.cssText='padding-right:24px;flex-shrink:0;min-width:max-content;';
      if(lGroups[i]) cL.appendChild(mkSection(lGroups[i],false));
      const sp=document.createElement('div');sp.style.cssText='flex:1;min-width:40px;';
      const cR=document.createElement('div');cR.style.cssText='padding-left:24px;flex-shrink:0;min-width:max-content;display:flex;flex-direction:column;align-items:flex-end;';
      if(rGroups[i]) cR.appendChild(mkSection(rGroups[i],true));
      row.appendChild(cL);row.appendChild(sp);row.appendChild(cR);
      outerWrap.appendChild(row);
    }
    view.appendChild(outerWrap);
  } else {
    // layout A/B/C/E
    const outerWrap=document.createElement('div');outerWrap.style.cssText='padding:8px;min-width:max-content;';
    groups.forEach(g=>{
      const shortLabel=g.label.split('/').map((p,pi)=>pi===0?p.trim():p.trim().replace('부','')).join('·');
      window._pv3CurrentGroupLabel=shortLabel;
      const taggedMatches=g.matches.map((round,ri)=>round.map((m,mi)=>({...m,_groupObj:g,_origMi:mi,_origRi:ri,_groupLabel:shortLabel})));
      S.matches=taggedMatches;
      const hdr=document.createElement('div');hdr.style.cssText='font-size:9px;color:#555;font-family:"Share Tech Mono",monospace;letter-spacing:1px;margin-bottom:4px;margin-top:8px;';
      hdr.textContent=shortLabel;outerWrap.appendChild(hdr);
      const groupWrap=document.createElement('div');groupWrap.style.cssText='margin-bottom:16px;position:relative;';
      try{
        const fns={A:renderBracketA,B:renderBracketB,C:renderBracketC,E:renderBracketE};
        (fns[layout]||renderBracketA)(groupWrap);
        stripScroll(groupWrap);
      }catch(e){groupWrap.innerHTML='<div style="color:red;font-size:11px;">오류:'+e.message+'</div>';}
      outerWrap.appendChild(groupWrap);
    });
    view.appendChild(outerWrap);
  }
  S.matches=saved;
  window._pv3CurrentGroupLabel='';
}

// 경기장별 선택경기 — updatePv3() 호출 간에 유지 (rAF 타이밍 문제 방지)
let _pv3SelectedMatches = [];

function updatePv3(){
  const view=document.getElementById('pv3-inner');if(!view)return;
  let groups=[];
  // 항상 localStorage 최신값 우선 로드 (bracket-view 별도창에서 변경 시 S가 stale할 수 있음)
  try{ const gb=JSON.parse(localStorage.getItem('sgp_groupBrackets')||'[]'); if(gb.length){ groups=gb; S.groupBrackets=gb; } }catch(e){}
  if(!groups.length && S.groupBrackets&&S.groupBrackets.length) groups=S.groupBrackets;
  if(!groups.length){
    view.innerHTML='<div style="color:var(--text3);font-family:Share Tech Mono,monospace;font-size:10px;padding:16px">대진표 없음 (bracket-view에서 설정 후 표시됩니다)</div>';
    return;
  }
  const layout=localStorage.getItem('sgp_layout')||_bracketLayout||'A';
  const courtCount=parseInt(localStorage.getItem('sgp_courtCount')||'1');

  // 진행중 경기: 그룹레이블+ri+mi로 특정
  let curGroupLabel='',curRi=-1,curMi=-1;
  try{
    const mv=JSON.parse(localStorage.getItem('sgp_display_vs')||'{}');
    const curP1=mv.p1||'',curP2=mv.p2||'';
    const _cn=n=>n?n.replace(/^\d+번\s*/,'').replace(/[()[\]]/g,'').trim()||n:'';
    if(curP1){
      outer: for(const g of groups){
        const sl=g.label.split('/').map((p,pi)=>pi===0?p.trim():p.trim().replace('부','')).join('·');
        for(let ri=0;ri<g.matches.length;ri++){
          for(let mi=0;mi<g.matches[ri].length;mi++){
            const m=g.matches[ri][mi];
            const p1n=m.p1?(typeof m.p1==='object'?m.p1.name:m.p1):'';
            const p2n=m.p2?(typeof m.p2==='object'?m.p2.name:m.p2):'';
            const p2match=curP2?(_cn(p2n)===curP2):(!m.p2);
            if(_cn(p1n)===curP1&&p2match){curGroupLabel=sl;curRi=ri;curMi=mi;break outer;}
          }
        }
      }
    }
  }catch(e){}

  // 경기장별 선택된 경기 전부 수집 (court_1, court_2 각각)
  const newSelectedMatches=[];
  try{
    const courtCount=parseInt(localStorage.getItem('sgp_courtCount')||'1');
    const _cn=n=>n?n.replace(/^\d+번\s*/,'').replace(/[()[\]]/g,'').trim()||n:'';
    for(let c=1;c<=Math.max(courtCount,2);c++){
      const courtStr=localStorage.getItem(`sgp_display_vs_court_${c}`);
      if(!courtStr) continue;
      const mv=JSON.parse(courtStr);
      // ri/mi가 저장돼 있으면 그걸 우선 사용 (BYE 포함 정확히 특정)
      if(mv.ri!=null && mv.mi!=null && mv.groupLabel){
        const sl_target = mv.groupLabel.split('/').map((p,pi)=>pi===0?p.trim():p.trim().replace('부','')).join('·');
        const matched = groups.find(g=>{
          const sl=g.label.split('/').map((p,pi)=>pi===0?p.trim():p.trim().replace('부','')).join('·');
          return sl===sl_target || g.label===mv.groupLabel;
        });
        if(matched){
          const sl=matched.label.split('/').map((p,pi)=>pi===0?p.trim():p.trim().replace('부','')).join('·');
          newSelectedMatches.push({groupLabel:sl, ri:mv.ri, mi:mv.mi, courtNum:c});
          continue;
        }
      }
      // fallback: 이름 매칭
      const curP1=_cn(mv.p1||''), curP2=_cn(mv.p2||'');
      if(!curP1) continue;
      outer2: for(const g of groups){
        const sl=g.label.split('/').map((p,pi)=>pi===0?p.trim():p.trim().replace('부','')).join('·');
        for(let ri=0;ri<g.matches.length;ri++){
          for(let mi=0;mi<g.matches[ri].length;mi++){
            const m=g.matches[ri][mi];
            const p1n=m.p1?(typeof m.p1==='object'?m.p1.name:m.p1):'';
            const p2n=m.p2?(typeof m.p2==='object'?m.p2.name:m.p2):'';
            const p2match=curP2?(_cn(p2n)===curP2):(!m.p2);
            if(_cn(p1n)===curP1&&p2match){
              newSelectedMatches.push({groupLabel:sl, ri, mi, courtNum:c});
              break outer2;
            }
          }
        }
      }
    }
  }catch(e){}

  // court별로 병합: 새로 찾은 court는 업데이트, 못 찾은 court는 기존 값 유지
  // (rAF 타이밍 문제로 두 번째 updatePv3 호출이 빈 값으로 하이라이트를 지우는 현상 방지)
  if(newSelectedMatches.length > 0){
    const updatedCourts = new Set(newSelectedMatches.map(s => s.courtNum));
    _pv3SelectedMatches = [
      ..._pv3SelectedMatches.filter(s => !updatedCourts.has(s.courtNum)),
      ...newSelectedMatches
    ];
  }
  // localStorage에 court 데이터가 아예 없으면 클리어
  const hasAnyCourt = [1,2,3,4].some(c => localStorage.getItem(`sgp_display_vs_court_${c}`));
  if(!hasAnyCourt) _pv3SelectedMatches = [];

  // _linkSel 강제 null → 파란 테두리 제거
  window._linkSel=null;
  // 그룹별 렌더 시 _pv3CurrentGroupLabel을 세팅해 isCurrentMatchIdx가 정확히 비교
  window._pv3CurrentGroupLabel='';
  window.isCurrentMatchIdx=function(ri,mi){
    return _pv3SelectedMatches.some(s=>s.ri===ri&&s.mi===mi&&s.groupLabel===window._pv3CurrentGroupLabel);
  };

  // _getAvailW override: pvcw 실제 너비 기준으로 박스 크기 계산
  const _origGetAvailW = window._getAvailW;
  window._getAvailW = function(wrap){
    const pvcw = document.getElementById('pvcw');
    const w = pvcw ? pvcw.offsetWidth - 40 : 440;
    return w > 100 ? w : 440;
  };

  view.id='pts-bracket-view';
  _d3DrawBracketPv3(view, groups, layout, courtCount);
  view.id='pv3-inner';
  if(_origGetAvailW) window._getAvailW=_origGetAvailW;
  else delete window._getAvailW;
}

/* ── PVC SCALE (TV 비율 축소) ── */
function scaleEl(wrapId, elId){
  const wrap=document.getElementById(wrapId);
  const el=document.getElementById(elId);
  if(!wrap||!el)return;
  const s=wrap.offsetWidth/1280;
  el.style.transform='scale('+s+')';
}
function scalePvc(){
  scaleEl('pvc-wrap','pvc');
  scaleEl('pv2-wrap','pv2');
  scaleEl('pv3-wrap','pv3');
}

/* ── CLOCK ── */
function startClk(){
  function tick(){const n=new Date();const h=String(n.getHours()).padStart(2,'0');const m=String(n.getMinutes()).padStart(2,'0');const s=String(n.getSeconds()).padStart(2,'0');const el=document.getElementById('pv-clk');if(el)el.textContent=`${h}:${m}:${s}`;}
  tick();setInterval(tick,1000);
}

/* ── DISPLAY ── */
function openDisp(){saveAll();window.open('display.html','sgp_disp','width=1280,height=720');}
function resetPv(){S.pts=[];renderPL();updatePv();toast('미리보기 초기화','info');}

/* ── dspanel fallback: 외부 js 파일이 없을 경우에만 동작 ── */
/* dspanel.js, ds-tab1~3.js가 있으면 그쪽에서 모두 처리함 */

let mobOpen=false;
function togMob(){
  const fab=document.getElementById('fab');
  if(!mobOpen){
    const r=document.getElementById('right');
    const ov=document.createElement('div');
    ov.id='mobov';ov.style.cssText='position:fixed;inset:0;z-index:150;background:var(--bg);padding-top:var(--nav-h);display:flex;flex-direction:column;overflow:hidden';
    ov.appendChild(r.cloneNode(true));
    document.body.appendChild(ov);
    fab.textContent='✕';mobOpen=true;
  }else{
    const ov=document.getElementById('mobov');if(ov)ov.remove();
    fab.textContent='📺';mobOpen=false;
  }
}

/* ── TOAST ── */
function toast(msg,type='info'){
  const c=document.getElementById('tc');
  const d=document.createElement('div');d.className='tos '+(type||'');d.textContent=msg;
  c.appendChild(d);setTimeout(()=>d.remove(),3000);
}
