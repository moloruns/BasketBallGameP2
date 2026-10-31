# Buzzer Beater — Game Spec

## 1. The Game

Buzzer Beater is a basketball shooting game that runs in a web browser. The player sees a full basketball court from above (bird's-eye view) and controls one basketball player with the mouse.

**What the player does**

1. Moves the mouse to walk the player to a spot on the court.
2. Clicks to start a shot. A vertical shot meter appears and starts filling from bottom to top.
3. Clicks again to release the shot, trying to stop the meter as close as possible to a target line at 90% of the bar's height. Stopping close enough to the line makes the shot; otherwise it misses.
4. Repeats this as many times as possible before the 60-second round ends, trying to score as many points as possible.

Shots are worth more from farther away, but the meter fills faster from farther away, so long shots are harder to time:

| Shot location | Points | Meter fill time |
|---|---|---|
| Inside the three-point line | 2 | 3.0 seconds |
| From the three-point line up to half court | 3 | 1.5 seconds |
| Beyond half court | 4 | 0.5 seconds |

**Why it's fun**

- Each shot is a short test of timing, in the style of the kicking meter in Madden NFL 24.
- Every shot is a risk-versus-reward choice: a safe, slow 2-pointer or a quick, hard 3- or 4-pointer.
- The clock keeps running while the meter fills, so slow shots cost time and the player feels pressure to move fast.
- A session high score gives the player something to beat on the next round.

## 2. Full Feature Set

### Platform
- Runs in a web browser (HTML/JavaScript). The game opens from `index.html` and needs no installation.

### Court
- A full basketball court shown from above, with a three-point line and a half-court line.
- Only one hoop is active, and every shot goes at it. Because the player can stand on the far side of half court, 4-point shots are possible.

### Movement
- The player character follows the mouse around the court.
- The player cannot leave the court.
- The player cannot move while the shot meter is filling.

### Shooting
- Clicking while moving starts the shot meter at the player's current position.
- The shot's point value and meter speed come from the zone the player is standing in when the meter starts (see the table in Section 1).
- The meter is a vertical rectangle that fills from bottom to top over the zone's fill time.
- A target line is drawn at 90% of the meter's height.
- Clicking again stops the meter and decides the shot.
- **Make window:** the shot is a make if the meter is stopped between **85% and 95%** of its height, inclusive (within ±5 percentage points of the 90% line). Anything below 85% or above 95% is a miss.
- **Bar fills without a click:** if the meter reaches 100% before the player clicks a second time, the shot is a miss.
- The player sees whether each shot was a make or a miss.

### Scoring and Timer
- A made shot adds its zone's points (2, 3, or 4) to the score. A missed shot adds nothing.
- The current score is visible during the round.
- Each round lasts 60 seconds. The time left is visible during the round.
- The clock keeps running while the meter fills.

### End of Round
- When time runs out, the round ends and an end screen appears.
- The end screen shows the score for the round that just ended and the session high score.
- The session high score is the highest round score since the game page was opened. It is not saved after the page is closed or reloaded.
- The player can start another round from the end screen.

### Polish (lowest priority; may not be built today)
- Sound effects.
- A ball arc animation showing the ball travelling from the player to the hoop.
- Make/miss effects (for example, the ball dropping through the net on a make or bouncing off the rim on a miss).

## 3. Acceptance Criteria

**Movement**
1. Opening `index.html` in a current desktop browser shows a full basketball court viewed from above, with a three-point line and a half-court line.
2. Moving the mouse over the court moves the player character to follow it.
3. The player character cannot be moved off the court.

**Shot meter**

4. Clicking on the court while moving starts the shot meter, and the player stops moving.
5. The meter is a vertical rectangle that fills from bottom to top.
6. A target line is visible at 90% of the meter's height.
7. While the meter is filling, moving the mouse does not move the player.
8. Clicking a second time stops the meter and resolves the shot as a make or a miss.
9. Stopping the meter at any fill from 85% to 95% inclusive is a make.
10. Stopping the meter below 85% is a miss.
11. Stopping the meter above 95% is a miss.
12. If the meter fills to 100% without a second click, the shot is a miss.
13. After each shot, the game shows whether it was a make or a miss, and the player can move and shoot again.

**Point zones**

14. A shot started from inside the three-point line is worth 2 points, and its meter fills in 3.0 seconds.
15. A shot started on or outside the three-point line, on the active hoop's side of half court, is worth 3 points, and its meter fills in 1.5 seconds.
16. A shot started beyond half court is worth 4 points, and its meter fills in 0.5 seconds.
17. The zone is fixed when the meter starts; the player's position cannot change it during the shot.

**Timer and score**

18. The score starts at 0 at the beginning of each round.
19. A made shot adds exactly its zone's points to the score; a missed shot adds 0.
20. The score is visible at all times during a round.
21. Each round lasts 60 seconds, and the time left is visible at all times during a round.
22. The clock keeps counting down while the shot meter is filling.

**End screen and high score**

23. When the clock reaches 0, the round ends and an end screen appears.
24. The end screen shows the score from the round that just ended.
25. The end screen shows the session high score.
26. If the round's score is higher than the previous high score, the high score updates to the round's score.
27. If the round's score is not higher, the high score stays the same.
28. The player can start a new round from the end screen, and the high score carries over to it.
29. Reloading the page resets the high score to 0.

## 4. Priorities

Build in this order. Each level depends on the one before it.

1. **Core loop (highest priority):** move → click → meter → make/miss. The player moves with the mouse, the first click starts the meter, the meter fills bottom to top with a target line at 90%, and the second click decides make or miss using the 85–95% window. The bar filling without a click is a miss.
2. **Correct point zones:** 2 / 3 / 4 points with 3.0s / 1.5s / 0.5s meter times, based on the three-point line and half court.
3. **60-second timer and score:** the countdown and score display, with makes adding the right points.
4. **End screen with session high score:** the round's score and the session high score after each round, plus a way to play again.
5. **Polish (lowest priority):** sound, a ball arc animation, and make/miss effects.

**What to cut first if time runs short:** cut from the bottom of the list up. Polish goes first, and within polish cut sound first, then make/miss effects, then the ball arc animation. Plain text results ("Make" / "Miss") are acceptable in place of effects. Never cut items 1–4; if they can't all be finished, finish them in order.
