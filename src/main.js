import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CowVM } from "./cowInterpreter.js";
import { createCow } from "./cowModel.js";

const canvas = document.querySelector("#scene");
const sourceEl = document.querySelector("#source");
const stdoutEl = document.querySelector("#stdout");
const statusEl = document.querySelector("#vm-status");

window.addEventListener("error", event => {
  statusEl.textContent = "error";
  stdoutEl.textContent = "JS error: " + event.message;
});

window.addEventListener("unhandledrejection", event => {
  statusEl.textContent = "error";
  stdoutEl.textContent = "Promise error: " + String(event.reason);
});

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bc7da);
scene.fog = new THREE.FogExp2(0x9bc7da, 0.018);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 150);
camera.position.set(8, 5.8, 9.5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.2, 0);
controls.maxPolarAngle = Math.PI * 0.49;
controls.minDistance = 5;
controls.maxDistance = 18;

scene.add(new THREE.HemisphereLight(0xe7f6ff, 0x597348, 2.6));

const sun = new THREE.DirectionalLight(0xfff1d2, 4.2);
sun.position.set(-5, 11, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -20;
sun.shadow.camera.right = 20;
sun.shadow.camera.top = 20;
sun.shadow.camera.bottom = -20;
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(42, 96),
  new THREE.MeshStandardMaterial({ color: 0x527d45, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const grid = new THREE.GridHelper(32, 32, 0xb9d094, 0x74945f);
grid.position.y = 0.012;
grid.material.opacity = 0.18;
grid.material.transparent = true;
scene.add(grid);

for (let i = 0; i < 48; i++) {
  const h = 0.12 + Math.random() * 0.25;
  const grass = new THREE.Mesh(
    new THREE.ConeGeometry(0.035, h, 4),
    new THREE.MeshStandardMaterial({ color: 0x79a95a, roughness: 1 })
  );

  const a = Math.random() * Math.PI * 2;
  const r = 4 + Math.random() * 22;

  grass.position.set(Math.cos(a) * r, h / 2, Math.sin(a) * r);
  grass.rotation.y = Math.random() * Math.PI;
  scene.add(grass);
}

const cow = createCow();
scene.add(cow);

// JS does not own game coordinates anymore.
// These are only render targets decoded from COW stdout.
const renderTarget = new THREE.Vector3();
let renderDirection = 4;
let packet = [];
let vm = null;
let dispatch = null;
let activeKey = null;
let repeatTimer = 0;

function parseDispatchTable(source) {
  const table = {};

  for (const key of ["W", "S", "A", "D"]) {
    const match = source.match(new RegExp("@" + key + "=(\\d+)"));
    if (!match) {
      throw new Error("Missing @" + key + "=... dispatch entry in cow.cow");
    }
    table[key.toLowerCase()] = Number(match[1]);
  }

  return table;
}

function directionAngle(dir) {
  if (dir === 1) return Math.PI / 2;   // W
  if (dir === 2) return -Math.PI / 2;  // S
  if (dir === 3) return Math.PI;       // A
  return 0;                            // D
}

function consumeCowByte(ch) {
  packet.push(ch.charCodeAt(0));

  if (packet.length < 3) return;

  const [xByte, zByte, dir] = packet;
  packet = [];

  const x = xByte - 128;
  const z = zByte - 128;

  renderTarget.set(x * 0.28, 0, z * 0.28);
  renderDirection = dir;

  stdoutEl.textContent =
    "COW STATE\n" +
    "x = " + x + "\n" +
    "z = " + z + "\n" +
    "dir = " + ({1:"W",2:"S",3:"A",4:"D"}[dir] ?? "?");
}

function boot(source) {
  dispatch = parseDispatchTable(source);
  packet = [];
  activeKey = null;
  repeatTimer = 0;
  renderTarget.set(0, 0, 0);
  renderDirection = 4;
  cow.position.set(0, 0, 0);
  cow.rotation.y = 0;

  vm = new CowVM(source, consumeCowByte);
  vm.step();

  statusEl.textContent = vm.halted ? "halted" : "COW owns state";
  stdoutEl.textContent = "COW STATE\nx = 0\nz = 0\ndir = D";
}

function sendKey(key) {
  if (!vm || !dispatch || dispatch[key] === undefined) return;

  vm.pushInput(dispatch[key]);
  vm.step();

  statusEl.textContent = vm.halted
    ? "halted"
    : vm.waiting
      ? "COW owns state"
      : "running";
}

async function loadProgram() {
  try {
    const response = await fetch("./programs/cow.cow", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(
        "Could not load programs/cow.cow (" + response.status + ")"
      );
    }

    const source = await response.text();
    sourceEl.value = source;
    boot(source);
  } catch (error) {
    statusEl.textContent = "error";
    stdoutEl.textContent = String(error);
  }
}

loadProgram();

const keyMap = {
  ArrowUp: "w",
  ArrowDown: "s",
  ArrowLeft: "a",
  ArrowRight: "d",
  w: "w",
  a: "a",
  s: "s",
  d: "d",
  W: "w",
  A: "a",
  S: "s",
  D: "d"
};

addEventListener("keydown", event => {
  if (document.activeElement === sourceEl) return;

  const key = keyMap[event.key];
  if (!key) return;

  event.preventDefault();

  if (activeKey !== key) {
    activeKey = key;
    repeatTimer = 0;
    sendKey(key);
  }
});

addEventListener("keyup", event => {
  const key = keyMap[event.key];
  if (key && activeKey === key) {
    activeKey = null;
  }
});

document.querySelector("#run").onclick = () => {
  try {
    boot(sourceEl.value);
  } catch (error) {
    statusEl.textContent = "error";
    stdoutEl.textContent = String(error);
  }
};

document.querySelector("#reset").onclick = () => {
  try {
    boot(sourceEl.value);
  } catch (error) {
    statusEl.textContent = "error";
    stdoutEl.textContent = String(error);
  }
};

const clock = new THREE.Clock();

function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}

addEventListener("resize", resize);
resize();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.04);
  const t = clock.elapsedTime;

  // A held physical key simply feeds more input to the COW VM.
  // Position is never integrated in JavaScript.
  if (activeKey) {
    repeatTimer += dt;
    if (repeatTimer >= 0.075) {
      repeatTimer = 0;
      sendKey(activeKey);
    }
  }

  const before = cow.position.clone();
  cow.position.lerp(renderTarget, 1 - Math.exp(-dt * 12));
  const visualSpeed = cow.position.distanceTo(before) / Math.max(dt, 0.001);

  const targetAngle = directionAngle(renderDirection);
  let delta = targetAngle - cow.rotation.y;
  delta = Math.atan2(Math.sin(delta), Math.cos(delta));
  cow.rotation.y += delta * (1 - Math.exp(-dt * 10));

  cow.userData.animate(t, visualSpeed);

  controls.target.x += (cow.position.x - controls.target.x) * dt * 1.8;
  controls.target.z += (cow.position.z - controls.target.z) * dt * 1.8;

  controls.update();
  renderer.render(scene, camera);
}

animate();
