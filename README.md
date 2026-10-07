# cow-COW 🐄

A tiny 3D game where a cow is controlled through the **COW esoteric programming language**.

Keyboard input is fed into a COW interpreter. The COW program echoes movement commands, and those commands drive a procedural Three.js cow.

## Run

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Controls

- W / A / S / D or arrow keys — move
- Mouse drag — orbit camera
- Mouse wheel — zoom
- Run COW — restart the VM with the editor contents
- Reset cow — return to origin

## Architecture

```text
keyboard → COW stdin → COW VM → COW stdout → 3D cow
```

The default `programs/cow.cow` is real COW code. It reads one character with `Moo`, outputs it with `Moo`, clears the input cell, and loops.

## Stack

- COW — control program
- JavaScript — interpreter + runtime
- Three.js — 3D rendering
