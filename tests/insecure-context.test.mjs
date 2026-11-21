// Opened over plain http from another computer (not localhost), browsers leave out crypto.randomUUID
// (secure contexts only). The app must still make ids there: crypto.getRandomValues is always present.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { newId, createStage } from "../js/model/stage.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

test("ids are made without crypto.randomUUID (plain http on a LAN address)", () => {
  const had = Object.getOwnPropertyDescriptor(globalThis.crypto, "randomUUID");
  Object.defineProperty(globalThis.crypto, "randomUUID", { value: undefined, configurable: true, writable: true });
  try {
    const ids = new Set(Array.from({ length: 500 }, () => newId()));
    assert.equal(ids.size, 500, "unique");
    for (const id of ids) assert.match(id, UUID, "a version 4 UUID");
    assert.match(createStage().id, UUID, "a new stage works");
  } finally {
    if (had) Object.defineProperty(globalThis.crypto, "randomUUID", had); else delete globalThis.crypto.randomUUID;
  }
});

test("no app code calls crypto.randomUUID directly (all ids go through newId)", () => {
  const files = [];
  const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (p.endsWith(".js")) files.push(p); } };
  walk("js");
  const direct = files.filter((f) => f !== join("js", "model", "id.js") && /crypto\.randomUUID\s*\(/.test(readFileSync(f, "utf8")));
  assert.deepEqual(direct, []);
});
