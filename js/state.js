// Game state: whether a round is in progress, the round timer, the score, and the
// session high score (kept in memory only, so reloading the page resets it to 0).

const GameState = (() => {
  let phase = 'READY';      // READY (start screen) | PLAYING | OVER (end screen)
  let score = 0;
  let highScore = 0;
  let timeLeft = ROUND_SECONDS;
  let deadlineMs = 0;

  function startRound(nowMs = performance.now()) {
    deadlineMs = nowMs + ROUND_SECONDS * 1000;
    phase = 'PLAYING';
    score = 0;
    timeLeft = ROUND_SECONDS;
  }

  // Uses the same monotonic clock as the meter, even after a suspended frame.
  // Returns true once when the round runs out of time,
  // after updating the high score.
  function tick(nowMs = performance.now()) {
    if (phase !== 'PLAYING') return false;
    timeLeft = Math.max(0, Math.min(ROUND_SECONDS, (deadlineMs - nowMs) / 1000));
    if (timeLeft > 0) return false;
    phase = 'OVER';
    highScore = Math.max(highScore, score);
    return true;
  }

  function addPoints(points) {
    if (phase === 'PLAYING') score += points;
  }

  return {
    startRound,
    tick,
    addPoints,
    isPlaying: () => phase === 'PLAYING',
    get phase() { return phase; },
    get score() { return score; },
    get highScore() { return highScore; },
    get timeLeft() { return timeLeft; },
  };
})();
