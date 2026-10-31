// Shot meter: a vertical bar that fills bottom to top over the shot zone's fill time,
// with a target line at METER.TARGET. Stopping it inside the make window
// (METER.MAKE_MIN to METER.MAKE_MAX, inclusive) is a make; anything else, including
// letting the bar fill to 100%, is a miss.

const Meter = (() => {
  let zone = null;        // the zone the current shot was taken from; null when idle
  let startMs = 0;

  function start(shotZone, nowMs) {
    zone = shotZone;
    startMs = nowMs;
  }

  function isActive() {
    return zone !== null;
  }

  function fillAt(nowMs) {
    return Math.min(1, (nowMs - startMs) / (zone.fillSeconds * 1000));
  }

  function isFull(nowMs) {
    return fillAt(nowMs) >= 1;
  }

  // Stops the meter and returns the shot result: { fill, made, points }
  function stop(nowMs) {
    const fill = fillAt(nowMs);
    const result = { fill, made: isMake(fill), points: zone.points };
    zone = null;
    return result;
  }

  function cancel() {
    zone = null;
  }

  function isMake(fill) {
    return fill >= METER.MAKE_MIN && fill <= METER.MAKE_MAX;
  }

  // Draws the bar beside the player, flipping to the left side near the right edge
  function draw(ctx, nowMs, playerPos) {
    const fill = fillAt(nowMs);
    const W = METER.WIDTH_PX;
    const H = METER.HEIGHT_PX;
    const gap = PLAYER.RADIUS_FT * COURT.PX_PER_FT + 18;
    const px = Court.toPx(playerPos.x);
    let x = px + gap;
    if (x + W > ctx.canvas.width - 8) x = px - gap - W;
    const y = Math.max(8, Math.min(ctx.canvas.height - H - 8, Court.toPx(playerPos.y) - H / 2));

    ctx.fillStyle = 'rgba(15, 17, 22, 0.85)';
    ctx.beginPath();
    ctx.roundRect(x - 4, y - 4, W + 8, H + 8, 6);
    ctx.fill();

    ctx.fillStyle = '#2e333d';
    ctx.fillRect(x, y, W, H);

    ctx.fillStyle = '#4fb3ff';
    ctx.fillRect(x, y + H * (1 - fill), W, H * fill);

    const targetY = y + H * (1 - METER.TARGET);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - 5, targetY - 1.5, W + 10, 3);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, W, H);
  }

  return { start, isActive, isFull, stop, cancel, isMake, draw };
})();
