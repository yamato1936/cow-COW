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

The executable project is one deliberately chaotic COW source file.

## Run

Using Sean Heber's original COW interpreter:

```bash
~/COW-interpreter/cow cow.cow
```

## Controls

The original interpreter reads **one character from each submitted terminal line**.

So use one key, then Enter:

```text
W + Enter   up
S + Enter   down
A + Enter   left
D + Enter   right
Q + Enter   quit
```

Lowercase `w/a/s/d/q` works too.

Do **not** enter `WASD` as a whole line. The original interpreter's character-input path consumes the first character and discards the remainder of that line.

## What is implemented in COW

`cow.cow` itself:

- emits ANSI escape sequences
- clears the terminal
- hides/restores the cursor
- draws and erases the ASCII cow
- reads terminal input
- performs ASCII comparisons for both uppercase and lowercase controls
- moves the terminal cursor
- redraws the cow
- runs the game loop
- exits on Q/q

The terminal cursor is the cow's position. There is no JavaScript position state.

## Source

Only the 12 standard COW instructions are used:

```text
moo mOo moO mOO Moo MOo MoO MOO OOO MMM OOM oom
```

Current size: **54,168 COW instructions**.

Yes, it is supposed to look like this:

```text
MoO moO moO OOO MoO MoO MoO Moo MOo MOo MOO moo ...
```

That is the point.
