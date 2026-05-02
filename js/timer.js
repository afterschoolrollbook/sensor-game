// ══════════════════════════════════════════
//  TIMER.JS — 타이머 엔진
// ══════════════════════════════════════════

const Timer = (() => {
  let startTime = null;
  let elapsed = 0;
  let running = false;
  let rafId = null;
  let onTick = null;
  let lapTimes = [];
  let lapStart = null;

  function start(callback) {
    if (running) return;
    running = true;
    startTime = performance.now() - elapsed;
    lapStart = lapStart ?? startTime;
    onTick = callback;
    tick();
  }

  function stop() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(rafId);
    elapsed = performance.now() - startTime;
    return elapsed;
  }

  function reset() {
    stop();
    elapsed = 0;
    startTime = null;
    lapStart = null;
    lapTimes = [];
  }

  function lap() {
    const now = performance.now();
    const total = running ? now - startTime : elapsed;
    const lapTime = now - (lapStart ?? startTime ?? now);
    lapStart = now;
    lapTimes.push(lapTime);
    return { total, lapTime, lapNumber: lapTimes.length };
  }

  function getElapsed() {
    if (running) return performance.now() - startTime;
    return elapsed;
  }

  function isRunning() { return running; }

  function getLaps() { return [...lapTimes]; }

  function tick() {
    if (!running) return;
    if (onTick) onTick(getElapsed());
    rafId = requestAnimationFrame(tick);
  }

  return { start, stop, reset, lap, getElapsed, isRunning, getLaps };
})();
