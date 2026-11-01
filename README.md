# Buzzer Beater

**Original author: Atin Mathur** ([atinm12](https://github.com/atinm12)). Phase 2 extends the inherited game from baseline `4055f49` in [BasketBallGameP2](https://github.com/moloruns/BasketBallGameP2).

A top-down basketball shooting game that runs in a web browser. Walk a player around the court with the mouse, choose two-click mouse controls or hold/release with mouse button or Space, and stop the shot meter as close to the 90% line as you can. You have 60 seconds to score as many points as possible.

`SPEC.md` is the source of truth for what the game should do. This README describes what the code does **right now**.

**Status:** All five SPEC priorities are implemented. Phase 2 fixes elapsed-time deadlines and restart input, adds ball arcs, make/miss finishes, synthesized sound with mute, and moves shot feedback above the court. Saved browser checks pass: **30 game checks + 5 audio checks**. Browser coverage and remaining human checks are described below.

---

## How to run it

There are no dependencies, build step, or installs.

**Option A: open the file (simplest)**

1. Get the code: `git clone https://github.com/moloruns/BasketBallGameP2.git`, or download the ZIP from GitHub and unzip it.
2. Double-click `index.html`, or drag it into a browser window.

**Option B: serve it locally** (handy if you want the browser dev tools on `localhost`)
```bash
cd BasketBallGameP2
python3 -m http.server 8000
```
Then open http://localhost:8000.

**Requirements:** a desktop browser and a mouse. Touch is not supported (see Known bugs and traps).

**Where it has been tested:** Chrome headless, both direct `file://` and local HTTP. Automated input checks and screenshot inspection cover gameplay and layout; this is not a claim of a human playthrough. Safari automation could not start because “Allow remote automation” is disabled. Firefox is not installed; Safari, Firefox, and Edge remain unverified. A current desktop browser with Canvas `roundRect` and, optionally, Web Audio is required. Audio scheduling and failure handling were tested with mocks; a human should still audition the sound levels.

---

## Controls and rules

| Action | How |
|---|---|
| Start a round | Click **Start Round** (or **Play Again** on the end screen) |
| Move | Move the mouse over the court. The player follows it. |
| Choose controls | Select a mode before **Start Round** or **Play Again**; the choice carries between rounds. |
| Mouse: click twice (default) | Left-click on the court to charge; left-click again to shoot. |
| Mouse: hold and release mouse button | Hold the left mouse button on the court to charge; release to shoot, even outside the court. |
| Keyboard: hold and release Space | Hold Space to charge; release to shoot. Mouse movement still positions the player. |
| Mute/unmute | Click **Sound: on/off** above the court. The setting survives round restarts. |

**What a player needs to know**

- The meter is a vertical bar that fills from bottom to top. The white line is at **90%**.
- **Make window:** stopping the bar anywhere from **85% to 95%** (inclusive) is a make. Below 85% or above 95% is a miss.
- If the bar fills all the way without a second click, it's a **miss**.
- After each shot, **MAKE +N** or **MISS** appears in a reserved bar above the court for about a second.
- Shot value depends on where you're standing **when you start the meter**:

  | Where | Points | Meter fill time |
  |---|---|---|
  | Inside the three-point line | 2 | 3.0 s |
  | On or outside the three-point line, up to and including the half-court line | 3 | 1.5 s |
  | Past half court | 4 | 0.5 s |

- Each mode starts the shot from the player’s current position, not an unreached cursor location. Only the selected shooting input is active during the round. Holding past 100% auto-misses once; releasing afterward cannot start another shot.
- Losing focus or hiding the tab cancels a held shot without awarding points and restores movement. The round clock continues; two-click shots retain the existing elapsed-time behavior.
- You always shoot at the **left** hoop. The right hoop is dimmed and does nothing.
- You can't move while the meter is filling. You can move again as soon as the shot is decided.
- The 60-second clock **keeps running** while the meter fills, so slow shots cost time.
- A shot released **before** the deadline scores immediately, even if its ball is still flying when the buzzer sounds. At or after the deadline, releases score nothing. An unfinished meter is discarded.
- The clock and meter use the same elapsed-time source. They keep counting when the tab is hidden; the next available frame or click reconciles the deadline. A suspended browser cannot render the end screen until it resumes.
- Flying balls are cosmetic. You can immediately move or start another shot; a new held ball appears immediately. The results screen never waits for flight to finish.
- The high score lasts while the page is open. **Reloading or closing the page resets it to 0.**

---

## Acceptance criteria status

Every numbered criterion from `SPEC.md` is assessed below using the saved browser checks, source inspection, and Chrome screenshots. “Met” describes implemented behavior with this evidence, not coverage of every browser. Rules are checked with controlled timestamps and synthetic mouse/button/key events. The original two-click controls remain the default for the numbered spec criteria; the optional hold modes are a user-requested extension.

| # | Criterion (short form) | Status | Notes |
|---|---|---|---|
| 1 | Opening `index.html` shows a top-down court with three-point and half-court lines | **Met** | Chrome screenshots show the full court and start overlay; other browsers unverified. |
| 2 | Moving the mouse moves the player to follow it | **Met** | Synthetic mouse events exercise following and CSS coordinate scaling. |
| 3 | The player can't be moved off the court | **Met** | Bounds assertions and unchanged clamp implementation. |
| 4 | Clicking while moving starts the meter and the player stops | **Met** | Mouse click starts the meter; subsequent movement stays frozen. |
| 5 | The meter is a vertical rectangle filling bottom to top | **Met** | Meter drawing inspected: fill rectangle grows upward. |
| 6 | Target line visible at 90% | **Met** | Drawing uses `METER.TARGET = 0.90` for the white line. |
| 7 | Moving the mouse during the meter doesn't move the player | **Met** | Mouse movement during an active meter leaves position unchanged. |
| 8 | A second click stops the meter and resolves make/miss | **Met** | Second synthetic click resolves; repeated `Meter.stop()` returns null. |
| 9 | 85%–95% inclusive is a make | **Met** | Assertions at exactly 0.85, 0.90, and 0.95. |
| 10 | Below 85% is a miss | **Met** | Assertion at 0.849. |
| 11 | Above 95% is a miss | **Met** | Assertion at 0.951. |
| 12 | Bar fills to 100% with no second click → miss | **Met** | All three zones tested at full fill; update auto-resolves as MISS. |
| 13 | Make/miss is shown, and the player can move and shoot again | **Met** | Feedback text, restored movement, and immediate next shot checked. |
| 14 | Inside the arc = 2 points, 3.0 s fill | **Met** | Zone, points, and 3.0-second duration checked. |
| 15 | On or outside the arc, on the hoop's side of half court = 3 points, 1.5 s fill | **Met** | Arc/corner boundaries and 1.5-second duration checked; exactly half court is 3. |
| 16 | Beyond half court = 4 points, 0.5 s fill | **Met** | Beyond-half-court boundary and 0.5-second duration checked. |
| 17 | The zone is fixed when the meter starts | **Met** | Mouse movement during filling cannot change the captured zone. |
| 18 | Score starts at 0 each round | **Met** | Repeated starts assert score 0 and time 60. |
| 19 | A make adds exactly its zone's points; a miss adds 0 | **Met** | All zone awards, misses, and no extra points on later frames/ball arrival checked. |
| 20 | Score visible at all times during a round | **Met** | HUD above the canvas in screenshots; score updates each render. |
| 21 | Rounds last 60 s, and the time left is always visible | **Met** | 60-second deadline tested at 60 FPS, 5 FPS, and a 60-second stall; HUD inspected. |
| 22 | The clock keeps counting during the meter | **Met** | Active meter and countdown advance on the same timestamps. |
| 23 | At 0 the round ends and the end screen appears | **Met** | Deadline/click checks assert OVER, canceled meter, and visible end screen. |
| 24 | The end screen shows the round score | **Met** | End-screen text asserted against the completed round score. |
| 25 | The end screen shows the session high score | **Met** | End-screen high-score text asserted against session best. |
| 26 | A higher score updates the high score | **Met** | Higher scores update the best in sequence tests. |
| 27 | A score that isn't higher leaves the high score alone | **Met** | Equal and lower scores leave the best unchanged. |
| 28 | You can start a new round from the end screen, and the high score carries over | **Met** | Three Play Again cycles preserve best and clear shot/score state without extra loops. |
| 29 | Reloading resets the high score to 0 | **Met** | Each fresh test-page load asserts zero; state is memory-only, with no persistence. |

**Polish (separate from criteria 1–29):** ball flight arcs from a captured release position with a ground shadow; makes drop through the rim with a short net/glow effect, and misses bounce away. Flights fade, are capped at 12, and clear on restart. Release, make, miss, and buzzer tones are synthesized locally; audio initializes after interaction, supports mute, bounds simultaneous voices, and fails silently if unavailable. Impact sounds follow the visual arrival without awarding points. The audio harness covers unavailable/blocked APIs, scheduling, and mute; audible quality still needs a human check.

---

## Code map

Plain HTML, CSS and JavaScript. No framework, bundler, or ES modules. The JS files are ordinary `<script>` tags loaded **in a fixed order** in `index.html`, and each file can use the ones loaded before it. Each module is an object created by an immediately-invoked function, so its helpers stay private. All positions are in **feet** on a 94 × 50 ft court, with the active hoop on the left; the code converts feet to pixels only when drawing.

| File | Responsible for |
|---|---|
| `SPEC.md` | What the game should do: features, acceptance criteria, priorities. |
| `index.html` | Page structure: score/time/high score bar, the canvas, start and end screens, sound/feedback controls, and script load order. |
| `style.css` | Layout and styling. Keeps the court's aspect ratio as the window resizes. |
| `js/constants.js` | **Core tunable values:** court size and scale, hoop position, three-point distances, zone points and fill times (`ZONES`), target line and make window (`METER`), player size and follow speed, `ROUND_SECONDS`, result-message duration, and ball-flight settings. |
| `js/court.js` | `Court`: feet ↔ pixel conversion, drawing the court, and zone detection. |
| `js/player.js` | `Player`: mouse tracking, moving and clamping the player, freezing during a shot, and drawing the player. |
| `js/meter.js` | `Meter`: the shot meter's timing, make/miss decision, and drawing. |
| `js/state.js` | `GameState`: round phase, countdown clock, score, and session high score. |
| `js/ball.js` | `Ball`: bounded cosmetic flights, arcs, shadows, rim finishes, and cleanup. |
| `js/audio.js` | `Sound`: optional synthesized effects, user-gesture unlock, mute, and voice cleanup. |
| `tests/` | Browser regression harness, isolated audio checks, and a deterministic flight preview. |
| `js/ui.js` | `Ui`: updating the HTML score/feedback bars, mute control, and start/end screens. |
| `js/input.js` | `ShotInput`: selected shooting mode, held-input tracking, keyboard events, window releases, and focus-loss cleanup. |
| `js/main.js` | Entry point: canvas setup, the click → meter → result flow, round start and end, and the game loop. |

### Major functions

**`Court`** (`js/court.js`)
- `toPx(ft)` / `toFt(px)`: convert between feet and canvas pixels, including the border around the court.
- `getZone(x, y)`: returns `ZONES.TWO`, `ZONES.THREE` or `ZONES.FOUR` for a spot. Past half court is 4. Otherwise it checks the straight corner-three lines (22 ft) near the baseline and the 23.75 ft arc elsewhere. Spots exactly on a line count as the outer zone.
- `draw(ctx)`: draws the floor, both ends of the court (the right end is the left end mirrored), the center line and circle, and the boundary.

**`Player`** (`js/player.js`)
- `attachInput(canvas, onClick)`: listens for `mousemove` (updates the mouse target in feet, adjusting for CSS scaling) and left-button `mousedown` (calls `onClick`).
- `update(dt)`: eases the player toward the mouse, clamped to the court. Does nothing while frozen.
- `setFrozen(bool)`, `reset()`, `draw(ctx)`, and `position`, a live `{x, y}` object in feet.

**`Meter`** (`js/meter.js`)
- `start(zone, nowMs)`: begins a shot from the given zone.
- `stop(nowMs)`: consumes the shot and returns `{ fill, made, points }`, or `null` if inactive.
- `isMake(fill)`: the make-window check (`METER.MAKE_MIN <= fill <= METER.MAKE_MAX`).
- `isFull(nowMs)`, `isActive()`, `cancel()`, and `draw(ctx, nowMs, playerPos)`. The bar sits to the right of the player and flips to the left near the right edge.
- Fill is computed from **monotonic elapsed time** (`performance.now()`), not from frame `dt`.

**`GameState`** (`js/state.js`)
- `startRound(nowMs = performance.now())`: resets score, sets a deadline 60 seconds ahead, and enters `PLAYING`.
- `tick(nowMs = performance.now())`: computes time remaining from the deadline. The first expired call enters `OVER`, updates `highScore`, and returns `true`; later calls return `false`.
- `addPoints(n)`, `isPlaying()`, and read-only `phase` (`READY` / `PLAYING` / `OVER`), `score`, `highScore`, `timeLeft`.

**`Ui`** (`js/ui.js`)
- `updateHud()`, `hideScreens()`, `showEndScreen()`, and `onStart(callback)`, which wires both the Start Round and Play Again buttons.

**`main.js`** (top-level functions, which are globals)
- `handleClick(now = performance.now())`: reconciles the deadline first, then ignores input unless a round is playing. Starts the meter with the zone at the player's current spot and freezes the player, or stops the meter and resolves the shot.
- `resolveShot(result, now = performance.now())`: guards the deadline, unfreezes the player, awards a make once via the consumed meter, launches a cosmetic ball, and sets feedback.
- `update(dt, now)`: ticks the clock (calling `endRound()` at 0), moves the player, and auto-resolves a full meter as a miss.
- `startRound(now = performance.now())` / `endRound()`: round transitions; start resets player/mouse target, effects, audio voices, meter, and frame bookkeeping. `endRound()` throws away a shot still on the meter.
- `render(now)`, `drawResult()`, and `frame(now)`, the `requestAnimationFrame` loop.

---

## Remaining verification and submission work

No implementation feature from `implements1.md` was cut. A human playthrough should check timing feel and listen to the audio volume; Safari/Firefox still need testing. The student must maintain `prompt_log2.md`, write the personal `HANDOFF_REPORT.md` without AI, and complete the assignment's submission steps. These documents are deliberately not generated here.

---

## Known bugs and traps

- **Browser suspension delays rendering, not the deadline.** A late click is checked before it can score, and the first resumed frame ends an expired round. The small frame-delta cap affects movement only.
- **No touch support.** Movement requires a mouse; shooting uses mouse buttons or Space. Phones and tablets cannot play with touch alone.
- **The player only follows while the mouse is over the court canvas.** If the mouse leaves the canvas, the player walks to the last spot the mouse was seen.
- **Script order matters.** The files are plain scripts sharing the global scope. Adding a new file means adding a `<script>` tag in the right place in `index.html`. Loading a file before something it depends on fails with a `ReferenceError` in the console.
- **`main.js` defines globals** (`canvas`, `ctx`, `update`, `render`, `handleClick`, `startRound`, `lastResult`, …). Don't reuse those names at the top level of another file. Note that `startRound` in `main.js` is different from `GameState.startRound`: the `main.js` version also resets the player and meter and hides the screens.
- **Controlled-time tests:** pass consistent millisecond timestamps to `startRound`, `handleClick`, `update`, and `Meter.stop`. The first argument to `update` is movement delta in seconds; the second is the elapsed-time timestamp used by the clock and meter. The test bootstrap substitutes the clock only in test pages.
- **Standing behind the backboard** (between the baseline and the hoop) counts as a 2-pointer. The spec doesn't cover this case.
- **Git history:** the inherited README referenced `3b99bc3`, `5d0f51b`, and `870672f`; those commits are not in this repository's inherited history. The actual baseline is `4055f49`. Phase 2 extends that baseline directly.

---

## Where we cut corners, and why

- **Browser-only tests, no package tooling.** The new harness uses the real game scripts and controlled time, keeping direct-file startup and avoiding a dependency installation.
- **Plain `<script>` tags and globals instead of ES modules or a bundler.** *Why:* browsers block ES modules on pages opened from `file://`, and the game has to run by double-clicking `index.html`. The cost is the load-order and global-name traps above.
- **Cosmetic flight instead of physical scoring.** Make/miss remains determined by the inherited meter. Immediate scoring and input preserve the original risk/reward loop; animation never delays the buzzer.
- **Judgment calls where the spec was silent:**
  - a start screen with a Start Round button, so the clock doesn't start the moment the page loads;
  - a shot still on the meter at the buzzer scores nothing;
  - points count the instant the shot is decided;
  - standing exactly on the half-court line is worth 3;
  - the court uses NBA dimensions (23.75 ft arc, 22 ft corners) so the three-point line has a real shape.
- **One elapsed-time source.** Both meter and round use `performance.now()`. The deadline also runs through input handlers so delayed rendering cannot accept a late shot.
- **The whole court is redrawn every frame**, with no caching. *Why:* simplest code, and it runs smoothly at this size.
- **Preserve the handoff.** Existing `Court`, `Player`, `Meter`, `GameState`, and `Ui` objects, plain-script architecture, court artwork, zones, and scoring rules remain. The small timing refactor replaces the clock accumulator with a deadline; feedback rendering moves to HTML. `SPEC.md` and both prompt logs are untouched. New ball/audio objects extend the original design. The original court, meter decision, scoring rules, and object architecture remain intact; selectable controls adapt gestures to the existing shot flow.

---

## Testing it yourself

Open `tests/index.html` directly, or visit `/tests/index.html` on the local server. The report should show **30/30 checks passed**. Open `tests/audio.html` for **5/5 checks passed**. Reload the test page to rerun it, including the fresh-page high-score assertion. Neither page needs packages or a network connection.

The game suite covers zone/meter boundaries, real DOM mouse events, scaled input, round deadlines at normal/low FPS and after stalls, buzzer-edge scoring, high scores, repeated restart, flight lifecycle, mute, and feedback placement. Nine additional control checks exercise mode selection, all three gestures, repeated keys, wrong-input isolation, outside-canvas releases, full-meter and buzzer boundaries, focus loss, button accessibility, and stale releases across restart. The separate audio page uses mocked browser APIs to exercise absence, construction failure, resume rejection, successful scheduling, and mute. These checks do not replace listening to actual speakers.

Open `tests/visual.html` for a deterministic mid-flight preview. Its frozen clock is intentional; play the actual `index.html` for a normal round. Chrome screenshots of the title screen and mid-flight scene were inspected, and both test reports passed through direct-file and HTTP launch.

For a controlled console example on the normal game page, run this entire block together:

```js
const demoNow = performance.now();
startRound(demoNow);                         // resets all round state
Player.position.x = 30; Player.position.y = 25;
handleClick(demoNow);                        // starts a 3-point, 1.5 s meter
handleClick(demoNow + 1350);                  // 90% -> make, +3
GameState.score;                             // 3
```

Use the saved harness for sustained time simulation: a normal game page continues receiving real animation frames.
