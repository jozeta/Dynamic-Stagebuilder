// Share links: a stage compressed (deflate) and base64url-encoded into the URL fragment,
// "#stage=…". Browsers never send the fragment to the server, so the stage stays between the
// people who have the link. Opening one is untrusted input: the link is size-capped, the
// decompressed text is capped while it streams (no zip bombs), and the stage goes through the same
// checks as an imported file, with a new id. No DOM.
import { parseStageFile } from "./files.js";

export const shareHash = "stage=";
export const MAX_LINK = 120_000;                 // characters after "#stage=" (browsers cope with far more)
const MAX_TEXT = 5_000_000;                      // decompressed bytes, the stage file limit

const toB64url = (bytes) => {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
};
const fromB64url = (code) => {
  const bin = atob(code.replaceAll("-", "+").replaceAll("_", "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
};

/** The code for a share link (the part after "#stage="). */
export async function encodeShare(stage) {
  const stream = new Blob([JSON.stringify(stage)]).stream().pipeThrough(new CompressionStream("deflate-raw"));
  return toB64url(new Uint8Array(await new Response(stream).arrayBuffer()));
}

/** A location hash: null if it isn't a share link, else { ok, stage } or { ok: false, error }. */
export async function decodeShare(hash) {
  if (typeof hash !== "string" || !hash.startsWith(`#${shareHash}`)) return null;
  const code = hash.slice(1 + shareHash.length);
  if (code.length > MAX_LINK) return { ok: false, error: "The share link is too large." };
  if (!/^[A-Za-z0-9_-]+$/.test(code)) return { ok: false, error: "The share link is damaged (it may have been cut short when copied)." };
  let bytes;
  try { bytes = fromB64url(code); } catch { return { ok: false, error: "The share link is damaged." }; }
  const reader = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw")).getReader();
  const parts = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_TEXT) { await reader.cancel(); return { ok: false, error: "The shared stage is too large." }; }
      parts.push(value);
    }
  } catch { return { ok: false, error: "The share link is damaged (it may have been cut short when copied)." }; }
  const text = new TextDecoder().decode(await new Blob(parts).arrayBuffer());
  return parseStageFile(text);
}
