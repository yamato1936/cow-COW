# cow-COW 🐄

A 3D cow whose **game state is executed by the COW esoteric programming language**.

This is intentionally not "JavaScript moves a cow after COW echoes a key" anymore.

The split is:

```text
keyboard
   ↓
tiny browser input bridge
   ↓
COW VM
   ↓
programs/cow.cow
   ├─ owns X
   ├─ owns Z
   ├─ handles W / A / S / D
   └─ emits [x, z, direction]
   ↓
Three.js renderer
   ↓
🐄
```

JavaScript is still required for browser/WebGL access because standard COW has no DOM, WebGL, GPU, keyboard-event, or 3D graphics instructions. The gameplay state itself lives in COW.

## Run

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Use W/A/S/D or the arrow keys.

## What COW owns

`programs/cow.cow` owns:

- X coordinate
- Z coordinate
- direction
- W/A/S/D state transitions
- the state packet sent to the renderer

Memory layout:

```text
cell 0 : input / computed-jump dispatcher
cell 1 : x + 128
cell 2 : z + 128
```

Every accepted command emits exactly three bytes:

```text
[x + 128] [z + 128] [direction]
```

where direction is:

```text
1 = W
2 = S
3 = A
4 = D
```

The browser does not integrate position. It only interpolates visually toward the coordinates produced by COW.

## COW dispatch ABI

The four movement handlers are placed at fixed instruction slots:

```text
W handler: instruction 64
S handler: instruction 128
A handler: instruction 192
D handler: instruction 256
```

Because this VM's `mOO` computed jump increments the program counter after assigning it, the input values are one less:

```text
@W=63
@S=127
@A=191
@D=255
```

Those values are stored in the small ABI header at the top of `cow.cow`. Everything after that header is COW instructions.

See `programs/COW_ENGINE.md` for the execution model.
