# cow-COW 🐄

**A terminal cow written entirely in COW.**

No JavaScript.  
No Python.  
No C/C++ game logic.  
No Three.js.

The executable project is one file:

```text
cow.cow
   ↓
COW interpreter
   ↓
terminal
```

`cow.cow` itself contains only standard COW instructions:

```text
moo mOo moO mOO Moo MOo MoO MOO OOO MMM OOM oom
```

The deliberately ridiculous wall of `MoO Moo MOo ...` is the source code.

## What the COW program does

The COW program itself:

- prints ANSI terminal control sequences
- clears the screen
- hides/restores the terminal cursor
- draws the ASCII cow
- reads keyboard input
- compares the ASCII input against `w`, `a`, `s`, `d`, and `q`
- erases the previous cow
- emits relative ANSI cursor movement
- redraws the cow
- loops

The terminal cursor is effectively the cow's position. There is no JavaScript state.

## Run with the original COW interpreter

Sean Heber's original interpreter is here:

https://github.com/BigZaphod/COW

One simple build:

```bash
git clone https://github.com/BigZaphod/COW.git ~/COW-interpreter
g++ -O2 ~/COW-interpreter/source/cow.cpp -o ~/COW-interpreter/cow
```

Then from this repository:

```bash
~/COW-interpreter/cow cow.cow
```

## Controls

With the original interpreter, type a letter and press Enter:

```text
w + Enter   up
s + Enter   down
a + Enter   left
d + Enter   right
q + Enter   quit
```

The Enter requirement comes from the original interpreter's terminal input implementation, not from game logic written in another language.

## Size

The current program expands to **31,023 COW instructions**.

That is intentional.

The source should look less like normal software and more like a cow has been repeatedly stepping on Caps Lock.

## Architecture

```text
             ┌────────────────────┐
keyboard --->│      cow.cow       │
             │                    │
             │ input comparison   │
             │ terminal movement  │
             │ cow rendering      │
             │ main game loop     │
             └─────────┬──────────┘
                       │ stdout
                       v
                ANSI terminal
                       │
                       v
                      🐄
```

Everything above the interpreter boundary is COW.
