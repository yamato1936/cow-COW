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

The original interpreter reads one character from each submitted terminal line.

```text
W + Enter   up
S + Enter   down
A + Enter   left
D + Enter   right
Q + Enter   quit
```

Lowercase works too.

Do not type `WASD` on one line: the original `Moo` input implementation keeps the first character and consumes the rest of that line.

## Pure COW

The program itself performs:

- ASCII input
- equality tests using `MOO ... moo`
- ANSI terminal control output
- cow erase/redraw
- relative movement
- the main loop
- quit

Only the 12 standard COW instructions occur in the executable source:

```text
moo mOo moO mOO Moo MOo MoO MOO OOO MMM OOM oom
```

Current size: **54,148 COW instructions**.

The source is intentionally a chaotic wall of moo.
