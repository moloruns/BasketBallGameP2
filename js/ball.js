// Cosmetic flights only. Meter/GameState remain the sole owners of shot outcomes.
const Ball = (() => {
  let flights = [];

  function launch(result, position, nowMs) {
    const facing = Math.atan2(HOOP.Y_FT - position.y, HOOP.X_FT - position.x);
    // Match the held ball in Player.draw, but copy the release position.
    const start = {
      x: position.x + Math.cos(facing) * 1.1 - Math.sin(facing) * .7,
      y: position.y + Math.sin(facing) * 1.1 + Math.cos(facing) * .7,
    };
    const distance = Math.hypot(start.x - HOOP.X_FT, start.y - HOOP.Y_FT);
    const flight = {
      start, made: result.made, fill: result.fill, startMs: nowMs,
      durationMs: BALL.MIN_FLIGHT_MS + Math.min(1, distance / COURT.WIDTH_FT) * BALL.EXTRA_FLIGHT_MS,
      arcPx: Math.min(BALL.MAX_ARC_PX, 25 + distance),
      target: { x: HOOP.X_FT + (result.made ? 0 : .6), y: HOOP.Y_FT },
      impacted: false,
    };
    flights.push(flight);
    if (flights.length > BALL.MAX_FLIGHTS) flights.shift();
    return flight;
  }

  // Shared by drawing and tests; the flight never reads the player's new position.
  function pose(flight, nowMs) {
    const elapsed = Math.max(0, nowMs - flight.startMs);
    const t = Math.min(1, elapsed / flight.durationMs);
    const finish = Math.max(0, (elapsed - flight.durationMs) / BALL.FINISH_MS);
    let x = flight.start.x + (flight.target.x - flight.start.x) * t;
    let y = flight.start.y + (flight.target.y - flight.start.y) * t;
    let lift = Math.sin(t * Math.PI) * flight.arcPx;
    if (finish > 0) {
      if (flight.made) y += finish * 1.6;
      else {
        x += finish * 4;
        y += finish * (flight.fill < METER.TARGET ? 2.8 : -2.8);
        lift = Math.sin(Math.min(1, finish) * Math.PI) * 24;
      }
    }
    return { x, y, lift, finish, alpha: Math.max(0, 1 - finish) };
  }

  function update(nowMs) {
    for (const flight of flights) {
      const age = nowMs - flight.startMs;
      if (!flight.impacted && age >= flight.durationMs) {
        flight.impacted = true;
        // Do not replay stale impact sounds when returning from a hidden tab.
        if (age < flight.durationMs + BALL.FINISH_MS) Sound.play(flight.made ? 'make' : 'miss');
      }
    }
    flights = flights.filter(flight => nowMs - flight.startMs < flight.durationMs + BALL.FINISH_MS);
  }

  function draw(ctx, nowMs) {
    for (const flight of flights) {
      const p = pose(flight, nowMs);
      if (p.alpha <= 0) continue;
      const x = Court.toPx(p.x), floorY = Court.toPx(p.y);
      const radius = BALL.RADIUS_PX * (1 + p.lift / 220);
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = 'rgba(0,0,0,.22)';
      ctx.beginPath(); ctx.ellipse(x + 3, floorY + 5, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
      if (p.finish > 0 && flight.made) {
        ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(Court.toPx(HOOP.X_FT), Court.toPx(HOOP.Y_FT), 12 + p.finish * 18, 0, Math.PI * 2); ctx.stroke();
        // A short net stretch under the active rim.
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath(); ctx.moveTo(Court.toPx(HOOP.X_FT) + i * 7, Court.toPx(HOOP.Y_FT));
          ctx.lineTo(Court.toPx(HOOP.X_FT) + i * 4, Court.toPx(HOOP.Y_FT) + 14 * (1 - p.finish)); ctx.stroke();
        }
      }
      ctx.translate(x, floorY - p.lift);
      ctx.rotate((nowMs - flight.startMs) / 220);
      ctx.fillStyle = '#ef7a1f'; ctx.strokeStyle = '#4a2208'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-radius, 0); ctx.lineTo(radius, 0); ctx.moveTo(0, -radius); ctx.lineTo(0, radius); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 0, radius * .45, radius, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }

  return { launch, pose, update, draw, clear: () => { flights = []; }, get count() { return flights.length; } };
})();
