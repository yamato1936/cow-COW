# COW game-state engine

The goal of this project is to put as much game logic as is practical inside COW.

## Boundary

A standard COW program can manipulate memory and perform input/output. It cannot call WebGL, create a browser canvas, compile shaders, access keyboard DOM events, or submit geometry to a GPU.

Therefore the clean boundary is:

- **COW:** game state and state transitions.
- **JavaScript:** COW interpreter, physical input adapter, WebGL/Three.js rendering.

That is similar to a native game where game logic is separate from the graphics driver.

## Memory

The program starts with the pointer at cell 0.

```text
cell 0 = dispatcher/input
cell 1 = x + 128
cell 2 = z + 128
```

X and Z are initialized to 128, representing world coordinate zero.

## Initialization

The program creates 128 efficiently as:

```text
8 × 16 = 128
```

A COW loop holds 8 in cell 0 and adds 16 to both coordinate cells on each iteration.

## Dispatch

The program then blocks on `oom`.

The browser supplies one numeric command. COW's `mOO` instruction is used as a computed jump.

Fixed slots are used so the ABI stays simple:

| key | handler instruction | input value |
| --- | ---: | ---: |
| W | 64 | 63 |
| S | 128 | 127 |
| A | 192 | 191 |
| D | 256 | 255 |

The difference of one is caused by this interpreter advancing the program counter after `mOO`.

## Handler

Each handler does all of the actual game-state mutation.

For example, W conceptually performs:

```text
z = z - 1
emit(x)
emit(z)
emit(1)
return WAIT
```

The implementation is entirely COW opcodes.

S increments Z, A decrements X, and D increments X.

## Output protocol

COW emits three raw bytes after every state transition:

```text
byte 0 = x + 128
byte 1 = z + 128
byte 2 = direction
```

The JavaScript renderer decodes those bytes and draws the cow at that state.

It does not calculate the next X/Z state itself.
