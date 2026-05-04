// ══ STEP 5: 확인/시작 ══
/* ── CONFIRM ── */
function buildConfirm(){
  const g=ALLG.find(x=>x.id===S.selG)||{name:S.selG};
  const pr=PROCS.find(x=>x.id===S.proc)||{name:S.proc};
  const rm=REGMODES.find(x=>x.id===S.rm)||{name:S.rm};
  const items=[
    {k:'행사명',v:S.en||'—'},{k:'종목명',v:S.gl||g.name||'—'},
    {k:'일시',v:S.dt||'—'},{k:'장소',v:S.pl||'—'},
    {k:'게임',v:g.name||'—'},
    {k:'참가방식',v:rm.name},{k:'진행방식',v:pr.name},
  ];
  const cg=document.getElementById('cgrid');cg.innerHTML='';
  items.forEach(x=>{const d=document.createElement('div');d.className='cbox';d.innerHTML=`<div class="ck">${x.k}</div><div class="cv${x.v==='—'?' empty':''}">${x.v}</div>`;cg.appendChild(d);});
  const pb=document.getElementById('ptbadges');pb.innerHTML='';
  if(!S.pts.length){pb.innerHTML='<div style="color:var(--text3);font-size:13px">참가자 없음</div>';}
  else{S.pts.slice(0,20).forEach(p=>{const d=document.createElement('div');d.className='ptbadge';d.innerHTML=`<div style="width:7px;height:7px;border-radius:50%;background:${p.color}"></div>${p.name}`;pb.appendChild(d);});if(S.pts.length>20){const m=document.createElement('div');m.className='ptbadge';m.textContent=`+${S.pts.length-20}명`;pb.appendChild(m);}}
  // start button
  const nav=document.getElementById('snav');
  if(!nav.querySelector('.bstart')){
    const a=document.createElement('a');a.href='game.html';a.className='bstart';a.onclick=saveAll;a.innerHTML='🚀 게임 시작';nav.appendChild(a);
  }
}
function saveAll(){
  try{
    App.setState({event:{name:S.en||'SGP 행사',subtitle:S.sub},gameType:S.selG,mode:S.proc.startsWith('team')?'team':'individual',participants:S.pts,settings:{laps:S.laps}});
    localStorage.setItem('sgp_display_config',JSON.stringify({eventName:S.en,subtitle:S.sub,gameLabel:S.gl,slogan1:S.s1,slogan2:S.s2,sponsor:S.sp,displayItems:S.di}));
  }catch(e){}
}

