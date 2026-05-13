// ══ DS TAB 1: 메인 전광판 설정 ══

const DS_THEMES=[
  {id:'dark-racing',  name:'🏁 다크 레이싱', primary:'#e63946', accent:'#4cc9f0'},
  {id:'neon-blue',    name:'💙 네온 블루',   primary:'#4361ee', accent:'#4cc9f0'},
  {id:'gold-black',   name:'🏆 골드 블랙',   primary:'#ffd60a', accent:'#ffffff'},
  {id:'green-dark',   name:'🌿 그린 다크',   primary:'#06d6a0', accent:'#4cc9f0'},
  {id:'purple-dark',  name:'💜 퍼플 다크',   primary:'#7b2fff', accent:'#f72585'},
  {id:'fire-red',     name:'🔥 파이어 레드', primary:'#ff6b35', accent:'#ffd60a'},
];
const DS_PRESET_COLORS=['#e63946','#4361ee','#06d6a0','#ffd60a','#7b2fff','#ff6b35','#f72585','#4cc9f0'];
let dsCurTheme='dark-racing';

function buildTab1(){
  buildDsTheme();
  buildBlkChips();
  buildFontPicker();
  document.getElementById('ds-rankval').textContent=S.rankCount||6;
}

function buildDsTheme(){
  const grid=document.getElementById('ds-theme-grid');if(!grid)return;
  grid.innerHTML='';
  DS_THEMES.forEach(t=>{
    const el=document.createElement('div');
    el.className='ds-theme-card'+(dsCurTheme===t.id?' on':'');
    el.innerHTML=t.name;
    el.onclick=()=>{
      dsCurTheme=t.id;
      document.querySelectorAll('.ds-theme-card').forEach(x=>x.classList.remove('on'));
      el.classList.add('on');
      const pc=document.getElementById('ds-primary-color');
      if(pc)pc.value=t.primary;
      // S state 동기화 후 config 저장 (웹페이지 색은 안 바꿈)
      if(typeof S!=='undefined'){S.theme=t.id;S.pointColor=null;S.accentColor=null;}
      if(typeof saveCfgNow==='function') saveCfgNow();
    };
    grid.appendChild(el);
  });
  // 프리셋 색상
  const presets=document.getElementById('ds-preset-colors');if(!presets)return;
  presets.innerHTML='';
  DS_PRESET_COLORS.forEach(col=>{
    const el=document.createElement('div');
    el.className='ds-swatch';
    el.style.background=col;
    el.onclick=()=>{
      // 웹페이지 CSS 변수 안 건드림 — display.html 타이머 색만 변경
      if(typeof S!=='undefined'){S.pointColor=col;S.theme=dsCurTheme||null;}
      if(typeof saveCfgNow==='function') saveCfgNow();
      // 선택 표시
      presets.querySelectorAll('.ds-swatch').forEach(x=>x.style.outline='none');
      el.style.outline='2px solid white';
    };
    presets.appendChild(el);
  });
}

function applyDsColor(color){
  const val=color||document.getElementById('ds-primary-color')?.value;
  if(!val)return;
  // S state 동기화 → config 저장 (웹페이지 색은 변경 안 함)
  const curT=DS_THEMES.find(t=>t.id===dsCurTheme);
  if(typeof S!=='undefined'){
    S.pointColor=val;
    S.theme=dsCurTheme||null;
    S.accentColor=curT?.accent||null;
  }
  if(typeof saveCfgNow==='function') saveCfgNow();
}
