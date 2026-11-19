// Technical: grey tiled floor with a 1 m grid, light grey concrete walls round the bay, soft light.
import * as THREE from "three";
import { canvasTexture, ground, sun } from "./common.js";

export function technical(bay) {
  const group = new THREE.Group();
  const margin = 40;
  const W = bay.width + margin * 2, D = bay.depth + margin * 2;
  const tiles = canvasTexture(256, (g, s) => {
    g.fillStyle = "#7c7f83"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 900; i++) {
      const v = 110 + Math.random() * 40;
      g.fillStyle = `rgba(${v},${v},${v},0.18)`;
      g.fillRect(Math.random() * s, Math.random() * s, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }
    g.strokeStyle = "#55585c"; g.lineWidth = 3; g.strokeRect(0, 0, s, s);
  }, [W, D]);
  const floorMat = new THREE.MeshStandardMaterial({ color: tiles ? 0xffffff : 0x7c7f83, map: tiles, roughness: 0.92 });
  group.add(ground(W, D, floorMat, bay.depth / 2));

  // Bay outline (thin dark line) so the edge reads in top view.
  const edge = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-bay.width / 2, 0.004, 0), new THREE.Vector3(bay.width / 2, 0.004, 0),
    new THREE.Vector3(bay.width / 2, 0.004, bay.depth), new THREE.Vector3(-bay.width / 2, 0.004, bay.depth)]),
  new THREE.LineBasicMaterial({ color: 0x3d4044 }));
  group.add(edge);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xa9adb2, roughness: 0.95 });
  const wall = (w, h, d, x, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    m.position.set(x, h / 2, z);
    m.receiveShadow = true;
    m.castShadow = true;
    group.add(m);
  };
  wall(bay.width + 1, 4, 0.5, 0, bay.depth + 1.25);                    // backstop
  wall(0.5, 2.5, bay.depth + 2, -bay.width / 2 - 1.25, bay.depth / 2);  // sides
  wall(0.5, 2.5, bay.depth + 2, bay.width / 2 + 1.25, bay.depth / 2);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x5c6066, 1.6);
  const sunLight = sun(bay, 0xffffff, 1.6, [-12, 30, -10]);
  return { group, lights: [hemiLight, sunLight], hemiLight, sunLight, sunStrength: 1.8, hemiStrength: 1.6, warmth: 0.35,
    hazeColor: null, background: new THREE.Color(0xb7bcc2), fog: null };
}
