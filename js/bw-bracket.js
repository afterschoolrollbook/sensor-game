
function generateBracketWithNames(pts, courtNum, startNum){
  const cNum=courtNum||1;
  const players=[...pts];
  const n=players.length;
  if(!n)return[[]];
  const round1=[];
  const isOdd=n%2===1;
  let slotNum=startNum||1;
  if(isOdd){
    round1.push({p1:{name:`${cNum}-${slotNum++}`,id:slotNum-1},p2:null,bye:true});
  }
  const rest=isOdd?players.slice(1):players;
  for(let i=0;i<rest.length;i+=2){
    round1.push({
      p1:{name:`${cNum}-${slotNum++}`,id:slotNum-1},
      p2:{name:`${cNum}-${slotNum++}`,id:slotNum-1},
      bye:false
    });
  }
  return[round1];
}

function generateAllBrackets(){
  // 경기장 수에 따라 레이아웃 자동 설정
  const courts=_courtCount||1;
  _bracketLayout = courts >= 2 ? 'D' : 'A';

  const entries=Object.entries(_groups).sort((a,b)=>a[0].localeCompare(b[0],'ko'));

  // 경기장별 그룹 배정 (분석과 동일 로직 — 경기 수 균등 분배)
  const courtSlots=Array.from({length:courts},(_,i)=>({court:i+1,groups:[],matchCount:0}));
  [...entries].sort((a,b)=>b[1].length-a[1].length).forEach(([gname,members])=>{
    courtSlots.sort((a,b)=>a.matchCount-b.matchCount);
    courtSlots[0].groups.push(gname);
    courtSlots[0].matchCount+=members.length-1;
  });
  courtSlots.sort((a,b)=>a.court-b.court);

  // groupBrackets 생성 — 경기장별 통합 순번 (체급 상관없이 이어서)
  const courtForGroup=(gname)=>courtSlots.findIndex(c=>c.groups.includes(gname))+1;
  // 경기장별 시작 번호 사전 계산 — courtSlots.groups 순서 기준 (화면 표시 순서와 동일)
  const _courtCounters={};
  const _groupStartNums={};
  courtSlots.forEach(slot=>{
    const c=slot.court;
    if(!_courtCounters[c]) _courtCounters[c]=1;
    slot.groups.forEach(gname=>{
      const members=_groups[gname]||[];
      _groupStartNums[gname]=_courtCounters[c];
      _courtCounters[c]+=members.length;
    });
  });
  // courtSlots.groups 순서대로 groupBrackets 생성 → 화면 표시 순서와 startNum 순서 일치
  const _groupsOrdered=[];
  courtSlots.forEach(slot=>{
    slot.groups.forEach(gname=>{
      const members=_groups[gname]||[];
      _groupsOrdered.push([gname,members]);
    });
  });
  S.groupBrackets=_groupsOrdered.map(([gname,members])=>{
    const c=courtForGroup(gname);
    const sn=_groupStartNums[gname];
    return {
      label:gname,
      matches:generateBracketWithNames([...members], c, sn),
      slots:members.map((p,i)=>({num:sn+i,player:p})),
      court:c,
      _startNum:sn
    };
  });

  S.activeGroup=0; _assignMode=false; _linkSel=null;
  try{
    localStorage.setItem('sgp_step','3');
    localStorage.setItem('sgp_courtCount', String(_courtCount||1));
    localStorage.setItem('sgp_layout', _bracketLayout||'A');
    localStorage.setItem('sgp_groupBrackets', JSON.stringify(S.groupBrackets));
  }catch(e){}
  // 대진표 새로 만들기 시 중간저장 캐시 삭제 → 새로 생성된 데이터 그대로 사용
  try{
    localStorage.removeItem('sgp_bracket_temp');
    localStorage.removeItem('sgp_groupBrackets');
  } catch(e){}

  show('pts-step3');
  renderBracketTabs();
  _redrawBracketView();
}

// 경기장+라운드 내 연속 경기번호 오프셋 계산
// 같은 경기장의 같은 라운드 내에서 그룹 순서대로 번호를 이어줌
// g._roundOffset[ri] = 이 그룹 이전에 같은 경기장+라운드에 몇 경기가 있었는지
function _computeSeqOffsets(){
  const courtRound={}; // {court: {ri: count}}
  (S.groupBrackets||[]).forEach(g=>{
    const c=g.court||1;
    if(!courtRound[c]) courtRound[c]={};
    g._roundOffset={};
    (g.matches||[]).forEach((round,ri)=>{
      if(!courtRound[c][ri]) courtRound[c][ri]=0;
      g._roundOffset[ri]=courtRound[c][ri];
      courtRound[c][ri]+=round.length;
    });
  });
}

function _redrawBracketView(){
  _linkSel=null;
  _computeSeqOffsets();
  const courts=_courtCount||1;
  const view=document.getElementById('pts-bracket-view');
  if(!view||!S.groupBrackets?.length) return;
  // 스크롤 위치 저장 (내부 스크롤 컨테이너)
  const prevScrollEl=view.querySelector('[style*="overflow"]');
  const savedScrollTop=prevScrollEl?prevScrollEl.scrollTop:0;
  const savedScrollLeft=prevScrollEl?prevScrollEl.scrollLeft:0;
  view.innerHTML='';

  const noByeMatches=matches=>(matches||[]).filter(m=>!m.bye);
  const saved=S.matches;

  // view 스타일 초기화
  view.style.overflow='';
  view.style.padding='';
  view.style.display='flex';
  view.style.flexDirection='column';

  if(_bracketLayout==='E' && courts>=2){
    view.style.overflow='auto';
    view.style.padding='12px';

    const outerWrap=document.createElement('div');
    outerWrap.style.cssText='display:flex;flex-direction:column;gap:0;min-width:100%;';

    const tGroups=(S.groupBrackets||[]).filter(g=>g.court===1);
    const bGroups=(S.groupBrackets||[]).filter(g=>g.court===2);

    const mkLabel=(txt)=>{
      const d=document.createElement('div');
      d.style.cssText='font-size:10px;color:var(--accent);font-family:"Share Tech Mono",monospace;letter-spacing:2px;margin-bottom:6px;';
      d.textContent=txt;
      return d;
    };

    const mkSection=(g, direction)=>{
      const labelParts=g.label.split('/').map(s=>s.trim());
      const shortLabel=labelParts.map((p,pi)=>pi===0?p:p.replace('부','')).join('·');
      const sec=document.createElement('div');
      sec.style.cssText='display:inline-flex;flex-direction:column;flex-shrink:0;min-width:max-content;margin-bottom:16px;margin-right:24px;';
      const hdr=document.createElement('div');
      hdr.style.cssText='font-size:9px;color:#555;font-family:"Share Tech Mono",monospace;letter-spacing:1px;margin-bottom:4px;margin-top:8px;flex-shrink:0;white-space:nowrap;';
      hdr.textContent=shortLabel;
      sec.appendChild(hdr);
      const groupWrap=document.createElement('div');
      groupWrap.style.cssText='min-width:max-content;';
      const taggedMatches=g.matches.map((round,ri)=>
        round.map((m,mi)=>({...m,_groupObj:g,_origMi:mi,_origRi:ri,_groupLabel:shortLabel,_seqMi:(g._roundOffset&&g._roundOffset[ri]!=null?g._roundOffset[ri]:0)+mi}))
      );
      S.matches=taggedMatches;
      _renderBracketHTML(groupWrap, taggedMatches, direction, false);
      _stripInnerScroll(groupWrap);
      sec.appendChild(groupWrap);
      return sec;
    };

    // ── 경기장 1 (위) ──
    outerWrap.appendChild(mkLabel('// 경기장 1'));
    const topSec=document.createElement('div');
    topSec.style.cssText='display:flex;flex-wrap:wrap;align-items:flex-start;';
    tGroups.forEach(g=>topSec.appendChild(mkSection(g,'top')));
    outerWrap.appendChild(topSec);

    // ── 구분선 ──
    const divider=document.createElement('div');
    divider.style.cssText='border-top:2px dashed var(--border2);margin:16px 0;';
    outerWrap.appendChild(divider);

    // ── 경기장 2 (아래) ──
    if(bGroups.length){
      outerWrap.appendChild(mkLabel('// 경기장 2'));
      const botSec=document.createElement('div');
      botSec.style.cssText='display:flex;flex-wrap:wrap;align-items:flex-start;';
      bGroups.forEach(g=>botSec.appendChild(mkSection(g,'bottom')));
      outerWrap.appendChild(botSec);
    }

    view.appendChild(outerWrap);
  } else if(_bracketLayout==='D' && courts>=2){
    view.style.overflow='auto';
    view.style.padding='12px';

    const outerWrap=document.createElement('div');
    outerWrap.style.cssText='display:flex;flex-direction:column;gap:0;min-width:100%;';

    // ── 행(row) 단위 렌더링 ──
    // 경기장1 그룹 / 경기장2 그룹을 각각 순서대로 가져와서
    // 한 번에 하나씩 "행"으로 묶어 렌더링.
    // 한 행 = [왼쪽 섹션 | 가운데 spacer | 오른쪽 섹션]
    // → 행의 height가 CSS align-items:stretch 로 자동으로 같아짐.
    // 한쪽이 체급이 더 많으면 나머지는 빈 셀로 처리.

    const lGroups=(S.groupBrackets||[]).filter(g=>g.court===1);
    const rGroups=(S.groupBrackets||[]).filter(g=>g.court===2);
    const rowCount=Math.max(lGroups.length, rGroups.length);

    // 헤더 행 (경기장1 / 경기장2 레이블)
    const hdrRow=document.createElement('div');
    hdrRow.style.cssText='display:flex;flex-direction:row;gap:0;margin-bottom:6px;';
    const mkLabel=(txt,align='left')=>{
      const d=document.createElement('div');
      d.style.cssText=`font-size:10px;color:var(--accent);font-family:"Share Tech Mono",monospace;letter-spacing:2px;text-align:${align};`;
      d.textContent=txt;
      return d;
    };
    const hdrL=document.createElement('div');
    hdrL.style.cssText='padding-right:24px;flex-shrink:0;';
    hdrL.appendChild(mkLabel('// 경기장 1','left'));
    const hdrSp=document.createElement('div');
    hdrSp.style.cssText='flex:1;min-width:40px;';
    const hdrR=document.createElement('div');
    hdrR.style.cssText='padding-left:24px;flex-shrink:0;display:flex;justify-content:flex-end;';
    /* 경기장 2에 배정된 그룹이 있을 때만 헤더 표시 */
    if(rGroups.length) hdrR.appendChild(mkLabel('// 경기장 2','right'));
    hdrRow.appendChild(hdrL); hdrRow.appendChild(hdrSp); hdrRow.appendChild(hdrR);
    outerWrap.appendChild(hdrRow);

    const mkSection=(g, reversed)=>{
      const labelParts=g.label.split('/').map(s=>s.trim());
      const shortLabel=labelParts.map((p,pi)=>pi===0?p:p.replace('부','')).join('·');
      const sec=document.createElement('div');
      sec.style.cssText='display:flex;flex-direction:column;flex-shrink:0;min-width:max-content;';
      const hdr=document.createElement('div');
      hdr.style.cssText='font-size:9px;color:#555;font-family:"Share Tech Mono",monospace;letter-spacing:1px;margin-bottom:4px;margin-top:8px;flex-shrink:0;white-space:nowrap;';
      hdr.textContent=shortLabel;
      sec.appendChild(hdr);
      const groupWrap=document.createElement('div');
      groupWrap.style.cssText='min-width:max-content;';
      const taggedMatches=g.matches.map((round,ri)=>
        round.map((m,mi)=>({...m,_groupObj:g,_origMi:mi,_origRi:ri,_groupLabel:shortLabel,_seqMi:(g._roundOffset&&g._roundOffset[ri]!=null?g._roundOffset[ri]:0)+mi}))
      );
      S.matches=taggedMatches;
      _renderBracketHTML(groupWrap, taggedMatches, 'top', reversed);
      _stripInnerScroll(groupWrap);
      sec.appendChild(groupWrap);
      return sec;
    };

    for(let i=0;i<rowCount;i++){
      const row=document.createElement('div');
      // stretch: 왼쪽/오른쪽 셀이 같은 height로 늘어남
      row.style.cssText='display:flex;flex-direction:row;align-items:stretch;gap:0;margin-bottom:20px;';

      // 왼쪽 셀
      const cellL=document.createElement('div');
      cellL.style.cssText='padding-right:24px;flex-shrink:0;min-width:max-content;';
      if(lGroups[i]) cellL.appendChild(mkSection(lGroups[i], false));
      row.appendChild(cellL);

      // 가운데 spacer
      const sp=document.createElement('div');
      sp.style.cssText='flex:1;min-width:40px;';
      row.appendChild(sp);

      // 오른쪽 셀
      const cellR=document.createElement('div');
      cellR.style.cssText='padding-left:24px;flex-shrink:0;min-width:max-content;display:flex;flex-direction:column;align-items:flex-end;';
      if(rGroups[i]) cellR.appendChild(mkSection(rGroups[i], true));
      row.appendChild(cellR);

      outerWrap.appendChild(row);
    }

    view.appendChild(outerWrap);
  } else {
    // A/B/C/E형 — 그룹별로 태깅해서 렌더링 (D형과 동일하게 _groupObj/_origRi/_origMi 보존)
    view.style.overflow='auto';
    const outerWrap=document.createElement('div');
    outerWrap.style.cssText='padding:8px;min-width:max-content;';

    S.groupBrackets.forEach(g=>{
      const labelParts=g.label.split('/').map(s=>s.trim());
      const shortLabel=labelParts.map((p,pi)=>pi===0?p:p.replace('부','')).join('·');

      const hdr=document.createElement('div');
      hdr.style.cssText='font-size:9px;color:#555;font-family:"Share Tech Mono",monospace;letter-spacing:1px;margin-bottom:4px;margin-top:8px;';
      hdr.textContent=shortLabel;
      outerWrap.appendChild(hdr);

      const groupWrap=document.createElement('div');
      groupWrap.style.cssText='margin-bottom:16px;position:relative;';

      const taggedMatches=g.matches.map((round,ri)=>
        round.map((m,mi)=>({...m,_groupObj:g,_origMi:mi,_origRi:ri,_groupLabel:shortLabel,_seqMi:(g._roundOffset&&g._roundOffset[ri]!=null?g._roundOffset[ri]:0)+mi}))
      );

      S.matches=taggedMatches;
      const fns={A:renderBracketA,B:renderBracketB,C:renderBracketC,E:renderBracketE};
      const fn=fns[_bracketLayout]||renderBracketA;
      fn(groupWrap);
      _stripInnerScroll(groupWrap);
      outerWrap.appendChild(groupWrap);
    });

    view.appendChild(outerWrap);
  }
  S.matches=saved;
  // 탭 체크 상태 갱신
  renderBracketTabs();
  // 스크롤 위치 복원 (새로 생성된 내부 스크롤 컨테이너에 적용)
  if(savedScrollTop||savedScrollLeft){
    requestAnimationFrame(()=>{
      const newScrollEl=view.querySelector('[style*="overflow"]');
      if(newScrollEl){
        newScrollEl.scrollTop=savedScrollTop;
        newScrollEl.scrollLeft=savedScrollLeft;
      }
    });
  }
}

// 부전승 배정 선택 팝업
// 특정 라운드에서 아직 연결되지 않은 경기 목록 반환
function _getUnlinkedMatches(g, ri){
  const curRound=g.matches[ri];
  const nextRound=g.matches[ri+1]||[];
  return curRound.map((m,mi)=>{
    const key=`${ri}-${mi}`;
    const linked=nextRound.find(nm=>nm.fromA===key||nm.fromB===key);
    return linked?null:{ri,mi,m};
  }).filter(Boolean);
}

// 수동 연결 후 홀수 체크 → 모든 경기 연결 완료 + 다음 라운드 진출자 홀수면 바로 팝업
function _checkAndHandleOddAfterLink(g, ri){
  const curRound=g.matches[ri];
  const nextRound=g.matches[ri+1]||[];

  // 현재 라운드 전체 경기 수 (BYE 포함)
  const totalMatches=curRound.length;

  // 다음 라운드에 연결된 경기 수
  const linkedCount=nextRound.length;

  // 진출자 수 = 현재 라운드 경기 수 (각 경기에서 1명 진출)
  const advancers=totalMatches;

  // 아직 다 연결 안 됐으면 패스
  // 짝수면 BYE 필요 없으니 패스
  // 이미 BYE가 배정돼 있으면 패스
  const alreadyHasBye=nextRound.some(m=>m.bye);
  if(alreadyHasBye) return;
  if(advancers%2===0) return;

  // 홀수 진출자 확정: 다음 라운드에서 짝 못 맞추는 1명이 생김
  // → 현재까지 연결된 경기 + 아직 미연결 경기 합쳐서 전체 진출자 목록으로 팝업
  const allCandidates=curRound.map((m,mi)=>({
    id:`bye_${ri}_${mi}`,
    name:`${g.court||1}-${ri+1}-${((g._roundOffset&&g._roundOffset[ri]!=null)?g._roundOffset[ri]:0)+mi+1} 승자`,
    color:'var(--accent)',
    _ri:ri, _mi:mi
  }));

  showByeSelector(
    allCandidates,
    `${ri+1}라운드 진출자 ${advancers}명 — 부전승 배정`,
    (sel)=>{
      if(!g.matches[ri+1]) g.matches.push([]);
      const key=`${sel._ri}-${sel._mi}`;
      if(g.matches[ri+1].find(nm=>nm.fromA===key||nm.fromB===key)){
        toast('이미 연결된 경기입니다','error');
        _redrawBracketView(); return;
      }
      g.matches[ri+1].push({p1:{name:sel.name,tbd:true},p2:null,fromA:key,fromB:null,bye:true});
      _redrawBracketView();
      toast(sel.name+' 부전승 배정!','success');
    },
    ()=>{
      // 랜덤: 전체 진출자 중 랜덤
      const pick=allCandidates[Math.floor(Math.random()*allCandidates.length)];
      if(!g.matches[ri+1]) g.matches.push([]);
      const key=`${pick._ri}-${pick._mi}`;
      if(g.matches[ri+1].find(nm=>nm.fromA===key||nm.fromB===key)){
        _redrawBracketView(); return;
      }
      g.matches[ri+1].push({p1:{name:pick.name,tbd:true},p2:null,fromA:key,fromB:null,bye:true});
      _redrawBracketView();
      showByeResult(pick.name);
    }
  );
}

function renderBracketTabs(){
  const tabs=document.getElementById('pts-bracket-tabs');
  const groups=S.groupBrackets||[];
  tabs.innerHTML='';
  if(groups.length<1){tabs.style.display='none';return;}
  tabs.style.display='block';

  // 경기장별로 그룹 분류
  const courts={};
  groups.forEach((g,i)=>{
    const c=g.court||1;
    if(!courts[c]) courts[c]=[];
    courts[c].push({g,i});
  });

  const courtNums=Object.keys(courts).map(Number).sort((a,b)=>a-b);

  // 좌우 분리 컨테이너
  const row=document.createElement('div');
  row.style.cssText='display:flex;gap:0;width:100%;';

  courtNums.forEach((courtNum, ci)=>{
    const col=document.createElement('div');
    col.style.cssText=`flex:1;padding:8px 14px;${ci>0?'border-left:1px solid var(--border)':''}`;

    // 경기장 헤더
    const hdr=document.createElement('div');
    hdr.style.cssText='font-size:9px;color:var(--accent);font-family:"Share Tech Mono",monospace;letter-spacing:2px;margin-bottom:6px;';
    hdr.textContent=`// 경기장 ${courtNum}`;
    col.appendChild(hdr);

    // 그룹 목록
    const list=document.createElement('div');
    list.style.cssText='display:flex;flex-wrap:wrap;gap:4px;';

    courts[courtNum].forEach(({g,i})=>{
      // 현재 그려진 non-bye 경기 박스 수
      // 총 목표 박스 수 계산 (BYE 포함, 참가자 수 기준)
      const calcTotalBoxes=(n)=>{ let t=0,c=n; while(c>1){t+=Math.ceil(c/2);c=Math.ceil(c/2);} return t; };
      const totalBoxes=calcTotalBoxes(g.slots.length);
      // 현재 그려진 박스 수 (BYE 포함)
      const drawnBoxes=g.matches.reduce((acc,round)=>acc+round.length, 0);
      const allDone=drawnBoxes>=totalBoxes;

      const checkboxes=Array.from({length:totalBoxes},(_,ci)=>
        `<span style="font-size:11px;color:${ci<drawnBoxes?'var(--green)':'var(--border2)'};">${ci<drawnBoxes?'☑':'☐'}</span>`
      ).join('');

      const btn=document.createElement('button');
      const active=i===S.activeGroup;

      const labelParts=g.label.split('/').map(s=>s.trim());
      const shortLabel=labelParts.map((p,pi)=>pi===0?p:p.replace('부','')).join('·');

      btn.style.cssText=`
        display:inline-flex;align-items:center;gap:5px;
        padding:3px 8px;border-radius:5px;
        border:1px solid ${allDone?'var(--green)':active?'var(--red)':'var(--border)'};
        background:${allDone?'rgba(6,214,160,.1)':active?'rgba(230,57,70,.15)':'transparent'};
        color:${allDone?'var(--green)':active?'var(--red)':'var(--text3)'};
        font-size:10px;cursor:pointer;font-weight:${active?'700':'400'};
        white-space:nowrap;
      `;

      btn.innerHTML=`
        <span style="font-size:10px;">${shortLabel}</span>
        <span style="font-size:9px;color:var(--text3);">(${g.slots.length}명)</span>
        <span style="display:inline-flex;gap:1px;align-items:center;">${checkboxes}</span>
      `;
      btn.onclick=()=>{ S.activeGroup=i; renderBracketTabs(); _redrawBracketView(); };
      list.appendChild(btn);
    });

    col.appendChild(list);
    row.appendChild(col);
  });

  tabs.appendChild(row);
}

function saveBracketTemp(){
  try{
    // _groupObj는 순환참조라 저장 전 제거
    const clean=S.groupBrackets.map(g=>({
      ...g,
      matches:g.matches.map(round=>round.map(m=>{
        const {_groupObj,...rest}=m; return rest;
      }))
    }));
    const saveData={groupBrackets:clean,savedAt:new Date().toLocaleTimeString()};
    localStorage.setItem('sgp_bracket_temp', JSON.stringify(saveData));
    // sgp_groupBrackets도 동시에 갱신 — 새로 불러올 때 연결 정보 유지
    localStorage.setItem('sgp_groupBrackets', JSON.stringify(clean));
    // step3 유지 — 중간저장 후 창 재오픈 시 step4로 가지 않도록
    localStorage.setItem('sgp_step','3');
    toast('중간저장 완료!','success');
  } catch(e){ console.error(e); toast('저장 실패: '+e.message,'error'); }
}

function loadBracketTemp(){
  try{
    const d=JSON.parse(localStorage.getItem('sgp_bracket_temp'));
    if(d&&d.groupBrackets){
      S.groupBrackets=d.groupBrackets;
      _migrateSlotNumbers(); // 구 형식("N번") 자동 변환 + _startNum 항상 계산
      _redrawBracketView(); renderBracketTabs();
      toast(`불러오기 완료 (${d.savedAt})`,'success');
    }
  } catch(e){ toast('불러오기 실패','error'); }
}

function renderBracketView(groupIdx){
  _redrawBracketView();
}

function selectSlot(num){ _assignSlotNum=(_assignSlotNum===num)?null:num; _redrawBracketView(); }

function assignPlayerToSlot(targetNum,fromIdx){
  const g=S.groupBrackets[S.activeGroup];
  const ti=g.slots.findIndex(s=>s.num===targetNum); if(ti<0) return;
  const tmp=g.slots[ti].player; g.slots[ti].player=g.slots[fromIdx].player; g.slots[fromIdx].player=tmp;
  g.matches=generateBracketWithNames(g.slots.map(s=>s.player), g.court||1, g._startNum||1);
  _assignSlotNum=null; _redrawBracketView(); toast('슬롯 배정 완료!','success');
}

function shuffleGroupBracket(){
  const g=S.groupBrackets[S.activeGroup];
  // 이름 배정 여부 확인 (괄호 있으면 명단 설정된 상태)
  const hasNames=g.matches[0]&&g.matches[0].some(m=>{
    const n1=(m.p1&&m.p1.name)||''; const n2=(m.p2&&m.p2.name)||'';
    return /\(.+\)/.test(n1)||/\(.+\)/.test(n2);
  });
  // 슬롯 순서 섞기
  const _sn=g._startNum||1;
  g.slots=[...g.slots].sort(()=>Math.random()-.5).map((s,i)=>({...s,num:_sn+i}));
  if(hasNames){
    // 이름이 있으면 이름도 함께 섞어서 재배정
    g.matches=_generateBracketKeepNames(g.slots.map(s=>s.player), g.court||1, g._startNum||1);
  } else {
    g.matches=generateBracketWithNames(g.slots.map(s=>s.player), g.court||1, g._startNum||1);
  }
  _redrawBracketView(); toast(g.label+' 무작위로 섞었어요','success');
}

function toggleAssignMode(){
  _assignMode=!_assignMode; _linkSel=null;
  const btn=document.getElementById('btn-assign');
  btn.style.borderColor=_assignMode?'var(--accent)':'var(--border)';
  btn.style.background=_assignMode?'rgba(76,201,240,.15)':'transparent';
  btn.style.color=_assignMode?'var(--accent)':'var(--text3)';
  btn.textContent=_assignMode?'✏️ 지정중... (취소)':'✏️ 지정';
  _redrawBracketView();
}

function setBracketLayout(mode){
  if((_courtCount||1) >= 2 && ['A','B','C'].includes(mode)){
    toast('경기장 2개 이상에서는 단방향 레이아웃(A·B·C)을 사용할 수 없습니다. D 또는 E를 선택하세요.','error');
    return;
  }
  if(_bracketLayout === mode) return;
  _bracketLayout=mode;
  ['A','B','C','D','E'].forEach(l=>{
    const btn=document.getElementById('popup-lay-'+l); if(!btn) return;
    const multiCourt=(_courtCount||1)>=2, disabled=multiCourt&&['A','B','C'].includes(l);
    if(disabled){ btn.style.borderColor='var(--border)';btn.style.background='transparent';btn.style.color='var(--text3)';btn.style.opacity='.3';btn.style.cursor='not-allowed'; }
    else { btn.style.opacity='1';btn.style.cursor='pointer';btn.style.borderColor=l===mode?'var(--red)':'var(--border2)';btn.style.background=l===mode?'rgba(230,57,70,.2)':'transparent';btn.style.color=l===mode?'var(--red)':'var(--text2)'; }
  });
  _redrawBracketView();
}

function addRound(){ toast('경기 박스를 클릭해서 연결하세요','info'); }

function removeLastRound(){
  const g=S.groupBrackets[S.activeGroup];
  if(!g||g.matches.length<=1){toast('1라운드는 삭제할 수 없어요','info');return;}
  g.matches.pop(); _redrawBracketView(); toast('마지막 라운드 삭제됨','success');
}
function applyBracket(){
  const g=S.groupBrackets[S.activeGroup];
  // 부모창에 postMessage 전송 (기존 동작 유지)
  if(window.opener){
    window.opener.postMessage({
      type:'sgp_apply_bracket',
      matches:g.matches, label:g.label,
      matchPts:g.slots.map(s=>s.player?.id).filter(Boolean).join(','),
      groupBrackets:S.groupBrackets, activeGroup:S.activeGroup
    },'*');
  }
  // localStorage에 step4 저장 — 새로고침해도 이어서 진행
  try{
    const cleanGB=S.groupBrackets.map(g=>({
      ...g,
      matches:g.matches.map(round=>round.map(m=>{const {_groupObj,...rest}=m;return rest;}))
    }));
    localStorage.setItem('sgp_step','4');
    localStorage.setItem('sgp_groupBrackets', JSON.stringify(cleanGB));
    localStorage.setItem('sgp_courtCount', String(_courtCount||1));
    localStorage.setItem('sgp_layout', _bracketLayout||'A');
  }catch(e){}
  toast(g.label+' 대진표 적용 완료!','success');
  setTimeout(()=>goStep4(), 400);
}

function goStep4(){
  show('pts-step4');
  _renderPdfCheckboxes();
  // 전체 선택 자동 적용
  requestAnimationFrame(()=>{
    document.querySelectorAll('.pdf-chk').forEach(b=>{ b.dataset.checked='1'; });
    _syncCheckStyles();
    _renderPdfPreview(_getSelectedGroups());
  });
}

/* ── 완성 버튼 — 전광판에서 불러올 수 있도록 전체 데이터 저장 ── */
function finalizeBracket(){
  try{
    // 1) groupBrackets 정제 (순환참조 제거)
    const clean=S.groupBrackets.map(g=>({
      ...g,
      matches:g.matches.map(round=>round.map(m=>{
        const {_groupObj,...rest}=m; return rest;
      }))
    }));

    // 2) display config (행사명·일시·장소 등)
    const dispCfg=(()=>{ try{ return JSON.parse(localStorage.getItem('sgp_display_config')||'{}'); }catch(e){ return {}; } })();

    // 3) 완성 데이터 패키지
    const finalData={
      version:2,
      finalizedAt: new Date().toISOString(),
      groupBrackets: clean,
      courtCount: _courtCount||1,
      layout: _bracketLayout||'A',
      settings: S.settings||{},
      displayConfig: dispCfg,
      totalGroups: clean.length,
      totalParticipants: clean.reduce((sum,g)=>sum+(g.slots?g.slots.length:0),0),
    };

    // 4) 전광판용 키에 저장 (sgp_bracket_final)
    localStorage.setItem('sgp_bracket_final', JSON.stringify(finalData));
    // 기존 키들도 동기화
    localStorage.setItem('sgp_groupBrackets', JSON.stringify(clean));
    localStorage.setItem('sgp_courtCount', String(finalData.courtCount));
    localStorage.setItem('sgp_layout', finalData.layout);
    localStorage.setItem('sgp_bracket_temp', JSON.stringify({groupBrackets:clean, savedAt:new Date().toLocaleTimeString()}));

    // 5) 부모창에도 알림
    if(window.opener){
      window.opener.postMessage({type:'sgp_bracket_finalized', finalData},'*');
    }

    // 6) 버튼 상태 변경
    const btn=document.getElementById('btn-finalize');
    if(btn){
      btn.textContent='✅ 완성됨';
      btn.style.background='linear-gradient(135deg,#00b97a,#008f5e)';
      btn.style.boxShadow='0 0 18px rgba(6,214,160,0.55)';
      setTimeout(()=>{
        btn.textContent='✅ 완성';
        btn.style.background='linear-gradient(135deg,#06d6a0,#00b97a)';
        btn.style.boxShadow='0 0 12px rgba(6,214,160,0.35)';
      },2500);
    }

    const g=clean.length, p=finalData.totalParticipants;
    toast('완성! '+g+'개 체급 · '+p+'명 저장됨 — 전광판에서 불러올 수 있어요','success');
  } catch(e){
    console.error(e);
    toast('완성 저장 실패: '+e.message,'error');
  }
}
