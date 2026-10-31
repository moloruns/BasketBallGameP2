// Game state: whether a round is in progress, the round timer, the score, and the
// session high score (kept in memory only, so reloading the page resets it to 0).

const GameState = (() => {
  let phase = 'READY';      // READY (start screen) | PLAYING | OVER (end screen)
  let score = 0;
  let highScore = 0;
  let timeLeft = ROUND_SECONDS;

  function startRound() {
    phase = 'PLAYING';
    score = 0;
    timeLeft = ROUND_SECONDS;
  }

  // Counts the clock down. Returns true on the frame the round runs out of time,
  // after updating the high score.
  function tick(dt) {
    if (phase !== 'PLAYING') return false;
    timeLeft = Math.max(0, timeLeft - dt);
    if (timeLeft > 0) return false;
    phase = 'OVER';
    highScore = Math.max(highScore, score);
    return true;
  }

  function addPoints(points) {
    score += points;
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
