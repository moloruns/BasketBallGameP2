# Buzzer Beater

A top-down basketball shooting game that runs in a web browser. Walk a player around the court with the mouse, click to start a shot meter, and click again as close to the 90% line as you can. You have 60 seconds to score as many points as possible.

`SPEC.md` is the source of truth for what the game should do. This README describes what the code does **right now**.

**Status:** SPEC priorities 1–4 are built and working: the core shot loop, the 2/3/4 point zones, the 60-second timer and score, and the end screen with the session high score. Priority 5 (polish: sound, ball arc animation, make/miss effects) is **not built**.

---

## How to run it

There are no dependencies, build step, or installs.

**Option A: open the file (simplest)**
1. Get the code: `git clone https://github.com/atinm12/BasketBallGame.git`, or download the ZIP from GitHub and unzip it.
2. Double-click `index.html`, or drag it into a browser window.

**Option B: serve it locally** (handy if you want the browser dev tools on `localhost`)
```bash
cd BasketBallGame
python3 -m http.server 8000
```
Then open http://localhost:8000.

**Requirements:** a desktop browser and a mouse. Touch is not supported (see Known bugs and traps).

**Where it has been tested:** only Google Chrome, both opened from `file://` and served from `localhost`. Safari, Firefox, and Edge have **not** been tested. The code uses `CanvasRenderingContext2D.roundRect`, which needs a reasonably recent browser (Chrome 99+, Safari 16+, Firefox 112+).

---

## Controls and rules

| Action | How |
|---|---|
| Start a round | Click **Start Round** (or **Play Again** on the end screen) |
| Move | Move the mouse over the court. The player follows it. |
| Start a shot | Left-click on the court. The shot meter appears next to the player. |
| Shoot | Left-click again while the meter is filling. |

**What a player needs to know**
- The meter is a vertical bar that fills from bottom to top. The white line is at **90%**.
- **Make window:** stopping the bar anywhere from **85% to 95%** (inclusive) is a make. Below 85% or above 95% is a miss.
- If the bar fills all the way without a second click, it's a **miss**.
- After each shot, **MAKE +N** or **MISS** appears near the top-left of the court for about a second.
- Shot value depends on where you're standing **when you click to start the meter**:

  | Where | Points | Meter fill time |
  |---|---|---|
  | Inside the three-point line | 2 | 3.0 s |
  | On or outside the three-point line, up to and including the half-court line | 3 | 1.5 s |
  | Past half court | 4 | 0.5 s |

- You always shoot at the **left** hoop. The right hoop is dimmed and does nothing.
- You can't move while the meter is filling. You can move again as soon as the shot is decided.
- The 60-second clock **keeps running** while the meter fills, so slow shots cost time.
- If time runs out while the meter is still filling, that shot is **thrown away** and scores nothing.
- The high score lasts while the page is open. **Reloading or closing the page resets it to 0.**

---

## Acceptance criteria status

Every criterion from `SPEC.md`, checked against the current code (commit `3b99bc3`) in Chrome. Testing method: scripted checks run in the browser console, which call the game's functions and dispatch mouse events. Movement, starting a round, the meter, and freezing during the meter were also checked with real mouse clicks. Opening from `file://` was checked in headless Chrome. **There are no automated tests in the repo**, so these checks have to be re-run by hand (see "Testing it yourself").

| # | Criterion (short form) | Status | Notes |
|---|---|---|---|
| 1 | Opening `index.html` shows a top-down court with three-point and half-court lines | **Met** | Verified in Chrome only. The start screen sits over the court until you click Start Round. |
| 2 | Moving the mouse moves the player to follow it | **Met** | The player eases toward the mouse; it doesn't snap. |
| 3 | The player can't be moved off the court | **Met** | Clamped so the player's whole body stays inside the boundary. |
| 4 | Clicking while moving starts the meter and the player stops | **Met** | |
| 5 | The meter is a vertical rectangle filling bottom to top | **Met** | |
| 6 | Target line visible at 90% | **Met** | |
| 7 | Moving the mouse during the meter doesn't move the player | **Met** | |
| 8 | A second click stops the meter and resolves make/miss | **Met** | |
| 9 | 85%–95% inclusive is a make | **Met** | Checked at exactly 0.85, 0.90 and 0.95. |
| 10 | Below 85% is a miss | **Met** | Checked at 0.849. |
| 11 | Above 95% is a miss | **Met** | Checked at 0.951. |
| 12 | Bar fills to 100% with no second click → miss | **Met** | |
| 13 | Make/miss is shown, and the player can move and shoot again | **Met** | |
| 14 | Inside the arc = 2 points, 3.0 s fill | **Met** | |
| 15 | On or outside the arc, on the hoop's side of half court = 3 points, 1.5 s fill | **Met** | Includes corner threes. Standing exactly on the half-court line counts as 3. |
| 16 | Beyond half court = 4 points, 0.5 s fill | **Met** | |
| 17 | The zone is fixed when the meter starts | **Met** | |
| 18 | Score starts at 0 each round | **Met** | |
| 19 | A make adds exactly its zone's points; a miss adds 0 | **Met** | |
| 20 | Score visible at all times during a round | **Met** | In the bar above the court. |
| 21 | Rounds last 60 s, and the time left is always visible | **Met** | See the timer trap under Known bugs and traps. |
| 22 | The clock keeps counting during the meter | **Met** | |
| 23 | At 0 the round ends and the end screen appears | **Met** | |
| 24 | The end screen shows the round score | **Met** | |
| 25 | The end screen shows the session high score | **Met** | |
| 26 | A higher score updates the high score | **Met** | |
| 27 | A score that isn't higher leaves the high score alone | **Met** | |
| 28 | You can start a new round from the end screen, and the high score carries over | **Met** | |
| 29 | Reloading resets the high score to 0 | **Met** | |

Not an acceptance criterion, but in the spec's feature list: the **polish features are not built** (sound, ball arc animation, make/miss effects).

---

## Code map

Plain HTML, CSS and JavaScript. No framework, bundler, or ES modules. The JS files are ordinary `<script>` tags loaded **in a fixed order** in `index.html`, and each file can use the ones loaded before it. Each module is an object created by an immediately-invoked function, so its helpers stay private. All positions are in **feet** on a 94 × 50 ft court, with the active hoop on the left; the code converts feet to pixels only when drawing.

| File | Responsible for |
|---|---|
| `SPEC.md` | What the game should do: features, acceptance criteria, priorities. |
| `index.html` | Page structure: score/time/high score bar, the canvas, start and end screens, and script load order. |
| `style.css` | Layout and styling. Keeps the court's aspect ratio as the window resizes. |
| `js/constants.js` | **All tunable values:** court size and scale, hoop position, three-point distances, zone points and fill times (`ZONES`), target line and make window (`METER`), player size and follow speed, `ROUND_SECONDS`, and how long the result message shows. |
| `js/court.js` | `Court`: feet ↔ pixel conversion, drawing the court, and zone detection. |
| `js/player.js` | `Player`: mouse tracking, moving and clamping the player, freezing during a shot, and drawing the player. |
| `js/meter.js` | `Meter`: the shot meter's timing, make/miss decision, and drawing. |
| `js/state.js` | `GameState`: round phase, countdown clock, score, and session high score. |
| `js/ui.js` | `Ui`: updating the HTML score bar and showing or hiding the start and end screens. |
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
- `stop(nowMs)`: ends the shot and returns `{ fill, made, points }`.
- `isMake(fill)`: the make-window check (`METER.MAKE_MIN <= fill <= METER.MAKE_MAX`).
- `isFull(nowMs)`, `isActive()`, `cancel()`, and `draw(ctx, nowMs, playerPos)`. The bar sits to the right of the player and flips to the left near the right edge.
- Fill is computed from **wall-clock time** (`performance.now()`), not from frame `dt`.

**`GameState`** (`js/state.js`)
- `startRound()`: resets the score and clock and sets the phase to `PLAYING`.
- `tick(dt)`: counts the clock down. On the frame it hits 0, it sets the phase to `OVER`, updates `highScore`, and returns `true`.
- `addPoints(n)`, `isPlaying()`, and read-only `phase` (`READY` / `PLAYING` / `OVER`), `score`, `highScore`, `timeLeft`.

**`Ui`** (`js/ui.js`)
- `updateHud()`, `hideScreens()`, `showEndScreen()`, and `onStart(callback)`, which wires both the Start Round and Play Again buttons.

**`main.js`** (top-level functions, which are globals)
- `handleClick()`: ignored unless a round is playing. Starts the meter with the zone at the player's current spot and freezes the player, or stops the meter and resolves the shot.
- `resolveShot(result)`: unfreezes the player, adds points on a make, and sets the MAKE/MISS message.
- `update(dt, now)`: ticks the clock (calling `endRound()` at 0), moves the player, and auto-resolves a full meter as a miss.
- `startRound()` / `endRound()`: round transitions. `endRound()` throws away a shot still on the meter.
- `render(now)`, `drawResult()`, and `frame(now)`, the `requestAnimationFrame` loop.

---

## What to build next (priority order)

Items 1–3 are what's left of `SPEC.md` (priority 5, polish). They're ordered to match the spec's cut order: if time runs short, sound is cut first and the ball arc last.

1. **Ball arc animation**: the ball travels from the player to the hoop after a shot. Note that points are currently added the instant the shot is decided, not when the ball arrives. Decide whether that should change, and how it interacts with the buzzer.
2. **Make/miss effects**: e.g., the ball dropping through the net on a make, bouncing off the rim on a miss.
3. **Sound effects.**

   For items 1 and 2, commit `5d0f51b` (an older single-file `game.js`) has a working ball arc and drop/bounce effects that could be ported into the modules. It's not part of the current code, and it predates the module split.

Hardening work. These aren't spec features, but the next person will want them:

4. **Saved automated tests** for `Court.getZone`, `Meter.isMake`, and `GameState`. The checks behind the table above were run by hand in the console and aren't in the repo.
5. **Cross-browser check** in Safari and Firefox (only Chrome has been tested).
6. **Fix the timer trap** below (make the round clock use wall-clock time like the meter does).

---

## Known bugs and traps

- **The round clock and the meter use different time sources.** The clock adds up frame `dt`, and each frame's `dt` is capped at 0.05 s (`main.js`, `frame`). The meter uses `performance.now()`. Two consequences:
  - Below about 20 frames per second, the round clock runs **slower than real time**, so a round lasts longer than 60 real seconds. The meter is unaffected.
  - If you switch tabs or minimize the window, browsers pause `requestAnimationFrame`, so **the clock pauses** but **the meter keeps filling** in real time. Come back mid-shot and the meter is full, so the shot is a miss.
- **No touch support.** Input is `mousemove` and `mousedown` only, so phones and tablets can't play.
- **The player only follows while the mouse is over the court canvas.** If the mouse leaves the canvas, the player walks to the last spot the mouse was seen.
- **Script order matters.** The files are plain scripts sharing the global scope. Adding a new file means adding a `<script>` tag in the right place in `index.html`. Loading a file before something it depends on fails with a `ReferenceError` in the console.
- **`main.js` defines globals** (`canvas`, `ctx`, `update`, `render`, `handleClick`, `startRound`, `lastResult`, …). Don't reuse those names at the top level of another file. Note that `startRound` in `main.js` is different from `GameState.startRound`: the `main.js` version also resets the player and meter and hides the screens.
- **Testing trap:** calling `update(dt, now)` in a loop fast-forwards the round clock but **not** the meter, because the meter reads real time. To test a fill level, pass a time to `Meter.stop`, e.g. `Meter.stop(performance.now() + 1350)` right after starting a 1.5 s meter gives 90%.
- **The MAKE/MISS message has a fixed position** (near the top-left of the court) and can overlap the player or meter if you're standing there.
- **Standing behind the backboard** (between the baseline and the hoop) counts as a 2-pointer. The spec doesn't cover this case.
- **Git history:** commit `5d0f51b` contains an older single-file version (`game.js`) that was deleted in `870672f`. Don't treat it as current code.

---

## Where we cut corners, and why

- **No automated tests or test runner.** The aim was a working core loop quickly. Every acceptance criterion was checked by running scripts in the browser console, but those scripts weren't saved. *Why:* time, and to avoid adding tooling before the game existed.
- **Plain `<script>` tags and globals instead of ES modules or a bundler.** *Why:* browsers block ES modules on pages opened from `file://`, and the game has to run by double-clicking `index.html`. The cost is the load-order and global-name traps above.
- **Polish (priority 5) skipped entirely.** *Why:* the spec puts it last and says to cut it first. An earlier version had an arc and effects, but they were left out of the rebuild to keep the foundation small.
- **Judgment calls where the spec was silent:**
  - a start screen with a Start Round button, so the clock doesn't start the moment the page loads;
  - a shot still on the meter at the buzzer scores nothing;
  - points count the instant the shot is decided;
  - standing exactly on the half-court line is worth 3;
  - the court uses NBA dimensions (23.75 ft arc, 22 ft corners) so the three-point line has a real shape.
- **The round clock is frame-based with a `dt` cap.** *Why:* simple and smooth. The cap stops a long pause from ending the round in one jump, at the cost of the timer trap above.
- **The whole court is redrawn every frame**, with no caching. *Why:* simplest code, and it runs smoothly at this size.
- **Only tested in Chrome.** *Why:* that's what was available in the build environment.

---

## Testing it yourself

Every module is a global, so you can drive the game from the browser console after loading the page. For example:

```js
GameState.startRound();                       // or click Start Round
Court.getZone(30, 25).points;                 // 3
Meter.isMake(0.85);                           // true
Player.position.x = 30; Player.position.y = 25;
handleClick();                                // start a 3-point shot (1.5 s meter)
resolveShot(Meter.stop(performance.now() + 1350));  // stop at 90% -> make, +3
GameState.score;                              // 3
```
