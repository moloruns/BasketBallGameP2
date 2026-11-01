// UI: the score / time / high score bar above the court and the start and
// end-of-round screens (plain HTML over the canvas, not drawn on it).

const Ui = (() => {
  const el = {
    score: document.getElementById('score'),
    time: document.getElementById('time'),
    high: document.getElementById('high'),
    startScreen: document.getElementById('start-screen'),
    endScreen: document.getElementById('end-screen'),
    finalScore: document.getElementById('final-score'),
    finalHigh: document.getElementById('final-high'),
    startButton: document.getElementById('start-button'),
    againButton: document.getElementById('again-button'),
    feedback: document.getElementById('shot-feedback'),
    muteButton: document.getElementById('mute-button'),
  };

  function onStart(callback) {
    el.startButton.addEventListener('click', callback);
    el.againButton.addEventListener('click', callback);
  }

  function updateHud() {
    el.score.textContent = GameState.score;
    el.high.textContent = GameState.highScore;
    const secs = Math.ceil(GameState.timeLeft);
    el.time.textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  }

  function hideScreens() {
    el.startScreen.classList.add('hidden');
    el.endScreen.classList.add('hidden');
  }

  function showEndScreen() {
    el.finalScore.textContent = GameState.score;
    el.finalHigh.textContent = GameState.highScore;
    el.endScreen.classList.remove('hidden');
  }

  function showResult(result) {
    const message = result ? result.text : 'Shoot at the left hoop · Release near the white line';
    if (el.feedback.textContent !== message) el.feedback.textContent = message;
    el.feedback.style.color = result ? result.color : '';
  }

  function onMute(callback) { el.muteButton.addEventListener('click', callback); }
  function updateMute() {
    el.muteButton.textContent = Sound.muted ? 'Sound: off' : 'Sound: on';
    el.muteButton.setAttribute('aria-pressed', String(Sound.muted));
  }

  return { onStart, updateHud, hideScreens, showEndScreen, showResult, onMute, updateMute };
})();
