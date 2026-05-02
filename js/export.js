// ══════════════════════════════════════════
//  EXPORT.JS — 엑셀 / CSV 내보내기
// ══════════════════════════════════════════

const Export = (() => {

  // CSV 다운로드
  function downloadCSV(filename, rows) {
    const csv = rows.map(row =>
      row.map(cell => {
        const s = String(cell ?? '');
        return s.includes(',') || s.includes('"') || s.includes('\n')
          ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(',')
    ).join('\n');

    const bom = '\uFEFF'; // Excel 한글 깨짐 방지
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, filename);
  }

  // 결과 CSV 내보내기
  function exportResults() {
    const state = App.getState();
    const ranking = App.getRanking();

    const rows = [
      ['순위', '참가자명', '팀', '최고기록', '도전횟수', '날짜'],
      ...ranking.map((item, idx) => [
        idx + 1,
        item.participant.name,
        item.participant.teamId ? (App.getTeam(item.participant.teamId)?.name ?? '') : '개인',
        item.best ? App.formatTime(item.best.time) : '-',
        App.getRecords(item.participant.id).length,
        new Date().toLocaleDateString('ko-KR'),
      ])
    ];

    downloadCSV(`${state.event.name}_결과_${dateStr()}.csv`, rows);
    App.toast('CSV 저장 완료!', 'success');
  }

  // 팀 결과 CSV
  function exportTeamResults() {
    const state = App.getState();
    const ranking = App.getTeamRanking();

    const rows = [
      ['팀순위', '팀명', '팀원수', '합산기록', '평균기록'],
      ...ranking.map((item, idx) => [
        idx + 1,
        item.team.name,
        item.count,
        App.formatTime(item.totalTime),
        App.formatTime(item.avgTime),
      ])
    ];

    downloadCSV(`${state.event.name}_팀결과_${dateStr()}.csv`, rows);
    App.toast('팀 결과 CSV 저장 완료!', 'success');
  }

  // 상세 기록 CSV (모든 랩)
  function exportDetailRecords() {
    const state = App.getState();

    const rows = [
      ['참가자', '팀', '라운드', '랩', '기록(ms)', '기록(표시)', '시각'],
      ...state.records.map(r => {
        const p = App.getParticipant(r.participantId);
        const t = p?.teamId ? App.getTeam(p.teamId)?.name : '개인';
        return [
          p?.name ?? '?',
          t ?? '',
          r.round ?? 1,
          r.lap ?? 1,
          r.time ?? '',
          r.time ? App.formatTime(r.time) : '',
          new Date(r.timestamp).toLocaleString('ko-KR'),
        ];
      })
    ];

    downloadCSV(`${state.event.name}_상세기록_${dateStr()}.csv`, rows);
    App.toast('상세 기록 CSV 저장 완료!', 'success');
  }

  // 결과 텍스트 클립보드 복사
  function copyResultText() {
    const state = App.getState();
    const ranking = App.getRanking();

    let text = `🏁 ${state.event.name} 결과\n`;
    text += `📅 ${new Date().toLocaleDateString('ko-KR')}\n\n`;
    ranking.slice(0, 10).forEach((item, idx) => {
      const medal = ['🥇','🥈','🥉'][idx] ?? `${idx+1}.`;
      text += `${medal} ${item.participant.name}  ${item.best ? App.formatTime(item.best.time) : '-'}\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      App.toast('클립보드에 복사됐어요!', 'success');
    }).catch(() => {
      App.toast('복사 실패 — 브라우저 권한을 확인하세요', 'error');
    });
  }

  // 인쇄
  function printResults() {
    window.print();
  }

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function dateStr() {
    return new Date().toISOString().slice(0,10);
  }

  return { exportResults, exportTeamResults, exportDetailRecords, copyResultText, printResults };
})();


// ══════════════════════════════════════════
//  설정 저장 / 불러오기 (JSON 파일)
// ══════════════════════════════════════════

const Settings = (() => {

  // 저장할 항목 정의
  function buildSaveData(includeRecords = false) {
    const state = App.getState();
    const data = {
      version: '1.0',
      savedAt: new Date().toISOString(),
      event: state.event,
      participants: state.participants,
      teams: state.teams,
      settings: state.settings,
      gameType: state.gameType,
      mode: state.mode,
    };
    if (includeRecords) data.records = state.records;
    return data;
  }

  // JSON 파일로 저장
  function saveToFile(includeRecords = false) {
    const data = buildSaveData(includeRecords);
    const state = App.getState();
    const filename = `SGP_${state.event.name || '행사'}_${new Date().toISOString().slice(0,10)}.json`
      .replace(/[\/:*?"<>|]/g, '_');
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    App.toast(`💾 "${filename}" 저장됨!`, 'success');
  }

  // JSON 파일 불러오기
  function loadFromFile(callback) {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!data.version) throw new Error('올바른 SGP 설정 파일이 아니에요');
          applyData(data);
          App.toast(`📂 "${file.name}" 불러오기 완료!`, 'success');
          if (callback) callback(data);
        } catch(err) {
          App.toast('파일 오류: ' + err.message, 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  // 불러온 데이터 적용
  function applyData(data) {
    App.setState({
      event:        data.event        || App.getState().event,
      participants: data.participants || [],
      teams:        data.teams        || [],
      settings:     data.settings     || App.getState().settings,
      gameType:     data.gameType     || null,
      mode:         data.mode         || 'individual',
      records:      data.records      || [],
      tournament:   { rounds: [], currentRound: 0, currentMatch: 0 },
    });
  }

  // 빠른 저장 (참가자+설정만, 기록 제외)
  function quickSave() { saveToFile(false); }

  // 전체 저장 (기록 포함)
  function fullSave() { saveToFile(true); }

  return { quickSave, fullSave, loadFromFile };
})();


// ══════════════════════════════════════════
//  엑셀 불러오기 / 내보내기 (SheetJS)
// ══════════════════════════════════════════

const ExcelIO = (() => {

  // SheetJS CDN 동적 로드
  function loadSheetJS(callback) {
    if (window.XLSX) { callback(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload = callback;
    document.head.appendChild(s);
  }

  // ── 엑셀 불러오기 ──
  function importExcel(callback) {
    loadSheetJS(() => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xlsx,.xls';
      input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
          try {
            const wb    = XLSX.read(ev.target.result, { type: 'array' });
            const state = App.getState();
            let newState = { ...state };

            // ── 행사 설정 시트 파싱 ──
            const ws1 = wb.Sheets['🎯 행사 설정'];
            if (ws1) {
              const rows = XLSX.utils.sheet_to_json(ws1, { header: 1 });
              const settings = {};
              rows.forEach(row => {
                if (row[0] && row[2] !== undefined) settings[row[0]] = row[2];
              });
              newState.event = {
                ...state.event,
                name:         settings['event_name']     || state.event.name,
                subtitle:     settings['event_subtitle'] || '',
                theme:        settings['theme']          || state.event.theme,
                primaryColor: settings['primary_color']  || state.event.primaryColor,
                accentColor:  settings['accent_color']   || state.event.accentColor,
                sound:        settings['sound'] !== 'OFF',
              };
              newState.gameType = settings['game_type'] || state.gameType;
              newState.mode     = settings['mode']      || state.mode;
              newState.settings = {
                ...state.settings,
                laps:      parseInt(settings['laps'])       || 1,
                timeLimit: parseInt(settings['time_limit']) || 0,
              };
            }

            // ── 팀 구성 시트 파싱 ──
            const ws3 = wb.Sheets['🏷️ 팀 구성'];
            const teams = [];
            if (ws3) {
              const rows = XLSX.utils.sheet_to_json(ws3, { header: 1 });
              rows.slice(1).forEach(row => {
                const id   = row[0]; // team_id
                const name = row[1]; // 팀 이름
                const color= row[2]; // 팀 색상
                if (id && name && String(name).trim()) {
                  teams.push({
                    id: String(id),
                    name: String(name).trim(),
                    color: String(color || '#E63946').trim(),
                  });
                }
              });
            }
            newState.teams = teams;

            // ── 참가자 명단 시트 파싱 ──
            const ws2 = wb.Sheets['👥 참가자 명단'];
            const participants = [];
            if (ws2) {
              const rows = XLSX.utils.sheet_to_json(ws2, { header: 1 });
              rows.slice(1).forEach(row => {
                const id   = row[0]; // no
                const name = row[2]; // 이름
                const team = row[3]; // 팀
                if (id && name && String(name).trim()) {
                  const teamObj = teams.find(t => t.name === String(team || '').trim());
                  participants.push({
                    id:     String(id),
                    name:   String(name).trim(),
                    teamId: teamObj ? teamObj.id : null,
                    color:  teamObj ? teamObj.color : App.TEAM_COLORS[participants.length % App.TEAM_COLORS.length],
                  });
                }
              });
            }
            newState.participants = participants;
            newState.records      = [];
            newState.tournament   = { rounds: [], currentRound: 0, currentMatch: 0 };

            App.setState(newState);
            App.toast(`✅ "${file.name}" 불러오기 완료! 참가자 ${participants.length}명, 팀 ${teams.length}개`, 'success', 4000);
            if (callback) callback(newState);

          } catch(err) {
            App.toast('엑셀 파일 오류: ' + err.message, 'error');
          }
        };
        reader.readAsArrayBuffer(file);
      };
      input.click();
    });
  }

  // ── 엑셀 내보내기 (결과) ──
  function exportResultExcel() {
    loadSheetJS(() => {
      const state   = App.getState();
      const ranking = App.getRanking();
      const wb      = XLSX.utils.book_new();

      // 시트1: 전체 순위
      const rankData = [
        ['순위', '참가자', '팀', '최고기록', '도전횟수', '날짜'],
        ...ranking.map((item, idx) => [
          idx + 1,
          item.participant.name,
          item.participant.teamId ? (App.getTeam(item.participant.teamId)?.name || '') : '개인',
          item.best ? App.formatTime(item.best.time) : '—',
          App.getRecords(item.participant.id).length,
          new Date().toLocaleDateString('ko-KR'),
        ])
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rankData), '전체 순위');

      // 시트2: 팀 순위
      const teamRanking = App.getTeamRanking();
      const teamData = [
        ['팀순위', '팀명', '팀원수', '합산기록', '평균기록'],
        ...teamRanking.map((item, idx) => [
          idx + 1, item.team.name, item.count,
          App.formatTime(item.totalTime), App.formatTime(item.avgTime),
        ])
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(teamData), '팀 순위');

      // 시트3: 상세 기록
      const detailData = [
        ['참가자', '팀', '라운드', '랩', '기록', '시각'],
        ...state.records.map(r => {
          const p = App.getParticipant(r.participantId);
          const t = p?.teamId ? App.getTeam(p.teamId)?.name : '개인';
          return [p?.name||'?', t||'', r.round||1, r.lap||1,
            r.time ? App.formatTime(r.time) : '—',
            new Date(r.timestamp).toLocaleString('ko-KR')];
        })
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(detailData), '상세 기록');

      // 시트4: 행사 정보
      const infoData = [
        ['항목', '내용'],
        ['행사명', state.event.name],
        ['날짜', new Date().toLocaleDateString('ko-KR')],
        ['게임', state.gameType || '—'],
        ['진행방식', state.mode || '—'],
        ['참가자수', state.participants.length],
        ['총 기록수', state.records.length],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(infoData), '행사 정보');

      const filename = `SGP_결과_${state.event.name}_${new Date().toISOString().slice(0,10)}.xlsx`.replace(/[\/:*?"<>|]/g,'_');
      XLSX.writeFile(wb, filename);
      App.toast(`📊 "${filename}" 저장됨!`, 'success');
    });
  }

  return { importExcel, exportResultExcel };
})();
