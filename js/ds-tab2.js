// ══ DS TAB 2: 현재경기 VS 화면 설정 ══

function buildTab2(){
  buildDs2FontPicker();
  updateDst2();
}

function buildDs2FontPicker(){
  const w=document.getElementById('ds2-fontpicker');if(!w)return;w.innerHTML='';
  if(typeof TITLE_FONTS==='undefined')return;
  TITLE_FONTS.forEach(f=>{
    const el=document.createElement('div');
    el.className='ds-font'+(S.vs2Font===f.id?' on':'');
    el.style.fontFamily=f.css;el.textContent=f.name;
    el.onclick=()=>{
      S.vs2Font=f.id;
      document.querySelectorAll('#ds2-fontpicker .ds-font').forEach(x=>x.classList.remove('on'));
      el.classList.add('on');
      // pv2 미리보기에 적용
      ['pv2-p1','pv2-p2'].forEach(id=>{
        const e=document.getElementById(id);
        if(e)e.style.fontFamily=f.css;
      });
      const pv2vs=document.querySelector('#pv2 .pv2-vs');
      if(pv2vs)pv2vs.style.fontFamily=f.css;
      // config 저장 → display.html 즉시 반영
      if(typeof saveCfgNow==='function') saveCfgNow();
    };
    w.appendChild(el);
  });
}

function updateDst2(){
  const el=document.getElementById('dst2-match');if(!el)return;
  if(S.matches&&S.matches.length){
    for(let ri=0;ri<S.matches.length;ri++){
      for(let mi=0;mi<S.matches[ri].length;mi++){
        const m=S.matches[ri][mi];
        if(!m.winner&&m.p1&&m.p2){
          el.textContent=m.p1.name+' VS '+m.p2.name;
          return;
        }
      }
    }
    el.textContent='모든 경기 완료';
  } else {
    el.textContent='— VS —';
  }
}

// VS 화면 배경 스타일 설정
function setVsBg(style){
  S.vs2Bg=style;
  document.querySelectorAll('.ds2-bg-btn').forEach(b=>b.classList.toggle('on',b.dataset.style===style));
  const pv2=document.getElementById('pv2');
  if(pv2) pv2.dataset.bg=style;
  if(typeof saveCfgNow==='function') saveCfgNow();
}
