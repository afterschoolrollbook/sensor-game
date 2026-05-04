// ══ STEP 2: 게임모드 ══
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
    d.onclick=()=>{
      S.selG=g.id;
      // 종목 선택 즉시 다음 스텝(3)으로 저장
      try{const cur=parseInt(localStorage.getItem('sgp_last_step')||'1');if(cur<3)localStorage.setItem('sgp_last_step','3');}catch(e){}
      buildGG();updatePv();
    };
    gw.appendChild(d);
  });
  if(document.getElementById('lapv'))document.getElementById('lapv').textContent=S.laps;
}
function switchTab(t){S.gtab=t;S.cat='all';document.getElementById('tab-s').classList.toggle('active',t==='sensor');document.getElementById('tab-p').classList.toggle('active',t==='sport');buildGG();}
function chLaps(d){S.laps=Math.max(1,Math.min(20,S.laps+d));if(document.getElementById('lapv'))document.getElementById('lapv').textContent=S.laps;updatePv();}

