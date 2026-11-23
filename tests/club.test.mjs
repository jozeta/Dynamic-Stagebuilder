// The club's name and logo on every printed brief: a per-browser setting, checked when read back
// (stored values are untrusted), the logo only as a small PNG or JPEG data URL the app made itself.
import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanClub, LOGO_MAX } from "../js/model/club.js";

const png = "data:image/png;base64,iVBORw0KGgo=";

test("a clean club keeps a trimmed name and a PNG or JPEG data URL logo", () => {
  assert.deepEqual(cleanClub({ name: "  Göteborgs PSK  ", logo: png }), { name: "Göteborgs PSK", logo: png });
  assert.equal(cleanClub({ logo: "data:image/jpeg;base64,/9j/" }).logo, "data:image/jpeg;base64,/9j/");
});

test("anything else is dropped: other types, scripts, broken base64, too large, not a string", () => {
  for (const logo of ["data:image/svg+xml;base64,PHN2Zz4=", "javascript:alert(1)", "data:image/png;base64,<>", `data:image/png;base64,${"A".repeat(LOGO_MAX)}`, 5, null])
    assert.equal(cleanClub({ name: "X", logo }).logo, null, String(logo).slice(0, 30));
  assert.deepEqual(cleanClub(null), { name: "", logo: null });
  assert.deepEqual(cleanClub("nonsense"), { name: "", logo: null });
  assert.equal(cleanClub({ name: "x".repeat(300) }).name.length, 120);
});
