const testResults = [];
let testFailures = 0;
function assert(value, message) { if (!value) throw new Error(message); }
function equal(actual, expected, message) { assert(Math.abs(actual - expected) < 1e-8, `${message}: ${actual} != ${expected}`); }
function test(name, callback) {
  try { callback(); testResults.push('PASS ' + name); }
  catch (error) { testFailures++; testResults.push('FAIL ' + name + ': ' + error.message); }
}
function fresh(now = 1000) { window.testClock = now; startRound(now); }
function advance(now) { window.testClock = now; update(.016, now); }
function move(x, y) {
  const rect = canvas.getBoundingClientRect();
  canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: rect.left + Court.toPx(x) / canvas.width * rect.width, clientY: rect.top + Court.toPx(y) / canvas.height * rect.height }));
}
function mouseClick() { canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0 })); }

// A fresh page is the only way to reset the deliberately session-only high score.
test('Fresh page has zero high score and visible start screen', () => {
  equal(GameState.highScore, 0, 'high score');
  assert(!document.getElementById('start-screen').classList.contains('hidden'), 'start screen');
});

test('Court arc, corner, half-court and conversion boundaries', () => {
  for (const [x,y,points] of [[10,25,2],[28.999,25,2],[29,25,3],[29.001,25,3],[10,3.001,2],[10,3,3],[10,2.999,3],[10,47,3],[47,25,3],[47.001,25,4],[1.3,25,2]]) {
    equal(Court.getZone(x,y).points, points, `zone ${x},${y}`);
  }
  equal(Court.toFt(Court.toPx(33)),33,'pixel conversion');
});

test('Meter make window includes 85 and 95 percent only', () => {
  for (const fill of [.85,.9,.95]) assert(Meter.isMake(fill),'make '+fill);
  for (const fill of [.849,.951,1]) assert(!Meter.isMake(fill),'miss '+fill);
});

test('All three zone fill times, points, and full-meter misses', () => {
  for (const zone of [ZONES.TWO,ZONES.THREE,ZONES.FOUR]) {
    Meter.start(zone,1000);
    const result=Meter.stop(1000+zone.fillSeconds*900);
    equal(result.fill,.9,'fill'); assert(result.made,'make'); equal(result.points,zone.points,'points');
    assert(Meter.stop(99999)===null,'second stop should be inert');
    Meter.start(zone,1000);
    assert(!Meter.isFull(1000+zone.fillSeconds*999),'not full');
    assert(Meter.isFull(1000+zone.fillSeconds*1000),'full');
    assert(!Meter.stop(1000+zone.fillSeconds*1000).made,'automatic miss');
  }
});

test('Actual mouse input follows, clamps and freezes during a shot', () => {
  fresh(); move(100,-10); Player.update(1);
  equal(Player.position.x, COURT.WIDTH_FT-PLAYER.RADIUS_FT,'right bound');
  equal(Player.position.y, PLAYER.RADIUS_FT,'top bound');
  move(30,25); Player.update(1); mouseClick();
  const x=Player.position.x, y=Player.position.y;
  move(80,40); Player.update(1);
  equal(Player.position.x,x,'frozen x'); equal(Player.position.y,y,'frozen y');
  window.testClock=2350; mouseClick();
  equal(GameState.score,3,'launch zone fixed'); assert(!Meter.isActive(),'meter stopped');
  Player.update(1); assert(Math.abs(Player.position.x-80)<.25,'movement restored (mouse pixels are rounded)');
});

test('Restart resets both position and old mouse target', () => {
  fresh(); move(80,40); Player.update(1); fresh(); Player.update(.05);
  equal(Player.position.x,PLAYER.START_X_FT,'reset x'); equal(Player.position.y,PLAYER.START_Y_FT,'reset y');
});

test('Makes add exact zone points once; automatic misses add none', () => {
  for (const [x,points,seconds] of [[10,2,3],[30,3,1.5],[60,4,.5]]) {
    fresh(); Player.position.x=x; Player.position.y=25; handleClick(1000);
    handleClick(1000+seconds*900); equal(GameState.score,points,'score');
    advance(1000+seconds*1000); equal(GameState.score,points,'no repeated award');
    handleClick(window.testClock); advance(window.testClock+seconds*1000);
    equal(GameState.score,points,'miss scores zero'); assert(lastResult.text==='MISS','miss feedback');
  }
});

test('Round clock stays accurate across normal, 5 FPS and suspended frames', () => {
  for (const gap of [1000/60,200,60000]) {
    fresh();
    for (let elapsed=gap; elapsed<60000; elapsed+=gap) advance(1000+elapsed);
    advance(61000);
    assert(!GameState.isPlaying(),'round must expire at 60 seconds'); equal(GameState.timeLeft,0,'zero time');
  }
});

test('RAF movement cap does not cap the round clock', () => {
  fresh(); const callback=window.testPendingFrame; window.testClock=61000; callback(61000);
  assert(!GameState.isPlaying(),'capped frame extended round');
});

test('Meter and round count the same elapsed time', () => {
  fresh(); handleClick(1000); advance(2000);
  equal(GameState.timeLeft,59,'clock while filling'); assert(Meter.isActive(),'meter still filling');
  advance(2500); assert(!Meter.isActive(),'full meter resolved'); assert(lastResult.text==='MISS','full miss');
});

test('Release just before deadline counts; exactly at and after do not', () => {
  for (const release of [60999,61000,61001]) {
    fresh(); handleClick(release-1350); handleClick(release);
    equal(GameState.score,release<61000?3:0,'buzzer score');
    if (release>=61000) assert(!GameState.isPlaying()&&!Meter.isActive(),'late click reconciles before frame');
    advance(61001); equal(Number(document.getElementById('final-score').textContent),release<61000?3:0,'final score');
  }
});

test('Unfinished meter is discarded; expired/ready input cannot score', () => {
  fresh(); handleClick(60500); advance(61000);
  assert(!Meter.isActive(),'meter cancelled'); equal(GameState.score,0,'discarded');
  handleClick(62000); GameState.addPoints(4); resolveShot({made:true,points:4},62000);
  equal(GameState.score,0,'post-game scoring');
});

test('Higher/equal/lower scores preserve session best and end-screen values', () => {
  for (const score of [12,12,3,15]) {
    const before=GameState.highScore; fresh(); GameState.addPoints(score); advance(61000);
    equal(GameState.highScore,Math.max(before,score),'best');
    equal(Number(document.getElementById('final-score').textContent),score,'final score');
    equal(Number(document.getElementById('final-high').textContent),GameState.highScore,'final best');
    assert(!document.getElementById('end-screen').classList.contains('hidden'),'end visible');
  }
});

test('Three button restarts clear state without adding loops or duplicate listeners', () => {
  const count=window.testFrameRequests;
  for(let i=0;i<3;i++) {
    window.testClock=1000; document.getElementById('again-button').click();
    equal(GameState.timeLeft,60,'fresh time'); equal(GameState.score,0,'fresh score');
    assert(!Meter.isActive()&&lastResult===null,'fresh state');
    mouseClick(); assert(Meter.isActive(),'one click starts, not resolves'); advance(61000);
  }
  equal(window.testFrameRequests,count,'restart created an animation loop');
});

test('Flight copies release position, arcs, and never awards points on arrival', () => {
  fresh(); const start={x:60,y:25};
  const flight=Ball.launch({made:true,fill:.9},start,1000);
  const origin={...flight.start}; start.x=5;
  equal(flight.start.x,origin.x,'copied release x');
  const mid=Ball.pose(flight,1000+flight.durationMs/2);
  assert(mid.lift>0 && mid.x<origin.x && mid.x>HOOP.X_FT,'arc to left hoop');
  const arrival=Ball.pose(flight,1000+flight.durationMs);
  equal(arrival.x,HOOP.X_FT,'arrival x'); equal(arrival.y,HOOP.Y_FT,'arrival y');
  Ball.update(1000+flight.durationMs+BALL.FINISH_MS+1);
  equal(Ball.count,0,'cleanup'); equal(GameState.score,0,'cosmetics cannot score');
});

test('Make drops through rim; miss bounces away; both fade', () => {
  fresh();
  const make=Ball.launch({made:true,fill:.9},Player.position,1000);
  const miss=Ball.launch({made:false,fill:.4},Player.position,1000);
  const a=Ball.pose(make,1000+make.durationMs+BALL.FINISH_MS/2);
  const b=Ball.pose(miss,1000+miss.durationMs+BALL.FINISH_MS/2);
  equal(a.x,HOOP.X_FT,'make stays at rim'); assert(a.y>HOOP.Y_FT,'drop');
  assert(b.x>miss.target.x && b.lift>0,'bounce');
  equal(a.alpha,.5,'make fades'); equal(b.alpha,.5,'miss fades');
});

test('Flights are bounded, allow another shot immediately, and clear on restart', () => {
  fresh(); handleClick(1000); handleClick(2350);
  equal(Ball.count,1,'visual flight'); assert(!Meter.isActive(),'ready for another shot');
  handleClick(2351); assert(Meter.isActive(),'next shot before previous arrival');
  for(let i=0;i<30;i++) Ball.launch({made:false,fill:.2},Player.position,2400+i);
  equal(Ball.count,BALL.MAX_FLIGHTS,'bounded pool'); fresh(); equal(Ball.count,0,'reset clears');
});

test('Buzzer does not wait for flight; visual finish cannot alter final score', () => {
  fresh(); handleClick(59649); handleClick(60999);
  equal(GameState.score,3,'release before buzzer'); equal(Ball.count,1,'still flying');
  advance(61000); assert(!GameState.isPlaying(),'end on time');
  advance(65000); equal(GameState.score,3,'no arrival score'); equal(Ball.count,0,'old flights gone');
});

test('Mute button preserves preference across restart and gameplay works muted', () => {
  fresh(); Sound.setMuted(false); Ui.updateMute();
  document.getElementById('mute-button').click(); assert(Sound.muted,'mute');
  assert(document.getElementById('mute-button').getAttribute('aria-pressed')==='true','accessible state');
  fresh(); assert(Sound.muted,'preference survives restart');
  handleClick(1000); handleClick(2350); equal(GameState.score,3,'silent play');
  document.getElementById('mute-button').click(); assert(!Sound.muted,'unmute');
});

test('Scaled canvas input and meter drawing remain inside all court edges', () => {
  fresh(); const app=document.getElementById('app'); const oldWidth=app.style.width; app.style.width='420px';
  move(60,35); Player.update(1);
  assert(Math.abs(Player.position.x-60)<.3 && Math.abs(Player.position.y-35)<.3,'scaled input');
  for(const [x,y] of [[1.3,1.3],[92.7,1.3],[1.3,48.7],[92.7,48.7]]) {
    Meter.start(ZONES.TWO,1000); Meter.draw(ctx,2000,{x,y});
    // Intercept the bar outline to verify its actual rendered bounds.
    const rects=[]; const original=ctx.strokeRect;
    ctx.strokeRect=(...args)=>rects.push(args); Meter.draw(ctx,2000,{x,y}); ctx.strokeRect=original;
    const [left,top,width,height]=rects[0];
    assert(left>=0 && top>=0 && left+width<=canvas.width && top+height<=canvas.height,'meter bounds');
  }
  Meter.cancel(); app.style.width=oldWidth;
});

test('Result feedback has reserved space outside the court', () => {
  fresh(); handleClick(1000); handleClick(2350); render(2350);
  assert(document.getElementById('shot-feedback').textContent==='MAKE +3','make feedback');
  const feedback=document.getElementById('feedback-bar').getBoundingClientRect();
  const court=canvas.getBoundingClientRect(); assert(feedback.bottom<=court.top,'feedback overlaps court');
  advance(4000); render(4000);
  assert(!document.getElementById('shot-feedback').textContent.includes('MAKE'),'stale message');
});

const report=document.createElement('pre'); report.id='test-results';
report.textContent=testResults.join('\n')+`\n\n${testResults.length-testFailures}/${testResults.length} checks passed.`;
document.body.append(report); document.body.dataset.testStatus=testFailures?'failed':'passed';
