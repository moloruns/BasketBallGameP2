// Entry point: sets up the canvas, connects mouse clicks to the shot flow
// (move -> click -> meter fills -> click -> make/miss), and runs the game loop.

const canvas = document.getElementById('court');
canvas.width = Court.width;
canvas.height = Court.height;
const ctx = canvas.getContext('2d');

let lastResult = null;   // { text, color, age } for the "MAKE" / "MISS" message

function handleClick() {
  if (!GameState.isPlaying()) return;
  const now = performance.now();
  if (Meter.isActive()) {
    resolveShot(Meter.stop(now));
  } else {
    // The zone is fixed here, at the moment the meter starts
    Meter.start(Court.getZone(Player.position.x, Player.position.y), now);
    Player.setFrozen(true);
  }
}

function resolveShot(result) {
  Player.setFrozen(false);
  if (result.made) GameState.addPoints(result.points);
  lastResult = result.made
    ? { text: `MAKE +${result.points}`, color: '#ffd23f', age: 0 }
    : { text: 'MISS', color: '#ff5a4f', age: 0 };
}

function update(dt, now) {
  if (GameState.tick(dt)) endRound();
  if (GameState.isPlaying()) {
    Player.update(dt);
    if (Meter.isActive() && Meter.isFull(now)) resolveShot(Meter.stop(now));
  }
  if (lastResult) {
    lastResult.age += dt;
    if (lastResult.age > RESULT_SHOW_SECONDS) lastResult = null;
  }
}

function startRound() {
  GameState.startRound();
  Player.reset();
  Meter.cancel();
  lastResult = null;
  Ui.hideScreens();
}

// A shot whose meter is still filling at the buzzer is thrown away and scores nothing.
function endRound() {
  Meter.cancel();
  Player.setFrozen(false);
  Ui.showEndScreen();
}

function render(now) {
  Court.draw(ctx);
  Player.draw(ctx);
  if (Meter.isActive()) Meter.draw(ctx, now, Player.position);
  if (lastResult) drawResult();
  Ui.updateHud();
}

function drawResult() {
  const x = Court.toPx(22);
  const y = Court.toPx(10);
  ctx.font = 'bold 40px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.strokeText(lastResult.text, x, y);
  ctx.fillStyle = lastResult.color;
  ctx.fillText(lastResult.text, x, y);
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
Ui.onStart(startRound);
requestAnimationFrame(frame);
