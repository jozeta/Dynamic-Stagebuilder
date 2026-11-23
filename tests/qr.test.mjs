// The QR code on the printed brief (a view link): the vendored encoder (vendor/qrcode-generator),
// medium error correction when the code stays small enough to scan easily, low otherwise; null
// when the link is too long for any QR code.
import { test } from "node:test";
import assert from "node:assert/strict";
import { qrFor, QR_MAX } from "../js/model/qr.js";

test("a short text gives a small square code", () => {
  const q = qrFor("https://example.org/#view=abc");
  assert.ok(q.size >= 21 && (q.size - 17) % 4 === 0, "21, 25, 29… modules a side");
  assert.equal(q.level, "M");
  assert.equal(typeof q.dark(0, 0), "boolean");
  assert.equal(q.dark(0, 0), true, "the finder pattern's corner is dark");
});

test("a link the size of the example stage's view link still fits", () => {
  const q = qrFor(`https://jozeta.github.io/Dynamic-Stagebuilder/#view=${"A".repeat(1450)}`);
  assert.ok(q, "fits");
  assert.ok(q.size <= 177);
});

test("too long for any QR code: null", () => {
  assert.equal(qrFor("A".repeat(QR_MAX + 1)), null);
  assert.equal(qrFor(""), null);
});
