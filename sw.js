// Service worker: makes the app work offline. It caches only the app's own files, under a cache
// named after the app version; a new version installs a new cache and deletes the old ones.
// The file list is checked by tests/pwa.test.mjs: add new app files here.
const VERSION = "0.1.0";
const CACHE = `dsb-${VERSION}`;
const FILES = [
  "./",
  "css/app.css",
  "css/print.css",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon.svg",
  "index.html",
  "js/demo.js",
  "js/editor.js",
  "js/main.js",
  "js/model/briefing.js",
  "js/model/history.js",
  "js/model/look.js", "js/model/arrays.js", "js/model/visibility.js", "js/model/briefing-options.js", "js/model/stage-library.js", "js/model/stage-library-data.js", "js/ui/prefs.js",
  "js/model/map.js",
  "js/model/numbering.js",
  "js/model/objsnap.js",
  "js/model/props.js",
  "js/model/schema.js",
  "js/model/scoring-rules.js",
  "js/model/snap.js",
  "js/model/stage.js",
  "js/model/stats.js",
  "js/render/builders/furniture.js",
  "js/render/builders/index.js",
  "js/render/builders/lines.js",
  "js/render/builders/obstacles.js",
  "js/render/builders/paper.js", "js/render/builders/moving.js", "js/render/builders/car.js", "js/render/builders/nationals.js", "js/render/builders/building.js", "js/model/surroundings.js", "js/model/animation.js", "js/model/layout.js", "js/render/animate.js", "js/render/builders/position.js", "js/model/positions.js", "js/model/route.js", "js/model/planner.js", "js/model/camera-view.js", "js/model/start-pose.js", "js/model/activation.js", "js/model/run-look.js", "js/render/figure-fade.js", "js/render/builders/route.js",
  "js/render/builders/parts.js",
  "js/render/builders/steel.js",
  "js/render/builders/target-shape.js",
  "js/render/builders/walls.js",
  "js/render/camera.js",
  "js/render/engine.js",
  "js/render/environments/common.js",
  "js/render/environments/ground.js",
  "js/render/environments/index.js",
  "js/render/environments/outdoor.js", "js/render/environments/blueprint.js", "js/render/environments/custom.js",
  "js/render/environments/technical.js",
  "js/render/environments/terrain.js",
  "js/render/ground.js",
  "js/render/labels.js",
  "js/render/materials.js",
  "js/render/picking.js",
  "js/render/rotation.js",
  "js/render/stage-view.js",
  "js/render/view-math.js",
  "js/storage/autosave.js",
  "js/storage/db.js",
  "js/storage/files.js",
  "js/storage/projects.js",
  "js/ui/about.js",
  "js/ui/briefing.js",
  "js/ui/dom.js",
  "js/ui/inspector.js",
  "js/ui/library.js",
  "js/ui/print.js",
  "js/ui/projects.js", "js/ui/panels.js", "js/ui/eye-steps.js", "js/ui/surroundings.js", "js/ui/help.js", "js/model/help-content.js",
  "js/ui/settings.js",
  "js/ui/shortcuts.js",
  "js/ui/stats.js",
  "js/ui/toolbar.js",
  "manifest.webmanifest",
  "package.json",
  "vendor/lada-glass/2.3.0/lada-glass.css",
  "vendor/three/0.187.0/addons/controls/OrbitControls.js",
  "vendor/three/0.187.0/addons/controls/TransformControls.js",
  "vendor/three/0.187.0/three.core.js",
  "vendor/three/0.187.0/three.module.js",
  "vendor/textures/polyhaven/gravelly_sand/gravelly_sand_arm_1k.jpg",
  "vendor/textures/polyhaven/gravelly_sand/gravelly_sand_diff_2k.jpg",
  "vendor/textures/polyhaven/gravelly_sand/gravelly_sand_nor_gl_2k.jpg"
];

self.addEventListener("install", (event) => {
  // cache: "reload" skips the browser's HTTP cache, so a new version never stores stale files.
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: "reload" })))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith("dsb-") && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Network first, so an online visit always gets the current files; the cache answers when offline.
// Only the app's own files (FILES) are ever written to the cache.
const OWN = new Set(FILES.map((f) => new URL(f, self.location).pathname));

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin || !OWN.has(url.pathname)) return;
  event.respondWith(fetch(event.request, { cache: "no-cache" }).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(url.pathname, copy)); }
    return res;
  }).catch(() => caches.match(url.pathname)));
});
