// ══════════════════════════════════════════
//  APP.JS — 공통 상태 관리 & 유틸리티
// ══════════════════════════════════════════

const App = (() => {

  // ── 기본 상태 ──
  const DEFAULT_STATE = {
    event: {
      name: '게임 행사',
      subtitle: '',
      logo: null,
      theme: 'dark-racing',
      primaryColor: '#e63946',
      accentColor: '#4cc9f0',
      sound: true,
    },
    mode: null,        // 'individual' | 'team' | 'tournament'
    gameType: null,    // 'timelap' | 'reaction' | 'weight' | ...
    participants: [],  // [{ id, name, team, color }]
    teams: [],         // [{ id, name, color, members:[] }]
    records: [],       // [{ id, participantId, time, score, round, lap, timestamp }]
    tournament: {
      rounds: [],
      currentRound: 0,
      currentMatch: 0,
    },
    settings: {
      laps: 1,
      timeLimit: 0,
      countFrom: 3,
    }
  };

  let state = loadState();

  function loadState() {
    try {
      const saved = localStorage.getItem('sgp_state');
      return saved ? { ...DEFAULT_STATE, ...JSON.parse(saved) } : { ...DEFAULT_STATE };
    } catch { return { ...DEFAULT_STATE }; }
  }

  function saveState() {
    localStorage.setItem('sgp_state', JSON.stringify(state));
  }

  function getState() { return state; }

  function setState(partial) {
    state = { ...state, ...partial };
    saveState();
  }

  function resetState() {
    state = { ...DEFAULT_STATE };
    saveState();
  }

  // ── 참가자 ──
  function addParticipant(name, teamId = null) {
    const p = {
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
      name,
      teamId,
      color: randomColor(),
    };
    state.participants.push(p);
    saveState();
    return p;
  }

  function removeParticipant(id) {
    state.participants = state.participants.filter(p => p.id !== id);
    state.records = state.records.filter(r => r.participantId !== id);
    saveState();
  }

  // ── 팀 ──
  const TEAM_COLORS = ['#e63946','#4cc9f0','#06d6a0','#ffd60a','#7b2fff','#ff6b35','#f72585','#4361ee'];

  function addTeam(name) {
    const t = {
      id: 't_' + Date.now(),
      name,
      color: TEAM_COLORS[state.teams.length % TEAM_COLORS.length],
    };
    state.teams.push(t);
    saveState();
    return t;
  }

  function removeTeam(id) {
    state.teams = state.teams.filter(t => t.id !== id);
    state.participants = state.participants.map(p =>
      p.teamId === id ? { ...p, teamId: null } : p
    );
    saveState();
  }

  // ── 기록 ──
  function addRecord(participantId, data) {
    const r = {
      id: 'r_' + Date.now(),
      participantId,
      ...data,
      timestamp: new Date().toISOString(),
    };
    state.records.push(r);
    saveState();
    return r;
  }

  function getRecords(participantId) {
    return state.records.filter(r => r.participantId === participantId);
  }

  function getBestRecord(participantId) {
    const recs = getRecords(participantId).filter(r => r.time != null);
    if (!recs.length) return null;
    return recs.reduce((a, b) => a.time < b.time ? a : b);
  }

  function getRanking() {
    return state.participants.map(p => {
      const best = getBestRecord(p.id);
      return { participant: p, best, time: best?.time ?? Infinity };
    }).sort((a, b) => a.time - b.time);
  }

  function getTeamRanking() {
    return state.teams.map(t => {
      const members = state.participants.filter(p => p.teamId === t.id);
      const times = members.map(p => getBestRecord(p.id)?.time).filter(Boolean);
      const total = times.reduce((a, b) => a + b, 0);
      const avg = times.length ? total / times.length : Infinity;
      return { team: t, members, totalTime: total, avgTime: avg, count: times.length };
    }).sort((a, b) => a.totalTime - b.totalTime);
  }

  function clearRecords() {
    state.records = [];
    saveState();
  }

  // ── 유틸 ──
  function formatTime(ms) {
    if (ms == null || ms === Infinity) return '--:--.---';
    const sign = ms < 0 ? '-' : '';
    ms = Math.floor(Math.abs(ms));
    const m  = Math.floor(ms / 60000);
    const s  = Math.floor((ms % 60000) / 1000);
    const ms3 = Math.floor(ms % 1000);
    return `${sign}${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms3).padStart(3,'0')}`;
  }

  function randomColor() {
    return TEAM_COLORS[Math.floor(Math.random() * TEAM_COLORS.length)];
  }

  function getParticipant(id) {
    return state.participants.find(p => p.id === id);
  }

  function getTeam(id) {
    return state.teams.find(t => t.id === id);
  }

  // ── 토스트 알림 ──
  function toast(msg, type = 'info', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), duration);
  }

  // ── 네비게이션 활성화 ──
  function setActiveNav(page) {
    document.querySelectorAll('.nav-step').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });
  }

  return {
    getState, setState, resetState,
    addParticipant, removeParticipant,
    addTeam, removeTeam,
    addRecord, getRecords, getBestRecord, getRanking, getTeamRanking, clearRecords,
    formatTime, randomColor,
    getParticipant, getTeam,
    toast, setActiveNav,
    TEAM_COLORS,
  };

// ══════════════════════════════════════════
//  게임 목록 — 단일 정의, 모든 페이지 공유
// ══════════════════════════════════════════

const SENSOR_GAMES = [
  { id:'timelap',   icon:'🏁', name:'타임랩',      desc:'출발~결승 시간 측정. 바퀴 수, 랩타임 자동 기록.', tag:'속도/시간', cat:'speed',    accent:'#e63946' },
  { id:'reaction',  icon:'⚡', name:'반응속도',     desc:'신호 후 버튼 누르는 속도 측정. 여러 명 동시 대결.', tag:'속도/시간', cat:'speed',    accent:'#ff6b35' },
  { id:'balance',   icon:'🎯', name:'균형 버티기',  desc:'압력 패드 위에서 균형 유지 시간. 흔들리면 탈락.', tag:'속도/시간', cat:'speed',    accent:'#4cc9f0' },
  { id:'jump',      icon:'🤸', name:'점프력',       desc:'패드에서 뛰어오른 공중 체공 시간 측정.', tag:'속도/시간', cat:'speed',    accent:'#4cc9f0' },
  { id:'distance',  icon:'📏', name:'멀리뛰기',     desc:'초음파 센서로 착지 거리 자동 측정.', tag:'속도/시간', cat:'speed',    accent:'#06d6a0' },
  { id:'weight',    icon:'⚖️', name:'무게 맞추기',  desc:'목표 무게에 얼마나 가까운지 정확도 경쟁.', tag:'힘/무게',  cat:'strength', accent:'#7b2fff' },
  { id:'strength',  icon:'💪', name:'악력/힘 측정', desc:'최대 힘 측정 후 순위. 3회 평균 또는 최고값.', tag:'힘/무게',  cat:'strength', accent:'#e63946' },
  { id:'weightacc', icon:'🏋️', name:'무게 정확도',  desc:'100g 단위로 정확하게 물건 올리기.', tag:'힘/무게',  cat:'strength', accent:'#ff6b35' },
  { id:'oddeven',   icon:'🎲', name:'홀짝 게임',    desc:'통과 횟수 카운트 후 홀짝 자동 판정.', tag:'운/재미',  cat:'fun',      accent:'#06d6a0' },
  { id:'roulette',  icon:'🎰', name:'랜덤 룰렛',    desc:'버튼 누르면 랜덤 미션/점수 지정.', tag:'운/재미',  cat:'fun',      accent:'#7b2fff' },
  { id:'count',     icon:'🔢', name:'카운트 대결',  desc:'제한 시간 안에 센서를 몇 번 통과하는지 대결.', tag:'운/재미',  cat:'fun',      accent:'#ffd60a' },
  { id:'sound',     icon:'🔊', name:'소리 크기',    desc:'가장 크게 소리지르기. 팀 응원 소리 크기 측정.', tag:'운/재미',  cat:'fun',      accent:'#ff6b35' },
];

const SPORT_GAMES = [
  { id:'athletics',   icon:'🏃', name:'육상',          desc:'트랙·필드·도로. 타이머·거리 기록.', tag:'육상/체조', cat:'athletics', accent:'#e63946' },
  { id:'gymnastics',  icon:'🤸', name:'체조',          desc:'기계체조·리듬체조·트램폴린. 심판 채점.', tag:'육상/체조', cat:'athletics', accent:'#ff6b35' },
  { id:'weightlift',  icon:'🏋️', name:'역도',          desc:'용상·인상. 체급별 기록 측정.', tag:'육상/체조', cat:'athletics', accent:'#7b2fff' },
  { id:'soccer',      icon:'⚽', name:'축구',          desc:'팀전. 득점 기록 및 토너먼트.', tag:'구기', cat:'ball', accent:'#06d6a0' },
  { id:'baseball',    icon:'⚾', name:'야구',          desc:'이닝별 점수 기록. 토너먼트 지원.', tag:'구기', cat:'ball', accent:'#e63946' },
  { id:'softball',    icon:'🥎', name:'소프트볼',      desc:'이닝별 점수 기록.', tag:'구기', cat:'ball', accent:'#ff6b35' },
  { id:'basketball',  icon:'🏀', name:'농구',          desc:'쿼터별 점수 기록. 토너먼트 지원.', tag:'구기', cat:'ball', accent:'#ffd60a' },
  { id:'volleyball',  icon:'🏐', name:'배구',          desc:'세트별 점수 기록. 토너먼트 지원.', tag:'구기', cat:'ball', accent:'#4cc9f0' },
  { id:'handball',    icon:'🤾', name:'핸드볼',        desc:'전·후반 득점 기록.', tag:'구기', cat:'ball', accent:'#7b2fff' },
  { id:'rugby',       icon:'🏉', name:'럭비',          desc:'전·후반 득점 기록. 토너먼트 지원.', tag:'구기', cat:'ball', accent:'#06d6a0' },
  { id:'hockey',      icon:'🏑', name:'하키',          desc:'전·후반 득점 기록.', tag:'구기', cat:'ball', accent:'#e63946' },
  { id:'tabletennis', icon:'🏓', name:'탁구',          desc:'세트 점수 입력. 토너먼트 지원.', tag:'구기', cat:'ball', accent:'#4cc9f0' },
  { id:'badminton',   icon:'🏸', name:'배드민턴',      desc:'세트 점수. 단식·복식 지원.', tag:'구기', cat:'ball', accent:'#ffd60a' },
  { id:'tennis',      icon:'🎾', name:'테니스',        desc:'세트·게임 점수. 단식·복식 지원.', tag:'구기', cat:'ball', accent:'#06d6a0' },
  { id:'softtennis',  icon:'🎾', name:'소프트테니스',  desc:'세트·게임 점수 입력.', tag:'구기', cat:'ball', accent:'#ff6b35' },
  { id:'squash',      icon:'🎱', name:'스쿼시',        desc:'게임 점수 입력. 토너먼트 지원.', tag:'구기', cat:'ball', accent:'#7b2fff' },
  { id:'bowling',     icon:'🎳', name:'볼링',          desc:'프레임별 점수. 스트라이크·스페어 자동 계산.', tag:'구기', cat:'ball', accent:'#4cc9f0' },
  { id:'golf',        icon:'⛳', name:'골프',          desc:'홀별 타수 입력. 스트로크·매치플레이 지원.', tag:'구기', cat:'ball', accent:'#06d6a0' },
  { id:'curling',     icon:'🥌', name:'컬링',          desc:'엔드별 점수 기록.', tag:'구기', cat:'ball', accent:'#4cc9f0' },
  { id:'boxing',      icon:'🥊', name:'복싱',          desc:'라운드 타이머 + 판정·점수. 체급별 지원.', tag:'무술/격투', cat:'martial', accent:'#e63946' },
  { id:'taekwondo',   icon:'🦵', name:'태권도',        desc:'경기 타이머 + 겨루기 승패·품새 점수.', tag:'무술/격투', cat:'martial', accent:'#4cc9f0' },
  { id:'judo',        icon:'🥋', name:'유도',          desc:'경기 타이머 + 판정(한판·절반). 체급별.', tag:'무술/격투', cat:'martial', accent:'#7b2fff' },
  { id:'wrestling',   icon:'🤼', name:'레슬링',        desc:'경기 타이머 + 포인트. 체급별 지원.', tag:'무술/격투', cat:'martial', accent:'#ff6b35' },
  { id:'fencing',     icon:'🤺', name:'펜싱',          desc:'경기 타이머 + 득점 기록.', tag:'무술/격투', cat:'martial', accent:'#ffd60a' },
  { id:'ssireum',     icon:'🏅', name:'씨름',          desc:'경기 타이머 + 승패. 체급별 토너먼트.', tag:'무술/격투', cat:'martial', accent:'#ff6b35' },
  { id:'hapkido',     icon:'🥋', name:'합기도',        desc:'시범 타이머 + 심판 채점.', tag:'무술/격투', cat:'martial', accent:'#7b2fff' },
  { id:'jujitsu',     icon:'🤼', name:'주짓수',        desc:'경기 타이머 + 체급별 포인트.', tag:'무술/격투', cat:'martial', accent:'#e63946' },
  { id:'muaythai',    icon:'🥊', name:'무에타이',      desc:'라운드 타이머 + 판정 점수.', tag:'무술/격투', cat:'martial', accent:'#ff6b35' },
  { id:'kickboxing',  icon:'🥊', name:'킥복싱',        desc:'라운드 타이머 + 판정 점수.', tag:'무술/격투', cat:'martial', accent:'#e63946' },
  { id:'wushu',       icon:'🐉', name:'우슈',          desc:'경기 타이머 + 심판 채점.', tag:'무술/격투', cat:'martial', accent:'#ffd60a' },
  { id:'sambo',       icon:'🥋', name:'삼보',          desc:'경기 타이머 + 포인트·판정.', tag:'무술/격투', cat:'martial', accent:'#7b2fff' },
  { id:'swimming',    icon:'🏊', name:'수영',          desc:'종목별 타임 기록. 부문별 지원.', tag:'수영/수상', cat:'aqua', accent:'#4cc9f0' },
  { id:'diving',      icon:'🤽', name:'다이빙',        desc:'심판 채점 입력.', tag:'수영/수상', cat:'aqua', accent:'#4cc9f0' },
  { id:'waterpolo',   icon:'🤽', name:'수구',          desc:'쿼터별 득점 기록.', tag:'수영/수상', cat:'aqua', accent:'#4cc9f0' },
  { id:'waterski',    icon:'🏄', name:'수상스키',      desc:'타임·채점 기록.', tag:'수영/수상', cat:'aqua', accent:'#06d6a0' },
  { id:'rowing',      icon:'🚣', name:'조정',          desc:'종목별 타임 기록.', tag:'수영/수상', cat:'aqua', accent:'#4cc9f0' },
  { id:'canoeing',    icon:'🛶', name:'카누',          desc:'종목별 타임 기록.', tag:'수영/수상', cat:'aqua', accent:'#4cc9f0' },
  { id:'sailing',     icon:'⛵', name:'요트',          desc:'레이스 순위 기록.', tag:'수영/수상', cat:'aqua', accent:'#06d6a0' },
  { id:'cycling',     icon:'🚴', name:'자전거',        desc:'타임·랩 기록. 도로·트랙·MTB 지원.', tag:'사이클', cat:'cycle', accent:'#ffd60a' },
  { id:'shooting',    icon:'🔫', name:'사격',          desc:'과녁 점수 입력. 종목별 설정 가능.', tag:'표적/정확도', cat:'target', accent:'#ffd60a' },
  { id:'archery',     icon:'🏹', name:'양궁',          desc:'라운드별 점수 합산. 실내·실외 지원.', tag:'표적/정확도', cat:'target', accent:'#06d6a0' },
  { id:'darts',       icon:'🎯', name:'다트',          desc:'라운드별 점수 입력.', tag:'표적/정확도', cat:'target', accent:'#06d6a0' },
  { id:'billiards',   icon:'🎱', name:'당구',          desc:'점수·이닝 기록. 3쿠션·포켓볼 지원.', tag:'표적/정확도', cat:'target', accent:'#7b2fff' },
  { id:'iceskating',  icon:'⛸️', name:'빙상',          desc:'타임 기록. 쇼트트랙·스피드스케이팅.', tag:'빙상/설상', cat:'winter', accent:'#4cc9f0' },
  { id:'figureskate', icon:'⛸️', name:'피겨스케이팅',  desc:'심판 채점 입력.', tag:'빙상/설상', cat:'winter', accent:'#4cc9f0' },
  { id:'icehockey',   icon:'🏒', name:'아이스하키',    desc:'피리어드별 득점 기록.', tag:'빙상/설상', cat:'winter', accent:'#4cc9f0' },
  { id:'skiing',      icon:'⛷️', name:'스키',          desc:'타임 기록. 알파인·크로스컨트리 지원.', tag:'빙상/설상', cat:'winter', accent:'#4cc9f0' },
  { id:'biathlon',    icon:'🎿', name:'바이애슬론',    desc:'타임+사격 점수 기록.', tag:'빙상/설상', cat:'winter', accent:'#4cc9f0' },
  { id:'equestrian',  icon:'🏇', name:'승마',          desc:'심판 채점·타임 기록.', tag:'기타', cat:'etc', accent:'#ff6b35' },
  { id:'triathlon',   icon:'🏅', name:'트라이애슬론',  desc:'수영+자전거+달리기 타임 기록.', tag:'기타', cat:'etc', accent:'#06d6a0' },
  { id:'climbing',    icon:'🧗', name:'스포츠클라이밍', desc:'타임·난이도·볼더링 점수.', tag:'기타', cat:'etc', accent:'#ff6b35' },
  { id:'cheerleading',icon:'📣', name:'치어리딩',      desc:'심판 채점 입력.', tag:'기타', cat:'etc', accent:'#e63946' },
  { id:'dancesport',  icon:'💃', name:'댄스스포츠',    desc:'심판 채점 입력. 종목별 지원.', tag:'기타', cat:'etc', accent:'#ff6b35' },
  { id:'esports',     icon:'🎮', name:'e스포츠',       desc:'라운드별 승패 기록. 토너먼트 지원.', tag:'기타', cat:'etc', accent:'#7b2fff' },
];

// 별칭 (setup.html 호환)
const SGAMES = SENSOR_GAMES.map(g => ({...g, ac: g.accent}));
const PGAMES = SPORT_GAMES.map(g => ({...g, ac: g.accent}));
const ALLG = [...SGAMES, ...PGAMES];

})();
