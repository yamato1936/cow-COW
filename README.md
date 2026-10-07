# cow-COW 🐄

A terminal cow whose **game logic and rendering are written in COW**.

Type a sequence such as:

```text
WSDASWDAWDD
```

press Enter once, and the cow plays the whole sequence in the terminal.

```text
keyboard line
   ↓
cow-stream
   ↓ one byte at a time
cow.cow
   ↓ ANSI escape sequences
terminal
   ↓
🐄
```

## Why?

Because moving a cow with COW should involve an unreasonable amount of `Moo`.

The current `cow.cow` is roughly **55,000 COW instructions** and contains only the 12 standard COW commands:

```text
moo mOo moO mOO Moo MOo MoO MOO OOO MMM OOM oom
```

## Requirements

- a C++17 compiler
- `make`
- an ANSI-compatible terminal

## Build

```bash
make
```

## Run

```bash
./cow-stream cow.cow
```

Then enter a movement sequence:

```text
> WSDASWDAWDD
```

Uppercase and lowercase both work.

- `W` — up
- `S` — down
- `A` — left
- `D` — right
- `Q` — quit

## Playback speed

By default, buffered commands are delivered to COW every **100 ms**, so intermediate frames remain visible.

The optional second argument controls the delay:

```bash
./cow-stream cow.cow 200   # slow
./cow-stream cow.cow 100   # default
./cow-stream cow.cow 40    # fast
./cow-stream cow.cow 0     # no pacing
```

Or through the Makefile:

```bash
make run DELAY=150
```

## What is actually written in COW?

`cow.cow` owns the game behavior:

- W/A/S/D parsing
- uppercase/lowercase handling
- movement direction
- cow erase/redraw
- ANSI terminal rendering
- the main game loop
- quitting

There are no cow coordinates or movement rules in C++.

`cow-stream.cpp` is the runtime. It:

- executes the 12 COW instructions
- feeds buffered stdin to `Moo` one byte at a time
- flushes stdout
- optionally paces input so consecutive COW-rendered frames are visible

So the boundary is:

```text
runtime / interpreter: C++
game + renderer:       COW
display:               terminal
```

## Why not use the original interpreter directly?

The original COW interpreter's character-input implementation reads one character and then consumes the rest of that terminal line.

That means:

```text
WASD + Enter
```

would expose only `W` to the COW program.

`cow-stream` keeps the same COW instruction set, but changes character input to consume **one byte per `Moo`**. After Enter submits the line, COW receives:

```text
W → A → S → D → \n
```

one byte at a time. The final newline does not match a movement command and is ignored.

## Why can WASD look stationary without pacing?

Its net displacement is zero:

```text
W ↑
A ←
S ↓
D →
```

Without a delay, all four terminal frames can be rendered faster than they are perceptible, leaving only the final position visible.

The runtime therefore defaults to 100 ms between buffered input characters. It controls **when** COW receives the next command; it does not decide **how** the cow moves.

## Project structure

```text
.
├── cow.cow          # game logic + ANSI renderer, written in COW
├── cow-stream.cpp   # modified COW runtime
├── Makefile
├── README.md
└── THIRD_PARTY_NOTICES.md
```

## COW

COW was created by Sean Heber (BigZaphod).

The runtime in this repository is derived from the original COW interpreter:

https://github.com/BigZaphod/COW

See `THIRD_PARTY_NOTICES.md` for the original MIT license notice.
