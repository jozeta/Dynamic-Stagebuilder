// QR codes for the printed brief (a view link to the stage), from the vendored encoder
// (vendor/qrcode-generator/2.0.4, MIT). Byte mode; medium error correction (15 %) while the code
// stays at most 101 modules a side (version 21), so it scans easily from paper; low (7 %) for
// longer links, up to the largest code (version 40, 177 modules). Pure: no DOM.
import qrcode from "../../vendor/qrcode-generator/2.0.4/qrcode.mjs";

export const QR_MAX = 2953;            // bytes a version 40 code holds at low error correction
const EASY = 101;                      // modules a side that a phone reads easily off an A4 page

function make(text, level) {
  try {
    const q = qrcode(0, level);        // 0: the smallest version that fits
    q.addData(text, "Byte");
    q.make();
    return { size: q.getModuleCount(), level, dark: (r, c) => q.isDark(r, c) };
  } catch { return null; }             // too long for this level
}

/** { size, level, dark(row, col) } for `text`, or null when it is empty or too long for a QR code. */
export function qrFor(text) {
  if (typeof text !== "string" || !text || new TextEncoder().encode(text).length > QR_MAX) return null;
  const m = make(text, "M");
  return m && m.size <= EASY ? m : make(text, "L");
}
