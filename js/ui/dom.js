// Tiny DOM helpers. Text always goes in with textContent (never innerHTML); icons are built with
// createElementNS from fixed path data in this file.
const SVG = "http://www.w3.org/2000/svg";

export function h(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "text") el.textContent = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "dataset") Object.assign(el.dataset, v);
    else el.setAttribute(k, v === true ? "" : String(v));
  }
  for (const c of [].concat(children)) {
    if (c === null || c === undefined || c === false) continue;
    el.append(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
  }
  return el;
}

const PATHS = {
  undo: ["M9 14 4 9l5-5", "M4 9h10.5a5.5 5.5 0 0 1 0 11H11"],
  redo: ["m15 14 5-5-5-5", "M20 9H9.5a5.5 5.5 0 0 0 0 11H13"],
  copy: ["M8 8h11v11H8z", "M16 8V5H5v11h3"],
  trash: ["M4 7h16", "M10 11v6M14 11v6", "M6 7l1 13h10l1-13", "M9 7V4h6v3"],
  line: ["M3 17l6-6 4 4 8-8"],
  area: ["M4 8l8-4 8 5-3 10H7z"],
  flag: ["M5 21V4", "M5 4h11l-2 4 2 4H5"],
  hash: ["M4 9h16M4 15h16", "M10 3 8 21M16 3l-2 18"],
  frame: ["M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"],
  info: ["M12 8h.01", "M11 12h1v5h1", "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"],
  new: ["M6 3h9l4 4v14H6z", "M14 3v5h5", "M12 11v6M9 14h6"],
  rotl: ["M4 4v5h5", "M4.6 15a8 8 0 1 0 1.8-8.3L4 9"],
  rotr: ["M20 4v5h-5", "M19.4 15a8 8 0 1 1-1.8-8.3L20 9"],
  search: ["M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z", "M20 20l-4-4"],
  check: ["M5 12l5 5 9-11"],
  doc: ["M6 3h9l4 4v14H6z", "M9 12h7M9 16h7M9 8h3"],
  print: ["M7 9V3h10v6", "M7 17H4v-7h16v7h-3", "M7 14h10v7H7z"],
  folder: ["M3 6h6l2 2h10v11H3z"],
  sliders: ["M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0", "M16 4v4M10 10v4M18 16v4"],
  grid: ["M4 4h16v16H4z", "M4 9.3h16M4 14.7h16M9.3 4v16M14.7 4v16"],
  magnet: ["M6 4v8a6 6 0 0 0 12 0V4", "M6 4h3v8a3 3 0 0 0 6 0V4h3", "M6 8h3M15 8h3"],
  x: ["M6 6l12 12M18 6 6 18"],
  chevl: ["M15 5l-7 7 7 7"],
  chevu: ["M5 15l7-7 7 7"],
  lock: ["M6 11h12v9H6z", "M8.5 11V8a3.5 3.5 0 0 1 7 0v3"],
  unlock: ["M6 11h12v9H6z", "M8.5 11V8a3.5 3.5 0 0 1 6.8-1.2"],
  eyeoff: ["M3 3l18 18", "M10.6 6.1A10 10 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3.2 3.8", "M6.6 7.6C3.7 9.4 2 12 2 12s3.6 6 10 6a9.6 9.6 0 0 0 4.5-1.1", "M9.9 10a3 3 0 0 0 4.1 4.1"],
  cut: ["M6 7a2.5 2.5 0 1 0 0-.01", "M6 19.5a2.5 2.5 0 1 0 0-.01", "M8 8.5 20 18M8 17.5 20 6"],
  paste: ["M9 4h6v3H9z", "M7 5H5v16h14V5h-2", "M9 12h6M9 16h4"],
  group: ["M3 3h7v7H3zM14 14h7v7h-7z", "M14 3h7v7h-7", "M3 14v7h7"],
  layers: ["M12 3l9 5-9 5-9-5z", "M3 13l9 5 9-5"],
  ruler: ["M3 17 17 3l4 4L7 21z", "M7 13l2 2M10 10l2 2M13 7l2 2"],
  chevd: ["M5 9l7 7 7-7"],
  play: ["M7 4l13 8-13 8z"],
  pause: ["M7 4v16M17 4v16"],
  eye: ["M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  help: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6", "M12 17h.01"],
  chevr: ["M9 5l7 7-7 7"],
  link: ["M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1", "M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"],
  mirror: ["M12 3v18", "M9 7 3 17h6z", "M15 7l6 10h-6z"],
  alignl: ["M4 3v18", "M8 7h10v4H8zM8 14h6v4H8z"],
  alignc: ["M12 3v18", "M6 7h12v4H6zM8 14h8v4H8z"],
  alignr: ["M20 3v18", "M6 7h10v4H6zM10 14h6v4h-6z"],
  alignf: ["M3 20h18", "M7 6h4v10H7zM14 10h4v6h-4z"],
  alignb: ["M3 4h18", "M7 8h4v10H7zM14 8h4v6h-4z"],
  spreadx: ["M4 4v16M20 4v16", "M10 8h4v8h-4z"],
  spreadz: ["M4 4h16M4 20h16", "M8 10h8v4H8z"],
};

export function icon(name) {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("class", "lg-icon");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.7");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  for (const d of PATHS[name] || []) {
    const p = document.createElementNS(SVG, "path");
    p.setAttribute("d", d);
    svg.append(p);
  }
  return svg;
}

export const isTyping = (el) => !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
