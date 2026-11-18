// Outdoor: a dirt range in warm sunlight with an earth berm round the bay and a blue sky.
import * as THREE from "three";
import { canvasTexture, ground, sun } from "./common.js";

function dirt(g, s) {
  g.fillStyle = "#a88a63"; g.fillRect(0, 0, s, s);
  for (let i = 0; i < 5000; i++) {
    const r = 120 + Math.random() * 70, gr = r * 0.8, b = r * 0.58;
    g.fillStyle = `rgba(${r | 0},${gr | 0},${b | 0},${0.15 + Math.random() * 0.3})`;
    const z = Math.random() * 2.5 + 0.5;
    g.fillRect(Math.random() * s, Math.random() * s, z, z);
  }
}

export function outdoor(bay) {
  const group = new THREE.Group();
  const margin = 70;
  const W = bay.width + margin * 2, D = bay.depth + margin * 2;
  const tex = canvasTexture(512, dirt, [W / 6, D / 6]);
  const dirtMat = new THREE.MeshStandardMaterial({ color: tex ? 0xffffff : 0xa88a63, map: tex, roughness: 1 });
  group.add(ground(W, D, dirtMat, bay.depth / 2));

  // Berms: sloped earth banks behind and beside the bay.
  const bermMat = new THREE.MeshStandardMaterial({ color: 0x8f7350, roughness: 1, map: canvasTexture(512, dirt, [6, 2]) });
  const berm = (length, height, base) => {
    const s = new THREE.Shape([new THREE.Vector2(-base / 2, 0), new THREE.Vector2(base / 2, 0),
      new THREE.Vector2(base / 4, height), new THREE.Vector2(-base / 4, height)]);
    const geo = new THREE.ExtrudeGeometry(s, { depth: length, bevelEnabled: false });
    geo.translate(0, 0, -length / 2);
    const m = new THREE.Mesh(geo, bermMat);
    m.receiveShadow = true;
    m.castShadow = true;
    return m;
  };
  const back = berm(bay.width + 8, 4.5, 8);
  back.rotation.y = Math.PI / 2;
  back.position.set(0, 0, bay.depth + 4);
  const left = berm(bay.depth + 4, 2.5, 5);
  left.position.set(-bay.width / 2 - 3, 0, bay.depth / 2);
  const right = berm(bay.depth + 4, 2.5, 5);
  right.position.set(bay.width / 2 + 3, 0, bay.depth / 2);
  group.add(back, left, right);

  const lights = [new THREE.HemisphereLight(0xcfe3ff, 0x7a6248, 1.1), sun(bay, 0xffe2b8, 2.6, [-18, 26, -14])];
  return { group, lights, background: new THREE.Color(0xa9cbe8), fog: new THREE.Fog(0xa9cbe8, 70, 140) };
}
