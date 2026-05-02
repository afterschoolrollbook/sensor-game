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
