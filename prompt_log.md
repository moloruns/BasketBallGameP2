# Prompt Log

- **Tool:** Claude Code (desktop app, Code tab)
- **Model:** Claude Opus 5.5 (`claude-opus-5-5`)
- **Session date:** 2026-10-28

Below are the user's messages from this session, in order, copied word for word. Labels in *italics* are notes about how a message was sent; they are not part of the message.

---

## 1. Original game description

```
i want to make a video game that is basketball themed. in the game, there is a basketball floor, and you can move the character, a basketball player, around on the floor with a mouse. the floor is viewed from a birds eye view. once you click when moving the character around, the shooting mechanism starts. the shooting mechanism is similar to the field goal mechanism in madden 24, where a vertical rectangle is shown, and in the span of some number of seconds, the bar gets shaded completely from bottom to top. at the 90% marker of the bar (close to the top), there will be a target line. to shoot, the user has to click again as close to the 90% bar as possible to determine if the ball goes in or not. the user can score two points by shooting closer than the three point line, three points from shooting from the three point line to half court, and 4 points from beyond halfcourt. make the bar shading last 3 seconds for 2 points, 1.5 seconds for 3 points, and 0.5 seconds for 4 points. keep track of a user's score. each round lasts a minute. keep the highest use score in the session, and after a round is over, display the current score and the high score. what questions do you have or clarifications before you start building
```

## 2. Answers to Claude's clarifying questions

*Picked from multiple-choice options. Each question, the option label picked, and that option's description are copied exactly. The questions and option text were written by Claude; the picks are the user's.*

**Question:** What should the game be built with?
**Picked:** Browser (HTML/JS) (Recommended)
*Option description:* A single index.html you open by double-clicking. No installs, smooth mouse control via canvas.

**Question:** How precise does the click need to be for the shot to go in?
**Picked:** Fixed window (Recommended)
*Option description:* Make if the click lands within ±5% of the 90% line (85–95%); anything else misses. Simple and predictable.

**Question:** What should the court look like?
**Picked:** Full court, one hoop (Recommended)
*Option description:* Whole court shown top-down; you always shoot at one basket, so 'beyond half court' 4-pointers are possible.

**Question:** What should happen while the shot meter is filling?
**Picked:** Player frozen, clock runs (Recommended)
*Option description:* Player locks in place during the meter; the 60-second clock keeps ticking, so slow 2-pointers cost time.

## 3. Plan approval

*The user approved Claude's build plan in the plan approval dialog. No text was typed.*

## 4. Message after the plan approval

*This message appeared right after Claude loaded a tool and may have been generated automatically rather than typed. It is included so nothing is left out.*

```
Tool loaded.
```

## 5. SPEC.md request

```
before anything else, i need a SPEC.md and it has to be the first commit in the repo with no code in it. if you've already written any code files, leave them uncommitted for now and only stage SPEC.md.

write the spec from my original description and the answers i picked. it needs four sections:
1. the game: what it is, what the player does, and why it's fun
2. full feature set, including stuff that probably won't get built today
3. acceptance criteria: a numbered list of specific statements someone else could check one by one
4. priorities: what matters most and what to cut first if time runs short

my priorities: the move → click → meter → make/miss loop comes first, then correct 2/3/4 point zones, then the 60 second timer and score, then the end screen with the session high score. polish like sound, a ball arc animation, or make/miss effects is last.

spell out the exact make window you're using around the 90% line, and say that a miss happens if the bar fills all the way without a click. don't add features i didn't ask for. commit it alone with the message "add SPEC.md" and push.
```

## 6. Create the GitHub repo

*Sent by clicking a suggested-reply button. The button text was written by Claude; the user chose it.*

```
Create a new public GitHub repo named BasketBallGame under atinm12 and push main to it.
```

## 7. Strip extras not in the spec

*Sent by clicking a suggested-reply button. The button text was written by Claude; the user chose it.*

```
Remove the extras that aren't in SPEC.md from the game code, then commit it.
```

## 8. Documentation request (first time, interrupted)

*The user sent this, then interrupted it before Claude acted on it.*

```
stop building. switching to documentation. someone else takes this over tonight and can't ask me anything, so everything they need has to be in the repo and it has to be true. don't call anything working unless it works right now.

write README.md with:
- how to run it on someone else's computer
- controls and anything a player needs to know
- every acceptance criterion from SPEC.md by number, marked met, partially met, or not met
- a code map: what each file and major function handles
- what to build next, in priority order
- known bugs and traps
- where we cut corners and why

then write prompt_log.md: the model and tool used (claude code), plus all my prompts from this session copied word for word, including my original game description and the answers i picked to your clarifying questions. no summaries.

commit both, push, and make no more changes after that.
```

## 9. Build in modules, in priority order

*Sent right after interrupting message 8.*

```
now build it following SPEC.md in priority order. the goal is a working core loop and a clean foundation for someone else to finish, not a complete game.

keep it organized. no single giant file. split it into something like court drawing and zone detection, player/mouse input, the shot meter, and game state (timer, score, high score), with index.html and a main file tying them together. put tunable values like fill times, the target line, the make window, and round length together in one constants section.

clear names, and a short comment at the top of each file saying what it's responsible for. commit each piece once it works, with a real message. tell me as soon as the core loop is playable so i can test it.
```

## 10. Push

*Sent by clicking a suggested-reply button. The button text was written by Claude; the user chose it.*

```
Push main to origin.
```

## 11. Documentation request (second time; this produced README.md and this file)

```
stop building. switching to documentation. someone else takes this over tonight and can't ask me anything, so everything they need has to be in the repo and it has to be true. don't call anything working unless it works right now.

write README.md with:
- how to run it on someone else's computer
- controls and anything a player needs to know
- every acceptance criterion from SPEC.md by number, marked met, partially met, or not met
- a code map: what each file and major function handles
- what to build next, in priority order
- known bugs and traps
- where we cut corners and why

then write prompt_log.md: the model and tool used (claude code), plus all my prompts from this session copied word for word, including my original game description and the answers i picked to your clarifying questions. no summaries.

commit both, push, and make no more changes after that.
```
