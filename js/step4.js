// ══ STEP 4: 진행방식 ══
/* ── PROC ── */
function buildProc(){
  const w=document.getElementById('proclist');w.innerHTML='';
  PROCS.forEach(p=>{
    const d=document.createElement('div');
    d.className='pcard'+(S.proc===p.id?' sel':'');
    d.innerHTML=`<div class="pci">${p.icon}</div><div><div class="pc-name">${p.name}</div><div class="pc-desc">${p.desc}</div></div>`;
    d.onclick=()=>{S.proc=p.id;buildProc();};
    w.appendChild(d);
  });
}

