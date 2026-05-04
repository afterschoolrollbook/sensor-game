// ══ STEP 3: 참가자 등록 ══
/* ── STEP3 요약 ── */

function buildStepSummary(step){
  const g=ALLG.find(x=>x.id===S.selG);
  const rm=REGMODES.find(x=>x.id===S.rm);
  const allItems=[
    {k:'행사명', v:S.en, icon:'📋'},
    {k:'종목',   v:S.gl||(g?g.name:''), icon:'🏅'},
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
      const nameIdx=headers.findIndex(h=>['이름','name'].includes(h));
      const teamIdx=headers.findIndex(h=>['팀명','팀','team'].includes(h));
      const weightIdx=headers.findIndex(h=>['체급','weight','class'].includes(h));
      const divIdx=headers.findIndex(h=>['부문','division','부서','category'].includes(h));
      const seqIdx=headers.findIndex(h=>['순번','번호','no','seq','#'].includes(h));
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
          color:TC[S.pts.length%TC.length]
        });
        added++;
      });
      renderPL();
      // 스텝3에서는 전광판 미리보기 업데이트 안함 (스텝4 이후에만)
      if(typeof cs!=='undefined'&&cs>=4)updatePv();
      try{App.setState({participants:S.pts});}catch(e2){}
      toast(added+'명 불러오기 완료! ('+added+'명)','success');
    };
    if(file.name.endsWith('.csv')) reader.readAsText(file,'UTF-8');
    else reader.readAsArrayBuffer(file);
  };
  input.click();
}

/* ── MODE GRID ── */
function buildMG(){
  buildS3Summary();buildS3Sample();
  const w=document.getElementById('mgrid');w.innerHTML='';
  REGMODES.forEach(m=>{
    const d=document.createElement('div');
    d.className='mc'+(S.rm===m.id?' sel':'');
    d.innerHTML=`<div class="mc-icon">${m.icon}</div><div class="mc-name">${m.name}</div><div class="mc-sub">${m.sub}</div>`;
    d.onclick=()=>{S.rm=m.id;buildMG();renderPA();};
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
        <button class="badd" onclick="addPt()">+ 추가</button>
      </div>
      <div class="plist" id="plist"></div>
      <button class="bxls" onclick="impXlsNew()">📂 CSV/엑셀에서 불러오기</button>
    </div>`;
  renderPL();
}
function renderPL(){
  const l=document.getElementById('plist');if(!l)return;l.innerHTML='';
  S.pts.forEach((p,i)=>{
    const d=document.createElement('div');d.className='ptag';
    const tags=[p.division,p.weight,p.team].filter(Boolean).map(t=>`<span style="font-size:10px;color:var(--text3);background:var(--card2);padding:1px 6px;border-radius:8px;margin-left:4px;">${t}</span>`).join('');
    d.innerHTML=`<div class="pt-clr" style="background:${p.color||TC[i%TC.length]}"></div><div class="pt-nm">${p.name}${tags}</div><div class="pt-x" onclick="delPt('${p.id}')">×</div>`;
    l.appendChild(d);
  });
}
function addPt(){
  const inp=document.getElementById('pti');if(!inp)return;
  const nm=inp.value.trim();if(!nm){toast('이름을 입력해주세요.','error');return;}
  S.pts.push({id:'p_'+Date.now()+'_'+Math.random().toString(36).slice(2,5),name:nm,color:TC[S.pts.length%TC.length]});
  inp.value='';inp.focus();renderPL();
  if(typeof cs!=='undefined'&&cs>=4)updatePv();
  try{App.setState({participants:S.pts});}catch(e){}
}
function delPt(id){S.pts=S.pts.filter(p=>p.id!==id);renderPL();if(typeof cs!=='undefined'&&cs>=4)updatePv();try{App.setState({participants:S.pts});}catch(e){}}
function impXls(){
  try{if(typeof ExcelIO!=='undefined'&&ExcelIO.importExcel){ExcelIO.importExcel(rows=>{rows.forEach((r,i)=>{if(r.name)S.pts.push({id:'p_'+Date.now()+'_'+i,name:r.name,color:TC[S.pts.length%TC.length]});});renderPL();updatePv();try{App.setState({participants:S.pts});}catch(e){}});}else toast('엑셀 기능 준비 중','info');}
  catch(e){toast('엑셀 오류','error');}
}

