let _compType='national';
let _courtCount=1;

function setCompType(type){
  _compType=type;
  document.querySelectorAll('.comp-type-btn').forEach(b=>{
    const active=b.dataset.type===type;
    b.style.borderColor=active?'var(--accent)':'var(--border)';
    b.style.background=active?'rgba(76,201,240,.15)':'transparent';
    b.style.color=active?'var(--accent)':'var(--text2)';
  });
}

function setCourtCount(n){
  _courtCount=n;
  try{ localStorage.setItem('sgp_courtCount', String(n)); }catch(e){}
  document.querySelectorAll('.court-btn').forEach(b=>{
    const active=Number(b.dataset.count)===n;
    b.style.borderColor=active?'var(--red)':'var(--border)';
    b.style.background=active?'rgba(230,57,70,.2)':'transparent';
    b.style.color=active?'var(--red)':'var(--text2)';
  });
  updateBracketPreview();
}


function setLayoutAndHighlight(l){
  _bracketLayout=l;
  ['A','B','C','D','E'].forEach(x=>{
    const btn=document.getElementById('setup-lay-'+x);
    if(!btn) return;
    const active=x===l;
    btn.style.borderColor=active?'var(--red)':'var(--border2)';
    btn.style.background=active?'rgba(230,57,70,.2)':'transparent';
    btn.style.color=active?'var(--red)':'var(--text2)';
  });
  // D형 말풍선 경기장 수 반영
  const tipD=document.getElementById('tip-D-court');
  if(tipD){
    tipD.textContent=`경기장 ${_courtCount}개 → ${_courtCount}곳에서 출발해 가운데 결승`;
  }
  updateBracketPreview();
}

function updateBracketPreview(){
  const panel=document.getElementById('bracket-preview-panel');
  const svgWrap=document.getElementById('bracket-preview-svg');
  const label=document.getElementById('preview-label');
  const desc=document.getElementById('preview-desc');
  const stats=document.getElementById('preview-stats');
  const n=_courtCount||1, ly=_bracketLayout||'A';
  if(!ly){panel.style.display='none';return;}
  panel.style.display='block';

  const layoutNames={A:'A형 (좌→우)',B:'B형 (아래→위)',C:'C형 (위→아래)',D:'D형 (양방향→중앙)',E:'E형 (상하→중앙)'};
  const layoutDescs={A:'경기장 1개 적합',B:'경기장 1개 적합',C:'경기장 1개 적합',D:`경기장 ${n}개 — 좌우 분산 후 가운데 결승`,E:`경기장 ${n}개 — 상하 분산 후 가운데 결승`};
  label.textContent=layoutNames[ly]||ly+'형';
  desc.textContent=layoutDescs[ly]||'';

  const _ec=(ly==='D'||ly==='E')?Math.max(2,n):1;
  const _erMap={A:4,B:4,C:4,D:4,E:3};
  const _er=_erMap[ly]||4;
  stats.innerHTML=`<span style="font-size:11px;color:var(--text3);">예시)</span> <span style="font-size:13px;color:var(--text2);font-weight:700;">16명 &nbsp;/&nbsp; ${_ec}경기장 &nbsp;/&nbsp; ${_er}라운드</span>`;
  svgWrap.innerHTML=getBracketPreviewSVG(n,ly);
}

function getBracketPreviewSVG(courts,layout){
  const C='rgba(76,201,240,0.25)', S='rgba(76,201,240,0.55)', F='rgba(230,57,70,0.5)', A='rgba(76,201,240,0.9)';
  const box=(x,y,w=52,h=18,col=C,sc=S)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${col}" stroke="${sc}" stroke-width="1"/>`;
  const line=(d,op=0.4)=>`<path d="${d}" fill="none" stroke="rgba(76,201,240,${op})" stroke-width="0.9"/>`;
  const txt=(x,y,t,col='rgba(240,240,248,0.5)',fs=9)=>`<text x="${x}" y="${y}" text-anchor="middle" fill="${col}" font-size="${fs}" font-family="'Share Tech Mono',monospace">${t}</text>`;
  const fbox=(x,y,w=52,h=18)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${F}" stroke="rgba(230,57,70,0.8)" stroke-width="1.5"/>`;

  if(layout==='A'){
    return `<svg viewBox="0 0 500 260" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;">
      ${txt(250,12,'A형 — 좌→우 단방향','rgba(76,201,240,0.7)',10)}
      ${txt(30,24,'1R','rgba(76,201,240,0.4)',8)}
      ${txt(130,24,'2R','rgba(76,201,240,0.4)',8)}
      ${txt(220,24,'3R','rgba(76,201,240,0.4)',8)}
      ${txt(400,24,'결승','rgba(230,57,70,0.8)',8)}
      ${box(4,28,52,20)}${box(4,54,52,20)}${box(4,84,52,20)}${box(4,110,52,20)}
      ${box(4,140,52,20)}${box(4,166,52,20)}${box(4,196,52,20)}${box(4,222,52,20)}
      ${box(84,41,52,20)}${box(84,97,52,20)}${box(84,153,52,20)}${box(84,209,52,20)}
      ${box(164,69,52,20)}${box(164,181,52,20)}
      ${fbox(320,115,120,30)}
      ${txt(380,134,'🏆 결승','rgba(230,57,70,0.95)',10)}
      ${line('M56 38 H70 V51 H84')}${line('M56 64 H70 V51 H70')}
      ${line('M56 94 H70 V107 H84')}${line('M56 120 H70 V107 H70')}
      ${line('M56 150 H70 V163 H84')}${line('M56 176 H70 V163 H70')}
      ${line('M56 206 H70 V219 H84')}${line('M56 232 H70 V219 H70')}
      ${line('M136 51 H150 V79 H164')}${line('M136 107 H150 V79 H150')}
      ${line('M136 163 H150 V191 H164')}${line('M136 219 H150 V191 H150')}
      ${line('M216 79 H268 V130 H320','0.7')}${line('M216 191 H268 V130 H268','0.7')}
    </svg>`;
  }
  if(layout==='B'){
    return `<svg viewBox="0 0 500 270" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;">
      ${txt(250,14,'B형 — 아래→위 단방향','rgba(76,201,240,0.7)',10)}
      ${txt(250,30,'결승','rgba(230,57,70,0.8)',8)}
      ${fbox(175,36,150,26)}
      ${txt(250,53,'🏆 결승','rgba(230,57,70,0.95)',10)}
      ${txt(250,82,'3R','rgba(76,201,240,0.4)',8)}
      ${box(82,88,90,22)}${box(328,88,90,22)}
      ${line('M127 88 L127 70 L250 70 L250 62','0.6')}
      ${line('M373 88 L373 70 L250 70','0.6')}
      ${txt(250,130,'2R','rgba(76,201,240,0.4)',8)}
      ${box(45,136,50,22)}${box(165,136,50,22)}${box(285,136,50,22)}${box(405,136,50,22)}
      ${line('M70 136 L70 116 L127 116 L127 110')}
      ${line('M190 136 L190 116 L127 116')}
      ${line('M310 136 L310 116 L373 116 L373 110')}
      ${line('M430 136 L430 116 L373 116')}
      ${txt(250,180,'1R','rgba(76,201,240,0.4)',8)}
      ${box(14,186,52,22)}${box(74,186,52,22)}${box(134,186,52,22)}${box(194,186,52,22)}
      ${box(254,186,52,22)}${box(314,186,52,22)}${box(374,186,52,22)}${box(434,186,52,22)}
      ${line('M40 186 L40 166 L70 166 L70 158')}
      ${line('M100 186 L100 166 L70 166')}
      ${line('M160 186 L160 166 L190 166 L190 158')}
      ${line('M220 186 L220 166 L190 166')}
      ${line('M280 186 L280 166 L310 166 L310 158')}
      ${line('M340 186 L340 166 L310 166')}
      ${line('M400 186 L400 166 L430 166 L430 158')}
      ${line('M460 186 L460 166 L430 166')}
    </svg>`;
  }
  if(layout==='C'){
    return `<svg viewBox="0 0 500 270" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;">
      ${txt(250,14,'C형 — 위→아래 단방향','rgba(76,201,240,0.7)',10)}
      ${txt(250,30,'1R','rgba(76,201,240,0.4)',8)}
      ${box(14,36,52,22)}${box(74,36,52,22)}${box(134,36,52,22)}${box(194,36,52,22)}
      ${box(254,36,52,22)}${box(314,36,52,22)}${box(374,36,52,22)}${box(434,36,52,22)}
      ${txt(250,80,'2R','rgba(76,201,240,0.4)',8)}
      ${box(45,86,50,22)}${box(165,86,50,22)}${box(285,86,50,22)}${box(405,86,50,22)}
      ${line('M40 58 L40 76 L70 76 L70 86')}
      ${line('M100 58 L100 76 L70 76')}
      ${line('M160 58 L160 76 L190 76 L190 86')}
      ${line('M220 58 L220 76 L190 76')}
      ${line('M280 58 L280 76 L310 76 L310 86')}
      ${line('M340 58 L340 76 L310 76')}
      ${line('M400 58 L400 76 L430 76 L430 86')}
      ${line('M460 58 L460 76 L430 76')}
      ${txt(250,130,'3R','rgba(76,201,240,0.4)',8)}
      ${box(82,136,90,22)}${box(328,136,90,22)}
      ${line('M70 108 L70 126 L127 126 L127 136')}
      ${line('M190 108 L190 126 L127 126')}
      ${line('M310 108 L310 126 L373 126 L373 136')}
      ${line('M430 108 L430 126 L373 126')}
      ${txt(250,178,'결승','rgba(230,57,70,0.8)',8)}
      ${fbox(175,184,150,26)}
      ${txt(250,201,'🏆 결승','rgba(230,57,70,0.95)',10)}
      ${line('M127 158 L127 172 L250 172 L250 184','0.6')}
      ${line('M373 158 L373 172 L250 172','0.6')}
    </svg>`;
  }
  if(layout==='D'){
    const courtNotice=(courts<2)?`<text x="250" y="16" text-anchor="middle" fill="rgba(76,201,240,0.7)" font-size="9" font-family="'Share Tech Mono',monospace">※ 2개 이상의 경기장에서 진행할 때 선택해 주세요</text>`:'';
    const svgsByCount={
      2:`<svg viewBox="0 0 500 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;">
        ${courtNotice}
        ${txt(250,12,'D형','rgba(76,201,240,0.7)',10)}
        <text x="4" y="65" fill="rgba(76,201,240,0.4)" font-size="7" font-family="'Share Tech Mono',monospace">1</text>
        <text x="4" y="75" fill="rgba(76,201,240,0.4)" font-size="7" font-family="'Share Tech Mono',monospace">경</text>
        <text x="4" y="85" fill="rgba(76,201,240,0.4)" font-size="7" font-family="'Share Tech Mono',monospace">기</text>
        <text x="4" y="95" fill="rgba(76,201,240,0.4)" font-size="7" font-family="'Share Tech Mono',monospace">장</text>
        <text x="490" y="65" fill="rgba(76,201,240,0.4)" font-size="7" font-family="'Share Tech Mono',monospace" text-anchor="middle">2</text>
        <text x="490" y="75" fill="rgba(76,201,240,0.4)" font-size="7" font-family="'Share Tech Mono',monospace" text-anchor="middle">경</text>
        <text x="490" y="85" fill="rgba(76,201,240,0.4)" font-size="7" font-family="'Share Tech Mono',monospace" text-anchor="middle">기</text>
        <text x="490" y="95" fill="rgba(76,201,240,0.4)" font-size="7" font-family="'Share Tech Mono',monospace" text-anchor="middle">장</text>
        ${box(14,26,52,20)}${box(14,54,52,20)}${box(14,96,52,20)}${box(14,124,52,20)}
        ${line('M66 36 H74 V50 H78')}${line('M66 64 H74 V50')}
        ${line('M66 106 H74 V120 H78')}${line('M66 134 H74 V120')}
        ${box(78,40,52,20)}${box(78,110,52,20)}
        ${line('M130 50 H138 V85 H142')}${line('M130 120 H138 V85')}
        ${box(142,75,52,20)}
        ${line('M194 85 H211','0.6')}
        ${fbox(211,75,78,20)}
        ${txt(250,88,'🏆 결승','rgba(230,57,70,0.95)',9)}
        ${line('M289 85 H306','0.6')}
        ${box(306,75,52,20)}
        ${line('M358 85 H362 V85')}${line('M362 85 V50 H370')}${line('M362 85 V120 H370')}
        ${box(370,40,52,20)}${box(370,110,52,20)}
        ${line('M434 36 H428 V50 H422')}${line('M434 64 H428 V50')}
        ${line('M434 106 H428 V120 H422')}${line('M434 134 H428 V120')}
        ${box(434,26,52,20)}${box(434,54,52,20)}${box(434,96,52,20)}${box(434,124,52,20)}
        ${txt(40,205,'1R','rgba(76,201,240,0.4)',7)}
        ${txt(104,205,'2R','rgba(76,201,240,0.4)',7)}
        ${txt(168,205,'3R','rgba(76,201,240,0.4)',7)}
        ${txt(250,205,'결승','rgba(230,57,70,0.7)',7)}
        ${txt(332,205,'3R','rgba(76,201,240,0.4)',7)}
        ${txt(396,205,'2R','rgba(76,201,240,0.4)',7)}
        ${txt(460,205,'1R','rgba(76,201,240,0.4)',7)}
      </svg>`,
      4:`<svg viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;">
        ${txt(200,12,'D형 — 경기장 4개 (준비중)','rgba(76,201,240,0.7)',10)}
      </svg>`,
    };
    const even=courts%2===0?courts:courts+1;
    const key=Math.min(even,4);
    return svgsByCount[key]||svgsByCount[2];
  }
  if(layout==='E'){
    const courtNotice=(courts<2)?`<text x="250" y="16" text-anchor="middle" fill="rgba(76,201,240,0.7)" font-size="9" font-family="'Share Tech Mono',monospace">※ 2개 이상의 경기장에서 진행할 때 선택해 주세요</text>`:'';
    const svgsByCount={
      2:`<svg viewBox="0 0 500 260" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;">
        ${courtNotice}
        ${txt(250,12,'E형','rgba(76,201,240,0.7)',10)}
        <text x="10" y="26" fill="rgba(76,201,240,0.45)" font-size="7" font-family="'Share Tech Mono',monospace">경기장1</text>
        ${txt(102,40,'1R','rgba(76,201,240,0.4)',7)}${txt(398,40,'1R','rgba(76,201,240,0.4)',7)}
        ${box(20,44,72,20)}${box(112,44,72,20)}${box(316,44,72,20)}${box(408,44,72,20)}
        ${line('M56 64 L56 76 L100 76 L100 86')}
        ${line('M148 64 L148 76 L100 76')}
        ${line('M352 64 L352 76 L400 76 L400 86')}
        ${line('M444 64 L444 76 L400 76')}
        ${txt(100,83,'2R','rgba(76,201,240,0.4)',7)}${txt(400,83,'2R','rgba(76,201,240,0.4)',7)}
        ${box(64,86,72,20)}${box(364,86,72,20)}
        ${line('M100 106 L100 116 L250 116 L250 124','0.6')}
        ${line('M400 106 L400 116 L250 116','0.6')}
        ${txt(250,120,'결승','rgba(230,57,70,0.7)',7)}
        ${fbox(175,124,150,26)}
        ${txt(250,141,'🏆 결승','rgba(230,57,70,0.95)',9)}
        ${line('M100 178 L100 168 L250 168 L250 150','0.6')}
        ${line('M400 178 L400 168 L250 168','0.6')}
        ${txt(100,175,'2R','rgba(76,201,240,0.4)',7)}${txt(400,175,'2R','rgba(76,201,240,0.4)',7)}
        ${box(64,178,72,20)}${box(364,178,72,20)}
        ${line('M56 218 L56 206 L100 206 L100 198')}
        ${line('M148 218 L148 206 L100 206')}
        ${line('M352 218 L352 206 L400 206 L400 198')}
        ${line('M444 218 L444 206 L400 206')}
        ${txt(102,215,'1R','rgba(76,201,240,0.4)',7)}${txt(398,215,'1R','rgba(76,201,240,0.4)',7)}
        ${box(20,218,72,20)}${box(112,218,72,20)}${box(316,218,72,20)}${box(408,218,72,20)}
        <text x="10" y="248" fill="rgba(76,201,240,0.45)" font-size="7" font-family="'Share Tech Mono',monospace">경기장2</text>
      </svg>`,
      4:`<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;">
        ${txt(200,12,'E형 — 경기장 4개 (준비중)','rgba(76,201,240,0.7)',10)}
      </svg>`,
    };
    const even=courts%2===0?courts:courts+1;
    const key=Math.min(even,4);
    return svgsByCount[key]||svgsByCount[2];
  }
  return `<svg viewBox="0 0 340 60" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;">
    <text x="170" y="35" text-anchor="middle" fill="rgba(144,144,176,0.6)" font-size="13" font-family="sans-serif">미리보기 준비 중...</text>
  </svg>`;
}

function _initLayoutTooltips(){
  document.querySelectorAll('.layout-btn').forEach(btn=>{
    const tip=btn.nextElementSibling;
    if(!tip) return;
    btn.addEventListener('mouseenter',()=>tip.style.display='block');
    btn.addEventListener('mouseleave',()=>tip.style.display='none');
  });
}

function goStep2(){
  show('pts-step2');
  setPtsMode('tournament');
  renderOrderArea();
  setCompType(_compType||'national');
  setCourtCount(_courtCount||1);
  _bracketLayout='A';
  setLayoutAndHighlight('A');
  requestAnimationFrame(_initLayoutTooltips);
  document.getElementById('bracket-preview-panel').style.display='block';
  updateBracketPreview();
  renderPtsOverview();
}

function renderPtsOverview(){
  const panel=document.getElementById('pts-overview');
  const body=document.getElementById('pts-overview-body');
  if(!panel||!body) return;

  // _groups에서 전체 참가자 수집
  const allPts=Object.values(_groups).flat();
  if(!allPts.length){panel.style.display='none';return;}

  const hasGender=allPts.some(p=>p.gender&&p.gender.trim());
  const hasDiv=allPts.some(p=>p.division&&p.division.trim());
  const hasWeight=allPts.some(p=>p.weight&&p.weight.trim());
  if(!hasGender&&!hasDiv&&!hasWeight){panel.style.display='none';return;}
  panel.style.display='block';
  body.innerHTML='';

  // 성별 기준으로 최상위 그룹
  const topGroups={};
  allPts.forEach(p=>{
    const gk=hasGender?(p.gender||'미분류'):'전체';
    if(!topGroups[gk]) topGroups[gk]=[];
    topGroups[gk].push(p);
  });

  Object.entries(topGroups).sort((a,b)=>a[0].localeCompare(b[0],'ko')).forEach(([gname,gpts])=>{
    const genderColor=gname==='남'?'rgba(76,201,240,0.15)':gname==='여'?'rgba(255,100,150,0.15)':'rgba(255,255,255,0.05)';
    const genderBorder=gname==='남'?'rgba(76,201,240,0.4)':gname==='여'?'rgba(255,100,150,0.4)':'var(--border)';
    const genderText=gname==='남'?'#4cc9f0':gname==='여'?'#ff6496':'var(--text2)';

    const box=document.createElement('div');
    box.style.cssText=`background:${genderColor};border:1px solid ${genderBorder};border-radius:10px;padding:10px 14px;flex:1;min-width:0;`;

    let html=`<div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;padding-bottom:7px;border-bottom:1px solid ${genderBorder};">
      <span style="font-size:13px;font-weight:700;color:${genderText};">${gname}</span>
      <span style="font-size:10px;color:var(--text3);">${gpts.length}명</span>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;">`;

    if(hasDiv){
      const divGroups={};
      gpts.forEach(p=>{const dk=p.division||'미분류';if(!divGroups[dk])divGroups[dk]=[];divGroups[dk].push(p);});
      Object.entries(divGroups).sort((a,b)=>a[0].localeCompare(b[0],'ko')).forEach(([dname,dpts])=>{
        html+=`<div style="background:rgba(255,255,255,0.05);border:1px solid var(--border);border-radius:7px;padding:6px 10px;">
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:5px;">
            <span style="font-size:11px;font-weight:700;color:var(--text2);">${dname}</span>
            <span style="font-size:10px;color:var(--text3);">${dpts.length}명</span>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">`;
        if(hasWeight){
          const wtGroups={};
          dpts.forEach(p=>{const wk=p.weight||'미분류';if(!wtGroups[wk])wtGroups[wk]=[];wtGroups[wk].push(p);});
          Object.entries(wtGroups).sort((a,b)=>a[0].localeCompare(b[0],'ko')).forEach(([wname,wpts])=>{
            html+=`<span style="font-size:10px;background:rgba(255,255,255,0.07);border:1px solid var(--border);border-radius:5px;padding:2px 7px;color:var(--text3);">${wname} <b style="color:var(--text2);font-weight:700;">${wpts.length}</b></span>`;
          });
        }
        html+=`</div></div>`;
      });
    } else if(hasWeight){
      const wtGroups={};
      gpts.forEach(p=>{const wk=p.weight||'미분류';if(!wtGroups[wk])wtGroups[wk]=[];wtGroups[wk].push(p);});
      Object.entries(wtGroups).sort((a,b)=>a[0].localeCompare(b[0],'ko')).forEach(([wname,wpts])=>{
        html+=`<span style="font-size:10px;background:rgba(255,255,255,0.07);border:1px solid var(--border);border-radius:5px;padding:2px 7px;color:var(--text3);">${wname} <b style="color:var(--text2);font-weight:700;">${wpts.length}</b></span>`;
      });
    }

    html+=`</div>`;
    box.innerHTML=html;
    body.appendChild(box);
  });
}


async function runBracketAnalysis(){
  const btn=document.getElementById('btn-analyze');
  const result=document.getElementById('analysis-result');
  const body=document.getElementById('analysis-body');
  const status=document.getElementById('analysis-status');

  const allPts=Object.values(_groups).flat();
  if(!allPts.length){ toast('참가자 데이터가 없어요','error'); return; }

  btn.disabled=true; btn.textContent='분석 중...'; btn.style.opacity='0.6';
  result.style.display='block'; body.innerHTML=''; status.textContent='';

  const entries=Object.entries(_groups).sort((a,b)=>a[0].localeCompare(b[0],'ko'));
  const totalGroups=entries.length;
  const courts=_courtCount||1;

  // ── 그룹별 분석 ──
  let totalMatches=0;
  const groupStats=entries.map(([gname,members])=>{
    const n=members.length;
    const rounds=Math.ceil(Math.log2(n));
    const matches=n-1; // 토너먼트 총 경기수 = 참가자-1
    const hasBye=n&(n-1); // 2의 거듭제곱이 아니면 부전승 있음
    totalMatches+=matches;
    return {gname,n,rounds,matches,hasBye:!!hasBye};
  });

  // ── 레이아웃 추천 (A~E형 모두 고려) ──
  let layoutRec, layoutReason;
  if(courts===1){
    if(totalGroups<=4 && maxInGroup<=8){
      layoutRec='B형 (아래→위)'; layoutReason='소규모 단일 경기장은 아래→위 흐름이 시각적으로 깔끔합니다.';
    } else if(totalGroups<=4){
      layoutRec='C형 (위→아래)'; layoutReason='단일 경기장에서 인원이 많을 때 위→아래 흐름이 보기 편합니다.';
    } else {
      layoutRec='A형 (좌→우)'; layoutReason='그룹이 많은 단일 경기장은 좌→우 단방향이 진행 흐름 파악에 가장 유리합니다.';
    }
  } else if(courts===2){
    layoutRec='D형 (양방향→중앙)'; layoutReason='경기장 2개는 좌우로 나눠 진행하고 가운데서 결승하는 D형이 최적입니다.';
  } else if(courts>=3 && courts%2===0){
    layoutRec='D형 (양방향→중앙)'; layoutReason=`경기장 ${courts}개(짝수)는 좌우 균등 분배 D형을 권장합니다.`;
  } else {
    layoutRec='E형 (상하→중앙)'; layoutReason=`경기장 ${courts}개(홀수)는 위아래로 나눠 가운데 결승하는 E형을 권장합니다.`;
  }

  // ── 경기 배정 추천: 그룹을 경기장에 나눠 배치 ──
  // 인원 많은 그룹 → 여러 경기장에 분산, 적은 그룹 → 한 경기장에 집중
  const sortedBig=[...groupStats].sort((a,b)=>b.n-a.n);
  const courtAssign=Array.from({length:courts},(_,i)=>({court:i+1,groups:[],matches:0}));
  sortedBig.forEach(g=>{
    // 현재 경기 수가 가장 적은 경기장에 배정
    courtAssign.sort((a,b)=>a.matches-b.matches);
    courtAssign[0].groups.push(g.gname);
    courtAssign[0].matches+=g.matches;
  });
  courtAssign.sort((a,b)=>a.court-b.court);

  // ── 부전승 필요 그룹 ──
  const byeGroups=groupStats.filter(g=>g.hasBye);

  // ── HTML 결과 렌더링 ──
  let html='';

  // 요약 카드
  html+=`<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;">
    <div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:8px 14px;text-align:center;">
      <div style="font-size:20px;font-weight:700;color:var(--accent);">${allPts.length}<span style="font-size:11px;color:var(--text3);margin-left:2px;">명</span></div>
      <div style="font-size:10px;color:var(--text3);margin-top:2px;">전체 참가자</div>
    </div>
    <div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:8px 14px;text-align:center;">
      <div style="font-size:20px;font-weight:700;color:var(--accent);">${totalGroups}<span style="font-size:11px;color:var(--text3);margin-left:2px;">그룹</span></div>
      <div style="font-size:10px;color:var(--text3);margin-top:2px;">체급/부문 수</div>
    </div>
    <div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:8px 14px;text-align:center;">
      <div style="font-size:20px;font-weight:700;color:var(--yellow);">${totalMatches}<span style="font-size:11px;color:var(--text3);margin-left:2px;">경기</span></div>
      <div style="font-size:10px;color:var(--text3);margin-top:2px;">총 경기 수</div>
    </div>
  </div>`;

  // 레이아웃 추천
  const layoutCode=layoutRec.charAt(0); // 'A','D','E' 등 첫 글자
  html+=`<div style="margin-bottom:12px;padding:10px 14px;background:rgba(76,201,240,0.07);border:1px solid rgba(76,201,240,0.25);border-radius:8px;">
    <div style="font-size:10px;color:var(--accent);font-family:'Share Tech Mono',monospace;margin-bottom:5px;">// 레이아웃 추천</div>
    <span style="font-size:13px;font-weight:700;color:var(--text);">${layoutRec}</span>
    <span style="font-size:11px;color:var(--text3);margin-left:8px;">${layoutReason}</span>
  </div>`;

  // 경기장별 배정
  html+=`<div style="margin-bottom:12px;">
    <div style="font-size:10px;color:var(--accent);font-family:'Share Tech Mono',monospace;margin-bottom:7px;">// 경기장별 그룹 배정 추천</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;">`;
  courtAssign.forEach(c=>{
    html+=`<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:8px 12px;min-width:120px;">
      <div style="font-size:10px;font-weight:700;color:var(--red);margin-bottom:5px;">경기장 ${c.court} <span style="color:var(--text3);font-weight:400;">(${c.matches}경기)</span></div>
      ${c.groups.map(g=>`<div style="font-size:11px;color:var(--text2);padding:1px 0;">${g}</div>`).join('')}
    </div>`;
  });
  html+=`</div></div>`;

  // 부전승
  if(byeGroups.length){
    html+=`<div style="margin-bottom:12px;padding:10px 14px;background:rgba(255,214,10,0.07);border:1px solid rgba(255,214,10,0.3);border-radius:8px;">
      <div style="font-size:10px;color:var(--yellow);font-family:'Share Tech Mono',monospace;margin-bottom:5px;">// 부전승 필요 그룹</div>
      <div style="font-size:11px;color:var(--text2);">${byeGroups.map(g=>`<b>${g.gname}</b> (${g.n}명)`).join(' · ')}은 홀수 인원이므로 1라운드에서 부전승 1명을 지정해야 합니다.</div>
    </div>`;
  }

  // 그룹별 세부 라운드 수
  html+=`<div>
    <div style="font-size:10px;color:var(--accent);font-family:'Share Tech Mono',monospace;margin-bottom:7px;">// 그룹별 라운드 구성</div>
    <div style="display:flex;gap:5px;flex-wrap:wrap;">
    ${groupStats.map(g=>`<div style="background:var(--card);border:1px solid var(--border);border-radius:6px;padding:5px 10px;font-size:11px;">
      <span style="color:var(--text2);">${g.gname}</span>
      <span style="color:var(--text3);margin-left:6px;">${g.n}명 / ${g.rounds}라운드 / ${g.matches}경기</span>
    </div>`).join('')}
    </div>
  </div>`;

  status.textContent='분석 완료';
  status.style.color='var(--green)';

  // 추천 적용 버튼 (레이아웃 저장만, 대진표 생성은 사용자가 직접)
  html+=`<div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:flex-end;gap:10px;">
    <span style="font-size:11px;color:var(--text3);">추천 레이아웃 <b style="color:var(--text2);">${layoutRec}</b></span>
    <button onclick="applyAnalysisLayout('${layoutCode}')" style="padding:6px 16px;background:rgba(76,201,240,.15);border:1px solid var(--accent);color:var(--accent);border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;">✔ 추천 레이아웃 적용</button>
  </div>`;

  body.innerHTML=html;
  btn.disabled=false; btn.textContent='🔍 대진표 분석'; btn.style.opacity='1';
}

function applyAnalysisLayout(layoutCode){
  setLayoutAndHighlight(layoutCode);
  try{
    localStorage.setItem('sgp_courtCount', String(_courtCount||1));
    localStorage.setItem('sgp_layout', layoutCode);
  }catch(e){}
  const btn=document.getElementById('btn-generate');
  if(btn){
    btn.style.transition='all .2s';
    btn.style.boxShadow='0 0 0 3px rgba(230,57,70,.6), 0 0 20px rgba(230,57,70,.4)';
    btn.textContent='← 레이아웃 적용 완료! 대진표 만들기 →';
    btn.scrollIntoView({behavior:'smooth', block:'center'});
    setTimeout(()=>{
      btn.style.boxShadow='';
      btn.textContent='대진표 만들기 →';
    }, 4000);
  }
  toast('레이아웃 적용 완료! 위 버튼을 눌러 대진표를 만드세요.', 'success');
}


function setPtsMode(mode){
  _mode=mode;
  document.querySelectorAll('.pts-mode-btn').forEach(b=>{b.style.borderColor='var(--border)';b.style.background='transparent';b.style.color='var(--text3)';});
  const btn=document.getElementById('mode-'+mode);
  if(btn){
    btn.style.borderColor=mode==='tournament'?'var(--red)':'var(--accent)';
    btn.style.background=mode==='tournament'?'rgba(230,57,70,.15)':'rgba(76,201,240,.15)';
    btn.style.color=mode==='tournament'?'var(--red)':'var(--accent)';
  }
  const overlay=document.getElementById('league-overlay');
  if(overlay) overlay.style.display=mode==='league'?'flex':'none';
  const g=document.getElementById('btn-generate');
  if(g){g.style.opacity=mode==='tournament'?'1':'0.4'; g.disabled=mode!=='tournament';}
}

function renderOrderArea(){
  const area=document.getElementById('pts-order-area'); if(!area) return; area.innerHTML='';
  Object.entries(_groups).sort((a,b)=>a[0].localeCompare(b[0],'ko')).forEach(([gname,members])=>{
    const sec=document.createElement('div'); sec.style.marginBottom='20px';
    sec.innerHTML=`<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--border);">
      <span style="font-size:12px;font-weight:700;">${gname}</span>
      <span style="font-size:10px;color:var(--text3);background:var(--card2);padding:1px 8px;border-radius:10px;">${members.length}명</span>
      <span style="font-size:10px;color:var(--text3);margin-left:4px;">이름 클릭→번호지정 · 드래그→순서변경</span></div>`;
    const grid=document.createElement('div'); grid.dataset.group=gname;
    members.forEach((p,i)=>grid.appendChild(buildOrderRow(p,i,gname,members)));
    initDragSort(grid,gname); sec.appendChild(grid); area.appendChild(sec);
  });
}

function buildOrderRow(p,i,gname,members){
  const row=document.createElement('div'); row.className='order-row'; row.draggable=true; row.dataset.pid=p.id;
  row.innerHTML=`<span class="onum" style="font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--red);width:20px;font-weight:700;flex-shrink:0;">${i+1}</span>
    <div style="width:6px;height:6px;border-radius:50%;background:${p.color||'var(--text3)'};flex-shrink:0;"></div>
    <span style="flex:1;font-size:13px;font-weight:600;">${p.name}</span>
    ${p.weight||p.division?`<span style="font-size:10px;color:var(--text3);">${[p.division,p.weight].filter(Boolean).join(' / ')}</span>`:''}
    <span style="font-size:10px;color:var(--text3);opacity:.5;">≡</span>`;
  row.onclick=e=>{
    if(e.target.tagName==='INPUT') return;
    const cur=parseInt(row.querySelector('.onum').textContent);
    const inp=document.createElement('input');
    inp.type='number'; inp.min=1; inp.max=members.length; inp.value=cur;
    inp.style.cssText='width:40px;font-size:12px;background:var(--bg);border:1px solid var(--accent);border-radius:4px;color:var(--text);text-align:center;padding:2px;';
    row.querySelector('.onum').replaceWith(inp); inp.focus(); inp.select();
    const apply=()=>{
      const nv=Math.max(1,Math.min(members.length,parseInt(inp.value)||cur));
      const g=_groups[gname]; const fi=g.findIndex(x=>x.id===p.id);
      g.splice(nv-1,0,g.splice(fi,1)[0]); renderOrderArea();
    };
    inp.onblur=apply;
    inp.onkeydown=e2=>{if(e2.key==='Enter')apply();if(e2.key==='Escape')renderOrderArea();};
    e.stopPropagation();
  };
  return row;
}

function initDragSort(grid,gname){
  let dragEl=null;
  grid.addEventListener('dragstart',e=>{dragEl=e.target.closest('[data-pid]');if(dragEl)setTimeout(()=>dragEl.style.opacity='.4',0);});
  grid.addEventListener('dragend',()=>{if(dragEl){dragEl.style.opacity='1';dragEl=null;}});
  grid.addEventListener('dragover',e=>{
    e.preventDefault();
    const over=e.target.closest('[data-pid]'); if(!over||over===dragEl) return;
    const rows=[...grid.querySelectorAll('[data-pid]')];
    const fi=rows.indexOf(dragEl),ti=rows.indexOf(over); if(fi<0||ti<0) return;
    const g=_groups[gname]; g.splice(ti,0,g.splice(fi,1)[0]);
    g.forEach((p,idx)=>{const r=grid.querySelector(`[data-pid="${p.id}"]`);if(r){r.querySelector('.onum').textContent=idx+1;grid.appendChild(r);}});
  });
}

function shuffleAllGroups(){
  Object.keys(_groups).forEach(k=>{_groups[k]=[..._groups[k]].sort(()=>Math.random()-.5);});
  renderOrderArea(); toast('무작위로 섞었어요','success');
}
