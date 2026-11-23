// Share links: a stage compressed (deflate) and base64url-encoded into the URL fragment,
// "#stage=…". Browsers never send the fragment to the server, so the stage stays between the
// people who have the link. Opening one is untrusted input: the link is size-capped, the
// decompressed text is capped while it streams (no zip bombs), and the stage goes through the same
// checks as an imported file, with a new id. No DOM.
// View links ("#view=…") carry the compact stage (model/compact.js: short ids, no defaults), small
// enough for a QR code on the printed brief; they open read-only, as a view, not a new project.
import { parseStageFile } from "./files.js";
import { compactStage } from "../model/compact.js";

export const shareHash = "stage=";
export const viewHash = "view=";
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

const deflate = async (text) => toB64url(new Uint8Array(await new Response(new Blob([text]).stream().pipeThrough(new CompressionStream("deflate-raw"))).arrayBuffer()));

/** The code for a share link (the part after "#stage="). */
export const encodeShare = (stage) => deflate(JSON.stringify(stage));

/** The code for a view link (the part after "#view="): the compact stage. */
export const encodeView = (stage) => deflate(JSON.stringify(compactStage(stage)));

/**
 * A location hash: null if it isn't a share or view link, else { ok, stage, view } (view: true for
 * a #view= link, to open read-only) or { ok: false, error }.
 */
export async function decodeShare(hash) {
  if (typeof hash !== "string") return null;
  const prefix = [shareHash, viewHash].find((p) => hash.startsWith(`#${p}`));
  if (!prefix) return null;
  const r = await decodeCode(hash.slice(1 + prefix.length));
  return r.ok ? { ...r, view: prefix === viewHash } : r;
}

async function decodeCode(code) {
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
