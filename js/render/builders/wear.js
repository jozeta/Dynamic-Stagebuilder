// Geometry helpers for worn, real-scale props: texture coordinates in metres (so a texture has the
// same scale on every face and every size), vertex-colour grime (dirt at the foot, patchy staining),
// steel faces that show the whole painted texture once, merging small parts into one mesh, and the
// pure layouts the textures and geometry share (brick courses, container corrugation).
import * as THREE from "three";

/** A standard brick (215 × 65 mm face) in 10 mm mortar joints. */
export const BRICK = Object.freeze({ length: 0.215, height: 0.065, joint: 0.01 });

/**
 * One texture tile of brickwork in running (stretcher) bond: `courses` horizontal courses of
 * `perCourse` bricks each, every other course shifted by half a brick. y and x are in metres from
 * the tile's bottom-left corner; each course is a joint (below) plus the brick height.
 */
export function brickCourses(perCourse = 8, courses = 24) {
  const mx = BRICK.length + BRICK.joint, my = BRICK.height + BRICK.joint;
  const rows = [];
  for (let i = 0; i < courses; i++) {
    const shift = i % 2 ? mx / 2 : 0, bricks = [];
    for (let k = 0; k < perCourse; k++) bricks.push({ x: shift + k * mx + BRICK.joint / 2, w: BRICK.length });
    rows.push({ y: i * my + BRICK.joint / 2, h: BRICK.height, bricks });
  }
  return { width: perCourse * mx, height: courses * my, rows };
}

/**
 * The trapezoidal corrugation of an ISO container's side panel across `span` metres, centred on 0:
 * [x, inset] points, inset 0 on the outer flats and `depth` on the inner ones. Standard sheet:
 * a 278 mm pitch (72 mm outer flat, 68 mm inner flat, 69 mm flanks) and 36 mm deep.
 */
export function corrugationProfile(span, { pitch = 0.278, outer = 0.072, inner = 0.068, depth = 0.036 } = {}) {
  const flank = (pitch - outer - inner) / 2;
  const n = Math.floor((span - outer) / pitch);
  const start = -span / 2 + (span - (n * pitch + outer)) / 2;
  const pts = [[-span / 2, 0]];
  for (let i = 0; i < n; i++) {
    const x = start + i * pitch;
    pts.push([x + outer, 0], [x + outer + flank, depth], [x + outer + flank + inner, depth], [x + pitch, 0]);
  }
  pts.push([span / 2, 0]);
  return pts.filter((p, i) => i === 0 || Math.abs(p[0] - pts[i - 1][0]) > 1e-9);
}

/**
 * Texture coordinates in metres by box projection: a face looking along x gets (z, y), along z
 * (x, y), and top and bottom faces (x, z + topV). `offset` is the geometry's place in the prop, so
 * neighbouring parts line up. Returns the geometry.
 */
export function worldUV(geo, { offset = [0, 0, 0], topV = 0 } = {}) {
  const pos = geo.attributes.position, n = geo.attributes.normal;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + offset[0], y = pos.getY(i) + offset[1], z = pos.getZ(i) + offset[2];
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
    if (ay >= ax && ay >= az) { uv[i * 2] = x; uv[i * 2 + 1] = z + topV; }
    else if (ax >= az) { uv[i * 2] = n.getX(i) > 0 ? -z : z; uv[i * 2 + 1] = y; }
    else { uv[i * 2] = n.getZ(i) > 0 ? x : -x; uv[i * 2 + 1] = y; }
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geo;
}

/**
 * A cylinder's texture in metres: u round the circumference (the seam at the back, +z, which faces
 * down range), v up. Caps get box projection.
 */
export function wrapUV(geo, radius, { offsetY = 0 } = {}) {
  const pos = geo.attributes.position, n = geo.attributes.normal, uv = geo.attributes.uv;
  const round = 2 * Math.PI * radius;
  for (let i = 0; i < pos.count; i++) {
    if (Math.abs(n.getY(i)) > 0.5) { uv.setXY(i, pos.getX(i), pos.getZ(i)); continue; }
    uv.setXY(i, uv.getX(i) * round, pos.getY(i) + offsetY);
  }
  uv.needsUpdate = true;
  return geo;
}

// Smooth value noise in 3D, 0..1, the same on every load.
function hash(x, y, z, seed) {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647 + seed * 144665) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
export function noise3(x, y, z, seed = 1) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const f = (t) => t * t * (3 - 2 * t), u = f(x - xi), v = f(y - yi), w = f(z - zi);
  const l = (a, b, t) => a + (b - a) * t;
  const c = (dx, dy, dz) => hash(xi + dx, yi + dy, zi + dz, seed);
  return l(l(l(c(0, 0, 0), c(1, 0, 0), u), l(c(0, 1, 0), c(1, 1, 0), u), v),
    l(l(c(0, 0, 1), c(1, 0, 1), u), l(c(0, 1, 1), c(1, 1, 1), u), v), w);
}

/**
 * Vertex-colour weathering, multiplied with the texture: soil splashed up the foot (strongest in the
 * first 30 cm), large patchy staining, and a damp, darker band under the top edge.
 */
export function grime(geo, { offset = [0, 0, 0], height = Infinity, seed = 1, ground = 1, top = 0.5, patch = 1 } = {}) {
  const pos = geo.attributes.position, col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) + offset[0], y = pos.getY(i) + offset[1], z = pos.getZ(i) + offset[2];
    const n = noise3(x / 1.4, y / 1.4, z / 1.4, seed), n2 = noise3(x * 2.1, y * 2.1, z * 2.1, seed + 7);
    const k = 1 - patch * (0.1 * n + 0.05 * n2);
    const d = ground * Math.min(1, Math.exp(-Math.max(0, y) / 0.4) * (0.65 + 0.45 * n2));
    const t = Number.isFinite(height) ? top * Math.exp(-Math.max(0, height - y) / 0.2) * (0.5 + 0.5 * n) : 0;
    const dark = 1 - 0.16 * t;
    col[i * 3] = k * dark * (1 - d * 0.42);
    col[i * 3 + 1] = k * dark * (1 - d * 0.5);
    col[i * 3 + 2] = k * dark * (1 - d * 0.58);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return geo;
}

/**
 * Painted steel: the faces looking along `axis` show the whole texture once (u across, v up, a
 * round face stretched onto the square so its rim meets the texture's worn border); every other
 * face (the plate's edges) shows that worn border. `round` is the face radius for a disc.
 */
export function steelFaceUV(geo, { axis = "z", round = 0, flipV = false } = {}) {
  geo.computeBoundingBox();
  const bb = geo.boundingBox, pos = geo.attributes.position, n = geo.attributes.normal;
  const [ua, va] = axis === "y" ? ["x", "z"] : axis === "x" ? ["z", "y"] : ["x", "y"];
  const get = { x: (i) => pos.getX(i), y: (i) => pos.getY(i), z: (i) => pos.getZ(i) };
  const nAxis = { x: (i) => n.getX(i), y: (i) => n.getY(i), z: (i) => n.getZ(i) }[axis];
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    let u = (get[ua](i) - bb.min[ua]) / (bb.max[ua] - bb.min[ua] || 1);
    let v = (get[va](i) - bb.min[va]) / (bb.max[va] - bb.min[va] || 1);
    if (flipV) v = 1 - v;
    if (Math.abs(nAxis(i)) > 0.7) {
      if (round) {                                            // disc → square, rim onto the border
        const dx = u * 2 - 1, dy = v * 2 - 1, m = Math.max(Math.abs(dx), Math.abs(dy)), r = Math.hypot(dx, dy);
        const s = m > 1e-9 ? Math.min(r, 1) / m : 0;
        u = 0.5 + 0.5 * dx * s; v = 0.5 + 0.5 * dy * s;
      }
    } else {
      v = 0.004 + 0.02 * v;                                   // the edge: the texture's worn bottom border
    }
    uv[i * 2] = Math.min(1, Math.max(0, u)); uv[i * 2 + 1] = Math.min(1, Math.max(0, v));
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geo;
}

/**
 * Merge meshes that share one material into a single geometry (fewer draw calls). Each mesh's own
 * position, rotation and scale are baked in. Attributes: position, normal, uv and (if all have it)
 * color.
 */
export function mergeMeshes(list) {
  const geos = list.map((m) => {
    m.updateMatrix();
    const g = (m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()).applyMatrix4(m.matrix);
    return g;
  });
  const names = ["position", "normal", "uv", ...(geos.every((g) => g.attributes.color) ? ["color"] : [])];
  const out = new THREE.BufferGeometry();
  for (const name of names) {
    const size = geos[0].attributes[name].itemSize;
    const arr = new Float32Array(geos.reduce((s, g) => s + g.attributes.position.count * size, 0));
    let o = 0;
    for (const g of geos) { const a = g.attributes[name]; arr.set(a.array.subarray(0, a.count * size), o); o += a.count * size; }
    out.setAttribute(name, new THREE.BufferAttribute(arr, size));
  }
  for (const g of geos) g.dispose();
  return out;
}
