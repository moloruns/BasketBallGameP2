// Entry point: sets up the canvas, connects mouse clicks to the shot flow
// (move -> click -> meter fills -> click -> make/miss), and runs the game loop.

const canvas = document.getElementById('court');
canvas.width = Court.width;
canvas.height = Court.height;
const ctx = canvas.getContext('2d');

let lastResult = null;   // { text, color, startMs } for the "MAKE" / "MISS" message

function handleClick(now = performance.now()) {
  if (GameState.tick(now)) endRound();
  if (!GameState.isPlaying()) return;
  Sound.unlock();
  if (Meter.isActive()) {
    resolveShot(Meter.stop(now), now);
  } else {
    // The zone is fixed here, at the moment the meter starts
    Meter.start(Court.getZone(Player.position.x, Player.position.y), now);
    Player.setFrozen(true);
  }
}

function resolveShot(result, now = performance.now()) {
  if (GameState.tick(now)) endRound();
  if (!result || !GameState.isPlaying()) return;
  Player.setFrozen(false);
  if (result.made) GameState.addPoints(result.points);
  Ball.launch(result, Player.position, now);
  Sound.play('release');
  lastResult = result.made
    ? { text: `MAKE +${result.points}`, color: '#ffd23f', startMs: now }
    : { text: 'MISS', color: '#ff5a4f', startMs: now };
}

function update(dt, now) {
  Ball.update(now);
  if (GameState.tick(now)) endRound();
  if (GameState.isPlaying()) {
    Player.update(dt);
    if (Meter.isActive() && Meter.isFull(now)) resolveShot(Meter.stop(now), now);
  }
  if (lastResult) {
    if (now - lastResult.startMs > RESULT_SHOW_SECONDS * 1000) lastResult = null;
  }
}

function startRound(now = performance.now()) {
  GameState.startRound(now);
  lastFrameMs = now;
  Player.reset();
  Meter.cancel();
  Ball.clear();
  Sound.stopAll();
  lastResult = null;
  Ui.hideScreens();
  Ui.showResult(null);
  Ui.updateHud();
}

// A shot whose meter is still filling at the buzzer is thrown away and scores nothing.
function endRound() {
  Meter.cancel();
  Player.setFrozen(false);
  Sound.stopAll();
  Sound.play('buzzer');
  Ui.showEndScreen();
  Ui.updateHud();
}

function render(now) {
  Court.draw(ctx);
  Player.draw(ctx);
  Ball.draw(ctx, now);
  if (Meter.isActive()) Meter.draw(ctx, now, Player.position);
  drawResult();
  Ui.updateHud();
}

function drawResult() {
  Ui.showResult(lastResult);
}

let lastFrameMs = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - lastFrameMs) / 1000);
  lastFrameMs = now;
  update(dt, now);
  render(now);
  requestAnimationFrame(frame);
}

Player.attachInput(canvas, handleClick);
Ui.onStart(() => { Sound.unlock(); startRound(); });
Ui.onMute(() => { Sound.unlock(); Sound.setMuted(!Sound.muted); Ui.updateMute(); });
requestAnimationFrame(frame);
