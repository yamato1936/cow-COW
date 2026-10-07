# cow-COW 🐄

A terminal cow whose **game logic and rendering are written entirely in COW**.

```text
keyboard line
   ↓
cow-stream
   ↓ one byte at a time
cow.cow
   ↓ ANSI
terminal
   ↓
🐄
```

## Build

```bash
make
```

## Run

Default playback is **100 ms per input character**:

```bash
./cow-stream cow.cow
```

Now type a whole sequence and press Enter once:

```text
> WSDASWDAWDD
```

The cow visibly plays every state in order instead of jumping directly to the final position.

## Playback speed

The optional second argument is milliseconds per buffered input character:

```bash
./cow-stream cow.cow 200   # slow / easy to inspect
./cow-stream cow.cow 100   # default
./cow-stream cow.cow 40    # fast
./cow-stream cow.cow 0     # no pacing; only final state may be perceptible
```

The Makefile exposes the same setting:

```bash
make run DELAY=150
```

## Why WASD previously looked stationary

`WASD` has net displacement zero:

```text
W ↑
A ←
S ↓
D →
```

The old buffered interpreter processed those four states so quickly that the terminal repainted them faster than a human could see. The final frame was back at the starting position, which made it look as though nothing happened.

`cow-stream` now pauses before delivering the next buffered character. Importantly, the runtime still does not calculate movement.

## Responsibilities

### cow.cow

All game behavior:

- W/A/S/D parsing
- movement direction
- erase/redraw
- ANSI rendering
- loop
- quit

### cow-stream.cpp

Runtime only:

- executes the 12 COW instructions
- feeds buffered stdin to `Moo` one byte at a time
- flushes COW stdout
- paces buffered input so rendered COW frames are visible

No cow coordinates or movement rules live in C++.
