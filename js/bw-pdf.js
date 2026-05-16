
function _renderPdfPreview(groups){
  const preview=document.getElementById('pdf-preview');
  if(!preview) return;
  preview.innerHTML='';
  _computeSeqOffsets();
  if(!groups||!groups.length){
    preview.innerHTML='<div style="text-align:center;padding:48px 0;color:var(--text3);font-size:13px;">위에서 출력할 체급을 선택하면 미리보기가 표시됩니다</div>';
    return;
  }

  const saved=S.matches;
  const _applyOverflow=(el)=>{
    el.querySelectorAll('*').forEach(child=>{
      child.style.overflow='visible';
      child.style.overflowX='visible';
      child.style.overflowY='visible';
    });
    el.querySelectorAll('svg').forEach(s=>{
      s.setAttribute('overflow','visible');
      s.style.overflow='visible';
    });
  };

  if(_bracketLayout==='D' && (_courtCount||1)>=2){
    // D형: 행(row) 단위 렌더링 — 체급 순서대로 왼쪽/오른쪽을 같은 행에 배치
    const outerWrap=document.createElement('div');
    outerWrap.style.cssText='display:flex;flex-direction:column;gap:0;overflow:visible;';

    const mkLabel=(txt,align)=>{
      const d=document.createElement('div');
      d.style.cssText=`font-size:10px;color:var(--accent);font-family:"Share Tech Mono",monospace;letter-spacing:2px;margin-bottom:10px;text-align:${align};`;
      d.textContent=txt; return d;
    };

    // 헤더 행
    const hdrRow=document.createElement('div');
    hdrRow.style.cssText='display:flex;flex-direction:row;gap:0;margin-bottom:6px;overflow:visible;';
    const hdrL=document.createElement('div');
    hdrL.style.cssText='padding-right:24px;flex-shrink:0;';
    hdrL.appendChild(mkLabel('// 경기장 1','left'));
    const hdrSp=document.createElement('div');
    hdrSp.style.cssText='flex:1;min-width:24px;';
    const hdrR=document.createElement('div');
    hdrR.style.cssText='padding-left:24px;flex-shrink:0;display:flex;justify-content:flex-end;';

    const lGroups=groups.filter(g=>g.court===1);
    const rGroups=groups.filter(g=>g.court===2);

    /* 경기장 2에 배정된 그룹이 있을 때만 헤더 표시 */
    if(rGroups.length) hdrR.appendChild(mkLabel('// 경기장 2','right'));
    hdrRow.appendChild(hdrL); hdrRow.appendChild(hdrSp); hdrRow.appendChild(hdrR);
    outerWrap.appendChild(hdrRow);

    const rowCount=Math.max(lGroups.length, rGroups.length);

    const mkPdfSection=(g, reversed)=>{
      const shortLabel=g.label.split('/').map(s=>s.trim()).join(' · ');
      const sec=document.createElement('div');
      sec.style.cssText='display:flex;flex-direction:column;flex-shrink:0;min-width:max-content;overflow:visible;';
      const hdr=document.createElement('div');
      hdr.style.cssText='font-size:9px;color:#555;font-family:"Share Tech Mono",monospace;letter-spacing:1px;margin-bottom:4px;margin-top:8px;flex-shrink:0;white-space:nowrap;';
      hdr.textContent=shortLabel;
      sec.appendChild(hdr);
      const gWrap=document.createElement('div');
      gWrap.style.cssText='min-width:max-content;overflow:visible;';
      const taggedMatches=g.matches.map((round,ri)=>round.map((m,mi)=>({...m,_groupObj:g,_origMi:mi,_origRi:ri,_groupLabel:shortLabel,_seqMi:(g._roundOffset&&g._roundOffset[ri]!=null?g._roundOffset[ri]:0)+mi})));
      S.matches=taggedMatches;
      _renderBracketHTML(gWrap, taggedMatches, 'top', reversed);
      _applyOverflow(gWrap);
      sec.appendChild(gWrap);
      return sec;
    };

    for(let i=0;i<rowCount;i++){
      const row=document.createElement('div');
      row.style.cssText='display:flex;flex-direction:row;align-items:stretch;gap:0;margin-bottom:20px;overflow:visible;';

      const cellL=document.createElement('div');
      cellL.style.cssText='padding-right:24px;flex-shrink:0;min-width:max-content;overflow:visible;';
      if(lGroups[i]) cellL.appendChild(mkPdfSection(lGroups[i], false));
      row.appendChild(cellL);

      const sp=document.createElement('div');
      sp.style.cssText='flex:1;min-width:24px;';
      row.appendChild(sp);

      const cellR=document.createElement('div');
      cellR.style.cssText='padding-left:24px;flex-shrink:0;min-width:max-content;overflow:visible;display:flex;flex-direction:column;align-items:flex-end;';
      if(rGroups[i]) cellR.appendChild(mkPdfSection(rGroups[i], true));
      row.appendChild(cellR);

      outerWrap.appendChild(row);
    }

    preview.appendChild(outerWrap);
  } else {
    // A/B/C/E형: 그룹별 세로 배치
    const outerWrap=document.createElement('div');
    outerWrap.style.cssText='overflow:visible;';
    groups.forEach((g,gi)=>{
      const shortLabel=g.label.split('/').map(s=>s.trim()).join(' · ');
      const section=document.createElement('div');
      section.style.cssText=`margin-bottom:24px;padding-bottom:24px;overflow:visible;${gi<groups.length-1?'border-bottom:1px solid var(--border);':''}`;
      const title=document.createElement('div');
      title.style.cssText='font-size:10px;color:#555;font-family:"Share Tech Mono",monospace;letter-spacing:1px;margin-bottom:6px;';
      title.textContent=shortLabel;
      section.appendChild(title);
      const bracketWrap=document.createElement('div');
      bracketWrap.style.cssText='overflow:visible;';
      const taggedMatches=g.matches.map((round,ri)=>round.map((m,mi)=>({...m,_groupObj:g,_origMi:mi,_origRi:ri,_groupLabel:shortLabel,_seqMi:(g._roundOffset&&g._roundOffset[ri]!=null?g._roundOffset[ri]:0)+mi})));
      S.matches=taggedMatches;
      const fns={A:renderBracketA,B:renderBracketB,C:renderBracketC,E:renderBracketE};
      (fns[_bracketLayout]||renderBracketA)(bracketWrap);
      _applyOverflow(bracketWrap);
      section.appendChild(bracketWrap);
      outerWrap.appendChild(section);
    });
    preview.appendChild(outerWrap);
  }
  S.matches=saved;
}

// ── 전체 PDF: 미리보기 창 직접 열기 (step3 화면과 동일) ──
function printAll(){
  _openFullPreviewWindow();
}

// ── 선택 PDF ──
function printSelected(){
  const sel=_getSelectedGroups();
  if(!sel.length){ toast('체급을 하나 이상 선택해주세요','error'); return; }
  if(!S.groupBrackets?.length){ toast('대진표를 먼저 만들어주세요','error'); return; }

  const win=window.open('','_blank','width=1200,height=900');
  if(!win){ toast('팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요','error'); return; }

  /* 팝업의 toggleNames가 전체 그룹 대신 선택 그룹만 재렌더하도록 저장 */
  window._popupSelectedGroups = sel;

  /* _renderPdfPreview는 #pdf-preview에만 렌더하므로,
     임시 요소에 pdf-preview ID를 달아 선택 그룹만 렌더링 후 원상복구 */
  const realPreview=document.getElementById('pdf-preview');
  const tempPreview=document.createElement('div');
  tempPreview.id='pdf-preview';
  tempPreview.style.cssText='position:fixed;left:-9999px;top:0;visibility:hidden;width:1200px;';
  document.body.appendChild(tempPreview);
  if(realPreview) realPreview.id='pdf-preview-bak';

  _renderPdfPreview(sel);  /* tempPreview에 선택 그룹만 렌더 (경기장 레이아웃 포함) */

  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    tempPreview.querySelectorAll('*').forEach(el=>{
      el.style.overflow='visible';el.style.overflowX='visible';el.style.overflowY='visible';
    });
    tempPreview.querySelectorAll('svg').forEach(s=>{
      s.setAttribute('overflow','visible');s.style.overflow='visible';
    });
    const rawHTML=tempPreview.innerHTML;

    /* ID 복원 */
    tempPreview.remove();
    if(realPreview) realPreview.id='pdf-preview';

    _writeFullPreviewWin(win, rawHTML, '선택 대진표 미리보기');
    win.addEventListener('beforeunload', ()=>{ window._popupSelectedGroups=null; });
  }));
}

// ── 전체 PDF 미리보기 창 ──
// step4 전체보기(pdf-preview, 모든 그룹)와 동일하게 보여줌
function _openFullPreviewWindow(){
  if(!S.groupBrackets?.length){
    toast('대진표를 먼저 만들어주세요','error'); return;
  }

  // 이름 포함 상태로 전체 렌더
  const savedHide=window._hideNames;
  window._hideNames=false;
  _renderPdfPreview(S.groupBrackets);
  window._hideNames=savedHide;

  // pdf-preview 복사 + overflow 강제(연결선 표시용)
  // requestAnimationFrame 2회 대기 → 연결선 SVG 렌더 완료 후 복사
  const win=window.open('','_blank','width=1200,height=900');
  if(!win){ toast('팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요','error'); return; }

  // 연결선 SVG는 rAF 2회 후 생성되므로 대기
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const previewEl=document.getElementById('pdf-preview');
    if(!previewEl){ toast('미리보기 생성 실패','error'); win.close(); return; }
    const clone=previewEl.cloneNode(true);
    clone.querySelectorAll('*').forEach(el=>{
      el.style.overflow='visible';
      el.style.overflowX='visible';
      el.style.overflowY='visible';
    });
    clone.querySelectorAll('svg').forEach(s=>{
      s.setAttribute('overflow','visible');
      s.style.overflow='visible';
    });
    const rawHTML=clone.innerHTML;
    _writeFullPreviewWin(win, rawHTML);
  }));
}

function _writeFullPreviewWin(win, rawHTML, winTitle){
  winTitle=winTitle||'전체 대진표 미리보기';
  const html=`<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">
<title>${winTitle}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Share+Tech+Mono&family=Bebas+Neue&family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#08080f;--bg2:#0f0f1a;--card:#13131f;--card2:#1a1a2a;
  --border:#2a2a40;--border2:#3a3a55;
  --red:#e63946;--accent:#4cc9f0;--green:#06d6a0;--yellow:#ffd60a;
  --text:#f0f0f8;--text2:#9090b0;--text3:#5a5a7a;
}
html{overflow:auto;min-height:100vh;}
body{background:var(--bg);color:var(--text);font-family:'Noto Sans KR',sans-serif;min-height:100vh;min-width:max-content;transition:background .25s,color .25s;}

/* ── 다크모드 대진표 선명도 강화 ── */
body:not(.white-mode) div[style*="border:1px solid #1"]{border-color:#ffffff !important;border-width:2px !important;}
body:not(.white-mode) div[style*="border:1px solid #2"]{border-color:#ffffff !important;border-width:2px !important;}
body:not(.white-mode) div[style*="border:1.5px solid #"]{border-color:#ffffff !important;border-width:2px !important;}
body:not(.white-mode) div[style*="border:2px solid #4"]{border-color:#ffffff !important;}
body:not(.white-mode) rect[stroke="#1a1a28"],body:not(.white-mode) rect[stroke="#1e1e30"],body:not(.white-mode) rect[stroke="#2a2a50"]{stroke:#ffffff !important;stroke-width:2 !important;}
body:not(.white-mode) rect[stroke="#444"]{stroke:#555555 !important;stroke-width:2 !important;}
body:not(.white-mode) path[stroke="#2a2a50"],body:not(.white-mode) path[stroke="#1e1e30"]{stroke:#ffffff !important;stroke-width:2 !important;}
body:not(.white-mode) line[stroke="#1e1e30"],body:not(.white-mode) line[stroke="#2a2a50"]{stroke:#ffffff !important;stroke-width:2 !important;}
body:not(.white-mode) [style*="color:#555"]{color:#ffffff !important;font-size:10px !important;font-weight:700 !important;}
body:not(.white-mode) [style*="color:#444"]{color:#aaaaaa !important;font-size:10px !important;}
body:not(.white-mode) [style*="color:#333"]{color:#aaaaaa !important;}
body:not(.white-mode) text[fill="#444"]{fill:#aaaaaa !important;font-size:10px !important;}
body:not(.white-mode) text[fill="#555"]{fill:#ffffff !important;}
body:not(.white-mode) text[fill="#2a2a3e"]{fill:#ffffff !important;}

/* ── 화이트 모드 ── */
body.white-mode{background:#f4f4f4 !important;color:#111 !important;}
body.white-mode .toolbar{background:#fff !important;border-bottom:1px solid #ddd !important;}
body.white-mode .toggle-wrap{background:#f0f0f0 !important;border-color:#ccc !important;}
body.white-mode .toggle-wrap span{color:#333 !important;}
body.white-mode .preview-wrap{background:#f4f4f4;}
/* 대진표 박스 화이트 */
body.white-mode #bracket-display div[style]{background:#fff !important;border-color:#999 !important;color:#111 !important;}
body.white-mode #bracket-display span{color:#111 !important;}
body.white-mode #bracket-display rect{fill:#fff !important;stroke:#999 !important;}
body.white-mode #bracket-display path,body.white-mode #bracket-display line{stroke:#888 !important;}
body.white-mode #bracket-display text{fill:#111 !important;}
/* VS 빨강 유지 */
body.white-mode #bracket-display [style*="color:#e63946"],
body.white-mode #bracket-display [style*="color: #e63946"]{color:#e63946 !important;}
body.white-mode #bracket-display text[fill="#e63946"]{fill:#e63946 !important;}

/* ── 툴바 ── */
.toolbar{position:fixed;top:0;left:0;right:0;background:var(--bg2);border-bottom:1px solid var(--border);z-index:999;display:flex;flex-direction:column;}
.toolbar-row1{display:flex;align-items:center;gap:8px;padding:8px 18px;flex-wrap:wrap;}
.toolbar-row2{display:flex;align-items:center;gap:7px;padding:5px 18px 5px;flex-wrap:wrap;border-top:1px solid var(--border);}
.toolbar-row3{display:flex;align-items:center;gap:7px;padding:4px 18px 7px;flex-wrap:wrap;}
.info-chip{display:flex;align-items:center;gap:5px;padding:4px 11px;border-radius:16px;cursor:pointer;font-size:11px;font-weight:600;border:1px solid var(--border2);background:var(--card);color:var(--text2);transition:all .15s;user-select:none;white-space:nowrap;}
.info-chip.on{border-color:#e63946;background:rgba(230,57,70,.15);color:#f0f0f8;}
.info-chip input{accent-color:#e63946;width:12px;height:12px;cursor:pointer;flex-shrink:0;}
.toolbar button{padding:7px 16px;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif;}
.btn-print{background:#e63946;color:#fff;}
.btn-close{background:rgba(255,255,255,.08);border:1px solid #3a3a55;color:#9090b0;}
.toggle-wrap{display:flex;align-items:center;gap:7px;padding:5px 13px;background:var(--card);border:1px solid var(--border2);border-radius:8px;cursor:pointer;user-select:none;}
.toggle-wrap input{width:14px;height:14px;cursor:pointer;}
.toggle-wrap span{font-size:12px;font-weight:600;color:var(--text2);}
#chk-show-names{accent-color:#06d6a0;}
#chk-white-mode{accent-color:#4cc9f0;}
#chk-page-guide{accent-color:#4cc9f0;}
#btn-hide-names{background:transparent !important;border:1px solid var(--border2) !important;color:var(--text3) !important;}
#btn-hide-names.active{background:rgba(76,201,240,.12) !important;border-color:var(--accent) !important;color:var(--accent) !important;}

/* ── 미리보기 ── */
.preview-wrap{padding:165px 24px 60px;overflow:visible;min-height:100vh;width:max-content;min-width:100%;box-sizing:border-box;position:relative;}

/* 연결선 포함 overflow 강제 */
#bracket-display{overflow:visible !important;min-height:200px;position:relative;width:max-content;}
#bracket-display *{overflow:visible !important;font-family:'Noto Sans KR',sans-serif;}
#bracket-display svg{overflow:visible !important;}
/* 정보표시 헤더는 화이트모드 오버라이드에서 제외 */
#bracket-display #pdf-info-header,
#bracket-display #pdf-info-header *,
body.white-mode #bracket-display #pdf-info-header div[style],
body.white-mode #bracket-display #pdf-info-header span{
  background:unset !important;border-color:unset !important;color:unset !important;
}

/* ── A4 페이지 나누기 가이드 ── */
.page-guide-line{
  position:absolute;left:0;right:0;
  border-top:2px dashed rgba(76,201,240,0.7);
  pointer-events:none;z-index:50;
  display:none;
}
.page-guide-line.visible{display:block;}
.page-guide-line::after{
  content:attr(data-label);
  position:absolute;right:10px;top:-16px;
  font-size:9px;color:#4cc9f0;background:rgba(8,8,15,.85);
  padding:1px 6px;border-radius:3px;
  font-family:'Share Tech Mono',monospace;white-space:nowrap;
}
body.white-mode .page-guide-line{border-top-color:rgba(0,100,220,0.6);}
body.white-mode .page-guide-line::after{color:#0064dc;background:rgba(240,240,240,.9);}

@media print{
  html,body{background:white;}
  body.white-mode{background:#fff !important;}
  .toolbar{display:none !important;}
  .preview-wrap{padding:0;}
  #bracket-display,#bracket-display *{overflow:visible !important;}
  .page-guide-line{display:none !important;}
  .a4g{display:none !important;}
  #a4-badge{display:none !important;}
  /* ── 격자 기반 인쇄 모드: 미리보기 숨기고 슬라이스 이미지만 출력 ── */
  body._grid_printing > *:not(#_grid_print_wrap){ display:none !important; }
  #_grid_print_wrap{ display:block !important; margin:0 !important; padding:0 !important; }
  #_grid_print_wrap > div{
    page-break-after:always; break-after:page;
    page-break-inside:avoid; break-inside:avoid;
    margin:0 !important; padding:0 !important;
  }
  #_grid_print_wrap > div:last-child{ page-break-after:auto; break-after:auto; }
}
</style>
</head>
<body class="white-mode">
<div class="toolbar">
  <!-- 1행 -->
  <div class="toolbar-row1">
    <button class="btn-print" id="btn-print-main" onclick="_printFromGrid()">🖨️ 인쇄</button><button id="btn-pdf-save" class="btn-print" onclick="savePDF()" style="background:#06d6a0;color:#08080f;margin-left:6px;">💾 PDF 저장</button><span id="pdf-save-status" style="font-size:11px;color:#06d6a0;font-family:'Share Tech Mono',monospace;display:none;margin-left:8px;"></span>
    <button class="btn-close" onclick="window.close()">✕ 닫기</button>
    <button id="btn-hide-names" onclick="toggleNames()" style="padding:5px 16px;background:transparent;border:1px solid var(--border2);color:var(--text3);border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;">👁 이름 가리기</button>
    <div class="toggle-wrap" style="gap:4px;padding:5px 10px;">
      <span style="font-size:11px;color:var(--text3);margin-right:4px;">모드:</span>
      <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
        <input type="radio" name="theme-mode" value="white" checked onchange="toggleWhite(true)" style="accent-color:#4cc9f0;width:13px;height:13px;cursor:pointer;">
        <span style="font-size:12px;font-weight:600;color:var(--text2);">⬜ 화이트</span>
      </label>
      <span style="width:1px;height:14px;background:var(--border2);margin:0 4px;display:inline-block;"></span>
      <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
        <input type="radio" name="theme-mode" value="dark" onchange="toggleWhite(false)" style="accent-color:#4cc9f0;width:13px;height:13px;cursor:pointer;">
        <span style="font-size:12px;font-weight:600;color:var(--text2);">⬛ 다크</span>
      </label>
    </div>
  </div><!-- /toolbar-row1 -->
  <!-- 2행: A4 용지 배치 + 줌 -->
  <div class="toolbar-row2">
    <label class="toggle-wrap">
      <input type="checkbox" id="chk-a4" style="accent-color:#4cc9f0;width:14px;height:14px;cursor:pointer;">
      <span style="font-size:12px;font-weight:600;color:var(--text2);">🗂 A4 용지 배치</span>
    </label>
    <span style="width:1px;height:14px;background:var(--border2);margin:0 4px;flex-shrink:0;"></span>
  <div id="a4-ctrl" style="display:none;align-items:center;gap:6px;padding:5px 12px;background:var(--card);border:1px solid var(--border2);border-radius:8px;flex-wrap:wrap;">
    <span style="font-size:10px;color:var(--text3);">용지:</span>
    <select id="a4-paper" onchange="_a4PaperChange()" style="font-size:11px;padding:2px 4px;border-radius:4px;border:1px solid var(--border2);background:var(--card2);color:var(--text2);cursor:pointer;font-family:'Noto Sans KR',sans-serif;">
      <optgroup label="A 시리즈">
        <option value="A0">A0 (841×1189mm)</option>
        <option value="A1">A1 (594×841mm)</option>
        <option value="A2">A2 (420×594mm)</option>
        <option value="A3">A3 (297×420mm)</option>
        <option value="A4" selected>A4 (210×297mm)</option>
        <option value="A5">A5 (148×210mm)</option>
      </optgroup>
      <optgroup label="B 시리즈">
        <option value="B0">B0 (1000×1414mm)</option>
        <option value="B1">B1 (707×1000mm)</option>
        <option value="B2">B2 (500×707mm)</option>
        <option value="B3">B3 (353×500mm)</option>
        <option value="B4">B4 (250×353mm)</option>
        <option value="B5">B5 (176×250mm)</option>
      </optgroup>
      <optgroup label="기타">
        <option value="Letter">Letter (216×279mm)</option>
        <option value="Legal">Legal (216×356mm)</option>
        <option value="Tabloid">Tabloid/A3+ (279×432mm)</option>
      </optgroup>
      <optgroup label="현수막">
        <option value="banner_3x1">현수막 3×1m</option>
        <option value="banner_6x1">현수막 6×1m</option>
        <option value="banner_9x1">현수막 9×1m</option>
      </optgroup>
      <option value="custom">사용자 지정...</option>
    </select>
    <!-- 사용자 지정 입력 -->
    <span id="a4-custom-area" style="display:none;align-items:center;gap:3px;">
      <input id="a4-cw" type="number" min="10" max="99999" value="210" style="width:55px;font-size:11px;padding:2px 4px;border-radius:4px;border:1px solid var(--border2);background:var(--card2);color:var(--text2);text-align:center;" onchange="_a4PaperChange()">
      <span style="font-size:10px;color:var(--text3);">×</span>
      <input id="a4-ch" type="number" min="10" max="99999" value="297" style="width:55px;font-size:11px;padding:2px 4px;border-radius:4px;border:1px solid var(--border2);background:var(--card2);color:var(--text2);text-align:center;" onchange="_a4PaperChange()">
      <span style="font-size:10px;color:var(--text3);">mm</span>
    </span>
    <label style="display:flex;align-items:center;gap:3px;cursor:pointer;font-size:11px;color:var(--text2);">
      <input type="radio" id="a4-portrait" name="a4-orient" checked style="accent-color:#4cc9f0;width:12px;height:12px;cursor:pointer;"> 세로
    </label>
    <label style="display:flex;align-items:center;gap:3px;cursor:pointer;font-size:11px;color:var(--text2);">
      <input type="radio" id="a4-landscape" name="a4-orient" style="accent-color:#4cc9f0;width:12px;height:12px;cursor:pointer;"> 가로
    </label>
    <span style="width:1px;height:14px;background:var(--border2);margin:0 2px;"></span>
    <span style="font-size:10px;color:var(--text3);">가로</span>
    <button id="a4-cm" style="width:22px;height:22px;border-radius:4px;border:1px solid var(--border2);background:rgba(255,255,255,.07);color:#9090b0;font-size:15px;font-weight:700;cursor:pointer;line-height:1;padding:0;">−</button>
    <input id="a4-cols" type="number" min="1" max="20" value="1" style="width:36px;font-size:13px;font-weight:700;color:#4cc9f0;font-family:'Share Tech Mono',monospace;text-align:center;background:rgba(76,201,240,.08);border:1px solid rgba(76,201,240,.3);border-radius:4px;padding:1px 2px;outline:none;-moz-appearance:textfield;">
    <button id="a4-cp" style="width:22px;height:22px;border-radius:4px;border:1px solid var(--border2);background:rgba(255,255,255,.07);color:#9090b0;font-size:15px;font-weight:700;cursor:pointer;line-height:1;padding:0;">+</button>
    <span style="font-size:11px;color:var(--text3);">장</span>
    <span style="font-size:12px;color:var(--text3);margin:0 2px;">×</span>
    <span style="font-size:10px;color:var(--text3);">세로</span>
    <button id="a4-rm" style="width:22px;height:22px;border-radius:4px;border:1px solid var(--border2);background:rgba(255,255,255,.07);color:#9090b0;font-size:15px;font-weight:700;cursor:pointer;line-height:1;padding:0;">−</button>
    <input id="a4-rows" type="number" min="1" max="50" value="1" style="width:36px;font-size:13px;font-weight:700;color:#4cc9f0;font-family:'Share Tech Mono',monospace;text-align:center;background:rgba(76,201,240,.08);border:1px solid rgba(76,201,240,.3);border-radius:4px;padding:1px 2px;outline:none;-moz-appearance:textfield;">
    <button id="a4-rp" style="width:22px;height:22px;border-radius:4px;border:1px solid var(--border2);background:rgba(255,255,255,.07);color:#9090b0;font-size:15px;font-weight:700;cursor:pointer;line-height:1;padding:0;">+</button>
    <span style="font-size:11px;color:var(--text3);">장</span>
    <span style="width:1px;height:14px;background:var(--border2);margin:0 2px;"></span>
    <label style="display:flex;align-items:center;gap:3px;cursor:pointer;font-size:11px;color:var(--text2);" title="비율 유지하면서 설정한 가로 용지 수 너비에 맞게 대진표 크기를 조정합니다">
      <input type="checkbox" id="a4-fit-w" style="accent-color:#4cc9f0;width:12px;height:12px;cursor:pointer;"> 좌우맞추기
    </label>
    <label style="display:flex;align-items:center;gap:3px;cursor:pointer;font-size:11px;color:var(--text2);" title="비율 유지하면서 설정한 세로 용지 수 높이에 맞게 대진표 크기를 조정합니다">
      <input type="checkbox" id="a4-fit-h" style="accent-color:#4cc9f0;width:12px;height:12px;cursor:pointer;"> 위아래맞추기
    </label>
    <label style="display:flex;align-items:center;gap:3px;cursor:pointer;font-size:11px;color:var(--text2);" title="용지 테두리 기준으로 대진표를 좌우 가운데 정렬합니다">
      <input type="checkbox" id="a4-fit-cx" style="accent-color:#4cc9f0;width:12px;height:12px;cursor:pointer;"> 가운데정렬
    </label>
    <span id="a4-pct" style="font-size:10px;color:var(--text3);font-family:'Share Tech Mono',monospace;margin-left:4px;"></span>
    <button id="a4-help" title="용지 배치 도움말" style="width:20px;height:20px;border-radius:50%;border:1px solid var(--border2);background:rgba(255,255,255,.07);color:#9090b0;font-size:11px;font-weight:700;cursor:pointer;line-height:1;padding:0;">?</button>
  </div>
  <!-- 줌 컨트롤 -->
  <div id="zoom-ctrl" style="display:flex;align-items:center;gap:4px;padding:5px 12px;background:var(--card);border:1px solid var(--border2);border-radius:8px;">
    <span style="font-size:10px;color:var(--text3);margin-right:2px;">🔍 보기:</span>
    <button onclick="_zoomStep(-0.05)" title="-5%" style="width:22px;height:22px;border-radius:4px;border:1px solid var(--border2);background:rgba(255,255,255,.07);color:#9090b0;font-size:15px;font-weight:700;cursor:pointer;line-height:1;padding:0;">−</button>
    <span id="zoom-pct-display" style="font-size:12px;font-weight:700;color:#4cc9f0;font-family:'Share Tech Mono',monospace;min-width:42px;text-align:center;">100%</span>
    <button onclick="_zoomStep(+0.05)" title="+5%" style="width:22px;height:22px;border-radius:4px;border:1px solid var(--border2);background:rgba(255,255,255,.07);color:#9090b0;font-size:15px;font-weight:700;cursor:pointer;line-height:1;padding:0;">+</button>
    <span style="width:1px;height:14px;background:var(--border2);margin:0 2px;flex-shrink:0;"></span>
    <button class="zoom-btn" data-zoom="0.5"  onclick="_zoomSet(0.5)"  style="padding:2px 7px;border-radius:4px;border:1px solid var(--border2);background:transparent;color:var(--text3);font-size:11px;font-weight:700;cursor:pointer;">50%</button>
    <button class="zoom-btn" data-zoom="0.75" onclick="_zoomSet(0.75)" style="padding:2px 7px;border-radius:4px;border:1px solid var(--border2);background:transparent;color:var(--text3);font-size:11px;font-weight:700;cursor:pointer;">75%</button>
    <button class="zoom-btn" data-zoom="1"    onclick="_zoomSet(1)"    style="padding:2px 7px;border-radius:4px;border:1px solid var(--border2);background:rgba(76,201,240,.15);color:#4cc9f0;font-size:11px;font-weight:700;cursor:pointer;border-color:#4cc9f0;">100%</button>
    <button class="zoom-btn" data-zoom="1.5"  onclick="_zoomSet(1.5)"  style="padding:2px 7px;border-radius:4px;border:1px solid var(--border2);background:transparent;color:var(--text3);font-size:11px;font-weight:700;cursor:pointer;">150%</button>
    <button class="zoom-btn" data-zoom="2"    onclick="_zoomSet(2)"    style="padding:2px 7px;border-radius:4px;border:1px solid var(--border2);background:transparent;color:var(--text3);font-size:11px;font-weight:700;cursor:pointer;">200%</button>
    <button id="zoom-fit-btn" onclick="_zoomSet(null)" style="padding:2px 7px;border-radius:4px;border:1px solid var(--border2);background:transparent;color:var(--text3);font-size:11px;cursor:pointer;" title="창 너비에 맞게 자동 조정">맞춤</button>
  </div>
  </div><!-- /toolbar-row2 -->
  <!-- 3행: 정보표시 체크박스 -->
  <div class="toolbar-row3">
    <span style="font-size:10px;color:var(--text3);font-weight:700;letter-spacing:1px;white-space:nowrap;font-family:'Share Tech Mono',monospace;">📋 정보표시:</span>
    <div id="info-hdr-chips" style="display:flex;gap:6px;flex-wrap:wrap;"></div>
  </div><!-- /toolbar-row3 -->
  <div id="a4-help-box" style="display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;background:#13131f;border:1px solid #3a3a55;border-radius:12px;padding:20px 24px;max-width:360px;font-size:12px;color:#9090b0;line-height:1.8;box-shadow:0 8px 32px rgba(0,0,0,.6);">
    <div style="font-size:14px;font-weight:700;color:#f0f0f8;margin-bottom:10px;">🗂 A4 용지 배치 도움말</div>
    <b style="color:#4cc9f0;">용지 방향</b> — 세로/가로 선택<br>
    <b style="color:#4cc9f0;">가로 N장 × 세로 N장</b> — 출력할 용지 수 설정<br>
    <b style="color:#4cc9f0;">좌우맞추기</b> — 비율 유지하면서 설정한 가로 용지 총 너비에 맞게 대진표를 축소/확대. 남거나 넘치는 세로를 보고 세로 장 수를 조절하세요.<br>
    <b style="color:#4cc9f0;">위아래맞추기</b> — 비율 유지하면서 설정한 세로 용지 총 높이에 맞게 축소/확대. 남거나 넘치는 가로를 보고 가로 장 수를 조절하세요.<br>
    <b style="color:#4cc9f0;">가운데정렬</b> — 축소/확대 후 남은 공간 기준으로 A4 용지 너비 안에서 좌우 가운데 배치합니다.<br>
    <b style="color:#4cc9f0;">둘 다 체크</b> — 가로/세로 모두 딱 맞게 (비율 변경될 수 있음)<br>
    <div style="margin-top:12px;text-align:right;"><button onclick="document.getElementById('a4-help-box').style.display='none'" style="padding:4px 14px;border-radius:6px;border:1px solid #3a3a55;background:rgba(255,255,255,.08);color:#9090b0;cursor:pointer;font-size:12px;">닫기</button></div>
  </div>
</div>
<div class="preview-wrap" id="preview-wrap">
  <div id="zoom-wrap" style="transform-origin:top left;display:inline-block;">
    <div style="position:relative;" id="a4-stage">
      <div id="a4-scale-wrap" style="transform-origin:top left;">
        <div id="bracket-display">${rawHTML}</div>
      </div>
    </div>
  </div>
</div>
<script>
function toggleNames(){
  const btn=document.getElementById('btn-hide-names');
  const hiding=btn.textContent.indexOf('가리기')!==-1;
  btn.textContent=hiding?'👁 이름 보이기':'👁 이름 가리기';
  btn.classList.toggle('active',hiding);
  const p=window.opener;
  const savedHide=p.window._hideNames;
  p.window._hideNames=hiding;
  /* 선택 PDF 팝업이면 선택된 그룹만, 전체이면 전체 그룹 재렌더 */
  const groups=p.window._popupSelectedGroups || p.S.groupBrackets;
  p._renderPdfPreview(groups);
  p.requestAnimationFrame(()=>p.requestAnimationFrame(()=>{
    const src=p.document.getElementById('pdf-preview');
    const dst=document.getElementById('bracket-display');
    if(src&&dst){
      const clone=src.cloneNode(true);
      clone.querySelectorAll('*').forEach(el=>{el.style.overflow='visible';el.style.overflowX='visible';el.style.overflowY='visible';});
      clone.querySelectorAll('svg').forEach(s=>{s.setAttribute('overflow','visible');s.style.overflow='visible';});
      dst.innerHTML=clone.innerHTML;
      if(typeof _renderInfoHeader==='function') _renderInfoHeader();
    }
    p.window._hideNames=savedHide;
    p._renderPdfPreview(p.window._popupSelectedGroups || p.S.groupBrackets);
  }));
}

function toggleWhite(on){
  // 라디오 버튼이므로 별도 라벨 업데이트 불필요
  document.body.classList.toggle('white-mode',on);
  if(typeof _renderInfoHeader==='function') _renderInfoHeader();
}

/* ── @page 자동 방향 적용 ── */
function _applyPageCSS(){
  var existing=document.getElementById('_page_rule_style');
  if(existing) existing.remove();
  var st=document.createElement('style');
  st.id='_page_rule_style';
  /* 정확한 mm 수치로 지정 — 브라우저별 용지명 해석 차이 방지 */
  var paper=_getPaperSize();
  var wMM=(paper.w/(96/25.4)).toFixed(2);
  var hMM=(paper.h/(96/25.4)).toFixed(2);
  st.textContent='@page{size:'+wMM+'mm '+hMM+'mm;margin:0;}';
  document.head.appendChild(st);
}

/* ── A4 페이지 나누기 가이드 ── */
// A4 = 297mm × 210mm. 세로 출력 기준 인쇄 가능 높이 ≒ 277mm (여백 20mm)
// CSS 1px = 1/96 인치 = 25.4/96 mm → 1mm = 96/25.4 px ≈ 3.7795px
var _guideOn=false;
function togglePageGuide(on){
  _guideOn=on;
  document.querySelectorAll('.page-guide-line').forEach(el=>el.classList.toggle('visible',on));
  if(on && document.querySelectorAll('.page-guide-line').length===0) buildPageGuides();
}

function buildPageGuides(){
  const wrap=document.getElementById('preview-wrap');
  const display=document.getElementById('bracket-display');
  const totalH=display.scrollHeight;
  const PX_PER_MM=96/25.4;
  const A4_H_MM=277; // 인쇄 가능 높이 (여백 제외)
  const A4_H_PX=A4_H_MM*PX_PER_MM;
  const pages=Math.ceil(totalH/A4_H_PX);
  // 기존 가이드 제거
  wrap.querySelectorAll('.page-guide-line').forEach(e=>e.remove());
  for(let i=1;i<pages;i++){
    const guide=document.createElement('div');
    guide.className='page-guide-line'+((_guideOn)?' visible':'');
    // preview-wrap의 padding-top(165px) 포함
    guide.style.top=(165+i*A4_H_PX)+'px';
    guide.dataset.label='P'+i+' ↓  P'+(i+1)+' ↑';
    wrap.appendChild(guide);
  }
  // 페이지 수 표시
  const cnt=document.createElement('div');
  cnt.style.cssText='position:fixed;bottom:10px;right:14px;font-size:10px;color:#4cc9f0;font-family:Share Tech Mono,monospace;background:rgba(8,8,15,.8);padding:3px 8px;border-radius:4px;z-index:999;';
  cnt.id='page-count-badge';
  cnt.textContent='총 '+pages+'페이지';
  document.body.appendChild(cnt);
}

window.addEventListener('load',function(){
  // 클릭 제거 (대진표 내부만 — 툴바 버튼 제외)
  const _bd=document.getElementById('bracket-display');
  if(_bd) _bd.querySelectorAll('[onclick],[data-match-id]').forEach(el=>{
    el.removeAttribute('onclick');el.style.cursor='default';el.style.pointerEvents='none';
  });
  // 페이지 가이드 초기 빌드
  buildPageGuides();
  // A4 버튼 등록
  _a4Init();
  // A4 용지 배치 기본 ON — 레이아웃 완료 후 실행
  setTimeout(function(){
    const chkA4=document.getElementById('chk-a4');
    const rLand=document.getElementById('a4-landscape');
    if(rLand){ rLand.checked=true; _a4Orient='landscape'; }
    _a4C=2; _a4R=14; _a4SyncD();
    _applyPageCSS();  /* 초기 @page 방향 적용 */
    if(chkA4){ chkA4.checked=true; _a4Toggle(true); }
  }, 300);
  // 정보표시 칩 초기화
  _initInfoChips();
});

/* ── A4 용지 배치 격자 ── */
var _a4On=false,_a4Orient='portrait',_a4C=1,_a4R=1,_a4Scale=1,_a4W=0,_a4H=0;
var _zoomLevel=1;

/* 용지 크기 테이블 (인쇄 가능 영역, mm 기준 → px 변환: 96dpi) */
const _MM=96/25.4;
const _PAPER_SIZES={
  /* A 시리즈 */
  A0:{w:Math.round(841*_MM),  h:Math.round(1189*_MM)},
  A1:{w:Math.round(594*_MM),  h:Math.round(841*_MM)},
  A2:{w:Math.round(420*_MM),  h:Math.round(594*_MM)},
  A3:{w:Math.round(297*_MM),  h:Math.round(420*_MM)},
  A4:{w:Math.round(210*_MM),  h:Math.round(297*_MM)},
  A5:{w:Math.round(148*_MM),  h:Math.round(210*_MM)},
  /* B 시리즈 */
  B0:{w:Math.round(1000*_MM), h:Math.round(1414*_MM)},
  B1:{w:Math.round(707*_MM),  h:Math.round(1000*_MM)},
  B2:{w:Math.round(500*_MM),  h:Math.round(707*_MM)},
  B3:{w:Math.round(353*_MM),  h:Math.round(500*_MM)},
  B4:{w:Math.round(250*_MM),  h:Math.round(353*_MM)},
  B5:{w:Math.round(176*_MM),  h:Math.round(250*_MM)},
  /* 기타 */
  Letter: {w:Math.round(216*_MM), h:Math.round(279*_MM)},
  Legal:  {w:Math.round(216*_MM), h:Math.round(356*_MM)},
  Tabloid:{w:Math.round(279*_MM), h:Math.round(432*_MM)},
  /* 현수막 */
  banner_3x1:{w:Math.round(3000*_MM), h:Math.round(1000*_MM)},
  banner_6x1:{w:Math.round(6000*_MM), h:Math.round(1000*_MM)},
  banner_9x1:{w:Math.round(9000*_MM), h:Math.round(1000*_MM)},
};
var _paperKey='A4'; /* 현재 선택된 용지 */

/* 현재 용지의 가로/세로(방향 적용) 반환 */
function _getPaperSize(){
  let s=_PAPER_SIZES[_paperKey];
  if(!s){ /* 사용자 지정 */
    const cw=parseFloat(document.getElementById('a4-cw').value)||210;
    const ch=parseFloat(document.getElementById('a4-ch').value)||297;
    s={w:Math.round(cw*_MM), h:Math.round(ch*_MM)};
  }
  return _a4Orient==='portrait'
    ? {w:Math.min(s.w,s.h), h:Math.max(s.w,s.h)}
    : {w:Math.max(s.w,s.h), h:Math.min(s.w,s.h)};
}

/* 예전 _A4 참조 호환 (portrait/landscape 방향 직접 접근하는 곳 대비) */
const _A4={
  get portrait(){ return _getPaperSize(); },
  get landscape(){ return _getPaperSize(); }
};

function _a4PaperChange(){
  const sel=document.getElementById('a4-paper');
  _paperKey=sel?sel.value:'A4';
  const customArea=document.getElementById('a4-custom-area');
  if(customArea) customArea.style.display=(_paperKey==='custom')?'flex':'none';
  if(_a4On) _a4Draw();
}

function _a4Init(){
  document.getElementById('chk-a4').addEventListener('change',function(){ _a4Toggle(this.checked); });
  document.getElementById('a4-cm').addEventListener('click',function(){ if(!_a4On)return; _a4C=Math.max(1,_a4C-1); _a4SyncD(); _a4Draw(); });
  document.getElementById('a4-cp').addEventListener('click',function(){ if(!_a4On)return; _a4C=Math.min(20,_a4C+1); _a4SyncD(); _a4Draw(); });
  document.getElementById('a4-rm').addEventListener('click',function(){ if(!_a4On)return; _a4R=Math.max(1,_a4R-1); _a4SyncD(); _a4Draw(); });
  document.getElementById('a4-rp').addEventListener('click',function(){ if(!_a4On)return; _a4R=Math.min(50,_a4R+1); _a4SyncD(); _a4Draw(); });
  /* 직접 입력 이벤트 */
  (function(){
    var colsEl=document.getElementById('a4-cols');
    var rowsEl=document.getElementById('a4-rows');
    function applyColInput(){
      var v=parseInt(colsEl.value,10);
      if(isNaN(v)||v<1) v=1;
      if(v>20) v=20;
      _a4C=v; colsEl.value=v;
      if(_a4On){ _a4SyncD(); _a4Draw(); }
    }
    function applyRowInput(){
      var v=parseInt(rowsEl.value,10);
      if(isNaN(v)||v<1) v=1;
      if(v>50) v=50;
      _a4R=v; rowsEl.value=v;
      if(_a4On){ _a4SyncD(); _a4Draw(); }
    }
    colsEl.addEventListener('change', applyColInput);
    colsEl.addEventListener('keydown', function(e){ if(e.key==='Enter'){ applyColInput(); this.blur(); } });
    colsEl.addEventListener('blur', applyColInput);
    rowsEl.addEventListener('change', applyRowInput);
    rowsEl.addEventListener('keydown', function(e){ if(e.key==='Enter'){ applyRowInput(); this.blur(); } });
    rowsEl.addEventListener('blur', applyRowInput);
    /* 스핀 버튼(화살표 키) 숨기기 CSS */
    var sty=document.createElement('style');
    sty.textContent='#a4-cols::-webkit-inner-spin-button,#a4-cols::-webkit-outer-spin-button,#a4-rows::-webkit-inner-spin-button,#a4-rows::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}';
    document.head.appendChild(sty);
  })();
  document.getElementById('a4-portrait').addEventListener('change',function(){ if(this.checked&&_a4On){_a4Orient='portrait';_applyPageCSS();_a4AutoFit();_a4Draw();} });
  document.getElementById('a4-landscape').addEventListener('change',function(){ if(this.checked&&_a4On){_a4Orient='landscape';_applyPageCSS();_a4AutoFit();_a4Draw();} });
  document.getElementById('a4-fit-w').addEventListener('change',function(){ if(_a4On) _a4Draw(); });
  document.getElementById('a4-fit-h').addEventListener('change',function(){ if(_a4On) _a4Draw(); });
  document.getElementById('a4-fit-cx').addEventListener('change',function(){ if(_a4On) _a4Draw(); });
  document.getElementById('a4-help').addEventListener('click',function(){
    const box=document.getElementById('a4-help-box');
    box.style.display=box.style.display==='none'?'block':'none';
  });
}

function _a4Toggle(on){
  _a4On=on;
  document.getElementById('a4-ctrl').style.display=on?'flex':'none';
  if(on){ _a4Measure(); _a4AutoFit(); _a4Draw(); }
  else  { _a4Clear(); }
  /* 줌 상태는 zoom-wrap이 유지하므로 별도 복원 불필요 */
}

function _a4Measure(){
  const d=document.getElementById('bracket-display');
  const rect=d.getBoundingClientRect();
  _a4W=Math.max(d.scrollWidth, rect.width) || 800;
  _a4H=Math.max(d.scrollHeight, rect.height) || 600;
}

function _a4AutoFit(){
  _a4C=1;
  _a4R=1;
  _a4SyncD();
}

function _a4SyncD(){
  document.getElementById('a4-cols').value=_a4C;
  document.getElementById('a4-rows').value=_a4R;
}

function _a4Draw(){
  const stage=document.getElementById('a4-stage');
  const paper=_getPaperSize();
  const pw=paper.w, ph=paper.h;
  const fitW=document.getElementById('a4-fit-w').checked;
  const fitH=document.getElementById('a4-fit-h').checked;
  const fitCX=document.getElementById('a4-fit-cx').checked;
  const sx=(_a4C*pw)/_a4W;
  const sy=(_a4R*ph)/_a4H;
  if(fitW&&fitH){ _a4Scale=Math.min(sx,sy); }
  else if(fitW){ _a4Scale=sx; }
  else if(fitH){ _a4Scale=sy; }
  else { _a4Scale=1; }
  _a4Scale=Math.max(0.01,Math.min(_a4Scale,10));

  const gridW=_a4C*pw, gridH=_a4R*ph;
  const sw=document.getElementById('a4-scale-wrap');

  /* 실제 적용할 scale 결정 */
  let applyScale = _a4Scale;
  let offsetX = 0;

  if(fitW||fitH){
    const scaledW=_a4W*_a4Scale;
    offsetX=(fitCX && scaledW<gridW) ? Math.round((gridW-scaledW)/2) : 0;
  } else {
    /* 맞추기 미체크: scale 없이 원본 크기 */
    applyScale = 1;
  }

  if(sw){
    sw.style.transform=applyScale===1?'':'scale('+applyScale+')';
    sw.style.transformOrigin='top left';
    sw.style.marginLeft=offsetX+'px';
  }

  const PAD=0, PADL=0;
  const scaledContentW = _a4W * applyScale;
  const scaledContentH = _a4H * applyScale;
  const stageW = Math.max(gridW, scaledContentW, offsetX + scaledContentW);
  const stageH = Math.max(gridH, scaledContentH);

  stage.style.position='relative';
  stage.style.width = stageW + 'px';
  stage.style.minHeight = stageH + 'px';
  stage.querySelectorAll('.a4g').forEach(e=>e.remove());

  const isW=document.body.classList.contains('white-mode');
  const lc=isW?'rgba(0,100,220,0.55)':'rgba(76,201,240,0.65)';
  const sc=isW?'rgba(0,100,220,0.4)':'rgba(76,201,240,0.45)';
  const bc=isW?'rgba(0,80,200,0.28)':'rgba(76,201,240,0.28)';
  for(let r=0;r<_a4R;r++){
    for(let c=0;c<_a4C;c++){
      const el=document.createElement('div');el.className='a4g';
      el.style.cssText='position:absolute;pointer-events:none;z-index:1;box-sizing:border-box;left:'+(PADL+c*pw)+'px;top:'+(PAD+r*ph)+'px;width:'+pw+'px;height:'+ph+'px;background:transparent;';
      stage.appendChild(el);
    }
  }
  for(let r=0;r<=_a4R;r++){
    const el=document.createElement('div');el.className='a4g';
    el.style.cssText='position:absolute;pointer-events:none;z-index:52;height:0;left:'+PADL+'px;width:'+gridW+'px;top:'+(PAD+r*ph)+'px;border-top:'+(r===0||r===_a4R?'2px solid '+sc:'2px dashed '+lc)+';';
    stage.appendChild(el);
  }
  for(let c=0;c<=_a4C;c++){
    const el=document.createElement('div');el.className='a4g';
    el.style.cssText='position:absolute;pointer-events:none;z-index:52;width:0;top:'+PAD+'px;left:'+(PADL+c*pw)+'px;height:'+gridH+'px;border-left:'+(c===0||c===_a4C?'2px solid '+sc:'2px dashed '+lc)+';';
    stage.appendChild(el);
  }
  let pn=1;
  for(let r=0;r<_a4R;r++){
    for(let c=0;c<_a4C;c++){
      const el=document.createElement('div');el.className='a4g';
      el.style.cssText='position:absolute;pointer-events:none;z-index:60;font-size:9px;font-family:"Share Tech Mono",monospace;letter-spacing:1px;color:'+bc+';left:'+(PADL+c*pw+5)+'px;top:'+(PAD+r*ph+5)+'px;';
      el.textContent='P'+(pn++);
      stage.appendChild(el);
    }
  }
  const pct=Math.round(applyScale*100);
  document.getElementById('a4-pct').textContent='('+pct+'%)';
  let badge=document.getElementById('a4-badge');
  if(!badge){ badge=document.createElement('div');badge.id='a4-badge';badge.style.cssText='position:fixed;bottom:10px;right:14px;font-size:11px;line-height:1.7;font-family:"Share Tech Mono",monospace;padding:6px 14px;border-radius:7px;z-index:9999;';document.body.appendChild(badge); }
  const paperName=(_paperKey==='custom')?'사용자지정':_paperKey;
  const ol=_a4Orient==='portrait'?'세로':'가로';
  badge.style.background=isW?'rgba(240,243,255,.96)':'rgba(8,8,15,.92)';
  badge.style.border=isW?'1px solid #b0c0e0':'1px solid #2a2a50';
  badge.innerHTML='<span style="color:'+(isW?'#0050c0':'#4cc9f0')+';">'+paperName+' '+ol+' '+_a4C+'×'+_a4R+'장</span><br>출력비율: <b style="color:'+(pct>=80?(isW?'#006600':'#06d6a0'):pct>=40?(isW?'#885500':'#ffd60a'):'#e63946')+';">'+pct+'%</b>';
  badge.style.display='';
}
function _a4Clear(){
  const sw=document.getElementById('a4-scale-wrap');
  if(sw){ sw.style.transform=''; sw.style.marginLeft=''; }
  const stage=document.getElementById('a4-stage');
  stage.style.minHeight='';
  stage.style.width='';
  stage.querySelectorAll('.a4g').forEach(e=>e.remove());
  document.getElementById('a4-pct').textContent='';
  const b=document.getElementById('a4-badge');if(b) b.style.display='none';
}

/* ── 정보표시 헤더 ── */
const _INFO_ITEMS=[
  {k:'eventname',l:'행사명'},
  {k:'subtitle', l:'부제목'},
  {k:'gamename', l:'종목명'},
  {k:'date',     l:'일시'},
  {k:'place',    l:'장소'},
  {k:'sponsor',  l:'후원'},
  {k:'slogan1',  l:'슬로건1'},
  {k:'slogan2',  l:'슬로건2'},
];
function _loadDispCfg(){
  try{ return JSON.parse(localStorage.getItem('sgp_display_config')||'{}'); }catch(e){ return {}; }
}
function _initInfoChips(){
  const cfg=_loadDispCfg();
  const di=cfg.displayItems||{eventname:true};
  const wrap=document.getElementById('info-hdr-chips');
  if(!wrap) return;
  wrap.innerHTML='';
  _INFO_ITEMS.forEach(function(item){
    const on=!!di[item.k];
    const chip=document.createElement('label');
    chip.className='info-chip'+(on?' on':'');
    const chk=document.createElement('input');
    chk.type='checkbox'; chk.checked=on;
    chk.style.cssText='accent-color:#e63946;width:11px;height:11px;cursor:pointer;';
    chk.addEventListener('change',function(){
      chip.classList.toggle('on', this.checked);
      _renderInfoHeader();
    });
    chip.appendChild(chk);
    chip.appendChild(document.createTextNode(item.l));
    wrap.appendChild(chip);
  });
  _renderInfoHeader();
}
function _getInfoChecked(){
  const wrap=document.getElementById('info-hdr-chips');
  if(!wrap) return {};
  const result={};
  wrap.querySelectorAll('label').forEach(function(chip,i){
    result[_INFO_ITEMS[i].k]=chip.querySelector('input').checked;
  });
  return result;
}
function _renderInfoHeader(){
  const cfg=_loadDispCfg();
  try{
    const bt=JSON.parse(localStorage.getItem('sgp_bracket_temp')||'{}');
    if(bt.settings){
      if(!cfg.date&&bt.settings.dt) cfg.date=bt.settings.dt;
      if(!cfg.place&&bt.settings.pl) cfg.place=bt.settings.pl;
    }
  }catch(e){}
  const valMap={
    eventname:cfg.eventName||'', subtitle:cfg.subtitle||'',
    gamename:cfg.gameLabel||'',  date:cfg.date||'',
    place:cfg.place||'',         sponsor:cfg.sponsor||'',
    slogan1:cfg.slogan1||'',     slogan2:cfg.slogan2||'',
  };
  const checked=_getInfoChecked();
  const existing=document.getElementById('pdf-info-header');
  if(existing) existing.remove();
  const anyChecked=_INFO_ITEMS.some(function(item){ return checked[item.k]; });
  if(!anyChecked) return;
  const isW=document.body.classList.contains('white-mode');
  const hdrBg=isW?'#ffffff':'#0f0f1a';
  const titleColor=isW?'#111111':'#f0f0f8';
  const metaColor=isW?'#333333':'#9090b0';
  const emptyColor=isW?'#bbbbbb':'#3a3a55';
  const sloganColor=isW?'#666666':'#5a5a7a';
  const ls='font-size:9px;font-weight:700;letter-spacing:1px;color:#e63946;font-family:"Share Tech Mono",monospace;margin-right:3px;';
  const en =checked.eventname ? (valMap.eventname||null)  : null;
  const sub=checked.subtitle  ? (valMap.subtitle ||null)  : null;
  const gl =checked.gamename  ? (valMap.gamename ||'—')   : null;
  const dt =checked.date      ? (valMap.date     ||'—')   : null;
  const pl =checked.place     ? (valMap.place    ||'—')   : null;
  const sp =checked.sponsor   ? (valMap.sponsor  ||'—')   : null;
  const s1 =checked.slogan1   ? (valMap.slogan1  ||'—')   : null;
  const s2 =checked.slogan2   ? (valMap.slogan2  ||'—')   : null;
  const hdr=document.createElement('div');
  hdr.id='pdf-info-header';
  hdr.style.cssText='min-width:max-content;width:100%;padding:16px 24px 13px;margin-bottom:8px;border-bottom:2px solid #e63946 !important;font-family:"Noto Sans KR",sans-serif !important;background:'+hdrBg+' !important;box-sizing:border-box;color:unset !important;';
  let inner='';
  if(en!==null)  inner+='<div style="font-size:20px;font-weight:700;color:'+(en?titleColor:emptyColor)+';letter-spacing:.3px;margin-bottom:3px;">'+(en||'—')+'</div>';
  if(sub!==null) inner+='<div style="font-size:12px;color:'+(sub?metaColor:emptyColor)+';margin-bottom:5px;">'+(sub||'—')+'</div>';
  const meta=[];
  if(gl!==null) meta.push('<span style="display:inline-flex;align-items:center;margin-right:14px;"><span style="'+ls+'">종목</span><span style="font-size:12px;color:'+(gl!=='—'?metaColor:emptyColor)+';">'+gl+'</span></span>');
  if(dt!==null) meta.push('<span style="display:inline-flex;align-items:center;margin-right:14px;"><span style="'+ls+'">일시</span><span style="font-size:12px;color:'+(dt!=='—'?metaColor:emptyColor)+';">'+dt+'</span></span>');
  if(pl!==null) meta.push('<span style="display:inline-flex;align-items:center;margin-right:14px;"><span style="'+ls+'">장소</span><span style="font-size:12px;color:'+(pl!=='—'?metaColor:emptyColor)+';">'+pl+'</span></span>');
  if(sp!==null) meta.push('<span style="display:inline-flex;align-items:center;margin-right:14px;"><span style="'+ls+'">후원</span><span style="font-size:12px;color:'+(sp!=='—'?metaColor:emptyColor)+';">'+sp+'</span></span>');
  if(meta.length) inner+='<div style="display:flex;flex-wrap:wrap;margin-bottom:'+((s1!==null||s2!==null)?'5':'0')+'px;">'+meta.join('')+'</div>';
  const slogans=[];
  if(s1!==null) slogans.push('<span style="color:'+(s1!=='—'?sloganColor:emptyColor)+';">'+s1+'</span>');
  if(s2!==null) slogans.push('<span style="color:'+(s2!=='—'?sloganColor:emptyColor)+';">'+s2+'</span>');
  if(slogans.length) inner+='<div style="font-size:11px;font-style:italic;">'+slogans.join('  ·  ')+'</div>';
  hdr.innerHTML=inner;
  /* bracket-display 안 첫 자식으로 → 대진표와 너비 컨텍스트 공유 */
  const bd=document.getElementById('bracket-display');
  if(bd) bd.insertBefore(hdr, bd.firstChild);
}

/* ── 줌 버튼: zoom-wrap 전체(격자+콘텐츠)를 화면 배율로 조정 ── */
function _zoomSet(ratio){
  const zw=document.getElementById('zoom-wrap');
  if(!zw) return;
  var isFit=(ratio===null);

  /* 맞춤(null): 현재 zoom-wrap 원본 너비 기준으로 창에 맞는 비율 계산 */
  if(isFit){
    /* 일시적으로 scale 제거해 실제 너비 측정 */
    zw.style.transform='';
    const naturalW=zw.scrollWidth||zw.offsetWidth||800;
    const wrapW=window.innerWidth-48;
    ratio=Math.max(0.1, Math.min(wrapW/naturalW, 4));
  }
  _zoomLevel=ratio;

  zw.style.transformOrigin='top left';
  zw.style.transform=ratio===1?'':'scale('+ratio+')';
  /* scale은 레이아웃 공간을 차지 안 하므로 preview-wrap 높이 보정 */
  const stage=document.getElementById('a4-stage');
  if(stage){
    const h=stage.offsetHeight||600;
    zw.style.marginBottom=(h*ratio - h)+'px';
  }

  /* 퍼센트 표시 업데이트 */
  const disp=document.getElementById('zoom-pct-display');
  if(disp) disp.textContent=Math.round(ratio*100)+'%';

  /* 프리셋 버튼 활성화 표시 */
  document.querySelectorAll('.zoom-btn').forEach(function(btn){
    const bz=parseFloat(btn.dataset.zoom);
    const active=!isFit&&!isNaN(bz)&&Math.abs(bz-ratio)<0.01;
    btn.style.background=active?'rgba(76,201,240,.15)':'transparent';
    btn.style.color=active?'#4cc9f0':'var(--text3)';
    btn.style.borderColor=active?'#4cc9f0':'var(--border2)';
  });

  /* 맞춤 버튼 활성화 표시 */
  var fitBtn=document.getElementById('zoom-fit-btn');
  if(fitBtn){
    fitBtn.style.background=isFit?'rgba(76,201,240,.15)':'transparent';
    fitBtn.style.color=isFit?'#4cc9f0':'var(--text3)';
    fitBtn.style.borderColor=isFit?'#4cc9f0':'var(--border2)';
  }
}

/* ── 줌 -/+ 미세 조정 (5% 단위) ── */
function _zoomStep(delta){
  var next=Math.round((_zoomLevel+delta)*100)/100;
  next=Math.max(0.1,Math.min(next,5));
  _zoomSet(next);
}


/* ── 격자 기반 인쇄: A4 설정 그대로 브라우저 인쇄 ── */
async function _printFromGrid(){
  /* A4 격자가 꺼져 있으면 일반 인쇄로 */
  if(!_a4On || typeof _a4Scale==='undefined' || _a4Scale<=0){
    window.print(); return;
  }
  var btn=document.getElementById('btn-print-main');
  if(btn){btn.disabled=true;btn.textContent='처리중...';}
  try{
    /* html-to-image: html2canvas보다 품질이 좋고 폰트/SVG를 정확히 렌더링 */
    if(!window.htmlToImage){
      await new Promise(function(res,rej){
        var s=document.createElement('script');
        s.src='https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js';
        s.onload=res; s.onerror=function(){
          /* fallback: html2canvas */
          rej(new Error('html-to-image load failed'));
        };
        document.head.appendChild(s);
      });
    }
    /* 정보 헤더 강제 렌더 */
    if(typeof _renderInfoHeader==='function') _renderInfoHeader();
    var paper=_getPaperSize();
    var lsc=_a4Orient==='landscape';
    var cols=_a4C, rows=_a4R;
    var cellW=lsc?Math.max(paper.w,paper.h):Math.min(paper.w,paper.h);
    var cellH=lsc?Math.min(paper.w,paper.h):Math.max(paper.w,paper.h);
    var cellWmm=cellW/(96/25.4), cellHmm=cellH/(96/25.4);
    /* 격자 숨김 (툴바는 #bracket-display 밖이므로 숨길 필요 없음) */
    var stage=document.getElementById('a4-stage');
    var grids=stage?Array.from(stage.querySelectorAll('.a4g')):[];
    grids.forEach(function(el){el.style.display='none';});
    /* 캡처 대상 */
    var target=document.getElementById('bracket-display');
    var prevOvf=target.style.overflow;
    target.style.overflow='visible';
    target.style.overflowX='visible';
    target.style.overflowY='visible';
    var ovfTargets=[document.getElementById('a4-scale-wrap'),document.getElementById('zoom-wrap'),document.getElementById('preview-wrap')].filter(Boolean);
    var ovfPrev=ovfTargets.map(function(el){return{el:el,ov:el.style.overflow,ox:el.style.overflowX,oy:el.style.overflowY};});
    ovfTargets.forEach(function(el){el.style.overflow='visible';el.style.overflowX='visible';el.style.overflowY='visible';});
    /* a4-scale-wrap transform 일시 제거 */
    var sw=document.getElementById('a4-scale-wrap');
    var prevSwTransform=sw?sw.style.transform:'';
    var prevSwMarginLeft=sw?sw.style.marginLeft:'';
    if(sw){sw.style.transform='';sw.style.marginLeft='0px';}
    var isW=document.body.classList.contains('white-mode');
    var SCALE=2; /* 캡처 해상도 배율 */

    /* ── 슬라이스 크기를 미리보기 격자선과 정확히 일치시키기 ──
       미리보기 격자선은 "용지 1장(px) 단위"로 그려지고,
       콘텐츠에는 actualScale 배율이 적용돼 있다.
       → 자연 크기 캡처 후 슬라이스 경계 = cellW / actualScale (px)
       균등 분할(fcW/cols)은 fitW 체크 시에만 우연히 맞고, 나머지는 어긋남 */
    var fitWchk=(document.getElementById('a4-fit-w')||{}).checked;
    var fitHchk=(document.getElementById('a4-fit-h')||{}).checked;
    var actualScale=(fitWchk||fitHchk)?_a4Scale:1;
    var cellNatW=cellW/actualScale;   /* 용지 1장 가로 = 자연 크기(px) */
    var cellNatH=cellH/actualScale;   /* 용지 1장 세로 = 자연 크기(px) */
    /* 캡처 캔버스는 전체 격자를 담을 수 있어야 함 */
    var captureW=Math.max(target.scrollWidth, Math.ceil(cols*cellNatW));
    var captureH=Math.max(target.scrollHeight, Math.ceil(rows*cellNatH));

    await new Promise(function(r){setTimeout(r,150);});

    /* 캡처 전 카드 헤더 줄바꿈 방지 + letter-spacing 제거
       원인: 카드 헤더(font-size:9px, letter-spacing:1px)는 카드 내부폭과 빡빡하게 맞음.
             skipFonts:true 시 폴백 폰트가 ~10px 더 넓어 20px 초과 → 줄바꿈 발생.
             letter-spacing:1px × 18자 = 18px → 0으로 줄이면 여유 확보.
       방법: <style> 태그 주입 (getComputedStyle 방식은 색상 정규화로 불안정) */
    var _capFixStyle=document.createElement('style');
    _capFixStyle.id='_cap_fix_style';
    _capFixStyle.textContent=
      '#bracket-display [style*="font-size:9px"],'+ /* 카드 헤더 */
      '#bracket-display [style*="font-size: 9px"]{'+
        'white-space:nowrap !important;'+
        'letter-spacing:0 !important;'+
      '}';
    document.head.appendChild(_capFixStyle);

    /* html-to-image로 고품질 캡처
       skipFonts:true — 외부 폰트(Google Fonts 등) CSS 인라인 시도를 건너뜀
       → CORS SecurityError 방지. 폰트는 이미 브라우저에 로드된 상태라 출력 품질 무관 */
    var dataUrl=await window.htmlToImage.toJpeg(target,{
      quality:0.97,
      pixelRatio:SCALE,
      backgroundColor:isW?'#ffffff':'#08080f',
      width:captureW,
      height:captureH,
      skipFonts:true,
      style:{overflow:'visible',overflowX:'visible',overflowY:'visible'}
    });

    /* 복원 */
    if(sw){sw.style.transform=prevSwTransform;sw.style.marginLeft=prevSwMarginLeft;}
    target.style.overflow=prevOvf;
    ovfPrev.forEach(function(s){s.el.style.overflow=s.ov;s.el.style.overflowX=s.ox;s.el.style.overflowY=s.oy;});
    grids.forEach(function(el){el.style.display='';});
    /* 캡처 픽스 스타일 제거 */
    var _cfs=document.getElementById('_cap_fix_style'); if(_cfs)_cfs.remove();
    var fullImg=new Image();
    await new Promise(function(r){fullImg.onload=r;fullImg.src=dataUrl;});
    var fcW=fullImg.naturalWidth, fcH=fullImg.naturalHeight;

    /* 슬라이스 크기: 격자선과 동일한 기준 (용지 1장 = cellNatW×cellNatH 자연px) */
    var sliceW=Math.round(cellNatW*SCALE);
    var sliceH=Math.round(cellNatH*SCALE);

    /* @page 크기: 정확한 mm 수치로 지정 */
    var existing=document.getElementById('_page_rule_style');
    if(existing)existing.remove();
    var st=document.createElement('style');
    st.id='_page_rule_style';
    st.textContent='@page{size:'+cellWmm+'mm '+cellHmm+'mm;margin:0;}';
    document.head.appendChild(st);

    /* 페이지 div 생성 */
    var wrap=document.createElement('div');
    wrap.id='_grid_print_wrap';
    wrap.style.cssText='display:none;';
    for(var r=0;r<rows;r++){
      for(var c=0;c<cols;c++){
        var oc=document.createElement('canvas');
        /* 각 슬라이스 시작점: 누적 오차 방지를 위해 매번 정수 계산 */
        var sx=Math.round(c*cellNatW*SCALE), sy=Math.round(r*cellNatH*SCALE);
        var sw2=Math.min(sliceW,Math.max(0,fcW-sx));
        var sh2=Math.min(sliceH,Math.max(0,fcH-sy));
        oc.width=sliceW; oc.height=sliceH;
        var octx=oc.getContext('2d');
        octx.fillStyle=isW?'#ffffff':'#08080f';
        octx.fillRect(0,0,oc.width,oc.height);
        if(sw2>0&&sh2>0) octx.drawImage(fullImg,sx,sy,sw2,sh2,0,0,sw2,sh2);
        var pd=document.createElement('div');
        pd.style.cssText=
          'display:block;'+
          'width:'+cellWmm+'mm;'+
          'height:'+cellHmm+'mm;'+
          'overflow:hidden;'+
          'margin:0;padding:0;'+
          'box-sizing:border-box;'+
          'background:white;'+
          'page-break-after:always;'+
          'break-after:page;'+
          'page-break-inside:avoid;'+
          'break-inside:avoid;';
        var img=document.createElement('img');
        img.src=oc.toDataURL('image/jpeg',0.97);
        img.style.cssText='width:100%;height:100%;display:block;';
        pd.appendChild(img); wrap.appendChild(pd);
      }
    }
    document.body.appendChild(wrap);
    document.body.classList.add('_grid_printing');
    await new Promise(function(r){setTimeout(r,200);});
    window.print();
    function _cleanup(){
      document.body.classList.remove('_grid_printing');
      var el=document.getElementById('_grid_print_wrap');
      if(el)el.remove();
      if(btn){btn.disabled=false;btn.textContent='🖨️ 인쇄';}
    }
    window.addEventListener('afterprint',_cleanup,{once:true});
    setTimeout(_cleanup,8000);
  }catch(err){
    console.error(err);
    alert('인쇄 준비 실패: '+err.message);
    document.body.classList.remove('_grid_printing');
    var el=document.getElementById('_grid_print_wrap');
    if(el)el.remove();
    if(btn){btn.disabled=false;btn.textContent='🖨️ 인쇄';}
  }
}

/* PDF save - grid based, no gridlines */
async function savePDF(){
  var btn=document.getElementById('btn-pdf-save');
  var status=document.getElementById('pdf-save-status');
  if(btn){btn.disabled=true;btn.textContent='...';}
  if(status){status.textContent='Loading...';status.style.display='inline';}
  try{
    if(!window.jspdf) await _ldScr('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    /* html2canvas 대신 html-to-image 사용 — html2canvas는 고배율에서 폰트 깨짐 발생 */
    if(!window.htmlToImage){
      await new Promise(function(res,rej){
        var s=document.createElement('script');
        s.src='https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js';
        s.onload=res; s.onerror=rej;
        document.head.appendChild(s);
      });
    }
    var jsPDF=window.jspdf.jsPDF;
    var paper=(typeof _getPaperSize==='function')?_getPaperSize():{w:Math.round(297*96/25.4),h:Math.round(210*96/25.4)};
    var lsc=(typeof _a4Orient!=='undefined')?_a4Orient==='landscape':true;
    var cols=(typeof _a4C!=='undefined')?_a4C:2;
    var rows=(typeof _a4R!=='undefined')?_a4R:14;
    var cellW=lsc?Math.max(paper.w,paper.h):Math.min(paper.w,paper.h);
    var cellH=lsc?Math.min(paper.w,paper.h):Math.max(paper.w,paper.h);
    var cellWmm=cellW/(96/25.4), cellHmm=cellH/(96/25.4);
    /* hide grid lines */
    var stage=document.getElementById('a4-stage');
    var grids=stage?Array.from(stage.querySelectorAll('.a4g')):[];
    grids.forEach(function(el){el.style.display='none';});
    var target=document.getElementById('bracket-display')||document.getElementById('a4-scale-wrap');
    /* overflow 해제 */
    var prevOvf2=target.style.overflow;
    target.style.overflow='visible';
    target.style.overflowX='visible';
    target.style.overflowY='visible';
    var ovfTargets2=[document.getElementById('a4-scale-wrap'),document.getElementById('zoom-wrap'),document.getElementById('preview-wrap')].filter(function(el){return el&&el!==target;});
    var ovfPrev2=ovfTargets2.map(function(el){return{el:el,ov:el.style.overflow,ox:el.style.overflowX,oy:el.style.overflowY};});
    ovfTargets2.forEach(function(el){el.style.overflow='visible';el.style.overflowX='visible';el.style.overflowY='visible';});
    /* a4-scale-wrap의 CSS transform 일시 제거 → 실제 크기로 캡처 */
    var sw2=document.getElementById('a4-scale-wrap');
    var prevSwTransform2=sw2?sw2.style.transform:'';
    var prevSwMarginLeft2=sw2?sw2.style.marginLeft:'';
    if(sw2){sw2.style.transform='';sw2.style.marginLeft='0px';}

    /* 슬라이스 크기를 미리보기 격자선과 정확히 일치시키기 */
    var fitWchk2=(document.getElementById('a4-fit-w')||{}).checked;
    var fitHchk2=(document.getElementById('a4-fit-h')||{}).checked;
    var actualScale2=(fitWchk2||fitHchk2)?_a4Scale:1;
    var cellNatW2=cellW/actualScale2;
    var cellNatH2=cellH/actualScale2;
    var captureW2=Math.max(target.scrollWidth, Math.ceil(cols*cellNatW2));
    var captureH2=Math.max(target.scrollHeight, Math.ceil(rows*cellNatH2));

    if(status)status.textContent='Capturing...';
    /* 캡처 전 카드 헤더 줄바꿈 방지 + letter-spacing 제거 */
    var _capFixStyle2=document.createElement('style');
    _capFixStyle2.id='_cap_fix_style2';
    _capFixStyle2.textContent=
      '#bracket-display [style*="font-size:9px"],'+
      '#bracket-display [style*="font-size: 9px"]{'+
        'white-space:nowrap !important;'+
        'letter-spacing:0 !important;'+
      '}';
    document.head.appendChild(_capFixStyle2);
    await new Promise(function(r){setTimeout(r,200);});
    var isW=document.body.classList.contains('white-mode');
    var PDF_SCALE=2; /* html-to-image 캡처 해상도 (인쇄와 동일) */

    /* html-to-image로 캡처 — skipFonts:true로 CORS 오류 방지 */
    var dataUrl=await window.htmlToImage.toJpeg(target,{
      quality:0.97,
      pixelRatio:PDF_SCALE,
      backgroundColor:isW?'#ffffff':'#08080f',
      width:captureW2,
      height:captureH2,
      skipFonts:true,
      style:{overflow:'visible',overflowX:'visible',overflowY:'visible'}
    });

    /* restore */
    if(sw2){sw2.style.transform=prevSwTransform2;sw2.style.marginLeft=prevSwMarginLeft2;}
    target.style.overflow=prevOvf2;
    ovfPrev2.forEach(function(s){s.el.style.overflow=s.ov;s.el.style.overflowX=s.ox;s.el.style.overflowY=s.oy;});
    grids.forEach(function(el){el.style.display='';});
    var _cfs2=document.getElementById('_cap_fix_style2'); if(_cfs2)_cfs2.remove();

    /* 이미지를 canvas에 그린 후 슬라이스 */
    var fullImg=new Image();
    await new Promise(function(r){fullImg.onload=r;fullImg.src=dataUrl;});
    var fcW=fullImg.naturalWidth, fcH=fullImg.naturalHeight;

    /* 슬라이스 크기: 용지 1장 = cellNatW2×cellNatH2 자연px 기준 */
    var sliceW=Math.round(cellNatW2*PDF_SCALE);
    var sliceH=Math.round(cellNatH2*PDF_SCALE);
    var pk=(typeof _paperKey!=='undefined')?_paperKey:'A4';
    var pdf=new jsPDF({orientation:lsc?'landscape':'portrait',unit:'mm',format:[cellWmm,cellHmm]});
    var page=0;
    for(var r=0;r<rows;r++){
      for(var c=0;c<cols;c++){
        if(page>0) pdf.addPage([cellWmm,cellHmm],lsc?'landscape':'portrait');
        var oc=document.createElement('canvas');
        oc.width=sliceW; oc.height=sliceH;
        var octx=oc.getContext('2d');
        octx.fillStyle=isW?'#ffffff':'#08080f';
        octx.fillRect(0,0,oc.width,oc.height);
        var sx=Math.round(c*cellNatW2*PDF_SCALE), sy=Math.round(r*cellNatH2*PDF_SCALE);
        var sw=Math.min(sliceW, Math.max(0, fcW-sx));
        var sh=Math.min(sliceH, Math.max(0, fcH-sy));
        if(sw>0 && sh>0){
          octx.drawImage(fullImg, sx, sy, sw, sh, 0, 0, sw, sh);
        }
        pdf.addImage(oc.toDataURL('image/jpeg',0.93),'JPEG',0,0,cellWmm,cellHmm);
        page++;
        if(status)status.textContent='PDF '+page+'/'+(rows*cols);
        await new Promise(function(r){setTimeout(r,0);});
      }
    }
    var now=new Date();
    var ds=now.getFullYear()+String(now.getMonth()+1).padStart(2,'0')+String(now.getDate()).padStart(2,'0');
    pdf.save('bracket_'+pk+'_'+cols+'x'+rows+'_'+ds+'.pdf');
    if(status){status.textContent='Done! ('+page+'p)';setTimeout(function(){status.style.display='none';},4000);}
  }catch(err){
    console.error(err);alert('PDF save failed: '+err.message);
    if(status)status.style.display='none';
  }
  if(btn){btn.disabled=false;btn.textContent='💾 PDF 저장';}
}
function _ldScr(src){
  return new Promise(function(res,rej){var s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});
}
<\/script>
</body></html>`;

  win.document.write(html);
  win.document.close();
}

// ── 선택 PDF 출력: 미리보기 창에서 이름 체크박스 토글 ──
function _doPrint(groups, hideNamesInitial){
  const win=window.open('','_blank','width=1000,height=850');
  if(!win){ toast('팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요','error'); return; }

  // 각 그룹 대진표를 숨겨진 div에 렌더 후 rAF 2회 대기(연결선 SVG 완성 후 복사)
  _computeSeqOffsets();
  const saved=S.matches;
  const hiddenContainer=document.createElement('div');
  hiddenContainer.style.cssText='position:fixed;left:-9999px;top:0;visibility:hidden;';
  document.body.appendChild(hiddenContainer);

  const groupDivs=groups.map(g=>{
    const shortLabel=g.label.split('/').map(s=>s.trim()).join(' · ');
    const wrapper=document.createElement('div');
    wrapper.style.cssText='margin-bottom:32px;';
    const taggedMatches=g.matches.map((round,ri)=>
      round.map((m,mi)=>({...m,_groupObj:g,_origMi:mi,_origRi:ri,_groupLabel:shortLabel,_seqMi:(g._roundOffset&&g._roundOffset[ri]!=null?g._roundOffset[ri]:0)+mi}))
    );
    S.matches=taggedMatches;
    _renderBracketHTML(wrapper, taggedMatches, 'top', false);
    hiddenContainer.appendChild(wrapper);
    return {label:shortLabel, slots:g.slots.length, wrapper};
  });
  S.matches=saved;

  // rAF 2회 대기 후 SVG 포함한 HTML 수집
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const pagesHTML=groupDivs.map(({label,slots,wrapper})=>{
      wrapper.querySelectorAll('*').forEach(el=>{
        el.style.overflow='visible'; el.style.overflowX='visible'; el.style.overflowY='visible';
      });
      wrapper.querySelectorAll('svg').forEach(s=>{
        s.setAttribute('overflow','visible'); s.style.overflow='visible';
      });
      return `<div class="page">
        <div class="group-title">${label} (${slots}명)</div>
        <div class="bracket-wrap">${wrapper.innerHTML}</div>
      </div>`;
    }).join('');
    hiddenContainer.remove();
    _writeSelectPreviewWin(win, pagesHTML, hideNamesInitial);
  }));
}

function _writeSelectPreviewWin(win, pagesHTML, hideNamesInitial){
  const html=`<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">
<title>선택 대진표</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Share+Tech+Mono&family=Bebas+Neue&family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#08080f;--bg2:#0f0f1a;--card:#13131f;--card2:#1a1a2a;
  --border:#2a2a40;--border2:#3a3a55;
  --red:#e63946;--accent:#4cc9f0;--green:#06d6a0;--yellow:#ffd60a;
  --text:#f0f0f8;--text2:#9090b0;--text3:#5a5a7a;
}
html,body{background:var(--bg2);font-family:'Noto Sans KR',sans-serif;}
.toolbar{position:fixed;top:0;left:0;right:0;background:var(--bg2);border-bottom:1px solid var(--border);z-index:999;display:flex;flex-direction:column;}
.toolbar-row1{display:flex;align-items:center;gap:8px;padding:8px 18px;flex-wrap:wrap;}
.toolbar-row3{display:flex;align-items:center;gap:7px;padding:4px 18px 7px;flex-wrap:wrap;}
.info-chip{display:flex;align-items:center;gap:5px;padding:4px 11px;border-radius:16px;cursor:pointer;font-size:11px;font-weight:600;border:1px solid var(--border2);background:var(--card);color:var(--text2);transition:all .15s;user-select:none;white-space:nowrap;}
.info-chip.on{border-color:#e63946;background:rgba(230,57,70,.15);color:#f0f0f8;}
.info-chip input{accent-color:#e63946;width:12px;height:12px;cursor:pointer;flex-shrink:0;}
.toolbar button{padding:7px 16px;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif;}
.btn-print{background:#e63946;color:#fff;}
.btn-close{background:rgba(255,255,255,.08);border:1px solid var(--border2) !important;color:var(--text2);}
#btn-hide-names{background:transparent !important;border:1px solid var(--border2) !important;color:var(--text3) !important;}
#btn-hide-names.active{background:rgba(76,201,240,.12) !important;border-color:var(--accent) !important;color:var(--accent) !important;}
#pdf-status{font-size:11px;color:#06d6a0;font-family:'Share Tech Mono',monospace;display:none;margin-left:8px;}
.pages{padding:100px 20px 20px;}
.page{
  width:210mm;min-height:297mm;
  background:#fff;color:#111;
  margin:0 auto 20px;
  padding:15mm;
  box-shadow:0 2px 12px rgba(0,0,0,.3);
  overflow:visible;
  position:relative;
  /* step4.js가 var(--card), var(--bg) 등으로 카드 배경을 설정하므로
     .page 범위에서 CSS 변수를 라이트 테마로 재정의 */
  --bg:#ffffff; --bg2:#f8f8f8; --card:#ffffff; --card2:#f4f4f4;
  --border:#cccccc; --border2:#aaaaaa;
  --text:#111111; --text2:#444444; --text3:#666666;
  --red:#e63946; --accent:#2266cc; --green:#119955; --yellow:#cc8800;
}
.group-title{font-size:14px;font-weight:700;color:#111;font-family:'Share Tech Mono',monospace;margin-bottom:10px;letter-spacing:1px;border-left:4px solid #e63946;padding-left:10px;}
.bracket-wrap{overflow:visible;}
.bracket-wrap *{overflow:visible !important;}
.bracket-wrap [style*="color:#555"] { white-space: nowrap !important; }
.bracket-wrap [style*="background:#0d0d1a"]{background:#ffffff !important;}
.bracket-wrap [style*="background:#0a0a14"]{background:#f8f8f8 !important;}
.bracket-wrap [style*="background:#080810"]{background:#f0f0f0 !important;}
.bracket-wrap span{color:#111 !important;}
.bracket-wrap [style*="border"]{border-color:#555 !important;}
.bracket-wrap rect{fill:#fff !important;stroke:#555 !important;}
.bracket-wrap path,.bracket-wrap line{stroke:#555 !important;}
.bracket-wrap [style*="color:#e63946"]{color:#e63946 !important;}
.bracket-wrap text[fill="#e63946"]{fill:#e63946 !important;}
body.hide-names .player-name-part{opacity:0;width:0;overflow:hidden;display:inline-block;pointer-events:none;}
@media print{ .toolbar{display:none !important;} }
</style>
</head>
<body class="${hideNamesInitial?'hide-names':''}">
<div class="toolbar">
  <div class="toolbar-row1">
    <button class="btn-print" id="btn-pdf-save" onclick="savePDF()">💾 PDF 저장</button>
    <span id="pdf-status"></span>
    <button class="btn-close" onclick="window.close()">✕ 닫기</button>
    <button id="btn-hide-names" onclick="toggleNames()" style="padding:7px 16px;background:${hideNamesInitial?'rgba(76,201,240,.12)':'transparent'};border:1px solid ${hideNamesInitial?'var(--accent)':'var(--border2)'};color:${hideNamesInitial?'var(--accent)':'var(--text3)'};border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;">${hideNamesInitial?'👁 이름 보이기':'👁 이름 가리기'}</button>
  </div>
  <div class="toolbar-row3" style="border-top:1px solid var(--border);">
    <span style="font-size:10px;color:var(--text3);font-weight:700;letter-spacing:1px;white-space:nowrap;font-family:'Share Tech Mono',monospace;">📋 정보표시:</span>
    <div id="info-hdr-chips" style="display:flex;gap:6px;flex-wrap:wrap;"></div>
  </div>
</div>
<div class="pages">${pagesHTML}</div>
<script>
const _INFO_ITEMS=[
  {k:'eventname',l:'행사명'},{k:'subtitle',l:'부제목'},{k:'gamename',l:'종목명'},
  {k:'date',l:'일시'},{k:'place',l:'장소'},{k:'sponsor',l:'후원'},
  {k:'slogan1',l:'슬로건1'},{k:'slogan2',l:'슬로건2'},
];
function _loadDispCfg(){ try{ return JSON.parse(localStorage.getItem('sgp_display_config')||'{}'); }catch(e){ return {}; } }
function _initInfoChips(){
  const cfg=_loadDispCfg(); const di=cfg.displayItems||{eventname:true};
  const wrap=document.getElementById('info-hdr-chips'); if(!wrap) return;
  wrap.innerHTML='';
  _INFO_ITEMS.forEach(function(item){
    const on=!!di[item.k];
    const chip=document.createElement('label'); chip.className='info-chip'+(on?' on':'');
    const chk=document.createElement('input'); chk.type='checkbox'; chk.checked=on;
    chk.style.cssText='accent-color:#e63946;width:11px;height:11px;cursor:pointer;';
    chk.addEventListener('change',function(){ chip.classList.toggle('on',this.checked); _renderInfoHeader(); });
    chip.appendChild(chk); chip.appendChild(document.createTextNode(item.l)); wrap.appendChild(chip);
  });
  _renderInfoHeader();
}
function _getInfoChecked(){
  const wrap=document.getElementById('info-hdr-chips'); if(!wrap) return {};
  const result={};
  wrap.querySelectorAll('label').forEach(function(chip,i){ result[_INFO_ITEMS[i].k]=chip.querySelector('input').checked; });
  return result;
}
function _renderInfoHeader(){
  const cfg=_loadDispCfg();
  try{ const bt=JSON.parse(localStorage.getItem('sgp_bracket_temp')||'{}'); if(bt.settings){ if(!cfg.date&&bt.settings.dt) cfg.date=bt.settings.dt; if(!cfg.place&&bt.settings.pl) cfg.place=bt.settings.pl; } }catch(e){}
  const valMap={ eventname:cfg.eventName||'',subtitle:cfg.subtitle||'',gamename:cfg.gameLabel||'',date:cfg.date||'',place:cfg.place||'',sponsor:cfg.sponsor||'',slogan1:cfg.slogan1||'',slogan2:cfg.slogan2||'' };
  const checked=_getInfoChecked();
  const existing=document.getElementById('pdf-info-header'); if(existing) existing.remove();
  if(!_INFO_ITEMS.some(function(item){ return checked[item.k]; })) return;
  const ec='#bbbbbb', ls='font-size:9px;font-weight:700;letter-spacing:1px;color:#e63946;font-family:"Share Tech Mono",monospace;margin-right:3px;';
  const en=checked.eventname?(valMap.eventname||null):null, sub=checked.subtitle?(valMap.subtitle||null):null;
  const gl=checked.gamename?(valMap.gamename||'—'):null, dt=checked.date?(valMap.date||'—'):null;
  const pl=checked.place?(valMap.place||'—'):null, sp=checked.sponsor?(valMap.sponsor||'—'):null;
  const s1=checked.slogan1?(valMap.slogan1||'—'):null, s2=checked.slogan2?(valMap.slogan2||'—'):null;
  const hdr=document.createElement('div'); hdr.id='pdf-info-header';
  hdr.style.cssText='width:100%;padding:12px 20px 10px;margin-bottom:8px;border-bottom:2px solid #e63946;font-family:"Noto Sans KR",sans-serif;background:#fff;box-sizing:border-box;';
  let inner='';
  if(en!==null) inner+='<div style="font-size:18px;font-weight:700;color:'+(en?'#111':ec)+';margin-bottom:2px;">'+(en||'—')+'</div>';
  if(sub!==null) inner+='<div style="font-size:11px;color:'+(sub?'#444':ec)+';margin-bottom:4px;">'+(sub||'—')+'</div>';
  const meta=[];
  if(gl!==null) meta.push('<span style="display:inline-flex;align-items:center;margin-right:12px;"><span style="'+ls+'">종목</span><span style="font-size:11px;color:'+(gl!=='—'?'#333':ec)+';">'+gl+'</span></span>');
  if(dt!==null) meta.push('<span style="display:inline-flex;align-items:center;margin-right:12px;"><span style="'+ls+'">일시</span><span style="font-size:11px;color:'+(dt!=='—'?'#333':ec)+';">'+dt+'</span></span>');
  if(pl!==null) meta.push('<span style="display:inline-flex;align-items:center;margin-right:12px;"><span style="'+ls+'">장소</span><span style="font-size:11px;color:'+(pl!=='—'?'#333':ec)+';">'+pl+'</span></span>');
  if(sp!==null) meta.push('<span style="display:inline-flex;align-items:center;margin-right:12px;"><span style="'+ls+'">후원</span><span style="font-size:11px;color:'+(sp!=='—'?'#333':ec)+';">'+sp+'</span></span>');
  if(meta.length) inner+='<div style="display:flex;flex-wrap:wrap;margin-bottom:3px;">'+meta.join('')+'</div>';
  const slogans=[];
  if(s1!==null) slogans.push(s1==='—'?'<span style="color:'+ec+';">—</span>':s1);
  if(s2!==null) slogans.push(s2==='—'?'<span style="color:'+ec+';">—</span>':s2);
  if(slogans.length) inner+='<div style="font-size:10px;color:#666;font-style:italic;">'+slogans.join('  ·  ')+'</div>';
  hdr.innerHTML=inner;
  const pages=document.querySelector('.pages'); if(pages) pages.insertBefore(hdr,pages.firstChild);
}
function wrapNames(){
  const walker=document.createTreeWalker(document.querySelector('.pages'),NodeFilter.SHOW_TEXT);
  const nodes=[];let node; while(node=walker.nextNode()) nodes.push(node);
  nodes.forEach(n=>{ if(/\([^)]+\)/.test(n.textContent)&&n.parentNode&&n.parentNode.childNodes.length===1){ n.parentNode.innerHTML=n.textContent.replace(/(\s*\([^)]+\))/g,'<span class="player-name-part">$1</span>'); } });
}
function toggleNames(){
  const btn=document.getElementById('btn-hide-names');
  const hiding=btn.textContent.indexOf('가리기')!==-1;
  btn.textContent=hiding?'👁 이름 보이기':'👁 이름 가리기';
  btn.classList.toggle('active',hiding);
  document.body.classList.toggle('hide-names',hiding);
}
function _ldScr(src){ return new Promise(function(res,rej){ var s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }
async function savePDF(){
  const btn=document.getElementById('btn-pdf-save'), status=document.getElementById('pdf-status');
  if(btn){btn.disabled=true;btn.textContent='...';}
  if(status){status.textContent='Loading...';status.style.display='inline';}
  try{
    if(!window.jspdf)       await _ldScr('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    if(!window.htmlToImage) await _ldScr('https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js');
    const jsPDF=window.jspdf.jsPDF;
    const pages=document.querySelectorAll('.page');
    if(!pages.length){ alert('출력할 내용이 없습니다.'); return; }
    const A4W=210, A4H=297, SCALE=2;
    const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:[A4W,A4H]});
    const fixSt=document.createElement('style'); fixSt.id='_cap_fix_sel';
    fixSt.textContent='.bracket-wrap [style*="font-size:9px"],.bracket-wrap [style*="font-size: 9px"]{white-space:nowrap !important;letter-spacing:0 !important;}';
    document.head.appendChild(fixSt);
    if(status)status.textContent='Capturing...';
    await new Promise(r=>setTimeout(r,200));
    let pi=0;
    for(const pageEl of pages){
      const dataUrl=await window.htmlToImage.toJpeg(pageEl,{
        quality:0.97,pixelRatio:SCALE,backgroundColor:'#ffffff',skipFonts:true,
        style:{overflow:'visible',overflowX:'visible',overflowY:'visible'}
      });
      if(pi>0) pdf.addPage([A4W,A4H],'portrait');
      pdf.addImage(dataUrl,'JPEG',0,0,A4W,A4H);
      pi++;
      if(status)status.textContent='PDF '+pi+'/'+pages.length;
      await new Promise(r=>setTimeout(r,0));
    }
    const fs=document.getElementById('_cap_fix_sel'); if(fs)fs.remove();
    const now=new Date();
    const ds=now.getFullYear()+String(now.getMonth()+1).padStart(2,'0')+String(now.getDate()).padStart(2,'0');
    pdf.save('bracket_selected_'+ds+'.pdf');
    if(status){status.textContent='Done! ('+pi+'p)';setTimeout(()=>status.style.display='none',4000);}
  }catch(err){ console.error(err); alert('PDF 저장 실패: '+err.message); if(status)status.style.display='none'; }
  if(btn){btn.disabled=false;btn.textContent='💾 PDF 저장';}
}
window.addEventListener('load',function(){
  wrapNames(); _initInfoChips();
  document.querySelectorAll('rect').forEach(el=>{el.setAttribute('fill','#fff');el.setAttribute('stroke','#999');});
  document.querySelectorAll('path,line').forEach(el=>{ const sw=el.getAttribute('stroke-width'); el.setAttribute('stroke',sw&&parseFloat(sw)>=1.5?'#555':'#ccc'); });
  document.querySelectorAll('text').forEach(el=>{ const f=el.getAttribute('fill'); if(f&&f!=='#e63946') el.setAttribute('fill','#111'); });
  document.querySelectorAll('svg').forEach(s=>s.setAttribute('overflow','visible'));
});
<\/script>
</body></html>`;

  win.document.write(html);
  win.document.close();
}


// 특정 라운드가 홀수일 때 부전승 팝업
// 상단 버튼 클릭 시 부전승 팝업 트리거
function triggerByeSelector(){
  const g=S.groupBrackets[S.activeGroup];
  const ri=g.matches.findIndex((round,ri)=>
    round.length>=2 && round.length%2===1 && !(g.matches[ri+1]||[]).some(m=>m.bye)
  );
  if(ri>=0) _showByeForRound(g, ri);
}

function _showByeForRound(g, ri){
  const existing=document.getElementById('bye-selector-overlay');
  if(existing) existing.remove();

  const round=g.matches[ri];
  if(!round || round.length%2===0) return;
  const candidates=round.map((m,mi)=>({
    id:`bye_${ri}_${mi}`,
    name:`${g.court||1}-${ri+1}-${((g._roundOffset&&g._roundOffset[ri]!=null)?g._roundOffset[ri]:0)+mi+1} 승자`,
    color:'var(--accent)',
    _ri:ri, _mi:mi
  }));
  showByeSelector(
    candidates,
    `${round.length}경기 중 부전승 배정`,
    (sel)=>{
      _byeAssigned={ri:sel._ri, mi:sel._mi};
      toast(sel.name+' 부전승!','success');
    }
  );
}

function _hideMatchModal(){
  const m=document.getElementById('match-action-modal');
  if(m) m.remove();
  if(window._modalOutsideListener){
    document.removeEventListener('click', window._modalOutsideListener, true);
    window._modalOutsideListener=null;
  }
}

function _showMatchModal(anchorEl, ri, mi, matchObj){
  _hideMatchModal();
  const grpObj = matchObj&&matchObj._groupObj ? matchObj._groupObj : null;
  const origMi = (matchObj&&matchObj._origMi!=null) ? matchObj._origMi : mi;
  const origRi = (matchObj&&matchObj._origRi!=null) ? matchObj._origRi : ri;
  const courtNum = grpObj ? (grpObj.court || 1) : 1;
  const seqMi = (matchObj&&matchObj._seqMi!=null) ? matchObj._seqMi : ((grpObj&&grpObj._roundOffset&&grpObj._roundOffset[origRi]!=null)?grpObj._roundOffset[origRi]:0)+origMi;
  const label = `${courtNum}-${origRi+1}-${seqMi+1}`;

  const modal = document.createElement('div');
  modal.id = 'match-action-modal';
  modal.style.cssText = `
    position:fixed;z-index:9999;
    background:var(--card2);border:1px solid var(--border2);
    border-radius:12px;padding:6px;
    box-shadow:0 8px 32px rgba(0,0,0,.6);
    display:flex;flex-direction:column;gap:4px;
    min-width:190px;animation:tsin .15s ease;
  `;

  const mkBtn=(icon,text,color,fn)=>{
    const b=document.createElement('button');
    b.style.cssText=`display:flex;align-items:center;gap:9px;padding:9px 13px;border-radius:8px;border:none;background:transparent;color:${color};font-size:12px;font-weight:600;cursor:pointer;text-align:left;transition:background .1s;font-family:'Noto Sans KR',sans-serif;width:100%;`;
    b.onmouseover=()=>b.style.background='rgba(255,255,255,.07)';
    b.onmouseout=()=>b.style.background='transparent';
    b.innerHTML=`<span style="font-size:15px;width:20px;text-align:center;">${icon}</span><span>${text}</span>`;
    b.onclick=(e)=>{ e.stopPropagation(); _hideMatchModal(); fn(); };
    return b;
  };

  // 헤더
  const hdr=document.createElement('div');
  hdr.style.cssText='padding:5px 13px 7px;font-size:10px;color:var(--text3);font-family:"Share Tech Mono",monospace;letter-spacing:1px;border-bottom:1px solid var(--border);margin-bottom:2px;';
  hdr.textContent=`// 경기 ${label}`;
  modal.appendChild(hdr);

  // 연결 대기 중이면 → "이 경기와 연결" 옵션만
  if(_linkSel){
    modal.appendChild(mkBtn('🔗','이 경기와 연결','var(--accent)',()=>{
      _doLink(ri,mi,grpObj,origMi,origRi);
    }));
    modal.appendChild(mkBtn('✕','선택 취소','var(--text3)',()=>{
      _linkSel=null; _redrawBracketView();
    }));
  } else {
    modal.appendChild(mkBtn('🔗','다른 경기와 연결','var(--accent)',()=>{
      _linkSel={ri,mi,grpObj,origMi,origRi,matchObj};
      // 선택 박스 강조
      if(matchObj&&matchObj._domId){
        const el=document.querySelector(`[data-match-id="${matchObj._domId}"]`);
        if(el){ el.style.borderColor='#4cc9f0'; el.style.boxShadow='0 0 8px rgba(76,201,240,.5)'; }
      }
      toast(`${label} 선택됨 — 연결할 경기를 클릭하세요`,'info');
    }));
    modal.appendChild(mkBtn('▶','부전승 직행','var(--green)',()=>{
      _doAdvance(origRi, origMi, grpObj);
    }));
    modal.appendChild(mkBtn('🗑','이 라운드 삭제','var(--red)',()=>{
      _doRemoveRound(origRi, origMi, grpObj);
    }));
  }

  document.body.appendChild(modal);

  // 위치 잡기 — 클릭 박스 바로 아래, 화면 벗어나면 위로
  const rect = anchorEl.getBoundingClientRect();
  let top = rect.bottom + 6;
  let left = rect.left;
  if(top + 220 > window.innerHeight) top = rect.top - 220;
  if(left + 200 > window.innerWidth) left = window.innerWidth - 210;
  modal.style.top = top + 'px';
  modal.style.left = left + 'px';

  // 외부 클릭 시 닫기 — 전역 변수로 관리해서 누수 방지
  if(window._modalOutsideListener){
    document.removeEventListener('click', window._modalOutsideListener, true);
  }
  window._modalOutsideListener = (e)=>{
    const m = document.getElementById('match-action-modal');
    if(!m){ document.removeEventListener('click', window._modalOutsideListener, true); window._modalOutsideListener=null; return; }
    if(!m.contains(e.target)){
      document.removeEventListener('click', window._modalOutsideListener, true);
      window._modalOutsideListener=null;
      _hideMatchModal();
    }
  };
  setTimeout(()=>{ document.addEventListener('click', window._modalOutsideListener, true); }, 200);
}

function _doLink(ri, mi, grpObj, origMi, origRi){
  const a = _linkSel;
  const b = {ri, mi, grpObj, origMi, origRi};
  _linkSel = null;

  if(a.origRi===origRi && a.origMi===origMi && a.grpObj===grpObj){
    _redrawBracketView(); return; // 같은 경기 재클릭 → 취소
  }

  const grpA = a.grpObj || S.groupBrackets[S.activeGroup];
  const grpB = b.grpObj || S.groupBrackets[S.activeGroup];
  if(grpA !== grpB){ toast('같은 체급 경기끼리만 연결할 수 있어요','error'); _redrawBracketView(); return; }
  if(a.origRi !== b.origRi){ toast('라운드가 맞지 않습니다','error'); _redrawBracketView(); return; }

  const grp = grpA;
  const targetRi = Math.max(a.origRi, b.origRi) + 1;
  while(grp.matches.length <= targetRi) grp.matches.push([]);
  const nextRound = grp.matches[targetRi];

  const aKey=`${a.origRi}-${a.origMi}`, bKey=`${b.origRi}-${b.origMi}`;
  const aLinked=nextRound.find(m=>m.fromA===aKey||m.fromB===aKey);
  const bLinked=nextRound.find(m=>m.fromA===bKey||m.fromB===bKey);
  if(aLinked||bLinked){ toast('이미 연결된 경기입니다','error'); _redrawBracketView(); return; }

  const _aSeq=(a.matchObj&&a.matchObj._seqMi!=null)?a.matchObj._seqMi:((grpA._roundOffset&&grpA._roundOffset[a.origRi]!=null)?grpA._roundOffset[a.origRi]:0)+a.origMi;
  const _bSeq=((grpB._roundOffset&&grpB._roundOffset[b.origRi]!=null)?grpB._roundOffset[b.origRi]:0)+b.origMi;
  nextRound.push({p1:{name:`${grpA.court||1}-${a.origRi+1}-${_aSeq+1} 승자`,tbd:true},p2:{name:`${grpB.court||1}-${b.origRi+1}-${_bSeq+1} 승자`,tbd:true},fromA:aKey,fromB:bKey,bye:false});
  _redrawBracketView();
  toast(`${grp.label} ${grpA.court||1}-${a.origRi+1}-${_aSeq+1} vs ${grpB.court||1}-${b.origRi+1}-${_bSeq+1} 연결됨!`,'success');
}

function _doAdvance(origRi, origMi, grpObj){
  const g = grpObj || S.groupBrackets[S.activeGroup];
  while(g.matches.length <= origRi+1) g.matches.push([]);
  const nextRound = g.matches[origRi+1];
  const aKey = `${origRi}-${origMi}`;
  if(nextRound.find(m=>m.fromA===aKey||m.fromB===aKey)){ toast('이미 연결된 경기입니다','error'); _redrawBracketView(); return; }
  const _advCourtNum = g.court || 1;
  const _advSeq=((g._roundOffset&&g._roundOffset[origRi]!=null)?g._roundOffset[origRi]:0)+origMi;
  nextRound.push({p1:{name:`${_advCourtNum}-${origRi+1}-${_advSeq+1} 승자`,tbd:true},p2:null,fromA:aKey,fromB:null,bye:true});
  _redrawBracketView();
  toast(`${_advCourtNum}-${origRi+1}-${_advSeq+1} 승자 다음 라운드 직행!`,'success');
}

function _doRemoveRound(origRi, origMi, grpObj){
  // grpObj가 null이면 origRi, origMi로 해당 매치를 가진 그룹을 전체에서 찾음
  let g = grpObj;
  if(!g){
    g = S.groupBrackets.find(gb =>
      gb.matches[origRi] && gb.matches[origRi][origMi]
    );
  }
  if(!g){ toast('삭제할 연결이 없어요','info'); return; }
  if(!g.matches[origRi]){ toast('삭제할 연결이 없어요','info'); return; }

  const match = g.matches[origRi][origMi];
  if(!match){ toast('삭제할 연결이 없어요','info'); return; }

  // 1라운드 자동 생성 경기(fromA/fromB 없음)는 삭제 불가
  if(origRi === 0 && !match.fromA && !match.fromB){
    toast('1라운드 경기는 삭제할 수 없어요','info'); return;
  }

  g.matches[origRi].splice(origMi, 1);
  if(g.matches[origRi].length === 0) g.matches.splice(origRi);

  _redrawBracketView();
  const _delSeq=((g._roundOffset&&g._roundOffset[origRi]!=null)?g._roundOffset[origRi]:0)+origMi;
  toast(`${g.label} ${g.court||1}-${origRi+1}-${_delSeq+1} 경기를 삭제했어요`,'success');
}

function onMatchClick(ri, mi, matchObj, event){
  event = event || window.event;
  // 클릭된 경기 박스 DOM 요소 찾기
  let anchorEl = null;
  if(matchObj&&matchObj._domId){
    anchorEl = document.querySelector(`[data-match-id="${matchObj._domId}"]`);
  }
  if(!anchorEl && event) anchorEl = event.currentTarget || event.target;
  if(!anchorEl) anchorEl = document.getElementById('pts-bracket-view');

  // 연결 대기 중이고 다른 경기 클릭 → 모달에 "이 경기와 연결" 표시
  if(_linkSel){
    const isSame = matchObj&&matchObj._domId && _linkSel.matchObj&&matchObj._domId===_linkSel.matchObj._domId;
    if(!isSame){ _showMatchModal(anchorEl, ri, mi, matchObj); return; }
  }

  _showMatchModal(anchorEl, ri, mi, matchObj);
}

function advanceMatch(ri,mi){
  // 하위 호환 — 직접 호출되는 경우 대비
  _doAdvance(ri, mi, null);
}

function _showLinkBar(){ /* 모달로 대체됨 — 빈 함수 유지 (step4.js 등 외부 참조 대비) */ }
function _hideLinkBar(){ _hideMatchModal(); }

document.addEventListener('keydown', e=>{ 
  if(e.key==='Escape'){
    if(document.getElementById('match-action-modal')){ _hideMatchModal(); _linkSel=null; _redrawBracketView(); }
    else window.close();
  }
});


// 저장된 대진표의 승자 이름을 새 형식(경기장-라운드-번경기)으로 자동 변환
// "1-2 승자" → "1-1-3 승자" 처럼 seqMi 기반으로 재계산
function _migrateSlotNumbers(){
  // 구 형식 "N번" → 새 형식 "경기장-N" 변환 + _startNum 항상 계산
  if(!S.groupBrackets||!S.groupBrackets.length) return;
  const needsMigration=S.groupBrackets.some(g=>
    g.matches&&g.matches[0]&&g.matches[0].some(m=>
      (m.p1&&/^\d+번/.test(m.p1.name))||(m.p2&&/^\d+번/.test(m.p2.name))
    )
  );
  // 경기장별 통합 순번 계산 (groupBrackets 순서대로) — 마이그레이션 여부 무관하게 항상 실행
  const courtCounters={};
  let changed=0;
  S.groupBrackets.forEach(g=>{
    const court=g.court||1;
    if(!courtCounters[court]) courtCounters[court]=1;
    const startNum=courtCounters[court];
    // _startNum이 없거나 0이면 계산값으로 설정
    if(!g._startNum) g._startNum=startNum;
    // 1라운드 슬롯 수 계산 (BYE=1, 일반=2)
    let slotCount=0;
    if(g.matches&&g.matches[0]){
      g.matches[0].forEach(m=>{ slotCount+=m.bye?1:2; });
    }
    courtCounters[court]+=slotCount;
    if(!needsMigration) return; // 이름 변환은 마이그레이션 필요할 때만
    // 1라운드 이름 순서대로 순번 재할당
    let cur=startNum;
    if(g.matches&&g.matches[0]){
      g.matches[0].forEach(m=>{
        if(m.p1&&/^\d+번/.test(m.p1.name)){
          m.p1.name=m.p1.name.replace(/^\d+번/,`${court}-${cur++}`);
          changed++;
        }
        if(!m.bye&&m.p2&&/^\d+번/.test(m.p2.name)){
          m.p2.name=m.p2.name.replace(/^\d+번/,`${court}-${cur++}`);
          changed++;
        }
      });
    }
  });
  if(changed>0){
    try{
      const clean=S.groupBrackets.map(g=>({...g,matches:g.matches.map(r=>r.map(m=>{const {_groupObj,...rest}=m;return rest;}))}));
      localStorage.setItem('sgp_groupBrackets',JSON.stringify(clean));
      localStorage.setItem('sgp_bracket_temp',JSON.stringify({groupBrackets:clean,savedAt:new Date().toLocaleTimeString()}));
    }catch(e){}
  }
}

function _migrateWinnerNames(){
  if(!S.groupBrackets||!S.groupBrackets.length) return;
  _computeSeqOffsets();
  let changed=0;
  S.groupBrackets.forEach(g=>{
    const court=g.court||1;
    g.matches.forEach((round,ri)=>{
      round.forEach(m=>{
        [m.p1,m.p2].forEach(p=>{
          if(!p||!p.tbd) return;
          // 기존 형식 "숫자-숫자 승자" 또는 "숫자-숫자-숫자 승자" 감지
          const old2=p.name.match(/^(\d+)-(\d+) 승자$/);
          const old3=p.name.match(/^(\d+)-(\d+)-(\d+) 승자$/);
          if(old2||old3){
            // fromA/fromB 키로 원본 경기 찾기
            const fromKey=m.fromA||m.fromB;
            if(!fromKey) return;
            const [srcRi,srcMi]=fromKey.split('-').map(Number);
            const srcRound=g.matches[srcRi];
            if(!srcRound) return;
            // 해당 라운드에서 p1/p2 기준으로 정확한 srcMi 파악
            const isPFromA = m.fromA&&(p===m.p1);
            const key=isPFromA?m.fromA:m.fromB;
            if(!key) return;
            const [kRi,kMi]=key.split('-').map(Number);
            const seqNum=((g._roundOffset&&g._roundOffset[kRi]!=null)?g._roundOffset[kRi]:0)+kMi+1;
            const newName=`${court}-${kRi+1}-${seqNum} 승자`;
            if(p.name!==newName){ p.name=newName; changed++; }
          }
        });
      });
    });
  });
  if(changed>0){
    // localStorage 갱신
    try{
      const clean=S.groupBrackets.map(g=>({...g,matches:g.matches.map(r=>r.map(m=>{const {_groupObj,...rest}=m;return rest;}))}));
      localStorage.setItem('sgp_groupBrackets',JSON.stringify(clean));
      localStorage.setItem('sgp_bracket_temp',JSON.stringify({groupBrackets:clean,savedAt:new Date().toLocaleTimeString()}));
    }catch(e){}
  }
}

// localStorage 복원 — 저장된 단계로 이동
(function restoreFromStorage(){
  try {
    const savedGroups = localStorage.getItem('sgp_groups');
    const savedKeys   = localStorage.getItem('sgp_sortKeys');
    const savedPts    = localStorage.getItem('sgp_pts');
    const savedStep   = localStorage.getItem('sgp_step');
    if(savedGroups){
      _groups   = JSON.parse(savedGroups);
      _sortKeys = JSON.parse(savedKeys||'[]');
      if(savedPts){ _pts=JSON.parse(savedPts); S.pts=_pts; }
      const savedCourtCount = localStorage.getItem('sgp_courtCount');
      const savedLayout     = localStorage.getItem('sgp_layout');
      if(savedCourtCount) _courtCount=parseInt(savedCourtCount);
      if(savedLayout) _bracketLayout=savedLayout;
      setTimeout(()=>{
        if(savedStep==='4'){
          const savedGB=localStorage.getItem('sgp_groupBrackets');
          if(savedGB) S.groupBrackets=JSON.parse(savedGB);
          _migrateSlotNumbers();
          _migrateWinnerNames();
          show('pts-step3');
          renderBracketTabs();
          _redrawBracketView();
          setTimeout(()=>goStep4(), 100);
          toast('이전 설정 불러왔어요','info');
        } else if(savedStep==='3'){
          const savedGB=localStorage.getItem('sgp_groupBrackets');
          if(savedGB) S.groupBrackets=JSON.parse(savedGB);
          _migrateSlotNumbers();
          _migrateWinnerNames();
          show('pts-step3');
          renderBracketTabs();
          _redrawBracketView();
          toast('이전 설정 불러왔어요','info');
        } else {
          goStep2();
          toast('이전 설정 불러왔어요','info');
        }
      }, 0);
    }
  } catch(e){}
})();

function restoreThenGo(){
  if(window._restoreBanner) window._restoreBanner.remove();
  goStep2();
  toast('이어서 진행합니다!','success');
}

function clearSavedAndRestart(){
  try{ localStorage.removeItem('sgp_groups'); localStorage.removeItem('sgp_sortKeys'); localStorage.removeItem('sgp_pts'); }catch(e){}
  if(window._restoreBanner) window._restoreBanner.remove();
  toast('초기화됐어요','info');
}

autoDetectSortKeys();
renderList();
/* ── 줌(비율 보기): zoom-wrap 전체(격자+콘텐츠)를 화면 배율로 조정 ── */
function _zoomSet(ratio){
  const zw=document.getElementById('zoom-wrap');
  if(!zw) return;

  if(ratio===null){
    zw.style.transform='';
    const naturalW=zw.scrollWidth||zw.offsetWidth||800;
    const wrapW=window.innerWidth-48;
    ratio=Math.max(0.1,Math.min(wrapW/naturalW,4));
  }
  _zoomLevel=ratio;

  zw.style.transformOrigin='top left';
  zw.style.transform=ratio===1?'':'scale('+ratio+')';
  const stage=document.getElementById('a4-stage');
  if(stage){
    const h=stage.offsetHeight||600;
    zw.style.marginBottom=(h*ratio - h)+'px';
  }

  document.querySelectorAll('.zoom-btn').forEach(function(btn){
    const bz=parseFloat(btn.dataset.zoom);
    const active=!isNaN(bz)&&Math.abs(bz-ratio)<0.01;
    btn.style.background=active?'rgba(76,201,240,.15)':'transparent';
    btn.style.color=active?'#4cc9f0':'var(--text3)';
    btn.style.borderColor=active?'#4cc9f0':'var(--border2)';
  });
}

/* ── 기본정보 헤더 체크박스 ── */
const _INFO_ITEMS=[
  {k:'eventname',l:'행사명'},
  {k:'subtitle', l:'부제목'},
  {k:'gamename', l:'종목명'},
  {k:'date',     l:'일시'},
  {k:'place',    l:'장소'},
  {k:'sponsor',  l:'후원'},
  {k:'slogan1',  l:'슬로건1'},
  {k:'slogan2',  l:'슬로건2'},
];
function _loadDispCfg(){
  try{ return JSON.parse(localStorage.getItem('sgp_display_config')||'{}'); }catch(e){ return {}; }
}
function _initInfoChips(){
  const cfg=_loadDispCfg();
  const di=cfg.displayItems||{eventname:true};
  const wrap=document.getElementById('info-hdr-chips');
  if(!wrap) return;
  wrap.innerHTML='';
  _INFO_ITEMS.forEach(function(item){
    const on=!!di[item.k];
    const chip=document.createElement('label');
    chip.className='info-chip'+(on?' on':'');
    const chk=document.createElement('input');
    chk.type='checkbox'; chk.checked=on;
    chk.style.cssText='accent-color:#e63946;width:11px;height:11px;cursor:pointer;';
    chk.addEventListener('change',function(){
      chip.classList.toggle('on', this.checked);
      _renderInfoHeader();
    });
    chip.appendChild(chk);
    chip.appendChild(document.createTextNode(item.l));
    wrap.appendChild(chip);
  });
  _renderInfoHeader();
}
function _getInfoChecked(){
  const wrap=document.getElementById('info-hdr-chips');
  if(!wrap) return {};
  const result={};
  wrap.querySelectorAll('label').forEach(function(chip,i){
    result[_INFO_ITEMS[i].k]=chip.querySelector('input').checked;
  });
  return result;
}
function _renderInfoHeader(){
  const cfg=_loadDispCfg();
  try{
    const bt=JSON.parse(localStorage.getItem('sgp_bracket_temp')||'{}');
    if(bt.settings){
      if(!cfg.date&&bt.settings.dt) cfg.date=bt.settings.dt;
      if(!cfg.place&&bt.settings.pl) cfg.place=bt.settings.pl;
    }
  }catch(e){}
  const valMap={
    eventname:cfg.eventName||'', subtitle:cfg.subtitle||'',
    gamename:cfg.gameLabel||'',  date:cfg.date||'',
    place:cfg.place||'',         sponsor:cfg.sponsor||'',
    slogan1:cfg.slogan1||'',     slogan2:cfg.slogan2||'',
  };
  const checked=_getInfoChecked();
  const existing=document.getElementById('pdf-info-header');
  if(existing) existing.remove();
  /* 체크된 항목이 하나라도 있으면 헤더를 표시 (값이 비어있어도) */
  const anyChecked=_INFO_ITEMS.some(function(item){ return checked[item.k]; });
  if(!anyChecked) return;
  const isW=document.body.classList.contains('white-mode');
  const hdrBg=isW?'#ffffff':'#0f0f1a';
  const titleColor=isW?'#111111':'#f0f0f8';
  const metaColor=isW?'#333333':'#9090b0';
  const emptyColor=isW?'#bbbbbb':'#3a3a55'; /* 빈 값 표시용 색상 */
  const sloganColor=isW?'#666666':'#5a5a7a';
  const ls='font-size:9px;font-weight:700;letter-spacing:1px;color:#e63946;font-family:"Share Tech Mono",monospace;margin-right:3px;';
  /* 체크됐으면 값 사용, 값이 없으면 '—' 표시 */
  const en =checked.eventname ? (valMap.eventname||null)  : null;
  const sub=checked.subtitle  ? (valMap.subtitle ||null)  : null;
  const gl =checked.gamename  ? (valMap.gamename ||'—')   : null;
  const dt =checked.date      ? (valMap.date     ||'—')   : null;
  const pl =checked.place     ? (valMap.place    ||'—')   : null;
  const sp =checked.sponsor   ? (valMap.sponsor  ||'—')   : null;
  const s1 =checked.slogan1   ? (valMap.slogan1  ||'—')   : null;
  const s2 =checked.slogan2   ? (valMap.slogan2  ||'—')   : null;
  const hdr=document.createElement('div');
  hdr.id='pdf-info-header';
  hdr.style.cssText='min-width:max-content;width:100%;padding:16px 24px 13px;margin-bottom:8px;border-bottom:2px solid #e63946 !important;font-family:"Noto Sans KR",sans-serif !important;background:'+hdrBg+' !important;box-sizing:border-box;color:unset !important;';
  let inner='';
  if(en!==null)  inner+='<div style="font-size:20px;font-weight:700;color:'+(en?titleColor:emptyColor)+';letter-spacing:.3px;margin-bottom:3px;">'+(en||'—')+'</div>';
  if(sub!==null) inner+='<div style="font-size:12px;color:'+(sub?metaColor:emptyColor)+';margin-bottom:5px;">'+(sub||'—')+'</div>';
  const meta=[];
  if(gl!==null) meta.push('<span style="display:inline-flex;align-items:center;margin-right:14px;"><span style="'+ls+'">종목</span><span style="font-size:12px;color:'+(gl!=='—'?metaColor:emptyColor)+';">'+gl+'</span></span>');
  if(dt!==null) meta.push('<span style="display:inline-flex;align-items:center;margin-right:14px;"><span style="'+ls+'">일시</span><span style="font-size:12px;color:'+(dt!=='—'?metaColor:emptyColor)+';">'+dt+'</span></span>');
  if(pl!==null) meta.push('<span style="display:inline-flex;align-items:center;margin-right:14px;"><span style="'+ls+'">장소</span><span style="font-size:12px;color:'+(pl!=='—'?metaColor:emptyColor)+';">'+pl+'</span></span>');
  if(sp!==null) meta.push('<span style="display:inline-flex;align-items:center;margin-right:14px;"><span style="'+ls+'">후원</span><span style="font-size:12px;color:'+(sp!=='—'?metaColor:emptyColor)+';">'+sp+'</span></span>');
  if(meta.length) inner+='<div style="display:flex;flex-wrap:wrap;margin-bottom:'+((s1!==null||s2!==null)?'5':'0')+'px;">'+meta.join('')+'</div>';
  const slogans=[];
  if(s1!==null) slogans.push('<span style="color:'+(s1!=='—'?sloganColor:emptyColor)+';">'+s1+'</span>');
  if(s2!==null) slogans.push('<span style="color:'+(s2!=='—'?sloganColor:emptyColor)+';">'+s2+'</span>');
  if(slogans.length) inner+='<div style="font-size:11px;font-style:italic;">'+slogans.join('  ·  ')+'</div>';
  hdr.innerHTML=inner;
  /* bracket-display 안 첫 자식으로 → 대진표와 너비 컨텍스트 공유 */
  const bd=document.getElementById('bracket-display');
  if(bd) bd.insertBefore(hdr, bd.firstChild);
}
window.addEventListener('load',function(){ _initInfoChips(); });

