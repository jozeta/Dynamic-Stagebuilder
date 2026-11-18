// The printed stage brief (A4, two pages): header, top-down map (SVG) and the WSB on page 1, long
// text flowing on, and the 3D view starting page 2. Built with createElementNS/textContent only.
import { h } from "./dom.js";
import { mapModel } from "../model/map.js";
import { briefingRows, briefingText } from "../model/briefing.js";

const SVG = "http://www.w3.org/2000/svg";
const MAP = { width: 186, height: 118 };
const FILL = { paper: "#c9a273", noshoot: "#ffffff", steel: "#8d9096", wall: "#1d1f22", obstacle: "#6f5638" };

function s(tag, attrs = {}, text) {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  if (text !== undefined) el.textContent = text;
  return el;
}
const pts = (points) => points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");

export function mapSvg(stage) {
  const { items } = mapModel(stage, MAP);
  const svg = s("svg", { viewBox: `0 0 ${MAP.width} ${MAP.height}`, width: `${MAP.width}mm`, height: `${MAP.height}mm`,
    role: "img", "aria-label": "Top-down stage map" });
  const layers = { grid: s("g"), area: s("g"), obj: s("g"), line: s("g"), text: s("g") };
  for (const it of items) {
    switch (it.kind) {
      case "bay": svg.append(s("rect", { x: it.x, y: it.y, width: it.w, height: it.h, fill: "#ffffff", stroke: "#444", "stroke-width": 0.35 })); break;
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
      case "circle": layers.obj.append(s("circle", { cx: it.x, cy: it.y, r: it.r, fill: FILL[it.style] })); break;
      case "label": layers.text.append(s("text", { x: it.x, y: it.y, "font-size": 2.6, "font-weight": 700, "text-anchor": "middle",
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

export function renderPrint(root, stage, snapshot) {
  const b = stage.briefing;
  const { procedure, notes } = briefingText(stage);
  const table = h("table", { class: "print-wsb" }, [h("tbody", {}, briefingRows(stage).map((r) =>
    h("tr", {}, [h("th", { scope: "row", text: r.label }), h("td", { text: r.value })])))]);
  const text = (title, value) => value.trim() ? h("section", { class: "print-text" }, [h("h2", { text: title }), h("p", { text: value })]) : null;
  root.replaceChildren(
    h("header", { class: "print-head" }, [
      h("p", { class: "print-match", text: b.matchName || "Written Stage Briefing" }),
      h("h1", { text: `Stage ${b.stageNumber} – ${stage.name}` }),
    ]),
    h("div", { class: "print-map" }, [mapSvg(stage)]),
    table,
    text("Procedure", procedure),
    text("Notes", notes),
    h("section", { class: "print-3d" }, [
      h("h2", { text: `Stage ${b.stageNumber} – ${stage.name}: 3D view` }),
      snapshot ? h("img", { src: snapshot, alt: "3D view of the stage" }) : h("p", { text: "3D view not available." }),
      h("p", { class: "print-foot", text: "Made with Dynamic-Stagebuilder. Counts follow the IPSC rules; check the stage before the match." }),
    ]),
  );
}
