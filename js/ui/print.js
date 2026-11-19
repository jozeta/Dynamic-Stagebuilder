// The printed stage brief (A4, two pages). Page 1: a header with the stage number, name and key
// figures, the briefing in a grid, the procedure, and the top-down map (cropped to the stage, with
// a legend). Page 2: the 3D view. Built with createElementNS/textContent only.
import { h } from "./dom.js";
import { mapModel, mapRegion } from "../model/map.js";
import { briefingRows, briefingText } from "../model/briefing.js";
import { setupRows, setupLines } from "../model/setup.js";

const SVG = "http://www.w3.org/2000/svg";
const MAP_WIDTH = 186;
// The map box follows the stage's shape, between 90 and 165 mm tall, so a deep stage uses the page.
function mapBox(stage) {
  const r = mapRegion(stage, "content");
  return { width: MAP_WIDTH, height: Math.round(Math.min(165, Math.max(90, (MAP_WIDTH * (r.maxZ - r.minZ)) / (r.maxX - r.minX)))) };
}
// Map colours as on IPSC stage diagrams: tan = shoot, white = no-shoot, blue = steel, black = hard cover.
const FILL = { paper: "#c9a273", noshoot: "#ffffff", steel: "#3d6fd6", wall: "#1d1f22", hardcover: "#000000", obstacle: "#6f5638", position: "#2f7bff" };

function s(tag, attrs = {}, text) {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  if (text !== undefined) el.textContent = text;
  return el;
}
const pts = (points) => points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");

export function mapSvg(stage) {
  const MAP = mapBox(stage);
  const { items } = mapModel(stage, { ...MAP, region: "content" });
  const svg = s("svg", { viewBox: `0 0 ${MAP.width} ${MAP.height}`, width: `${MAP.width}mm`, height: `${MAP.height}mm`,
    role: "img", "aria-label": "Top-down stage map" });
  const layers = { grid: s("g"), area: s("g"), obj: s("g"), line: s("g"), text: s("g") };
  for (const it of items) {
    switch (it.kind) {
      case "bay": svg.append(it.points
        ? s("polygon", { points: it.points.map((p) => p.join(",")).join(" "), fill: "#ffffff", stroke: "#444", "stroke-width": 0.35 })
        : s("rect", { x: it.x, y: it.y, width: it.w, height: it.h, fill: "#ffffff", stroke: "#444", "stroke-width": 0.35 })); break;
      case "frame": layers.text.append(s("rect", { x: it.x, y: it.y, width: it.w, height: it.h, fill: "none", stroke: "#bbb", "stroke-width": 0.25 })); break;
      case "grid": layers.grid.append(s("polyline", { points: pts(it.points), fill: "none", stroke: "#e2e2e2", "stroke-width": 0.15 })); break;
      case "poly": {
        const tag = it.closed ? "polygon" : "polyline";
        const area = it.style === "area";
        (area ? layers.area : layers.line).append(s(tag, { points: pts(it.points), fill: area ? "rgba(216,50,42,0.07)" : "none",
          stroke: "#d8322a", "stroke-width": area ? 0.45 : 0.8, "stroke-dasharray": area ? "1.6 1" : "none", "stroke-linejoin": "round" }));
        break;
      }
      case "rect": layers.obj.append(s("rect", { x: -it.w / 2, y: -it.h / 2, width: it.w, height: it.h, fill: FILL[it.style],
        stroke: it.style === "noshoot" ? "#222" : "none", "stroke-width": 0.25, transform: `translate(${it.x} ${it.y}) rotate(${it.rotation})` })); break;
      case "circle": layers.obj.append(it.style === "position"
        ? s("circle", { cx: it.x, cy: it.y, r: it.r, fill: "none", stroke: FILL.position, "stroke-width": 0.5 })
        : s("circle", { cx: it.x, cy: it.y, r: it.r, fill: FILL[it.style] })); break;
      case "label": layers.text.append(s("text", { x: it.x, y: it.y - 0.5, "font-size": 2.6, "font-weight": 700, "text-anchor": "middle",
        fill: "#111", stroke: "#fff", "stroke-width": 0.6, "paint-order": "stroke" }, it.text)); break;
      case "start": {
        const g = s("g", { transform: `translate(${it.x} ${it.y}) rotate(${it.rotation})` });
        g.append(s("rect", { x: -it.size / 2, y: -it.size / 2, width: it.size, height: it.size, fill: "none", stroke: "#111", "stroke-width": 0.35 }),
          s("path", { d: `M0 ${-it.size * 0.35} L${it.size * 0.22} ${it.size * 0.2} L${-it.size * 0.22} ${it.size * 0.2}Z`, fill: "#111" }));
        layers.text.append(g, s("text", { x: it.x, y: it.y + it.size / 2 + 3, "font-size": 2.4, "text-anchor": "middle", fill: "#111" }, "Start"));
        break;
      }
      case "scalebar": {
        const g = s("g", { transform: `translate(${it.x} ${it.y})` });
        g.append(s("line", { x1: 0, y1: 0, x2: it.length, y2: 0, stroke: "#111", "stroke-width": 0.5 }),
          s("line", { x1: 0, y1: -1, x2: 0, y2: 0.5, stroke: "#111", "stroke-width": 0.4 }),
          s("line", { x1: it.length, y1: -1, x2: it.length, y2: 0.5, stroke: "#111", "stroke-width": 0.4 }),
          s("text", { x: it.length + 1.5, y: 0.9, "font-size": 2.4, fill: "#111" }, `${it.metres} m`));
        layers.text.append(g);
        break;
      }
    }
  }
  svg.append(layers.grid, layers.area, layers.obj, layers.line, layers.text,
    s("text", { x: MAP.width - 4, y: 3.5, "font-size": 2.6, "text-anchor": "end", fill: "#111" }, "Down range ↑"));
  return svg;
}

// The map legend: a small drawing per kind of thing on the map.
function legend() {
  const sw = (draw) => { const g = s("svg", { viewBox: "0 0 8 4", width: "8mm", height: "4mm", "aria-hidden": "true" }); g.append(...draw()); return g; };
  const entries = [
    ["Paper target", () => [s("rect", { x: 2, y: 1.3, width: 4, height: 1.4, fill: FILL.paper })]],
    ["No-shoot", () => [s("rect", { x: 2, y: 1.3, width: 4, height: 1.4, fill: FILL.noshoot, stroke: "#222", "stroke-width": 0.25 })]],
    ["Steel", () => [s("rect", { x: 3, y: 1, width: 2, height: 2, fill: FILL.steel })]],
    ["Hard cover", () => [s("rect", { x: 1, y: 1.4, width: 6, height: 1.2, fill: FILL.hardcover })]],
    ["Wall", () => [s("rect", { x: 0.5, y: 1.6, width: 7, height: 0.8, fill: FILL.wall })]],
    ["Obstacle", () => [s("rect", { x: 1.5, y: 0.6, width: 5, height: 2.8, fill: FILL.obstacle })]],
    ["Fault line", () => [s("line", { x1: 0.5, y1: 2, x2: 7.5, y2: 2, stroke: "#d8322a", "stroke-width": 0.8 })]],
    ["Shooting area", () => [s("rect", { x: 0.8, y: 0.6, width: 6.4, height: 2.8, fill: "rgba(216,50,42,0.07)", stroke: "#d8322a", "stroke-width": 0.4, "stroke-dasharray": "1.2 0.8" })]],
    ["Shooting position", () => [s("circle", { cx: 4, cy: 2, r: 1.5, fill: "none", stroke: FILL.position, "stroke-width": 0.5 })]],
    ["Start", () => [s("rect", { x: 2.4, y: 0.4, width: 3.2, height: 3.2, fill: "none", stroke: "#111", "stroke-width": 0.3 }), s("path", { d: "M4 1 L4.8 3 L3.2 3Z", fill: "#111" })]],
  ];
  return h("ul", { class: "print-legend" }, entries.map(([label, draw]) => h("li", {}, [sw(draw), h("span", { text: label })])));
}

// The setup sheet page: where each prop goes, from the shooter's-left side line and the up-range
// edge, and to both up-range corners (two tapes).
function setupSheet(stage) {
  const m = (v) => v.toFixed(2);
  const lines = setupLines(stage);
  return h("section", { class: "print-setup" }, [
    h("h2", { text: `Stage ${stage.briefing.stageNumber} – ${stage.name}: setup sheet` }),
    h("p", { class: "print-meta", text: `Bay ${stage.bay.width} × ${stage.bay.depth} m. Measured from the up-range edge, looking down range: "from left" is from the left side line; the corners are the two up-range corners. Rotation 0° faces up range.` }),
    h("table", { class: "print-stages print-setup-table" }, [
      h("thead", {}, [h("tr", {}, ["", "Prop", "From left", "Down range", "To left corner", "To right corner", "Rotation"].map((t) => h("th", { text: t })))]),
      h("tbody", {}, setupRows(stage).map((r) => h("tr", {}, [h("td", { text: r.label }), h("td", { text: r.name }),
        ...[r.fromLeft, r.downRange, r.toLeftCorner, r.toRightCorner].map((v) => h("td", { class: "num", text: m(v) })), h("td", { class: "num", text: `${r.rotation}°` })]))),
    ]),
    lines.length ? h("ul", { class: "print-setup-lines" }, lines.map((l) => h("li", { text: `${l.name}: ${l.points.map(([a, b]) => `(${m(a)}, ${m(b)})`).join(" → ")}` }))) : null,
  ]);
}

export function renderPrint(root, stage, snapshot, { threeD = true, setup = true } = {}) {
  const b = stage.briefing;
  const { procedure, notes } = briefingText(stage);
  const row = Object.fromEntries(briefingRows(stage).map((r) => [r.label, r.value]));
  const cell = (label, wide = false) => h("div", { class: `print-cell${wide ? " wide" : ""}` }, [h("span", { class: "print-k", text: label }), h("span", { class: "print-v", text: row[label] })]);
  const figure = (label, value) => h("div", { class: "print-figure" }, [h("span", { class: "print-k", text: label }), h("strong", { text: value })]);
  const meta = [b.matchName.trim() ? null : "Written Stage Briefing", row.Designer !== "–" ? `Designer: ${row.Designer}` : null, `Stage type: ${row["Stage type"]}`].filter(Boolean).join("  ·  ");
  const nodes = [
    h("header", { class: "print-head" }, [
      h("div", { class: "print-badge" }, [h("span", { text: "Stage" }), h("strong", { text: String(b.stageNumber) })]),
      h("div", { class: "print-title" }, [
        b.matchName.trim() ? h("p", { class: "print-match", text: b.matchName.trim() }) : null,
        h("h1", { text: stage.name || "Untitled stage" }),
        h("p", { class: "print-meta", text: meta }),
      ]),
      h("div", { class: "print-figures" }, [figure("Minimum rounds", row["Minimum rounds"]), figure("Maximum points", row["Maximum points"])]),
    ]),
    h("section", { class: "print-grid" }, [
      cell("Targets"), cell("Scoring"), cell("Start signal"), cell("Stop time"),
      cell("Start position", true), cell("Gun condition", true),
      row.Activated ? cell("Activated", true) : null,
    ].filter(Boolean)),
    h("section", { class: "print-text print-procedure" }, [h("h2", { text: "Procedure" }), h("p", { text: procedure.trim() || "–" })]),
    notes.trim() ? h("section", { class: "print-text" }, [h("h2", { text: "Notes" }), h("p", { text: notes })]) : null,
    h("figure", { class: "print-map" }, [mapSvg(stage), h("figcaption", {}, [legend()])]),
    h("p", { class: "print-foot", text: "Made with Dynamic-Stagebuilder. Counts follow the IPSC rules; check the stage before the match." }),
    threeD ? h("section", { class: "print-3d" }, [
      h("h2", { text: `Stage ${b.stageNumber} – ${stage.name}: 3D view` }),
      snapshot ? h("img", { src: snapshot, alt: "3D view of the stage" }) : h("p", { text: "3D view not available." }),
    ]) : null,
    setup ? setupSheet(stage) : null,
  ];
  root.replaceChildren(...nodes.filter(Boolean));
}

/**
 * A whole match: a cover page (the match name, its stages in order with rounds and points, and the
 * totals), then each stage's brief page (header, briefing, map). The 3D view needs the stage on
 * screen, so it isn't part of a match print.
 */
export function renderMatchPrint(root, match, stages) {
  const rows = stages.map((st, i) => {
    const r = Object.fromEntries(briefingRows(st).map((x) => [x.label, x.value]));
    return h("tr", {}, [h("td", { text: String(i + 1) }), h("td", { text: st.name || "Untitled stage" }), h("td", { text: r["Stage type"] }),
      h("td", { class: "num", text: r["Minimum rounds"] }), h("td", { class: "num", text: r["Maximum points"] })]);
  });
  const total = (label) => stages.reduce((n, st) => n + Number(briefingRows(st).find((x) => x.label === label)?.value || 0), 0);
  const cover = h("section", { class: "print-cover" }, [
    h("p", { class: "print-match", text: "Match" }),
    h("h1", { text: match.name }),
    h("p", { class: "print-meta", text: `${stages.length} stage${stages.length === 1 ? "" : "s"} · ${total("Minimum rounds")} rounds minimum · ${total("Maximum points")} points` }),
    h("table", { class: "print-stages" }, [
      h("thead", {}, [h("tr", {}, ["Stage", "Name", "Type", "Rounds", "Points"].map((t) => h("th", { text: t })))]),
      h("tbody", {}, rows),
    ]),
  ]);
  const pages = stages.map((st) => { const el = h("div", { class: "print-stage" }); renderPrint(el, st, null, { threeD: false, setup: false }); return el; });
  root.replaceChildren(cover, ...pages);
}
