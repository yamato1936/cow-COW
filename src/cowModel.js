import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const mat = (color, roughness=.72, metalness=.02) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

const white = mat(0xf5efe2);
const black = mat(0x171513);
const pink = mat(0xe7a8a1, .8);
const horn = mat(0xd7c8a1, .9);
const hoof = mat(0x2a211c, .9);
const eye = mat(0x090909, .4);

function mesh(geo, material, pos, scale=[1,1,1], rot=[0,0,0]) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(...pos);
  m.scale.set(...scale);
  m.rotation.set(...rot);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function createCow() {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  body.add(mesh(new THREE.SphereGeometry(1, 48, 32), white, [0, 1.55, 0], [1.85, .95, .95]));
  body.add(mesh(new THREE.SphereGeometry(.72, 40, 28), white, [1.75, 1.85, 0], [.85,.78,.78]));
  body.add(mesh(new THREE.SphereGeometry(.47, 36, 24), pink, [2.28,1.62,0], [.72,.5,.66]));

  const nostrilGeo = new THREE.SphereGeometry(.055, 16, 10);
  body.add(mesh(nostrilGeo, black, [2.59,1.7,.22], [1,.7,.7]));
  body.add(mesh(nostrilGeo, black, [2.59,1.7,-.22], [1,.7,.7]));

  for (const z of [-.34,.34]) {
    body.add(mesh(new THREE.SphereGeometry(.07,18,12), eye, [2.1,2.08,z]));
    body.add(mesh(new THREE.SphereGeometry(.025,10,8), white, [2.145,2.105,z*1.03]));
  }

  const earGeo = new THREE.SphereGeometry(.28, 24, 16);
  body.add(mesh(earGeo, white, [1.72,2.43,.62], [1.15,.38,.62], [0,0,.22]));
  body.add(mesh(earGeo, white, [1.72,2.43,-.62], [1.15,.38,.62], [0,0,-.22]));

  const hornGeo = new THREE.ConeGeometry(.13,.58,20);
  body.add(mesh(hornGeo, horn, [1.92,2.58,.36], [1,1,1], [0,0,-.34]));
  body.add(mesh(hornGeo, horn, [1.92,2.58,-.36], [1,1,1], [0,0,-.34]));

  const spotGeo = new THREE.SphereGeometry(.58, 30, 20);
  body.add(mesh(spotGeo, black, [-.72,1.84,.75], [1.25,.72,.18], [.15,.1,.18]));
  body.add(mesh(spotGeo, black, [.32,1.22,-.82], [.9,.55,.14], [-.1,.2,.05]));
  body.add(mesh(new THREE.SphereGeometry(.28,24,16), black, [1.64,2.02,-.64], [1,.65,.16]));

  const legGeo = new THREE.CapsuleGeometry(.17, 1.08, 8, 18);
  const legs = [];
  for (const [x,z] of [[-1.05,-.57],[-1.05,.57],[.92,-.57],[.92,.57]]) {
    const pivot = new THREE.Group();
    pivot.position.set(x,1.02,z);
    const leg = mesh(legGeo, white, [0,-.52,0]);
    const foot = mesh(new THREE.CylinderGeometry(.19,.21,.22,20), hoof, [0,-1.13,.03]);
    pivot.add(leg, foot);
    body.add(pivot);
    legs.push(pivot);
  }

  const tail = new THREE.Group();
  tail.position.set(-1.78,1.86,0);
  const tailStem = mesh(new THREE.CylinderGeometry(.045,.065,1.05,12), white, [0,-.42,0], [1,1,1], [0,0,-.6]);
  const tuft = mesh(new THREE.SphereGeometry(.18,18,12), black, [-.31,-.83,0], [1,.75,.75]);
  tail.add(tailStem, tuft);
  body.add(tail);

  root.userData.animate = (t, speed) => {
    const amp = Math.min(speed * .16, .55);
    legs.forEach((leg, i) => {
      leg.rotation.z = Math.sin(t * 8 + (i % 2 ? Math.PI : 0)) * amp;
    });
    tail.rotation.x = Math.sin(t * 3.2) * .22;
    tail.rotation.z = Math.sin(t * 2.1) * .18;
    body.position.y = Math.abs(Math.sin(t * 8)) * Math.min(speed*.025,.08);
  };

  return root;
}
