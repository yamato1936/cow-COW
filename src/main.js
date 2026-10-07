import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CowVM } from "./cowInterpreter.js";
import { createCow } from "./cowModel.js";

const canvas = document.querySelector("#scene");
const sourceEl = document.querySelector("#source");
const stdoutEl = document.querySelector("#stdout");
const statusEl = document.querySelector("#vm-status");

window.addEventListener("error", (event) => {
  statusEl.textContent = "error";
  stdoutEl.textContent = "JS error: " + event.message;
});

window.addEventListener("unhandledrejection", (event) => {
  statusEl.textContent = "error";
  stdoutEl.textContent = "Promise error: " + String(event.reason);
});

const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bc7da);
scene.fog = new THREE.FogExp2(0x9bc7da, .018);

const camera = new THREE.PerspectiveCamera(42, 1, .1, 150);
camera.position.set(8,5.8,9.5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0,1.2,0);
controls.maxPolarAngle = Math.PI * .49;
controls.minDistance = 5;
controls.maxDistance = 18;

scene.add(new THREE.HemisphereLight(0xe7f6ff, 0x597348, 2.6));
const sun = new THREE.DirectionalLight(0xfff1d2, 4.2);
sun.position.set(-5,11,6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left = -20; sun.shadow.camera.right = 20;
sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -20;
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.CircleGeometry(42, 96),
  new THREE.MeshStandardMaterial({color:0x527d45, roughness:1})
);
ground.rotation.x = -Math.PI/2;
ground.receiveShadow = true;
scene.add(ground);

const grid = new THREE.GridHelper(32,32,0xb9d094,0x74945f);
grid.position.y = .012;
grid.material.opacity = .18;
grid.material.transparent = true;
scene.add(grid);

for (let i=0;i<48;i++) {
  const h=.12+Math.random()*.25;
  const grass=new THREE.Mesh(
    new THREE.ConeGeometry(.035,h,4),
    new THREE.MeshStandardMaterial({color:0x79a95a,roughness:1})
  );
  const a=Math.random()*Math.PI*2, r=4+Math.random()*22;
  grass.position.set(Math.cos(a)*r,h/2,Math.sin(a)*r);
  grass.rotation.y=Math.random()*Math.PI;
  scene.add(grass);
}

const cow = createCow();
cow.rotation.y = -.35;
scene.add(cow);

let velocity = new THREE.Vector3();
let desired = new THREE.Vector3();
let output = "";
let vm;

function command(ch) {
  const c=ch.toLowerCase();
  if (c==="w") desired.z=-1;
  if (c==="s") desired.z=1;
  if (c==="a") desired.x=-1;
  if (c==="d") desired.x=1;
}

function boot(source) {
  output="";
  stdoutEl.textContent="moo...";
  vm = new CowVM(source, ch => {
    output=(output+ch).slice(-36);
    stdoutEl.textContent=output.replace(/\n/g,"↵");
    command(ch);
  });
  vm.step();
  statusEl.textContent=vm.halted?"halted":"waiting";
}

async function loadProgram() {
  try {
    const r = await fetch("./programs/cow.cow", { cache: "no-store" });
    if (!r.ok) throw new Error("Could not load programs/cow.cow (" + r.status + ")");
    const src = await r.text();
    sourceEl.value = src;
    boot(src);
  } catch (err) {
    statusEl.textContent = "error";
    stdoutEl.textContent = String(err);
  }
}

loadProgram();

function send(ch) {
  if (!vm) return;
  vm.pushInput(ch);
  vm.step();
  statusEl.textContent=vm.halted?"halted":vm.waiting?"waiting":"running";
}

const keyMap = {
  ArrowUp:"w", ArrowDown:"s", ArrowLeft:"a", ArrowRight:"d",
  w:"w",a:"a",s:"s",d:"d",W:"w",A:"a",S:"s",D:"d"
};

addEventListener("keydown", e=>{
  if (document.activeElement===sourceEl) return;
  const c=keyMap[e.key];
  if (!c) return;
  e.preventDefault();
  send(c);
});
addEventListener("keyup", e=>{
  if (keyMap[e.key]) desired.set(0,0,0);
});

document.querySelector("#run").onclick=()=>boot(sourceEl.value);
document.querySelector("#reset").onclick=()=>{
  cow.position.set(0,0,0); velocity.set(0,0,0); desired.set(0,0,0);
};

const clock = new THREE.Clock();
function resize() {
  const w=innerWidth,h=innerHeight;
  renderer.setSize(w,h,false);
  camera.aspect=w/h; camera.updateProjectionMatrix();
}
addEventListener("resize",resize); resize();

function animate() {
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),.04);
  const t=clock.elapsedTime;

  const targetVel=desired.clone().normalize().multiplyScalar(4.0);
  velocity.lerp(targetVel,1-Math.exp(-dt*7));
  cow.position.addScaledVector(velocity,dt);
  cow.position.x=THREE.MathUtils.clamp(cow.position.x,-14,14);
  cow.position.z=THREE.MathUtils.clamp(cow.position.z,-14,14);

  if (velocity.lengthSq()>.04) {
    const targetAngle=Math.atan2(velocity.x,velocity.z)-Math.PI/2;
    let d=targetAngle-cow.rotation.y;
    d=Math.atan2(Math.sin(d),Math.cos(d));
    cow.rotation.y += d*(1-Math.exp(-dt*8));
  }

  cow.userData.animate(t, velocity.length());

  controls.target.x += (cow.position.x-controls.target.x)*dt*1.8;
  controls.target.z += (cow.position.z-controls.target.z)*dt*1.8;
  controls.update();
  renderer.render(scene,camera);
}
animate();
