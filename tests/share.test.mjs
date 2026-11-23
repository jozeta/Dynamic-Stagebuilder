// Share links: the stage compressed into the URL fragment (never sent to a server), checked like an
// imported file when opened.
import { test } from "node:test";
import assert from "node:assert/strict";
import { encodeShare, decodeShare, shareHash, MAX_LINK } from "../js/storage/share.js";
import { createStage, addObject } from "../js/model/stage.js";

test("a stage round-trips through a share link and gets a new id", async () => {
  const s = addObject(createStage({ name: "Bay 4" }), "barrel", [1, 2]).stage;
  const code = await encodeShare(s);
  assert.match(code, /^[A-Za-z0-9_-]+$/, "URL-safe");
  const r = await decodeShare(`#${shareHash}${code}`);
  assert.equal(r.ok, true, r.error);
  assert.equal(r.stage.name, "Bay 4");
  assert.notEqual(r.stage.id, s.id);
  assert.deepEqual(r.stage.objects, s.objects);
});

test("only #stage= links are share links", async () => {
  assert.equal(await decodeShare(""), null);
  assert.equal(await decodeShare("#other"), null);
});

test("broken, oversized and bomb links are refused with a message", async () => {
  assert.equal((await decodeShare(`#${shareHash}!!notbase64`)).ok, false);
  assert.equal((await decodeShare(`#${shareHash}${"A".repeat(MAX_LINK + 1)}`)).ok, false);
  // 20 MB of spaces compresses to a few kB: it must stop at the size limit, not fill memory.
  const big = new Blob([" ".repeat(20_000_000)]).stream().pipeThrough(new CompressionStream("deflate-raw"));
  const bytes = new Uint8Array(await new Response(big).arrayBuffer());
  const code = Buffer.from(bytes).toString("base64url");
  const r = await decodeShare(`#${shareHash}${code}`);
  assert.equal(r.ok, false);
  assert.match(r.error, /too large/);
  const junk = (await decodeShare(`#${shareHash}${Buffer.from("not deflate").toString("base64url")}`));
  assert.equal(junk.ok, false);
});

// View links (#view=…): the compact stage (model/compact.js), opened read-only; much shorter than a
// share link.
import { encodeView, viewHash } from "../js/storage/share.js";
import { demoStage } from "../js/demo.js";

test("a view link opens read-only: the same stage, marked as a view", async () => {
  const s = demoStage();
  const r = await decodeShare(`#${viewHash}${await encodeView(s)}`);
  assert.equal(r.ok, true, r.error);
  assert.equal(r.view, true);
  assert.equal(r.stage.name, s.name);
  assert.equal(r.stage.objects.length, s.objects.length);
  assert.deepEqual(r.stage.objects.map((o) => o.position), s.objects.map((o) => o.position));
  const plain = await decodeShare(`#${shareHash}${await encodeShare(s)}`);
  assert.equal(plain.view, false);
});

test("a view link is much shorter than a share link", async () => {
  const s = demoStage();
  const v = await encodeView(s), sh = await encodeShare(s);
  assert.ok(v.length < sh.length * 0.6, `${v.length} vs ${sh.length}`);
  assert.ok(v.length < 2000);
});
