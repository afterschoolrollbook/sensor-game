
// ── 체급 선택 체크박스 렌더 ──
function _renderPdfCheckboxes(){
  const wrap=document.getElementById('pdf-group-checkboxes');
  if(!wrap) return;
  wrap.innerHTML='';

  const groups=S.groupBrackets||[];

  // sortKeys 기반으로 각 파트 추출
  const allLabels=groups.map(g=>g.label);
  const parts0=[...new Set(allLabels.map(l=>l.split('/')[0]?.trim()).filter(Boolean))]; // 성별
  const parts1=[...new Set(allLabels.map(l=>l.split('/')[1]?.trim()).filter(Boolean))]; // 부문
  const parts2=[...new Set(allLabels.map(l=>l.split('/')[2]?.trim()).filter(Boolean))]; // 체급

  const sep=()=>{
    const s=document.createElement('span');
    s.style.cssText='width:1px;height:16px;background:var(--border);display:inline-block;margin:0 6px;vertical-align:middle;';
    wrap.appendChild(s);
  };

  const mkLabel=(txt)=>{
    const l=document.createElement('span');
    l.style.cssText='font-size:9px;color:var(--text3);letter-spacing:1px;margin-right:2px;vertical-align:middle;';
    l.textContent=txt;
    wrap.appendChild(l);
  };

  const mkFilterBtn=(label, matchFn)=>{
    const btn=document.createElement('button');
    btn.style.cssText='padding:3px 10px;border-radius:5px;border:1px solid var(--border2);background:rgba(255,255,255,.06);color:var(--text2);font-size:10px;cursor:pointer;margin-right:2px;transition:all .15s;';
    btn.textContent=label;
    btn.onclick=()=>{
      // 같은 그룹 버튼들 비활성화, 자신만 활성화
      wrap.querySelectorAll('.filter-btn').forEach(b=>{
        b.style.borderColor='var(--border2)';
        b.style.background='rgba(255,255,255,.06)';
        b.style.color='var(--text2)';
      });
      btn.style.borderColor='var(--accent)';
      btn.style.background='rgba(76,201,240,.15)';
      btn.style.color='var(--accent)';
      wrap.querySelectorAll('.pdf-chk').forEach(b=>{
        b.dataset.checked=matchFn(groups[parseInt(b.dataset.idx)])?'1':'0';
      });
      _syncCheckStyles();
      _renderPdfPreview(_getSelectedGroups());
    };
    btn.className='filter-btn';
    wrap.appendChild(btn);
  };

  // 전체 선택/해제
  mkFilterBtn('전체 선택', ()=>true);
  mkFilterBtn('전체 해제', ()=>false);

  // 성별 (파트0)
  if(parts0.length>1){ sep(); mkLabel('성별:'); parts0.forEach(v=>mkFilterBtn(v, g=>g.label.split('/')[0]?.trim()===v)); }

  // 부문 (파트1)
  if(parts1.length>0){ sep(); mkLabel('부문:'); parts1.forEach(v=>mkFilterBtn(v, g=>g.label.split('/')[1]?.trim()===v)); }

  // 체급 (파트2)
  if(parts2.length>0){
    const br2=document.createElement('div');
    br2.style.cssText='width:100%;height:0;margin:2px 0;';
    wrap.appendChild(br2);
    mkLabel('체급:'); parts2.forEach(v=>mkFilterBtn(v, g=>g.label.split('/')[2]?.trim()===v));
  }

  // 구분선
  const br=document.createElement('div');
  br.style.cssText='width:100%;height:1px;background:var(--border);margin:8px 0;';
  wrap.appendChild(br);

  // 개별 체급 버튼
  groups.forEach((g,i)=>{
    const shortLabel=g.label.split('/').map(s=>s.trim()).join(' · ');
    const btn=document.createElement('button');
    btn.className='pdf-chk';
    btn.dataset.idx=i;
    btn.dataset.checked='0';
    btn.onclick=()=>{
      btn.dataset.checked=btn.dataset.checked==='1'?'0':'1';
      _syncCheckStyles();
      _renderPdfPreview(_getSelectedGroups());
    };
    btn.style.cssText='padding:3px 10px;border-radius:5px;border:1px solid var(--border2);background:transparent;color:var(--text3);font-size:10px;cursor:pointer;margin-right:2px;margin-bottom:2px;';
    btn.textContent=shortLabel+` (${g.slots.length}명)`;
    wrap.appendChild(btn);
  });
}

function _syncCheckStyles(){
  const wrap=document.getElementById('pdf-group-checkboxes');
  if(!wrap) return;
  wrap.querySelectorAll('.pdf-chk').forEach(b=>{
    const on=b.dataset.checked==='1';
    b.style.borderColor=on?'var(--green)':'var(--border2)';
    b.style.background=on?'rgba(6,214,160,.1)':'transparent';
    b.style.color=on?'var(--green)':'var(--text3)';
  });
}

function _getSelectedGroups(){
  const sel=[];
  document.querySelectorAll('.pdf-chk').forEach(b=>{
    if(b.dataset.checked==='1') sel.push(S.groupBrackets[parseInt(b.dataset.idx)]);
  });
  return sel;
}

// ── 명단 설정 모달 ──
function openRosterModal(){
  const existing=document.getElementById('roster-modal');
  if(existing) existing.remove();

  const overlay=document.createElement('div');
  overlay.id='roster-modal';
  overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center;';

  // ── 방식 선택 화면 ──
  const choiceBox=document.createElement('div');
  choiceBox.style.cssText='background:var(--bg2);border:1px solid var(--border2);border-radius:14px;width:420px;max-width:95vw;padding:28px 28px 24px;display:flex;flex-direction:column;gap:16px;';
  choiceBox.innerHTML=`
    <div style="font-size:14px;font-weight:700;margin-bottom:4px;">📋 명단 배정 방식 선택</div>
    <button id="rm-choice-manual"
      style="display:flex;align-items:center;gap:14px;padding:16px 20px;border-radius:10px;border:1px solid var(--border2);background:var(--card);color:var(--text);cursor:pointer;text-align:left;transition:all .15s;"
      onmouseover="this.style.borderColor='var(--accent)';this.style.background='rgba(76,201,240,.08)'"
      onmouseout="this.style.borderColor='var(--border2)';this.style.background='var(--card)'">
      <span style="font-size:26px;line-height:1;">✏️</span>
      <div>
        <div style="font-size:13px;font-weight:700;margin-bottom:3px;">개별 지정</div>
        <div style="font-size:11px;color:var(--text3);">슬롯마다 선수 이름을 직접 입력합니다</div>
      </div>
    </button>
    <button id="rm-choice-random"
      style="display:flex;align-items:center;gap:14px;padding:16px 20px;border-radius:10px;border:1px solid var(--border2);background:var(--card);color:var(--text);cursor:pointer;text-align:left;transition:all .15s;"
      onmouseover="this.style.borderColor='var(--yellow)';this.style.background='rgba(255,214,10,.08)'"
      onmouseout="this.style.borderColor='var(--border2)';this.style.background='var(--card)'">
      <span style="font-size:26px;line-height:1;">🎲</span>
      <div>
        <div style="font-size:13px;font-weight:700;margin-bottom:3px;">랜덤 자동배정</div>
        <div style="font-size:11px;color:var(--text3);">참가자를 무작위로 섞어 슬롯에 자동 배정합니다</div>
      </div>
    </button>
    <button onclick="document.getElementById('roster-modal').remove()"
      style="align-self:flex-end;padding:5px 14px;background:transparent;border:1px solid var(--border);color:var(--text3);border-radius:7px;font-size:12px;cursor:pointer;">취소</button>
  `;
  overlay.appendChild(choiceBox);
  document.body.appendChild(overlay);

  // 개별 지정 선택
  document.getElementById('rm-choice-manual').onclick=()=>{
    choiceBox.remove();
    _openManualRosterModal(overlay);
  };

  // 랜덤 자동배정 선택
  document.getElementById('rm-choice-random').onclick=()=>{
    choiceBox.remove();
    _openRandomRosterModal(overlay);
  };
}

// ── 랜덤 자동배정 모달 ──
function _openRandomRosterModal(overlay){
  const modal=document.createElement('div');
  modal.style.cssText='background:var(--bg2);border:1px solid var(--border2);border-radius:14px;width:420px;max-width:95vw;padding:24px 28px;display:flex;flex-direction:column;gap:14px;';

  const groupItems=S.groupBrackets.map((g,i)=>{
    const lbl=g.label.split('/').map(s=>s.trim()).join(' · ');
    return `<label style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:7px;border:1px solid var(--border);background:var(--card);cursor:pointer;">
      <input type="checkbox" data-idx="${i}" checked style="accent-color:var(--yellow);width:14px;height:14px;">
      <span style="font-size:12px;">${lbl}</span>
      <span style="font-size:10px;color:var(--text3);margin-left:auto;">${g.slots.length}명</span>
    </label>`;
  }).join('');

  modal.innerHTML=`
    <div style="font-size:14px;font-weight:700;">🎲 랜덤 자동배정</div>
    <div style="font-size:11px;color:var(--text3);line-height:1.7;">배정할 체급을 선택하세요. 참가자를 무작위로 섞어 1라운드 슬롯에 자동 배정합니다.</div>
    <div style="display:flex;gap:6px;margin-bottom:2px;">
      <button onclick="this.closest('div').parentElement.querySelectorAll('input[type=checkbox]').forEach(c=>c.checked=true)" style="padding:3px 10px;border-radius:5px;border:1px solid var(--border);background:transparent;color:var(--text3);font-size:10px;cursor:pointer;">전체 선택</button>
      <button onclick="this.closest('div').parentElement.querySelectorAll('input[type=checkbox]').forEach(c=>c.checked=false)" style="padding:3px 10px;border-radius:5px;border:1px solid var(--border);background:transparent;color:var(--text3);font-size:10px;cursor:pointer;">전체 해제</button>
    </div>
    <div id="rm-group-list" style="display:flex;flex-direction:column;gap:5px;max-height:260px;overflow-y:auto;">${groupItems}</div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px;">
      <button onclick="document.getElementById('roster-modal').remove()" style="padding:6px 14px;background:transparent;border:1px solid var(--border);color:var(--text3);border-radius:7px;font-size:12px;cursor:pointer;">취소</button>
      <button id="rm-random-apply" style="padding:6px 20px;background:var(--yellow);border:none;color:#111;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;">🎲 배정 실행</button>
    </div>
  `;
  overlay.appendChild(modal);

  document.getElementById('rm-random-apply').onclick=()=>{
    const checked=[...modal.querySelectorAll('input[type=checkbox]')].filter(c=>c.checked).map(c=>parseInt(c.dataset.idx));
    if(!checked.length){ toast('체급을 하나 이상 선택해주세요','error'); return; }
    checked.forEach(gi=>{
      const g=S.groupBrackets[gi];
      if(!g||!g.matches[0]) return;
      // 해당 그룹 참가자 이름 목록
      const names=g.slots.map(s=>s.player?.name||'').filter(Boolean);
      // Fisher-Yates 셔플
      for(let i=names.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [names[i],names[j]]=[names[j],names[i]];
      }
      // matches[0] 슬롯에 순서대로 배정
      let idx=0;
      g.matches[0].forEach(m=>{
        if(m.p1){ const sm=m.p1.name.match(/^(\d+-\d+)/); const sn=sm?sm[1]:m.p1.name; const n=names[idx++]||''; m.p1.name=n?`${sn} (${n})`:sn; }
        if(m.p2&&!m.bye){ const sm=m.p2.name.match(/^(\d+-\d+)/); const sn=sm?sm[1]:m.p2.name; const n=names[idx++]||''; m.p2.name=n?`${sn} (${n})`:sn; }
      });
    });
    document.getElementById('roster-modal').remove();
    _applyRoster();
    toast(`${checked.length}개 체급 랜덤 배정 완료!`,'success');
  };
}

// ── 개별 지정 모달 ──
function _openManualRosterModal(overlay){
  const modal=document.createElement('div');
  modal.style.cssText='background:var(--bg2);border:1px solid var(--border2);border-radius:12px;width:700px;max-width:95vw;max-height:85vh;display:flex;flex-direction:column;overflow:hidden;';

  // 헤더
  const hdr=document.createElement('div');
  hdr.style.cssText='padding:14px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;';
  hdr.innerHTML=`
    <span style="font-size:13px;font-weight:700;">✏️ 명단 설정 — 개별 지정</span>
    <button onclick="document.getElementById('roster-modal').remove()" style="background:transparent;border:none;color:var(--text3);font-size:18px;cursor:pointer;">✕</button>
  `;
  modal.appendChild(hdr);

  // 체급 탭
  const tabRow=document.createElement('div');
  tabRow.style.cssText='display:flex;flex-wrap:wrap;gap:4px;padding:10px 18px;border-bottom:1px solid var(--border);flex-shrink:0;';
  const body=document.createElement('div');
  body.style.cssText='flex:1;overflow:auto;padding:16px 18px;';

  const renderRosterBody=(gIdx)=>{
    body.innerHTML='';
    const g=S.groupBrackets[gIdx];
    if(!g||!g.matches[0]) return;

    g.matches[0].forEach((m,mi)=>{
      const row=document.createElement('div');
      row.style.cssText='display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);';

      const label=document.createElement('div');
      label.style.cssText='font-size:12px;color:var(--text3);font-family:"Share Tech Mono",monospace;width:60px;flex-shrink:0;';
      label.textContent=`${mi+1}경기`;
      row.appendChild(label);

      [0,1].forEach(pi=>{
        if(pi===1&&m.bye) return;
        const pObj=pi===0?m.p1:m.p2;
        if(!pObj) return;

        // 슬롯번호 추출 (예: "1번 (홍길동)" → "1번")
        const slotMatch=pObj.name.match(/^(\d+-\d+)/);
        const slotNum=slotMatch?slotMatch[1]:pObj.name;

        const cell=document.createElement('div');
        cell.style.cssText='display:flex;align-items:center;gap:6px;flex:1;';

        const numLabel=document.createElement('span');
        numLabel.style.cssText='font-size:12px;font-weight:700;color:var(--accent);min-width:36px;';
        numLabel.textContent=slotNum;
        cell.appendChild(numLabel);

        // 현재 이름에서 괄호 안 이름 추출
        const nameMatch=pObj.name.match(/\((.+)\)/);
        const curName=nameMatch?nameMatch[1]:'';

        const inp=document.createElement('input');
        inp.type='text';
        inp.value=curName;
        inp.placeholder='이름 입력';
        inp.style.cssText='flex:1;background:var(--card);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:5px 8px;font-size:12px;font-family:"Noto Sans KR",sans-serif;';
        inp.oninput=()=>{
          const newName=inp.value.trim();
          const slotNumOnly=slotNum; // "N번"
          pObj.name=newName?`${slotNumOnly} (${newName})`:slotNumOnly;
        };
        cell.appendChild(inp);

        if(pi===0&&!m.bye){
          const vs=document.createElement('span');
          vs.style.cssText='font-size:11px;color:var(--red);font-family:"Bebas Neue",cursive;padding:0 4px;';
          vs.textContent='VS';
          row.appendChild(cell);
          row.appendChild(vs);
        } else {
          row.appendChild(cell);
        }
      });

      if(m.bye){
        const byeBadge=document.createElement('span');
        byeBadge.style.cssText='font-size:10px;color:var(--accent);';
        byeBadge.textContent='BYE';
        row.appendChild(byeBadge);
      }
      body.appendChild(row);
    });
  };

  // 탭 버튼 생성
  let activeGIdx=0;
  S.groupBrackets.forEach((g,i)=>{
    const shortLabel=g.label.split('/').map(s=>s.trim()).join(' · ');
    const tab=document.createElement('button');
    tab.style.cssText=`padding:3px 10px;border-radius:5px;border:1px solid ${i===0?'var(--accent)':'var(--border2)'};background:${i===0?'rgba(76,201,240,.15)':'transparent'};color:${i===0?'var(--accent)':'var(--text3)'};font-size:10px;cursor:pointer;`;
    tab.textContent=shortLabel;
    tab.onclick=()=>{
      tabRow.querySelectorAll('button').forEach(b=>{ b.style.borderColor='var(--border2)'; b.style.background='transparent'; b.style.color='var(--text3)'; });
      tab.style.borderColor='var(--accent)'; tab.style.background='rgba(76,201,240,.15)'; tab.style.color='var(--accent)';
      activeGIdx=i;
      renderRosterBody(i);
    };
    tabRow.appendChild(tab);
  });

  modal.appendChild(tabRow);
  modal.appendChild(body);

  // 하단 버튼
  const footer=document.createElement('div');
  footer.style.cssText='padding:12px 18px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;flex-shrink:0;';
  footer.innerHTML=`
    <button onclick="document.getElementById('roster-modal').remove()" style="padding:6px 16px;background:var(--card);border:1px solid var(--border);color:var(--text2);border-radius:7px;font-size:12px;cursor:pointer;">취소</button>
    <button onclick="_applyRoster()" style="padding:6px 18px;background:var(--red);border:none;color:#fff;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;">✅ 적용</button>
  `;
  modal.appendChild(footer);

  overlay.appendChild(modal);
  renderRosterBody(0);
}

function _applyRoster(){
  const modal=document.getElementById('roster-modal');
  if(modal) modal.remove();
  _renderPdfPreview(_getSelectedGroups());
  toast('명단이 적용됐어요!','success');
}

// ── 공통 그룹 선택 모달 (이름삭제 / 랜덤섞기 공용) ──
function _openGroupSelectModal(title, actionLabel, onExec){
  const overlay=document.createElement('div');
  overlay.id='group-action-modal';
  overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:9000;';

  const modal=document.createElement('div');
  modal.style.cssText='background:var(--bg2);border:1px solid var(--border2);border-radius:14px;width:400px;max-width:95vw;padding:24px 24px 20px;display:flex;flex-direction:column;gap:14px;';

  // 헤더
  const hdr=document.createElement('div');
  hdr.style.cssText='font-size:14px;font-weight:700;';
  hdr.textContent=title;
  modal.appendChild(hdr);

  // 전체 / 그룹별 선택 버튼
  let mode='all'; // 'all' | 'group'
  const modeRow=document.createElement('div');
  modeRow.style.cssText='display:flex;gap:8px;';

  const mkModeBtn=(label, val)=>{
    const btn=document.createElement('button');
    btn.textContent=label;
    btn.style.cssText=`flex:1;padding:10px 0;border-radius:8px;border:1px solid ${val==='all'?'var(--accent)':'var(--border2)'};background:${val==='all'?'rgba(76,201,240,.12)':'transparent'};color:${val==='all'?'var(--accent)':'var(--text3)'};font-size:12px;font-weight:700;cursor:pointer;`;
    btn.onclick=()=>{
      mode=val;
      modeRow.querySelectorAll('button').forEach(b=>{b.style.borderColor='var(--border2)';b.style.background='transparent';b.style.color='var(--text3)';});
      btn.style.borderColor='var(--accent)';btn.style.background='rgba(76,201,240,.12)';btn.style.color='var(--accent)';
      groupList.style.display=val==='group'?'flex':'none';
    };
    return btn;
  };
  const btnAll=mkModeBtn('전체',   'all');
  const btnGrp=mkModeBtn('그룹별 선택','group');
  btnAll.style.borderColor='var(--accent)';btnAll.style.background='rgba(76,201,240,.12)';btnAll.style.color='var(--accent)';
  modeRow.appendChild(btnAll);
  modeRow.appendChild(btnGrp);
  modal.appendChild(modeRow);

  // 그룹 체크박스 목록 (기본 숨김)
  const groupList=document.createElement('div');
  groupList.style.cssText='display:none;flex-direction:column;gap:5px;max-height:240px;overflow-y:auto;';
  S.groupBrackets.forEach((g,i)=>{
    const lbl=document.createElement('label');
    lbl.style.cssText='display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:7px;border:1px solid var(--border);background:var(--card);cursor:pointer;';
    const chk=document.createElement('input');
    chk.type='checkbox'; chk.dataset.idx=i; chk.checked=true;
    chk.style.cssText='accent-color:var(--accent);width:14px;height:14px;';
    const span=document.createElement('span');
    span.style.cssText='font-size:12px;';
    span.textContent=g.label.split('/').map(s=>s.trim()).join(' · ');
    const cnt=document.createElement('span');
    cnt.style.cssText='font-size:10px;color:var(--text3);margin-left:auto;';
    cnt.textContent=g.slots.length+'명';
    lbl.appendChild(chk); lbl.appendChild(span); lbl.appendChild(cnt);
    groupList.appendChild(lbl);
  });
  modal.appendChild(groupList);

  // 하단 버튼
  const footer=document.createElement('div');
  footer.style.cssText='display:flex;gap:8px;justify-content:flex-end;';
  const cancelBtn=document.createElement('button');
  cancelBtn.textContent='취소';
  cancelBtn.style.cssText='padding:6px 16px;background:var(--card);border:1px solid var(--border);color:var(--text2);border-radius:7px;font-size:12px;cursor:pointer;';
  cancelBtn.onclick=()=>overlay.remove();
  const execBtn=document.createElement('button');
  execBtn.textContent=actionLabel;
  execBtn.style.cssText='padding:6px 20px;background:var(--red);border:none;color:#fff;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;';
  execBtn.onclick=()=>{
    let idxs;
    if(mode==='all'){
      idxs=S.groupBrackets.map((_,i)=>i);
    } else {
      idxs=[...groupList.querySelectorAll('input[type=checkbox]')].filter(c=>c.checked).map(c=>parseInt(c.dataset.idx));
      if(!idxs.length){ toast('그룹을 하나 이상 선택해주세요','error'); return; }
    }
    overlay.remove();
    onExec(idxs);
  };
  footer.appendChild(cancelBtn);
  footer.appendChild(execBtn);
  modal.appendChild(footer);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

// ── 이름 삭제 ──
function openDeleteNamesModal(){
  _openGroupSelectModal('🗑 이름 삭제', '삭제 실행', (idxs)=>{
    idxs.forEach(gi=>{
      const g=S.groupBrackets[gi];
      if(!g) return;
      g.matches.forEach(round=>round.forEach(m=>{
        if(m.p1) m.p1.name=m.p1.name.replace(/\s*\(.+\)/,'');
        if(m.p2) m.p2.name=m.p2.name.replace(/\s*\(.+\)/,'');
      }));
    });
    _renderPdfPreview(_getSelectedGroups());
    toast('이름을 삭제했어요','success');
  });
}

// ── 랜덤 섞기 ──
function openShuffleNamesModal(){
  // 1단계: 애니메이션 스타일 선택
  const overlay=document.createElement('div');
  overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:9000;';

  const modal=document.createElement('div');
  modal.style.cssText='background:var(--bg2);border:1px solid var(--border2);border-radius:16px;width:420px;max-width:95vw;padding:28px 24px;display:flex;flex-direction:column;gap:18px;';

  modal.innerHTML=`
    <div style="font-size:15px;font-weight:700;text-align:center;">🔀 랜덤 섞기</div>
    <div style="font-size:11px;color:var(--text3);text-align:center;">애니메이션 스타일을 선택해주세요</div>
    <div style="display:flex;gap:12px;justify-content:center;">
      <button id="anim-lotto" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px 24px;border-radius:12px;border:1px solid var(--border2);background:var(--card);color:var(--text);cursor:pointer;transition:all .15s;font-family:'Noto Sans KR',sans-serif;"
        onmouseover="this.style.borderColor='var(--accent)';this.style.background='rgba(76,201,240,.08)'"
        onmouseout="this.style.borderColor='var(--border2)';this.style.background='var(--card)'">
        <span style="font-size:36px;">🎱</span>
        <span style="font-size:12px;font-weight:700;">로또 기계</span>
        <span style="font-size:10px;color:var(--text3);">공이 섞이는 모습</span>
      </button>
      <button id="anim-dart" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px 24px;border-radius:12px;border:1px solid var(--border2);background:var(--card);color:var(--text);cursor:pointer;transition:all .15s;font-family:'Noto Sans KR',sans-serif;"
        onmouseover="this.style.borderColor='var(--yellow)';this.style.background='rgba(255,214,10,.08)'"
        onmouseout="this.style.borderColor='var(--border2)';this.style.background='var(--card)'">
        <span style="font-size:36px;">🎯</span>
        <span style="font-size:12px;font-weight:700;">다트판</span>
        <span style="font-size:10px;color:var(--text3);">룰렛이 돌아가는 모습</span>
      </button>
    </div>
    <button onclick="this.closest('div').parentElement.remove()" style="align-self:center;padding:5px 18px;background:transparent;border:1px solid var(--border);color:var(--text3);border-radius:7px;font-size:11px;cursor:pointer;font-family:'Noto Sans KR',sans-serif;">취소</button>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const goNext=(animType)=>{
    overlay.remove();
    // 2단계: 그룹 선택
    _openGroupSelectModal('🔀 랜덤 섞기 — 범위 선택', '섞기 실행', (idxs)=>{
      // 3단계: 이름 추출 & 셔플
      const allNames=[];
      idxs.forEach(gi=>{
        const g=S.groupBrackets[gi];
        if(!g||!g.matches[0]) return;
        g.matches[0].forEach(m=>{
          if(m.p1){ const nm=m.p1.name.match(/\((.+)\)/); if(nm) allNames.push(nm[1]); }
          if(m.p2&&!m.bye){ const nm=m.p2.name.match(/\((.+)\)/); if(nm) allNames.push(nm[1]); }
        });
      });
      if(!allNames.length){ toast('배정된 이름이 없어요','info'); return; }

      // 4단계: 애니메이션 → 완료 후 실제 섞기 적용
      _showShuffleAnimation(animType, allNames, ()=>{
        idxs.forEach(gi=>{
          const g=S.groupBrackets[gi];
          if(!g||!g.matches[0]) return;
          const names=[];
          g.matches[0].forEach(m=>{
            if(m.p1){ const nm=m.p1.name.match(/\((.+)\)/); if(nm) names.push(nm[1]); }
            if(m.p2&&!m.bye){ const nm=m.p2.name.match(/\((.+)\)/); if(nm) names.push(nm[1]); }
          });
          for(let i=names.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [names[i],names[j]]=[names[j],names[i]]; }
          let idx=0;
          g.matches[0].forEach(m=>{
            if(m.p1){ const sn=m.p1.name.replace(/\s*\(.+\)/,''); const n=names[idx++]||''; m.p1.name=n?`${sn} (${n})`:sn; }
            if(m.p2&&!m.bye){ const sn=m.p2.name.replace(/\s*\(.+\)/,''); const n=names[idx++]||''; m.p2.name=n?`${sn} (${n})`:sn; }
          });
        });
        _renderPdfPreview(_getSelectedGroups());
        toast('랜덤으로 섞었어요 🎉','success');
      });
    });
  };

  document.getElementById('anim-lotto').onclick=()=>goNext('lotto');
  document.getElementById('anim-dart').onclick=()=>goNext('dart');
}

// ── 셔플 애니메이션 ──
function _showShuffleAnimation(type, names, onDone){
  const ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;z-index:9500;flex-direction:column;gap:0;';
  document.body.appendChild(ov);

  if(type==='lotto'){
    // 로또 기계 — 캔버스에서 공들이 튀어다니다가 멈춤
    ov.innerHTML=`
      <div style="font-size:13px;color:var(--accent);font-family:'Share Tech Mono',monospace;letter-spacing:2px;margin-bottom:16px;">// SHUFFLING...</div>
      <div style="position:relative;width:320px;height:280px;border-radius:50% 50% 40% 40%;border:3px solid var(--accent);background:radial-gradient(ellipse at 50% 30%,#0d1a2a,#050a10);overflow:hidden;box-shadow:0 0 40px rgba(76,201,240,.3),inset 0 0 60px rgba(0,0,0,.8);">
        <canvas id="lotto-canvas" width="320" height="280" style="position:absolute;inset:0;"></canvas>
        <div style="position:absolute;bottom:0;left:0;right:0;height:60px;background:linear-gradient(to top,#050a10,transparent);"></div>
      </div>
      <div id="shuffle-done-msg" style="margin-top:20px;font-size:0px;color:var(--green);font-weight:700;font-family:'Bebas Neue',cursive;letter-spacing:4px;transition:font-size .4s ease;"></div>
    `;
    document.body.appendChild(ov);

    const canvas=document.getElementById('lotto-canvas');
    const ctx=canvas.getContext('2d');
    const W=320, H=280;
    const colors=['#e63946','#4cc9f0','#ffd60a','#06d6a0','#ff6b6b','#a855f7','#f97316','#22d3ee'];
    const balls=names.slice(0,Math.min(names.length,12)).map((name,i)=>({
      x:60+Math.random()*200, y:60+Math.random()*160,
      vx:(Math.random()-0.5)*6, vy:(Math.random()-0.5)*6,
      r:22, color:colors[i%colors.length], name:name.slice(0,4),
    }));

    let frame=0; let animId;
    ov.addEventListener('click',()=>{ cancelAnimationFrame(animId); ov.remove(); },{ once:true });
    const animate=()=>{
      ctx.clearRect(0,0,W,H);
      balls.forEach(b=>{
        b.x+=b.vx; b.y+=b.vy;
        // 타원형 경계 반사
        const cx=W/2, cy=H/2, rx=W/2-b.r-4, ry=H/2-b.r-8;
        const dx=(b.x-cx)/rx, dy=(b.y-cy)/ry;
        if(dx*dx+dy*dy>1){
          b.vx*=-0.95; b.vy*=-0.95;
          b.x=cx+Math.cos(Math.atan2(b.y-cy,b.x-cx))*rx;
          b.y=cy+Math.sin(Math.atan2(b.y-cy,b.x-cx))*ry;
        }
        // 공끼리 충돌
        balls.forEach(b2=>{
          if(b===b2) return;
          const ddx=b.x-b2.x, ddy=b.y-b2.y, dist=Math.sqrt(ddx*ddx+ddy*ddy);
          if(dist<b.r+b2.r&&dist>0){
            const nx=ddx/dist, ny=ddy/dist;
            b.vx+=nx*0.5; b.vy+=ny*0.5; b2.vx-=nx*0.5; b2.vy-=ny*0.5;
          }
        });
        // 속도 제한
        const spd=Math.sqrt(b.vx*b.vx+b.vy*b.vy);
        if(spd>7){b.vx=b.vx/spd*7;b.vy=b.vy/spd*7;}
        // 그리기
        const grad=ctx.createRadialGradient(b.x-6,b.y-6,2,b.x,b.y,b.r);
        grad.addColorStop(0,'rgba(255,255,255,.35)');
        grad.addColorStop(1,b.color);
        ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
        ctx.fillStyle=grad; ctx.fill();
        ctx.strokeStyle='rgba(255,255,255,.15)'; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle='#fff'; ctx.font='bold 9px "Noto Sans KR"';
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(b.name,b.x,b.y);
      });
      frame++;
      if(frame<150) animId=requestAnimationFrame(animate);
      else{
        // 멈추고 완료 표시
        const msg=document.getElementById('shuffle-done-msg');
        if(msg){ msg.textContent='완료!'; msg.style.fontSize='48px'; }
        setTimeout(()=>{ ov.remove(); onDone(); }, 900);
      }
    };
    animate();

  } else {
    // 다트판 룰렛
    ov.innerHTML=`
      <div style="font-size:13px;color:var(--yellow);font-family:'Share Tech Mono',monospace;letter-spacing:2px;margin-bottom:16px;">// SPINNING...</div>
      <div style="position:relative;width:300px;height:300px;">
        <canvas id="dart-canvas" width="300" height="300"></canvas>
        <div id="dart-arrow" style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);font-size:28px;filter:drop-shadow(0 2px 6px rgba(0,0,0,.8));">▼</div>
      </div>
      <div id="shuffle-done-msg" style="margin-top:20px;font-size:0px;color:var(--green);font-weight:700;font-family:'Bebas Neue',cursive;letter-spacing:4px;transition:font-size .5s ease;"></div>
    `;
    document.body.appendChild(ov);

    const canvas=document.getElementById('dart-canvas');
    const ctx=canvas.getContext('2d');
    const cx=150, cy=150, r=138;
    const slices=Math.min(names.length,16);
    const colors2=['#e63946','#4cc9f0','#ffd60a','#06d6a0','#ff6b6b','#a855f7','#f97316','#22d3ee',
                   '#e63946','#4cc9f0','#ffd60a','#06d6a0','#ff6b6b','#a855f7','#f97316','#22d3ee'];
    const sliceAngle=(Math.PI*2)/slices;

    let angle=0;
    // 빠르게 시작해서 점점 느려지는 속도
    let speed=0.35;
    const totalRot=Math.PI*2*6+Math.random()*Math.PI*2; // 6바퀴+랜덤
    let rotated=0; let animId2;
    ov.addEventListener('click',()=>{ cancelAnimationFrame(animId2); ov.remove(); },{ once:true });

    const drawWheel=(ang)=>{
      ctx.clearRect(0,0,300,300);
      for(let i=0;i<slices;i++){
        const start=ang+i*sliceAngle, end=start+sliceAngle;
        ctx.beginPath(); ctx.moveTo(cx,cy);
        ctx.arc(cx,cy,r,start,end);
        ctx.fillStyle=colors2[i%colors2.length]; ctx.fill();
        ctx.strokeStyle='rgba(0,0,0,.4)'; ctx.lineWidth=1.5; ctx.stroke();
        // 이름
        ctx.save();
        ctx.translate(cx,cy);
        ctx.rotate(ang+i*sliceAngle+sliceAngle/2);
        ctx.textAlign='right'; ctx.fillStyle='#fff';
        ctx.font='bold 11px "Noto Sans KR"';
        ctx.shadowColor='rgba(0,0,0,.8)'; ctx.shadowBlur=3;
        ctx.fillText(names[i%names.length].slice(0,5), r-8, 4);
        ctx.restore();
      }
      // 중앙 원
      ctx.beginPath(); ctx.arc(cx,cy,18,0,Math.PI*2);
      ctx.fillStyle='#0d0d1a'; ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.2)'; ctx.lineWidth=2; ctx.stroke();
    };

    const spin=()=>{
      const decel=rotated/totalRot;
      speed=Math.max(0.008, 0.35*(1-decel*decel));
      angle+=speed; rotated+=speed;
      drawWheel(angle);
      if(rotated<totalRot) animId2=requestAnimationFrame(spin);
      else{
        drawWheel(angle);
        const msg=document.getElementById('shuffle-done-msg');
        if(msg){ msg.textContent='완료!'; msg.style.fontSize='48px'; }
        setTimeout(()=>{ ov.remove(); onDone(); }, 900);
      }
    };
    drawWheel(0);
    spin();
  }
}

