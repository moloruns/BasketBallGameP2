# Buzzer Beater — implementation blueprint

Prepared November 1, 2026, against inherited baseline commit `4055f49`.

This is our Phase 2 work plan. Checked boxes record completed implementation and verification; limitations are recorded below. Follow the original [SPEC.md](SPEC.md) for game behavior and update [README.md](README.md) with verified results as work finishes. The game already implements the main shooting loop; build on it rather than replacing it.

## 1. Preserve the inherited foundation

- Keep the existing `Court`, `Player`, `Meter`, `GameState`, and `Ui` objects and their responsibilities. Preserve the author's naming, plain-script architecture, court rendering, and zone logic.
- Retain at least 75% of the original work. This is about preserving substantive work, not padding a line count. Review changes against `4055f49` and explain any necessary refactor.
- Keep `SPEC.md` unchanged. If a clarification must be recorded there, append a clearly marked section rather than editing the author's text.
- Preserve direct launch by opening `index.html`: no framework migration, ES-module conversion, required server, external assets, or build tooling.
- Leave `prompt_log2.md` entirely to the user. Do not modify the inherited `prompt_log.md` either.
- Do not write `HANDOFF_REPORT.md`; the assignment requires the student's own reflection without AI.
- Make small, focused changes and commits. Do not import Bird Keeper mechanics or aesthetics into this different game.

## 2. What is already present

The inherited code has mouse following and court bounds; movement lock during the shot meter; two-click shooting; the inclusive 85–95% make window; automatic misses at 100%; all three scoring zones and fill speeds; a score/countdown HUD; results; session high score; and restart.

Initial browser checks verified zone boundaries, make/miss boundaries, zone fill speeds, scoring, results, and high-score carryover. These were temporary checks, not a complete saved acceptance suite. The README's original “Met” statuses must be independently verified for our final submission.

The remaining spec features are **ball-flight animation, make/miss effects, and sound**. The main confirmed correctness defect is the mismatch between the frame-based round clock and the elapsed-time shot meter.

## 3. First: fix timekeeping and buzzer behavior

**Priority:** required correctness before polish. **Criteria:** 18–29, especially 19, 21–23. **Files:** `js/state.js`, `js/main.js`; tests alongside the fix.

- [x] Use one monotonic time source (`performance.now()`) for the round deadline and meter timing. Let the relevant functions accept timestamps so tests can control time.
- [x] Set a deadline 60 seconds after starting each round. Compute remaining time from that deadline; do not subtract the capped movement `dt` from the game clock.
- [x] Keep the small frame-delta cap for movement/visual stability. It must not extend the round.
- [x] Reconcile the deadline in both the update path and the click handler. A click after time expires must not score merely because the next animation frame has not run yet.
- [x] End the round once, cancel any still-filling meter, release the movement lock, and update the high score once. Guard scoring outside an active round.
- [x] Retain the inherited scoring decision: a valid shot released **before** the deadline scores immediately; a release at or after the deadline scores nothing. Visual ball travel must not change that decision.
- [x] Let both meter and round time continue while the tab is hidden. On the next available callback/input, reconcile elapsed time and show results if expired. Browsers may suspend rendering, so do not promise an overlay will update while a tab is suspended.
- [x] Reset the round deadline and animation bookkeeping on every new round so time between rounds is not deducted from the next one.

**Done when:** a round expires after 60 elapsed seconds despite low FPS or a long suspended frame; a late click cannot sneak in points; a just-before-buzzer release counts exactly once; an unfinished shot is discarded; restart starts at 0 points and 60 seconds.

## 4. Save repeatable regression checks

**Priority:** accompany correctness changes. **Files:** a small `tests/` browser harness using the existing scripts; no required package installation.

- [x] Test inside/on/outside the three-point arc, the straight corner-three boundaries, exactly half court (3 points), and beyond half court (4 points).
- [x] Test meter fills of 0.849, 0.85, 0.90, 0.95, 0.951, and 1.0; verify inclusive makes and automatic full-bar misses.
- [x] Test all zone combinations: 2 points / 3.0 s, 3 points / 1.5 s, and 4 points / 0.5 s.
- [x] Verify the shot zone is captured at launch and mouse movement cannot move the player or change that zone during filling.
- [x] Test scoring once per resolved shot, zero points for a miss, and ignored input outside a round.
- [x] Test the round deadline under normal frames, low FPS, and a long stall. Include clicks immediately before, exactly at, and after the deadline, including before the next rendered frame.
- [x] Test higher/equal/lower round scores, high-score carryover, and reset after a fresh page load.
- [x] Test repeated restart: no stale meter, duplicate input listeners, duplicate animation loops, old effects, or stale score.
- [x] Keep tests reproducible with controlled timestamps rather than real one-minute waits. Update tests and documentation when a timing function's signature changes.

**Done when:** checks can be rerun from documented instructions, fail on the relevant inherited timing defect, and pass after the fix. Treat automated checks as evidence for rules, not as a substitute for playing the game.

## 5. Add ball-flight animation

**Priority:** first spec polish feature. **Files:** a small new `js/ball.js` object/module, `js/main.js`, drawing constants in `js/constants.js`, and script registration in `index.html`.

- [x] Create a visual shot when the meter resolves. Capture the release position, active left-hoop position, result, and animation start time; do not retain a live reference to the moving player's position.
- [x] Draw a ball traveling toward the left hoop with a readable arc. A height offset and ground shadow can suggest flight while preserving the overhead court view.
- [x] Keep animation separate from the meter's make/miss decision and scoring. Do not introduce a second scoring event when the ball lands.
- [x] Preserve immediate return to movement/shooting after release. Do not add a forced wait that changes the 60-second risk/reward balance.
- [x] Handle rapid consecutive shots with bounded visual state. New shots must not corrupt older shot results or grow an unbounded list.
- [x] Keep the meter, player, and hoop readable. Decide how the held ball is displayed while earlier shots are in flight without changing input rules.
- [x] Clear all visual shots on restart. End the round on time even if a released ball is still in flight; any remaining animation is cosmetic and must not delay the results or change the score.
- [x] Add the new plain script after its dependencies and before `main.js`; avoid colliding with existing top-level globals.

**Done when:** makes and misses both show a visible trajectory from the release position, rapid shooting remains possible, and scoring/timer behavior is unchanged by flight duration.

The inherited README references old commits containing a previous animation implementation. Those commits are not in this repository's single-commit baseline. Do not assume they exist locally or replace current modules with an older monolithic version.

## 6. Add make/miss visual effects

**Priority:** after ball flight. **Files:** primarily `js/ball.js` and small renderer hooks as needed.

- [x] On a make, show the ball dropping through the rim/net, with a brief readable success effect if useful.
- [x] On a miss, show a rim bounce or a visibly offset finish. The effect must reflect the already-decided result, not create physics-based scoring rules.
- [x] Retain immediate MAKE/MISS text feedback, including the point value for makes.
- [x] Fix the current feedback placement if it overlaps the player or meter near the upper-left court. Prefer a predictable reserved area; keep score and time visible.
- [x] Clean up effects after their duration and on restart; verify multiple shots cannot leave stale particles/balls or repeated awards.

**Done when:** make versus miss is clear from both feedback text and the ball's finish, without obscuring the timing interaction.

## 7. Add sound if time remains

**Priority:** lowest spec priority; first feature to cut. **Files:** a small optional `js/audio.js`, existing event hooks, and a mute control in the UI.

- [x] Add short, distinguishable effects for release, make, miss, and optionally the buzzer. Keep volume modest.
- [x] Initialize/resume audio only after a user gesture. Simple generated tones avoid asset and installation requirements.
- [x] Provide a mute control. This is a usability addition to the spec's sound request, not a new scoring mechanic.
- [x] Handle unavailable or blocked audio without breaking the game. Prevent duplicate sounds from repeated end-round callbacks.
- [x] Trigger result sounds consistently with their visual events and avoid noisy accumulation during rapid shooting.

**Done when:** sound works after interaction, mute works, and the game remains fully playable with audio disabled or unavailable.

## 8. Small usability and compatibility checks

- [x] Check restart with a stationary mouse. `Player.reset()` currently resets the player but not the remembered mouse target; verify whether that causes an unintended walk toward the previous round's location and reset both together if needed.
- [x] Verify movement/bounds and clicks after CSS resizing; check the meter near all court edges.
- [x] Verify text/effects do not cover the meter and that the HUD is always readable.
- [x] Launch the actual `index.html` directly via `file://`, then through a local static server. New modules/assets must support both paths.
- [x] Check Safari and Firefox when available. If a browser cannot be tested, state that limit in the README rather than claiming coverage.
- [x] Preserve existing interpretations where the spec is silent: the left hoop is active, standing behind its backboard counts as 2 points, and exactly half court counts as 3.

No mobile controls, persistent high-score storage, extra game modes, opponent AI, court redesign, or broader feature expansion is required. In particular, persisting the high score across reloads would contradict the spec.

## 9. Documentation and completion

- [x] Update the README's 29 acceptance criteria individually with **met / partially met / not met**, plus evidence or a limitation. Correct inherited claims where verification finds a discrepancy.
- [x] Document completed polish separately from the numbered criteria, since the original spec has no numbered acceptance items for those effects.
- [x] Update run instructions, code map, timing API examples, known issues, and implementation decisions. Replace the obsolete timer warning once fixed, explaining the resulting hidden-tab/buzzer behavior.
- [x] Credit the original author by name at the top of the README. Verify the name from available attribution; do not infer a real name from a GitHub handle.
- [x] Remove or qualify inherited references to unavailable history and original-repository setup commands so the new repo's instructions are accurate.
- [x] Review the diff against `4055f49` for unnecessary rewrites and document any small refactor. Preserve the original `SPEC.md` and user-maintained logs.
- [x] Leave the user's prompt logging and personal handoff reflection to the user. The assignment asks for a substantive prompt log, including an actual unwanted AI action and the response to it; do not invent such an incident or write the reflection for them.
- [ ] Finish with working, verified changes committed and pushed, and an honest list of anything omitted. Follow the assignment's final submission requirements.

## 10. Work order and cut line

1. Implement the clock/deadline fix with focused regression tests.
2. Add ball flight without changing shooting/scoring behavior.
3. Add make/miss finishes and address overlapping feedback.
4. Add audio only if the earlier work is stable.
5. Run final browser/manual checks, update documentation, and review/commit the changes.

Reserve roughly the last 20 minutes for verification and documentation. If time runs short, cut **sound first, then extra make/miss effects, then ball animation**, matching the author's spec. Keep the corrected core loop, score/timer, session high score, and restart working throughout.

## Phase 2 completion record

Implemented all planned code changes; no spec polish was cut. Core fixes are in `ed54273`; ball flight, finish effects, sound/mute, and feedback polish are in `5380cc1`. Original author credited as **Atin Mathur**, as confirmed by the user.

Verification: 21 game checks and 5 isolated audio checks pass in Chrome via direct files and HTTP. Title and flight screenshots were inspected. Safari automation was unavailable because remote automation is disabled; Firefox is not installed. Human playtesting and listening to the sound levels remain recommended. Checked sound tasks indicate implementation and automated API coverage, not a listening test.

The existing architecture and substantive gameplay remain; `SPEC.md`, `prompt_log.md`, and `prompt_log2.md` were not edited. The student remains responsible for their prompt log, personal handoff report, and final course submission. Implementation is committed locally. `git push origin main` was attempted but Git could not read a GitHub username because credentials are unavailable in this session. The final push checkbox remains open; publish the local commits with a signed-in GitHub client.
