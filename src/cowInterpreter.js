const OPS = new Set([
  "moo","mOo","moO","mOO","Moo","MOo",
  "MoO","MOO","OOO","MMM","OOM","oom"
]);

export class CowVM {
  constructor(source = "", onOutput = () => {}) {
    this.onOutput = onOutput;
    this.input = [];
    this.reset(source);
  }

  reset(source) {
    this.program = source.match(/[mMoO]{3}/g)?.filter(op => OPS.has(op)) ?? [];
    this.cells = new Map([[0, 0]]);
    this.ptr = 0;
    this.pc = 0;
    this.register = null;
    this.waiting = false;
    this.halted = false;
    this.jumps = this.buildJumps();
  }

  buildJumps() {
    const jumps = new Map();
    const stack = [];
    for (let i = 0; i < this.program.length; i++) {
      if (this.program[i] === "MOO") stack.push(i);
      if (this.program[i] === "moo") {
        const open = stack.pop();
        if (open !== undefined) {
          jumps.set(open, i);
          jumps.set(i, open);
        }
      }
    }
    return jumps;
  }

  get() { return this.cells.get(this.ptr) ?? 0; }
  set(v) { this.cells.set(this.ptr, v | 0); }
  pushInput(ch) {
    this.input.push(ch.charCodeAt(0));
    this.waiting = false;
  }

  step(max = 10000) {
    let n = 0;
    while (!this.halted && !this.waiting && this.pc < this.program.length && n++ < max) {
      const op = this.program[this.pc];
      switch (op) {
        case "moo":
          if (this.get() !== 0 && this.jumps.has(this.pc)) {
            this.pc = this.jumps.get(this.pc);
          }
          break;
        case "mOo": this.ptr--; break;
        case "moO": this.ptr++; break;
        case "mOO":
          if (this.get() === 0) this.halted = true;
          else this.pc = this.get();
          break;
        case "Moo":
          if (this.get() === 0) {
            if (!this.input.length) {
              this.waiting = true;
              return;
            }
            this.set(this.input.shift());
          } else {
            this.onOutput(String.fromCharCode(this.get() & 255));
          }
          break;
        case "MOo": this.set(this.get() - 1); break;
        case "MoO": this.set(this.get() + 1); break;
        case "MOO":
          if (this.get() === 0 && this.jumps.has(this.pc)) {
            this.pc = this.jumps.get(this.pc);
          }
          break;
        case "OOO": this.set(0); break;
        case "MMM":
          if (this.register === null) this.register = this.get();
          else { this.set(this.register); this.register = null; }
          break;
        case "OOM": this.onOutput(String(this.get())); break;
        case "oom":
          if (!this.input.length) {
            this.waiting = true;
            return;
          }
          this.set(this.input.shift());
          break;
      }
      this.pc++;
    }
    if (this.pc >= this.program.length) this.halted = true;
  }
}
