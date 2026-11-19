// Technical: grey tiled floor with a 1 m grid, light grey concrete walls round the bay, soft light.
// The floor runs on to the horizon (fading into the background, like the Blueprint sheet); the
// walls can be hidden (look.walls) and the floor tinted (look.groundHue / Intensity / Brightness).
import * as THREE from "three";
import { canvasTexture, ground, sun } from "./common.js";
import { hsvToRgb } from "../../model/look.js";

const FLOOR = 900;                 // metres a side: well past the fog, so it reads as endless
const BG = 0xb7bcc2;
const TILE_TONE = new THREE.Color(0x7c7f83);

export function technical(bay) {
  const group = new THREE.Group();
  const W = FLOOR, D = FLOOR;
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
  const floorBase = floorMat.color.clone();

  // Bay outline (thin dark line) so the edge reads in top view.
  const edge = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-bay.width / 2, 0.004, 0), new THREE.Vector3(bay.width / 2, 0.004, 0),
    new THREE.Vector3(bay.width / 2, 0.004, bay.depth), new THREE.Vector3(-bay.width / 2, 0.004, bay.depth)]),
  new THREE.LineBasicMaterial({ color: 0x3d4044 }));
  group.add(edge);

  const walls = new THREE.Group();
  walls.name = "walls";
  group.add(walls);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xa9adb2, roughness: 0.95 });
  const wall = (w, h, d, x, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    m.position.set(x, h / 2, z);
    m.receiveShadow = true;
    m.castShadow = false;           // only props cast sun shadows
    walls.add(m);
  };
  wall(bay.width + 1, 4, 0.5, 0, bay.depth + 1.25);                    // backstop
  wall(0.5, 2.5, bay.depth + 2, -bay.width / 2 - 1.25, bay.depth / 2);  // sides
  wall(0.5, 2.5, bay.depth + 2, bay.width / 2 + 1.25, bay.depth / 2);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x5c6066, 1.6);
  const sunLight = sun(bay, 0xffffff, 1.6, [-12, 30, -10]);
  const fog = new THREE.Fog(BG, 60, 260);           // the endless floor fades into the background before its edge
  return { group, lights: [hemiLight, sunLight], hemiLight, sunLight, sunStrength: 1.8, hemiStrength: 1.6, warmth: 0.1,
    hazeColor: null, background: new THREE.Color(BG), fog, baseFog: fog,
    walls: true,
    setWalls(on) { this.walls = on; walls.visible = on; },
    // The floor's colour: its grey tiles times an HSV tint (no intensity: plain grey).
    setGroundTone({ hue, intensity, brightness }) {
      floorMat.color.setRGB(...hsvToRgb(hue, intensity, Math.min(1, brightness)).map((c) => c * Math.max(1, brightness)), THREE.SRGBColorSpace).multiply(floorBase);
      // The background and the distance fade take the colour the floor shows far off under this
      // light (measured: about 0.38 of its colour, in linear terms), so it runs on without a horizon line.
      this.background.copy(TILE_TONE).multiply(floorMat.color).multiplyScalar(0.38);
      this.fog.color.copy(this.background);
    },
  };
}
