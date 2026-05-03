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
})();
