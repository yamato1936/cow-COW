# cow-COW 🐄

**A cow game written in COW. Yes, the cow programming language.**

55,000+ COW instructions. Type a WASD sequence, press Enter, and watch the cow move.

> No JavaScript. No game engine. Just COW, ANSI escape sequences, and questionable decisions.

## Demo

Type a whole sequence at once:

```text
> WSDASWDAWDD
```

Press Enter and the cow plays the commands one by one.

```text
W → up
S → down
D → right
A → left
...
```

## Quick start

Requirements:

- a C++17 compiler
- `make`
- an ANSI-compatible terminal

Build:

```bash
make
```

Run:

```bash
./cow-stream cow.cow
```

Or:

```bash
make run
```

Then enter any combination of:

```text
W / w   up
S / s   down
A / a   left
D / d   right
Q / q   quit
```

## What is actually COW?

The game itself lives in `cow.cow`.

It handles:

- W/A/S/D parsing
- movement
- uppercase and lowercase controls
- erasing the previous cow
- redrawing the cow
- ANSI cursor movement
- the main game loop
- quitting

The executable COW source contains only the 12 standard COW instructions:

```text
moo mOo moO mOO Moo MOo MoO MOO OOO MMM OOM oom
```

The current `cow.cow` is roughly **55,000 COW instructions**.

A small taste:

```text
MoO moO moO moO moO OOO MoO MoO MoO MoO MoO MoO
MoO Moo MOo MOo MOo MOO moO OOO Moo MoO MoO moo
...
```

## Architecture

```text
           WSDASWDAWDD + Enter
                    │
                    ▼
              cow-stream
                    │
              one byte at a time
                    │
                    ▼
                cow.cow
           ┌────────┴────────┐
           │                 │
      game logic       ANSI renderer
           │                 │
           └────────┬────────┘
                    ▼
                 terminal
                    │
                    ▼
                   🐄
```

### `cow.cow`

The game and renderer.

There are no cow coordinates or movement rules in C++.

### `cow-stream.cpp`

A tiny modified COW runtime.

It:

- executes the 12 COW instructions
- feeds buffered stdin to `Moo` one byte at a time
- flushes COW output immediately
- optionally delays buffered input so intermediate frames are visible

It does **not** decide how the cow moves.

## Why cow-stream?

The original COW interpreter reads one character and then consumes the rest of that input line.

So with the original runtime:

```text
WASD + Enter
```

COW effectively sees only:

```text
W
```

`cow-stream` changes the input behavior so each `Moo` consumes exactly one byte.

Therefore:

```text
WASD + Enter
```

becomes:

```text
W → A → S → D → newline
```

The newline does not match a movement command, so it is ignored.

## Playback speed

By default, `cow-stream` waits **100 ms** between buffered commands.

That makes every COW-rendered frame visible instead of jumping straight to the final position.

```bash
./cow-stream cow.cow 200   # slow
./cow-stream cow.cow 100   # default
./cow-stream cow.cow 40    # fast
./cow-stream cow.cow 0     # no pacing
```

Or:

```bash
make run DELAY=150
```

Why does this matter?

```text
W ↑
A ←
S ↓
D →
```

`WASD` has zero net displacement. Without pacing, all four frames can render faster than a human can perceive, making the cow appear stationary.

## Project structure

```text
.
├── cow.cow
├── cow-stream.cpp
├── Makefile
├── README.md
└── THIRD_PARTY_NOTICES.md
```

## About COW

COW is an esoteric programming language created by **Sean Heber (BigZaphod)**.

The runtime in this repository is derived from the original COW interpreter:

https://github.com/BigZaphod/COW

See `THIRD_PARTY_NOTICES.md` for the original MIT license notice.

---

**Built for the extremely important purpose of moving a cow with COW.**
