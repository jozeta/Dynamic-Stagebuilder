// Outdoor: a dirt range at golden hour, after the reference photo. Sandy pebbly ground, earth banks
// round three sides with grass on top, flat-shaded bushes, grass tufts and trees (the slightly
// illustrated feel), a low warm sun with long soft shadows, and a warm-to-blue sky with haze.
import * as THREE from "three";
import { canvasTexture, sun, disposeGroup } from "./common.js";
import { buildGround } from "./ground.js";
import { createClouds } from "./clouds.js";
import { buildFoliage } from "./foliage.js";
import { LOOK_DEFAULTS } from "../../model/look.js";

// The sky: blue overhead fading to a warm horizon; warmer and deeper toward sunset.
function paintSky(g, s, warmth) {
  const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
  const grd = g.createLinearGradient(0, 0, 0, s);
  grd.addColorStop(0, mix([138, 168, 200], [112, 128, 164], warmth));
  grd.addColorStop(0.5, mix([196, 204, 206], [214, 182, 150], warmth));
  grd.addColorStop(0.82, mix([232, 214, 182], [238, 186, 128], warmth));
  grd.addColorStop(1, mix([236, 220, 190], [242, 200, 150], warmth));
  g.fillStyle = grd; g.fillRect(0, 0, s, s);
}

// A late-afternoon sky as an equirectangular image for reflections (IBL): blue overhead, warm
// haze at the horizon, a bright sun glow low in the west, dusty ground below. Generated in code.
function reflectionSky() {
  const t = canvasTexture(512, (g, s) => {
    const sky = g.createLinearGradient(0, 0, 0, s / 2);
    sky.addColorStop(0, "#7f9cc2"); sky.addColorStop(0.75, "#d8c4a4"); sky.addColorStop(1, "#f2d2a0");
    g.fillStyle = sky; g.fillRect(0, 0, s, s / 2);
    const ground = g.createLinearGradient(0, s / 2, 0, s);
    ground.addColorStop(0, "#b8946a"); ground.addColorStop(1, "#6e5a44");
    g.fillStyle = ground; g.fillRect(0, s / 2, s, s / 2);
    const sun = g.createRadialGradient(s * 0.75, s * 0.4, 0, s * 0.75, s * 0.4, s * 0.12);
    sun.addColorStop(0, "rgba(255,236,200,1)"); sun.addColorStop(1, "rgba(255,210,150,0)");
    g.fillStyle = sun; g.fillRect(0, 0, s, s);
  }, [1, 1], { seed: 61 });
  if (t) t.mapping = THREE.EquirectangularReflectionMapping;
  return t;
}

export function outdoor(bay, { onUpdate } = {}) {
  const group = new THREE.Group();
  const groundGroup = buildGround(bay, { onUpdate });
  group.add(groundGroup);

  // Plants: trees beyond the banks, bushes and grass on them (Settings → Foliage, foliage.js).
  let foliage = buildFoliage(bay, LOOK_DEFAULTS.foliage);         // the default kind, so a default look builds it only once
  group.add(foliage);

  // Fill: a cool sky above and a warm dusty bounce below, low, so shadow sides stay readable and
  // slightly blue rather than black.
  const hemiLight = new THREE.HemisphereLight(0x9db4d0, 0xb8946a, 0.85);
  const sunLight = sun(bay, 0xffe0b8, 3.1, [-16, 15, 16]);
  const skyTex = canvasTexture(256, (g, s) => paintSky(g, s, 0.5), [1, 1]);
  const clouds = createClouds(bay, groundGroup.children.find((c) => c.userData.ground));
  if (clouds) group.add(clouds.mesh, clouds.shadow);
  return {
    clouds,
    group, lights: [hemiLight, sunLight], hemiLight, sunLight, sunStrength: 5.4, hemiStrength: 0.95, warmth: 1,
    reflectionSky: reflectionSky(), reflectionStrength: 0.35,
    hazeColor: 0xd9c3a0, background: skyTex ?? new THREE.Color(0xb9cfe0), fog: new THREE.Fog(0xe6d6bb, 55, 150), exposure: 1.05,
    ground: "sand",
    setGround(name) { this.ground = name; groundGroup.userData.setGround(name); },
    foliage: LOOK_DEFAULTS.foliage,
    // Another kind of plants: the old ones are freed and the new ones built (seeded, so the same each time).
    setFoliage(kind) {
      if (kind === this.foliage) return;
      this.foliage = kind;
      group.remove(foliage);
      disposeGroup(foliage);
      foliage = buildFoliage(bay, kind);
      group.add(foliage);
    },
    paintSky(warmth) {
      if (!skyTex) return;
      paintSky(skyTex.image.getContext("2d"), skyTex.image.width, warmth);
      skyTex.needsUpdate = true;
    },
  };
}
