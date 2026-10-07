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

```bash
./cow-stream cow.cow
```

or simply:

```bash
make run
```

## Controls

Type an entire movement sequence, then press Enter:

```text
> WSDASWDAWDD
```

The cow then consumes the buffered characters one by one and moves rapidly:

```text
W → up
S → down
D → right
A → left
S → down
...
```

Uppercase and lowercase both work.

`Q` or `q` quits. Any other character, including the final newline, is ignored.

## Why cow-stream exists

Sean Heber's original COW interpreter implements character input roughly as:

```cpp
cell = getchar();
while (getchar() != '\n');
```

so `WSDASWDAWDD + Enter` gives COW only the first `W`.

`cow-stream` changes only that input behavior conceptually:

```cpp
cell = getchar();
```

The terminal stays in normal canonical mode. Therefore:

1. You type `WSDASWDAWDD`.
2. Enter submits the line.
3. The first COW `Moo` reads `W`.
4. The next COW `Moo` immediately reads `S`.
5. Then `D`, `A`, and so on.
6. The final newline is ignored.
7. Once the input buffer is empty, the next `Moo` waits for another line.

There is no raw-mode keyboard handling.

## Responsibilities

### cow.cow

The game itself:

- W/A/S/D parsing
- uppercase/lowercase handling
- movement
- erase/redraw
- ANSI rendering
- main loop
- quit

The source contains only the 12 COW instructions.

### cow-stream.cpp

Only the runtime:

- parses COW source
- implements the 12 COW instructions
- provides one-byte-at-a-time stdin to `Moo`
- flushes stdout so movement frames appear immediately

It does **not** contain cow movement logic.

Current `cow.cow`: **55,674 COW instructions**.
