// Unique ids (version 4 UUIDs). crypto.randomUUID exists only in secure contexts (HTTPS or
// localhost), so a copy opened over plain http from another computer builds the same UUID from
// crypto.getRandomValues, which every browser offers everywhere.
export function newId() {
  if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID();
  const b = globalThis.crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;                       // version 4
  b[8] = (b[8] & 0x3f) | 0x80;                       // RFC 4122 variant
  const hex = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
