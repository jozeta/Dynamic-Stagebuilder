// Worn, real-scale building pieces and steel: brick courses run horizontally at real brick size,
// textures are mapped in metres (so the scale is the same on every face), and the container, fence
// and barrier have their real parts.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Box3, Vector3 } from "three";
import { BRICK, brickCourses, corrugationProfile, worldUV } from "../js/render/builders/wear.js";
import { buildProp } from "../js/render/builders/index.js";
import { defaultParams } from "../js/model/props.js";
import { getMaterial } from "../js/render/materials.js";
import * as THREE from "three";

const near = (a, b, t = 1e-6, m = "") => assert.ok(Math.abs(a - b) <= t, `${m} ${a} vs ${b}`);
const obj = (type, params = {}) => ({ id: "w", type, position: [0, 0], rotation: 0, params: { ...defaultParams(type), ...params } });
const parts = (g, name) => { const out = []; g.traverse((c) => { if (c.userData.part === name) out.push(c); }); return out; };
const meshes = (g) => { const out = []; g.traverse((c) => { if (c.isMesh) out.push(c); }); return out; };

test("bricks are real size: 215 × 65 mm with 10 mm joints", () => {
  assert.deepEqual(BRICK, { length: 0.215, height: 0.065, joint: 0.01 });
});

test("brick courses run horizontally in running bond", () => {
  const { rows, width, height } = brickCourses();
  assert.ok(rows.length >= 8, "several courses in a tile");
  near(height, rows.length * (BRICK.height + BRICK.joint), 1e-9, "tile height is whole courses");
  rows.forEach((row, i) => {
    near(row.h, BRICK.height, 1e-9, "course height");
    if (i) near(row.y - rows[i - 1].y, BRICK.height + BRICK.joint, 1e-9, "one course above the last");
    for (const b of row.bricks) {
      assert.ok(b.w > row.h * 3, "the long side is horizontal");
      near(b.w, BRICK.length, 1e-9, "brick length");
    }
    // Whole bricks fill the tile's width (so it tiles), each course offset by half a brick.
    near(row.bricks.length * (BRICK.length + BRICK.joint), width, 1e-9, "a course fills the tile");
    const off = (((row.bricks[0].x - BRICK.joint / 2) % (BRICK.length + BRICK.joint)) + (BRICK.length + BRICK.joint)) % (BRICK.length + BRICK.joint);
    near(off, i % 2 ? (BRICK.length + BRICK.joint) / 2 : 0, 1e-9, "staggered vertical joints");
  });
});

// On every face of the piece, the texture's v follows world height and u runs horizontally, in metres.
function assertWorldScale(mesh, m) {
  mesh.updateMatrixWorld(true);
  const geo = mesh.geometry, pos = geo.attributes.position, uv = geo.attributes.uv, n = geo.attributes.normal;
  const idx = geo.index ? geo.index.array : [...Array(pos.count).keys()];
  let checked = 0;
  for (let t = 0; t < idx.length; t += 3) {
    const [a, b, c] = [idx[t], idx[t + 1], idx[t + 2]];
    if (Math.abs(n.getY(a)) > 0.5) continue;                     // top and bottom faces
    // For side faces, v changes exactly as y does, and u along the horizontal edges as distance does.
    for (const [p, q] of [[a, b], [b, c], [a, c]]) {
      const dy = pos.getY(q) - pos.getY(p), dv = uv.getY(q) - uv.getY(p);
      const dh = Math.hypot(pos.getX(q) - pos.getX(p), pos.getZ(q) - pos.getZ(p)), du = uv.getX(q) - uv.getX(p);
      near(dv, dy, 1e-4, `${m}: v follows height`);
      if (Math.abs(dy) < 1e-9) near(Math.abs(du), dh, 0.05 * dh + 1e-4, `${m}: u follows width`);
    }
    checked++;
  }
  assert.ok(checked > 0, `${m}: has side faces`);
}

test("pillar, column and building wall map their texture in metres on every face", () => {
  for (const material of ["brick", "concrete", "wood", "metal"]) {
    for (const [type, p] of [["pillar", { size: 0.4, height: 3 }], ["pillar", { size: 1.2, height: 6 }], ["column", { diameter: 0.6 }], ["building-wall", { length: 7, height: 3.5 }]]) {
      const g = buildProp(obj(type, { ...p, material }));
      const body = meshes(g).filter((c) => c.material === getMaterial(`bld-${material}`));
      assert.ok(body.length >= 1, `${type} uses bld-${material}`);
      for (const b of body) assertWorldScale(b, `${type} ${material}`);
    }
  }
});

test("building materials are weathered: vertex grime, darker at the foot", () => {
  for (const m of ["brick", "concrete", "wood", "metal"]) assert.equal(getMaterial(`bld-${m}`).vertexColors, true, m);
  const g = buildProp(obj("pillar", { height: 3, material: "brick" }));
  const body = meshes(g).find((c) => c.material === getMaterial("bld-brick"));
  const col = body.geometry.attributes.color, pos = body.geometry.attributes.position;
  assert.ok(col, "has vertex colours");
  let low = 0, nl = 0, high = 0, nh = 0;
  for (let i = 0; i < col.count; i++) {
    const v = col.getX(i) + col.getY(i) + col.getZ(i);
    if (pos.getY(i) < 0.05) { low += v; nl++; } else if (pos.getY(i) > 1.5) { high += v; nh++; }
  }
  assert.ok(nl && nh && low / nl < high / nh, "dirt near the ground");
});

test("worldUV: a box's side faces get u/v in metres", () => {
  const geo = worldUV(new THREE.BoxGeometry(2, 3, 1));
  const uv = geo.attributes.uv, pos = geo.attributes.position;
  let maxV = -Infinity, minV = Infinity;
  for (let i = 0; i < uv.count; i++) if (Math.abs(geo.attributes.normal.getY(i)) < 0.5) { maxV = Math.max(maxV, uv.getY(i)); minV = Math.min(minV, uv.getY(i)); }
  near(maxV - minV, 3, 1e-9);
  assert.equal(pos.count, uv.count);
});

test("container: corrugated sides, two doors with locking bars and cam handles, corner castings", () => {
  for (const size of ["20ft", "40ft"]) {
    const g = buildProp(obj("container", { size }));
    assert.equal(parts(g, "door").length, 2, "two doors");
    assert.equal(g.userData.parts["locking-bar"], 4, "four vertical locking bars");
    assert.equal(g.userData.parts["cam-handle"], 4, "a handle on each bar");
    assert.equal(g.userData.parts["corner-casting"], 8, "eight corner castings");
    assert.ok(parts(g, "corrugated-side").length >= 2, "corrugated long sides");
  }
  const prof = corrugationProfile(5.8);
  const depths = new Set(prof.map((p) => p[1]));
  assert.ok(depths.size === 2 && Math.max(...depths) >= 0.03, "trapezoidal: two depths, about 36 mm apart");
  near(prof[0][0], -2.9, 1e-9); near(prof[prof.length - 1][0], 2.9, 1e-9);
  assert.ok(prof.length > 70, "a corrugation about every 28 cm");
  for (const c of ["blue", "red", "green", "grey", "rust"]) {
    const g = buildProp(obj("container", { color: c }));
    let side = false, door = false;
    g.traverse((m) => { if (m.material === getMaterial(`container-${c}`)) side = true; if (m.material === getMaterial(`container-door-${c}`)) door = true; });
    assert.ok(side && door, `colour ${c} on the sides and doors`);
  }
});

test("chain-link fence: posts, top rail, a see-through sagging mesh mapped in metres", () => {
  const g = buildProp(obj("fence", { length: 10, height: 2 }));
  assert.equal(parts(g, "post").length, 5, "a post every 2.5 m");
  assert.equal(parts(g, "top-rail").length, 1);
  const net = parts(g, "mesh")[0];
  assert.ok(net.material.alphaTest > 0 || net.material.transparent, "see-through");
  const pos = net.geometry.attributes.position, uv = net.geometry.attributes.uv;
  let minU = Infinity, maxU = -Infinity, sag = false, top = -Infinity;
  for (let i = 0; i < pos.count; i++) { minU = Math.min(minU, uv.getX(i)); maxU = Math.max(maxU, uv.getX(i)); top = Math.max(top, pos.getY(i)); }
  for (let i = 0; i < pos.count; i++) if (pos.getY(i) < top - 1e-4 && pos.getY(i) > top - 0.06) sag = true;
  near(maxU - minU, 10 - 0.06, 0.1, "u in metres along the fence");
  assert.ok(sag, "the mesh sags a little between posts");
});

test("concrete barrier: Jersey profile with base slots and lifting pockets", () => {
  const g = buildProp(obj("barrier", { length: 2 }));
  assert.equal(parts(g, "slot").length, 2, "two slots through the foot");
  assert.ok(parts(g, "lift-pocket").length >= 2, "lifting pockets on top");
  const b = new Box3().setFromObject(g), s = b.getSize(new Vector3());
  near(s.y, 0.81, 0.005); near(s.z, 0.6, 0.005);
  // The narrow top: about 15 cm wide.
  let topW = 0;
  g.traverse((c) => { if (c.isMesh && c.material === getMaterial("barrier-concrete")) {
    const p = c.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) if (p.getY(i) > 0.809) topW = Math.max(topW, Math.abs(p.getZ(i)) * 2);
  } });
  near(topW, 0.15, 0.01, "top width");
});

test("steel faces map the whole texture once, edges get the worn border", () => {
  for (const [type, p] of [["plate-round", {}], ["plate-square", {}], ["popper", {}], ["mini-popper", {}], ["texas-star", {}], ["plate-rack", {}], ["dueling-tree", {}]]) {
    const g = buildProp(obj(type, p));
    let faces = 0;
    g.traverse((c) => {
      if (!c.isMesh || !/^steel-(white|yellow)$/.test(c.material.name || "")) return;
      const uv = c.geometry.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        assert.ok(uv.getX(i) >= -1e-6 && uv.getX(i) <= 1 + 1e-6 && uv.getY(i) >= -1e-6 && uv.getY(i) <= 1 + 1e-6, `${type} uv in 0..1`);
      }
      faces++;
    });
    assert.ok(faces > 0, `${type} has painted steel`);
  }
});

test("the chain-link fence reads from a distance: a faint grey veil behind the wire", async () => {
  const { buildProp } = await import("../js/render/builders/index.js");
  const { defaultParams } = await import("../js/model/props.js");
  const g = buildProp({ id: "f", type: "fence", params: defaultParams("fence") });
  const veil = g.children.find((c) => c.userData.part === "veil");
  assert.ok(veil, "a veil");
  assert.ok(veil.material.transparent && veil.material.opacity > 0.1 && veil.material.opacity < 0.4);
});
