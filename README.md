# cow-COW 🐄

**A terminal cow written entirely in COW.**

No JavaScript.  
No Python.  
No C/C++ game logic.  
No Three.js.

```text
cow.cow
   ↓
COW interpreter
   ↓
terminal
```

## Run

```bash
~/COW-interpreter/cow cow.cow
```

## Controls

The original interpreter reads one character from each submitted terminal line:

```text
W + Enter   up
S + Enter   down
A + Enter   left
D + Enter   right
Q + Enter   quit
```

Lowercase works too.

Do not type `WASD` on one line. The original `Moo` input implementation keeps the first character and consumes the remainder of the line.

## Why the input prompt is near the top

The original interpreter uses canonical terminal input, so the terminal echoes the pressed key and Enter.

If input is requested on the last terminal row, the echoed Enter scrolls the whole terminal and invalidates the saved cow cursor position.

Therefore `cow.cow` deliberately places the input prompt on rows 4-5, above the cow. This keeps the terminal framebuffer stable while remaining 100% COW.

## Pure COW

The COW program performs:

- ASCII input
- uppercase/lowercase equality tests using `MOO ... moo`
- ANSI terminal control output
- cursor save/restore
- cow erase/redraw
- relative movement
- main game loop
- quit

Only the 12 standard COW instructions occur in the executable source:

```text
moo mOo moO mOO Moo MOo MoO MOO OOO MMM OOM oom
```

Current size: **55,716 COW instructions**.
