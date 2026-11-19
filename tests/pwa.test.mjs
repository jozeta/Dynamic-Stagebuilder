// The installable app: manifest, icons, and a service worker that caches exactly the app's files.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const read = (p) => readFileSync(join(root, p), "utf8");
const pkg = JSON.parse(read("package.json"));

function walk(dir) {
  return readdirSync(join(root, dir)).flatMap((f) => {
    const p = `${dir}/${f}`;
    return statSync(join(root, p)).isDirectory() ? walk(p) : [p];
  });
}

test("the manifest describes an installable app", () => {
  const m = JSON.parse(read("manifest.webmanifest"));
  assert.equal(m.name, "Dynamic-Stagebuilder");
  assert.equal(m.start_url, "./");
  assert.equal(m.display, "standalone");
  for (const size of ["192x192", "512x512"]) {
    const icon = m.icons.find((i) => i.sizes === size);
    assert.ok(icon, size);
    assert.ok(existsSync(join(root, icon.src)), icon.src);
  }
  assert.match(read("index.html"), /<link rel="manifest" href="manifest.webmanifest">/);
});

test("the service worker version matches package.json", () => {
  assert.match(read("sw.js"), new RegExp(`const VERSION = "${pkg.version.replace(/\./g, "\\.")}";`));
});

test("every app file is cached, and every cached file exists", () => {
  const sw = read("sw.js");
  const files = JSON.parse(sw.match(/const FILES = (\[[\s\S]*?\]);/)[1]);
  const needed = ["./", "index.html", "manifest.webmanifest", "package.json", "vendor/lada-glass/2.4.0/lada-glass.css",
    ...walk("js"), ...walk("css"), ...walk("icons"), ...walk("vendor/three/0.187.0").filter((f) => f.endsWith(".js"))];
  for (const f of needed) assert.ok(files.includes(f), `missing from cache list: ${f}`);
  for (const f of files) if (f !== "./") assert.ok(existsSync(join(root, f)), `cached file does not exist: ${f}`);
});
