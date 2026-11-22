// One version everywhere: package.json is the source (the About dialog reads it); the lock file,
// the service worker's cache name, the README, the CHANGELOG's newest release and CLAUDE.md agree.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const read = (f) => readFileSync(f, "utf8");
const V = JSON.parse(read("package.json")).version;

test("every place that names the app's version says the same as package.json", () => {
  const lock = JSON.parse(read("package-lock.json"));
  assert.equal(lock.version, V, "package-lock.json");
  assert.equal(lock.packages[""].version, V, "package-lock.json packages['']");
  assert.equal(read("sw.js").match(/const VERSION = "([^"]+)"/)[1], V, "sw.js VERSION");
  assert.equal(read("README.md").match(/\*\*Version:\*\* ([0-9.]+)/)[1], V, "README Version line");
  assert.equal(read("README.md").match(/## What's new\s+### ([0-9.]+)/)[1], V, "README What's new");
  assert.equal(read("CHANGELOG.md").match(/^## (\d+\.\d+\.\d+)/m)[1], V, "CHANGELOG newest release");
  assert.equal(read("CLAUDE.md").match(/- Version ([0-9.]+) \(in `package.json`\)/)[1], V, "CLAUDE.md");
});

test("the docs name the Låda Glass version the app loads", () => {
  const vendored = readdirSync("vendor/lada-glass").filter((d) => /^\d+\.\d+\.\d+$/.test(d));
  assert.equal(vendored.length, 1, "one vendored copy");
  assert.match(read("index.html"), new RegExp(`vendor/lada-glass/${vendored[0]}/`));
  for (const m of read("CLAUDE.md").matchAll(/Låda Glass (\d+\.\d+\.\d+)/g)) assert.equal(m[1], vendored[0], "CLAUDE.md Låda Glass");
});
