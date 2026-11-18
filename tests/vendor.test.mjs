// The self-hosted Three.js copy matches the pinned npm version, and the import map points at real files.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const root = new URL("../", import.meta.url);
const pkg = JSON.parse(readFileSync(new URL("package.json", root), "utf8"));
const html = readFileSync(new URL("index.html", root), "utf8");

test("vendored Three.js matches the pinned devDependency", () => {
  const v = readFileSync(new URL("vendor/three/0.187.0/VERSION", root), "utf8").trim();
  assert.equal(v, pkg.devDependencies.three);
});

test("import map points at files that exist", () => {
  const map = JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]);
  assert.ok(map.imports.three);
  assert.ok(existsSync(new URL(map.imports.three, root)), map.imports.three);
  assert.ok(existsSync(new URL(map.imports["three/addons/"] + "controls/OrbitControls.js", root)));
  assert.ok(existsSync(new URL(map.imports["three/addons/"] + "controls/TransformControls.js", root)));
});
