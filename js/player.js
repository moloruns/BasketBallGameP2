// Player and mouse input: tracks where the mouse is on the court, moves the player
// toward it (unless frozen during a shot), keeps the player on the court, draws the
// player, and forwards left clicks to the game.

const Player = (() => {
  const position = { x: PLAYER.START_X_FT, y: PLAYER.START_Y_FT };
  const mouse = { x: PLAYER.START_X_FT, y: PLAYER.START_Y_FT };
  let frozen = false;

  function attachInput(canvas, onClick) {
    canvas.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      // The canvas is scaled by CSS, so convert from screen pixels to canvas pixels first
      mouse.x = Court.toFt((e.clientX - r.left) * (canvas.width / r.width));
      mouse.y = Court.toFt((e.clientY - r.top) * (canvas.height / r.height));
    });
    canvas.addEventListener('mousedown', e => {
      if (e.button === 0) onClick();
    });
  }

  function update(dt) {
    if (frozen) return;
    const r = PLAYER.RADIUS_FT;
    const tx = clamp(mouse.x, r, COURT.WIDTH_FT - r);
    const ty = clamp(mouse.y, r, COURT.HEIGHT_FT - r);
    const k = Math.min(1, dt * PLAYER.FOLLOW_SPEED);
    position.x += (tx - position.x) * k;
    position.y += (ty - position.y) * k;
  }

  function reset() {
    position.x = PLAYER.START_X_FT;
    position.y = PLAYER.START_Y_FT;
    frozen = false;
  }

  function draw(ctx) {
    const S = COURT.PX_PER_FT;
    const px = Court.toPx(position.x);
    const py = Court.toPx(position.y);
    const facing = Math.atan2(HOOP.Y_FT - position.y, HOOP.X_FT - position.x);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.arc(px + 3, py + 4, PLAYER.RADIUS_FT * S, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(facing);

    // Shoulders / jersey
    ctx.fillStyle = '#1e4fd8';
    ctx.strokeStyle = '#0d2a7a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 0.75 * S, PLAYER.RADIUS_FT * S, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Ball held in front, toward the hoop
    ctx.fillStyle = '#ef7a1f';
    ctx.strokeStyle = '#4a2208';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(1.1 * S, 0.7 * S, 0.62 * S, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.fillStyle = '#6b4128';
    ctx.beginPath();
    ctx.arc(0, 0, 0.55 * S, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  return {
    position,
    attachInput,
    update,
    reset,
    draw,
    setFrozen: value => { frozen = value; },
  };
})();
