// The earth berm: a height field over its footprint (model/berm.js: sloping sides and ends, or a
// drawn outline), with dug-earth lumps on its faces, on the Outdoor ground's own surface (the chosen
// ground's graded photo scan), and grass and bushes on it. Seeded, so the same berm looks the same.
import * as THREE from "three";
import { group } from "./parts.js";
import { bermHeight, bermSize } from "../../model/berm.js";
import { earthMaterial, grassAt, EARTH_TILE } from "../environments/ground.js";
import { bushesAt } from "../environments/foliage.js";
import { fbm } from "../environments/terrain.js";
import { rng } from "../environments/common.js";

const STEP = 0.25;                         // metres between height samples
const lumps = fbm(611), tone = fbm(612);
// Lumpy dug earth on the faces: none at the foot or on the flat top, most half way up.
const lump = (u, v, h, H) => (h > 0 && h < H ? lumps(u * 0.9, v * 0.9) * 0.14 * Math.sin(Math.PI * (h / H)) : 0);

export function buildBerm(obj) {
  const g = group(obj.id);
  const [L, D] = bermSize(obj);
  const H = obj.params.height;
  const geo = new THREE.PlaneGeometry(L, D, Math.ceil(L / STEP), Math.ceil(D / STEP));
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position, uv = geo.attributes.uv;
  const raised = new Uint8Array(pos.count);
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i), v = pos.getZ(i);
    const h = bermHeight(obj, u, v);
    raised[i] = h > 0 ? 1 : 0;
    pos.setY(i, h + lump(u, v, h, H));
    uv.setXY(i, u / EARTH_TILE, v / EARTH_TILE);
    // Darker, damper earth at the foot; lighter, dried crust on top; a little patchiness.
    const k = 0.66 + 0.14 * Math.min(1, h / H) + tone(u * 0.3, v * 0.3) * 0.07;      // faces catch more sun than the floor: a little darker
    colors.set([k, k * 0.98, k * 0.95], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  // Only the triangles on the berm: the flat ground round it (and in a drawing's gaps) is left out.
  const idx = geo.index.array, keep = [];
  for (let t = 0; t < idx.length; t += 3) if (raised[idx[t]] || raised[idx[t + 1]] || raised[idx[t + 2]]) keep.push(idx[t], idx[t + 1], idx[t + 2]);
  geo.setIndex(keep);
  geo.computeVertexNormals();
  const earth = new THREE.Mesh(geo, earthMaterial(obj.params.ground));
  earth.name = "berm-earth";
  earth.castShadow = true;
  earth.receiveShadow = true;
  g.add(earth);

  // Plants: grass tufts on the top and the faces, a few bushes along the top.
  const plants = obj.params.plants || "mixed";
  if (plants !== "none") {
    const r = rng(701 + Math.round(L * 7 + D * 13 + H * 17));
    const grass = [], bushes = [];
    const tries = Math.round(L * D * 5);
    for (let i = 0; i < tries; i++) {
      const u = (r() - 0.5) * (L - 0.6), v = (r() - 0.5) * (D - 0.6), h = bermHeight(obj, u, v);     // kept off the very edge
      if (h < 0.15) continue;
      const y = h + lump(u, v, h, H);
      if (tone(u * 0.4 + 7, v * 0.4) > -0.15) grass.push([u, y, v]);
      if (plants === "mixed" && h > H * 0.7 && r() < 0.035) bushes.push([u, y, v]);
    }
    const pg = new THREE.Group();
    pg.name = "berm-plants";
    if (grass.length) pg.add(grassAt(grass, { seed: 11 }));
    const b = bushesAt(bushes, 13);
    if (b) pg.add(b);
    if (plants === "mixed" && !b) pg.add(grassAt(grass.slice(0, Math.ceil(grass.length / 3)), { seed: 12, scale: 1.4 }));   // taller tufts where no bush landed
    if (pg.children.length) g.add(pg);
  }
  return g;
}
