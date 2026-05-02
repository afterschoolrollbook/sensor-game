// ══════════════════════════════════════════
//  TOURNAMENT.JS — 토너먼트 로직
// ══════════════════════════════════════════

const Tournament = (() => {

  // 참가자 목록으로 싱글 엘리미네이션 브라켓 생성
  function createBracket(participants) {
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    // 2의 거듭제곱으로 맞추기 (빈 슬롯 = BYE)
    const size = Math.pow(2, Math.ceil(Math.log2(shuffled.length)));
    while (shuffled.length < size) shuffled.push(null); // BYE

    const rounds = [];
    let currentRound = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      currentRound.push({
        id: `m_${0}_${i/2}`,
        p1: shuffled[i],
        p2: shuffled[i+1],
        winner: shuffled[i+1] === null ? shuffled[i] : null, // BYE 자동 승리
        score1: null,
        score2: null,
        round: 0,
      });
    }
    rounds.push(currentRound);

    // 나머지 라운드 빈 슬롯으로 생성
    let matchCount = currentRound.length / 2;
    let roundIdx = 1;
    while (matchCount >= 1) {
      const round = [];
      for (let i = 0; i < matchCount; i++) {
        round.push({
          id: `m_${roundIdx}_${i}`,
          p1: null, p2: null,
          winner: null, score1: null, score2: null,
          round: roundIdx,
        });
      }
      rounds.push(round);
      matchCount = Math.floor(matchCount / 2);
      roundIdx++;
    }

    return rounds;
  }

  // 결과 입력 후 다음 라운드 업데이트
  function setResult(rounds, roundIdx, matchIdx, winnerId) {
    const match = rounds[roundIdx][matchIdx];
    match.winner = winnerId;

    // 다음 라운드 슬롯에 승자 배치
    const nextRound = roundIdx + 1;
    if (nextRound < rounds.length) {
      const nextMatchIdx = Math.floor(matchIdx / 2);
      const slot = matchIdx % 2 === 0 ? 'p1' : 'p2';
      rounds[nextRound][nextMatchIdx][slot] = winnerId;

      // 상대방도 BYE면 자동 진출
      const nextMatch = rounds[nextRound][nextMatchIdx];
      if (nextMatch.p1 === null) nextMatch.winner = nextMatch.p2;
      if (nextMatch.p2 === null) nextMatch.winner = nextMatch.p1;
    }

    return rounds;
  }

  // 현재 진행 중인 매치 찾기
  function getCurrentMatch(rounds) {
    for (let ri = 0; ri < rounds.length; ri++) {
      for (let mi = 0; mi < rounds[ri].length; mi++) {
        const m = rounds[ri][mi];
        if (m.p1 && m.p2 && !m.winner) {
          return { roundIdx: ri, matchIdx: mi, match: m };
        }
      }
    }
    return null; // 토너먼트 완료
  }

  // 우승자
  function getChampion(rounds) {
    const final = rounds[rounds.length - 1];
    return final?.[0]?.winner ?? null;
  }

  // 라운드 이름
  function getRoundName(rounds, roundIdx) {
    const total = rounds.length;
    const remaining = total - roundIdx;
    if (remaining === 1) return '결승';
    if (remaining === 2) return '준결승';
    if (remaining === 3) return '8강';
    if (remaining === 4) return '16강';
    return `${roundIdx + 1}라운드`;
  }

  return { createBracket, setResult, getCurrentMatch, getChampion, getRoundName };
})();
