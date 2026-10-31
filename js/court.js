// Court: converts between feet and canvas pixels, draws the top-down court
// (floor, lines, keys, three-point arcs, and both hoops, with the far hoop dimmed),
// and decides which shot zone (2, 3, or 4 points) a spot on the floor is in.

const Court = (() => {
  const S = COURT.PX_PER_FT;
  const width = COURT.WIDTH_FT * S + COURT.MARGIN_PX * 2;
  const height = COURT.HEIGHT_FT * S + COURT.MARGIN_PX * 2;
  const HALF_X_FT = COURT.WIDTH_FT / 2;
  // Where the straight corner three-point lines meet the arc
  const CORNER_X_FT = HOOP.X_FT + Math.sqrt(
    THREE_POINT.ARC_RADIUS_FT ** 2 - THREE_POINT.CORNER_DISTANCE_FT ** 2);

  const toPx = ft => COURT.MARGIN_PX + ft * S;
  const toFt = px => (px - COURT.MARGIN_PX) / S;

  // Beyond half court = 4. On or outside the three-point line = 3. Otherwise 2.
  // A spot exactly on the half-court line still counts as 3.
  function getZone(x, y) {
    if (x > HALF_X_FT) return ZONES.FOUR;
    const dy = Math.abs(y - HOOP.Y_FT);
    if (x <= CORNER_X_FT) {
      return dy >= THREE_POINT.CORNER_DISTANCE_FT ? ZONES.THREE : ZONES.TWO;
    }
    return Math.hypot(x - HOOP.X_FT, dy) >= THREE_POINT.ARC_RADIUS_FT ? ZONES.THREE : ZONES.TWO;
  }

  function draw(ctx) {
    ctx.fillStyle = '#23262e';
    ctx.fillRect(0, 0, width, height);
    drawFloor(ctx);
    drawHalf(ctx, false);
    drawHalf(ctx, true);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(toPx(HALF_X_FT), toPx(0));
    ctx.lineTo(toPx(HALF_X_FT), toPx(COURT.HEIGHT_FT));
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(toPx(HALF_X_FT), toPx(COURT.HEIGHT_FT / 2), 6 * S, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeRect(toPx(0), toPx(0), COURT.WIDTH_FT * S, COURT.HEIGHT_FT * S);
  }

  function drawFloor(ctx) {
    ctx.fillStyle = '#d8a368';
    ctx.fillRect(toPx(0), toPx(0), COURT.WIDTH_FT * S, COURT.HEIGHT_FT * S);
    ctx.strokeStyle = 'rgba(90, 50, 20, 0.12)';
    ctx.lineWidth = 1;
    for (let y = 0; y <= COURT.HEIGHT_FT; y += 1.5) {
      ctx.beginPath();
      ctx.moveTo(toPx(0), toPx(y));
      ctx.lineTo(toPx(COURT.WIDTH_FT), toPx(y));
      ctx.stroke();
      const offset = (y * 7.3) % 12;
      for (let x = offset; x < COURT.WIDTH_FT; x += 12) {
        ctx.beginPath();
        ctx.moveTo(toPx(x), toPx(y));
        ctx.lineTo(toPx(x), toPx(Math.min(y + 1.5, COURT.HEIGHT_FT)));
        ctx.stroke();
      }
    }
  }

  // Draws one end of the court in feet; the right end is the left end mirrored.
  function drawHalf(ctx, mirrored) {
    ctx.save();
    ctx.translate(COURT.MARGIN_PX, COURT.MARGIN_PX);
    ctx.scale(S, S);
    if (mirrored) {
      ctx.translate(COURT.WIDTH_FT, 0);
      ctx.scale(-1, 1);
    }
    ctx.lineWidth = 2.5 / S;
    ctx.strokeStyle = '#fff';

    // Paint
    ctx.fillStyle = mirrored ? 'rgba(170, 60, 40, 0.35)' : 'rgba(170, 60, 40, 0.75)';
    ctx.fillRect(0, 17, 19, 16);
    ctx.strokeRect(0, 17, 19, 16);

    // Free-throw circle: solid outside the key, dashed inside
    ctx.beginPath();
    ctx.arc(19, 25, 6, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.setLineDash([1, 1]);
    ctx.beginPath();
    ctx.arc(19, 25, 6, Math.PI / 2, Math.PI * 1.5);
    ctx.stroke();
    ctx.setLineDash([]);

    // Restricted area
    ctx.beginPath();
    ctx.arc(HOOP.X_FT, HOOP.Y_FT, 4, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    // Three-point line
    const theta = Math.asin(THREE_POINT.CORNER_DISTANCE_FT / THREE_POINT.ARC_RADIUS_FT);
    ctx.beginPath();
    ctx.moveTo(0, HOOP.Y_FT - THREE_POINT.CORNER_DISTANCE_FT);
    ctx.lineTo(CORNER_X_FT, HOOP.Y_FT - THREE_POINT.CORNER_DISTANCE_FT);
    ctx.arc(HOOP.X_FT, HOOP.Y_FT, THREE_POINT.ARC_RADIUS_FT, -theta, theta);
    ctx.lineTo(0, HOOP.Y_FT + THREE_POINT.CORNER_DISTANCE_FT);
    ctx.stroke();

    // Backboard and rim (the far hoop is dimmed because it isn't used)
    ctx.globalAlpha = mirrored ? 0.4 : 1;
    ctx.lineWidth = 5 / S;
    ctx.beginPath();
    ctx.moveTo(4, 22);
    ctx.lineTo(4, 28);
    ctx.stroke();
    ctx.lineWidth = 2 / S;
    ctx.beginPath();
    ctx.moveTo(4, 25);
    ctx.lineTo(HOOP.X_FT - 0.75, 25);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(HOOP.X_FT, HOOP.Y_FT, 0.75, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ff5a1f';
    ctx.lineWidth = 3.5 / S;
    ctx.stroke();
    ctx.restore();
  }

  return { width, height, toPx, toFt, getZone, draw };
})();
