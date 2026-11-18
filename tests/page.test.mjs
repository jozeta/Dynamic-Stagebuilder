// The entry page keeps the standards that matter: viewport, strict CSP, no third-party loads.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("has a viewport meta tag (responsive)", () => {
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
});

test("has a strict Content-Security-Policy", () => {
  assert.match(html, /http-equiv="Content-Security-Policy" content="default-src 'self'/);
  assert.doesNotMatch(html, /unsafe-inline|unsafe-eval/);
});

test("loads nothing from other hosts", () => {
  assert.doesNotMatch(html, /(src|href)="https?:\/\//);
});

test("CSP allows the inline import map by its sha256 hash and nothing else inline", () => {
  const map = html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1];
  const hash = createHash("sha256").update(map).digest("base64");
  assert.ok(html.includes(`script-src 'self' 'sha256-${hash}'`), "CSP hash matches the import map");
  const inline = html.match(/<script(?![^>]*\bsrc=)(?![^>]*importmap)[^>]*>/g) || [];
  assert.equal(inline.length, 0);
});

test("boots js/main.js as a module", () => {
  assert.match(html, /<script type="module" src="js\/main.js"><\/script>/);
});

test("phones get only the larger-screen message", () => {
  assert.match(html, /<p class="small-screen">Dynamic-Stagebuilder needs a computer or an iPad\.<\/p>/);
  const css = readFileSync(new URL("../css/app.css", import.meta.url), "utf8");
  assert.match(css, /@media \(max-width: 767px\)/);
});

test("has an app icon", () => {
  assert.match(html, /<link rel="icon" href="icons\/icon.svg"/);
});
