// The Help window: a topic list and, for each topic, a drawing made for it, short text and tips.
// Text comes from model/help-content.js; drawings are SVG built here with createElementNS, coloured
// by CSS classes on the Låda Glass tokens so they follow the dark and light themes.
import { h, icon } from "./dom.js";
import { HELP_TOPICS, SHORTCUTS } from "../model/help-content.js";

const NS = "http://www.w3.org/2000/svg";
function s(tag, attrs = {}, kids = []) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  for (const c of kids) el.append(typeof c === "string" ? document.createTextNode(c) : c);
  return el;
}
const text = (x, y, t, cls = "hi-ink", size = 11, anchor = "middle") => s("text", { x, y, class: cls, "font-size": size, "text-anchor": anchor }, [t]);

// The lower third of the classic outline (painted hard cover), same placement as target().
function lowerCover(x, y, w) {
  const k = w / 45;
  const p = [[-11.5, 0], [11.5, 0], [22.5, 10], [22.5, 19], [-22.5, 19], [-22.5, 10]].map(([a, b]) => `${x + a * k},${y - b * k}`).join(" ");
  return s("polygon", { points: p, class: "hi-cover" });
}

// An IPSC classic target outline, w wide, at (x, y) = bottom centre.
function target(x, y, w, cls = "hi-paper") {
  const k = w / 45;
  const p = [[-11.5, 0], [11.5, 0], [22.5, 10], [22.5, 38], [7.5, 57], [-7.5, 57], [-22.5, 38], [-22.5, 10]].map(([a, b]) => `${x + a * k},${y - b * k}`).join(" ");
  return s("polygon", { points: p, class: cls });
}
const ground = () => s("rect", { x: 10, y: 20, width: 300, height: 120, rx: 10, class: "hi-ground" });
const grid = () => s("g", { class: "hi-grid" }, [...Array(11)].map((_, i) => s("line", { x1: 20 + i * 28, y1: 26, x2: 20 + i * 28, y2: 134 }))
  .concat([...Array(5)].map((_, i) => s("line", { x1: 16, y1: 30 + i * 26, x2: 304, y2: 30 + i * 26 }))));

const ART = {
  steps: () => [
    ...[["1", "Pick a prop", 60], ["2", "Tap the ground", 160], ["3", "Print the brief", 260]].flatMap(([n, label, x]) => [
      s("circle", { cx: x, cy: 62, r: 30, class: "hi-card" }),
      text(x, 72, n, "hi-acc-text", 28),
      text(x, 118, label, "hi-ink", 12),
    ]),
    s("path", { d: "M96 62h26M196 62h26", class: "hi-arrow" }),
    s("path", { d: "M118 56l6 6-6 6M218 56l6 6-6 6", class: "hi-arrow" }),
  ],
  place: () => [
    s("rect", { x: 14, y: 22, width: 86, height: 116, rx: 8, class: "hi-card" }),
    ...[0, 1, 2].map((i) => s("rect", { x: 22, y: 34 + i * 32, width: 70, height: 24, rx: 5, class: i === 1 ? "hi-pick" : "hi-item" })),
    text(57, 82, "IPSC target", "hi-ink", 9),
    s("rect", { x: 116, y: 22, width: 192, height: 116, rx: 8, class: "hi-ground" }), grid(),
    target(226, 104, 34), s("rect", { x: 212, y: 104, width: 28, height: 5, class: "hi-stand" }),
    s("path", { d: "M92 82 C150 70, 170 70, 200 92", class: "hi-arrow hi-dash" }),
    s("circle", { cx: 226, cy: 116, r: 6, class: "hi-tap" }),
  ],
  rotate: () => [
    ground(), grid(),
    s("ellipse", { cx: 160, cy: 92, rx: 64, ry: 26, class: "hi-ring" }),
    s("rect", { x: 120, y: 78, width: 80, height: 16, rx: 2, class: "hi-wood" }),
    s("path", { d: "M214 76 l10 -2 -2 10", class: "hi-ring-head" }),
    s("rect", { x: 24, y: 30, width: 62, height: 26, rx: 6, class: "hi-key" }), text(55, 48, "Shift", "hi-ink", 12),
    text(55, 74, "fine moves", "hi-muted", 10),
    s("rect", { x: 248, y: 30, width: 26, height: 26, rx: 6, class: "hi-key" }), text(261, 48, "Q", "hi-ink", 12),
    s("rect", { x: 278, y: 30, width: 26, height: 26, rx: 6, class: "hi-key" }), text(291, 48, "E", "hi-ink", 12),
  ],
  walls: () => [
    ground(), grid(),
    s("rect", { x: 40, y: 84, width: 110, height: 10, class: "hi-mesh" }),
    s("rect", { x: 172, y: 60, width: 10, height: 70, class: "hi-mesh", transform: "rotate(-8 177 95)" }),
    s("circle", { cx: 150, cy: 89, r: 14, class: "hi-snap" }),
    s("path", { d: "M176 66 C170 76, 160 80, 154 84", class: "hi-arrow hi-dash" }),
    text(150, 50, "ends jump together", "hi-ink", 11),
    s("rect", { x: 210, y: 84, width: 80, height: 10, class: "hi-mesh" }),
    s("rect", { x: 236, y: 82, width: 18, height: 14, class: "hi-port" }),
    text(250, 116, "port", "hi-muted", 10),
  ],
  markings: () => [
    ground(), grid(),
    s("polyline", { points: "30,98 100,98 130,70 200,70 220,104 292,104", class: "hi-fault" }),
    s("rect", { x: 120, y: 104, width: 70, height: 28, class: "hi-area" }),
    s("rect", { x: 146, y: 108, width: 18, height: 18, class: "hi-start" }), s("path", { d: "M155 111 l5 11 h-10z", class: "hi-ink-fill" }),
    ...[[30, 98], [100, 98], [130, 70], [200, 70], [220, 104], [292, 104]].map(([x, y]) => s("circle", { cx: x, cy: y, r: 3.5, class: "hi-point" })),
    text(70, 88, "fault line", "hi-ink", 10), text(236, 128, "shooting area", "hi-ink", 10),
  ],
  arrays: () => [
    ...[
      [42, [target(42, 112, 38)], "Target"],
      [118, [target(118, 112, 38), target(95, 112, 38, "hi-white"), target(141, 112, 38, "hi-white")], "No-shoots"],
      [200, [target(200, 112, 32), target(200, 71, 32)], "Stacked"],
      [274, [target(274, 112, 38), lowerCover(274, 112, 38)], "Hard cover ⅓"],
    ].flatMap(([x, parts, label]) => [...parts, text(x, 134, label, "hi-ink", 10)]),
  ],
  star: () => [
    s("path", { d: "M90 132 L110 132 M100 132 V70", class: "hi-steel-line" }),
    ...[0, 1, 2, 3, 4].flatMap((k) => {
      const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5, x = 100 + 42 * Math.cos(a), y = 70 + 42 * Math.sin(a);
      return [s("line", { x1: 100, y1: 70, x2: x, y2: y, class: "hi-steel-line" }), s("circle", { cx: x, cy: y, r: 10, class: "hi-white" })];
    }),
    s("circle", { cx: 100, cy: 70, r: 5, class: "hi-steel" }),
    s("path", { d: "M152 40 a40 40 0 0 1 0 60", class: "hi-arrow hi-dash" }),
    s("rect", { x: 186, y: 50, width: 110, height: 54, rx: 8, class: "hi-card" }),
    text(241, 72, "Not for IPSC", "hi-red-text", 12), text(241, 90, "USPSA and club", "hi-muted", 10),
  ],
  camera: () => [
    s("rect", { x: 40, y: 28, width: 54, height: 84, rx: 27, class: "hi-card" }), s("line", { x1: 67, y1: 28, x2: 67, y2: 62, class: "hi-line" }),
    s("path", { d: "M67 29 A26 26 0 0 0 41 55 V62 H67 Z", class: "hi-pick" }),
    text(67, 128, "drag: orbit", "hi-ink", 10), text(67, 142, "right-drag: pan", "hi-ink", 10),
    s("circle", { cx: 176, cy: 68, r: 32, class: "hi-ring" }),
    s("path", { d: "M208 68 l-6 -8 m6 8 l6 -8", class: "hi-ring-head" }),
    text(176, 128, "scroll or pinch:", "hi-ink", 10), text(176, 142, "zoom", "hi-ink", 10),
    ...["Iso", "Top", "Front", "Eye"].map((t, i) => [s("rect", { x: 244, y: 28 + i * 24, width: 56, height: 20, rx: 5, class: i ? "hi-item" : "hi-pick" }), text(272, 42 + i * 24, t, "hi-ink", 10)]).flat(),
  ],
  sun: () => [
    s("rect", { x: 10, y: 100, width: 300, height: 40, rx: 8, class: "hi-ground" }),
    s("path", { d: "M40 100 Q160 -10 280 100", class: "hi-arc hi-dash" }),
    s("circle", { cx: 220, cy: 46, r: 14, class: "hi-sun" }),
    target(150, 112, 26), s("path", { d: "M150 112 L118 128 L138 128 L163 112 Z", class: "hi-shadow" }),
    text(60, 92, "06:00", "hi-muted", 10), text(262, 92, "20:00", "hi-muted", 10),
  ],
  page: () => [
    s("rect", { x: 96, y: 14, width: 96, height: 128, rx: 4, class: "hi-white hi-page" }),
    s("rect", { x: 104, y: 22, width: 16, height: 16, rx: 2, class: "hi-ink-fill" }),
    s("rect", { x: 124, y: 24, width: 50, height: 5, class: "hi-paper" }), s("rect", { x: 124, y: 32, width: 34, height: 3, class: "hi-grey" }),
    ...[0, 1, 2, 3].map((i) => s("rect", { x: 104 + i * 21, y: 46, width: 19, height: 12, class: "hi-cell" })),
    s("rect", { x: 104, y: 62, width: 80, height: 10, class: "hi-proc" }),
    s("rect", { x: 104, y: 76, width: 80, height: 58, class: "hi-map" }),
    s("polyline", { points: "110,118 128,118 136,108 160,108 166,120 180,120", class: "hi-fault hi-thin" }),
    s("rect", { x: 200, y: 26, width: 80, height: 104, rx: 4, class: "hi-white hi-page" }),
    s("rect", { x: 206, y: 34, width: 68, height: 60, class: "hi-ground" }), target(240, 80, 18),
    text(240, 116, "3D view", "hi-muted", 10),
    text(48, 80, "A4", "hi-acc-text", 24),
  ],
  files: () => [
    s("rect", { x: 30, y: 30, width: 110, height: 96, rx: 10, class: "hi-card" }),
    ...[0, 1, 2].map((i) => s("rect", { x: 40, y: 42 + i * 26, width: 90, height: 20, rx: 5, class: i ? "hi-item" : "hi-pick" })),
    text(85, 140, "saved in this browser", "hi-muted", 10),
    s("path", { d: "M150 78 h40", class: "hi-arrow" }), s("path", { d: "M184 72 l6 6 -6 6", class: "hi-arrow" }),
    s("path", { d: "M206 36 h50 l20 20 v68 h-70 z", class: "hi-white hi-page" }), s("path", { d: "M256 36 v20 h20", class: "hi-line" }),
    text(241, 98, ".json", "hi-acc-text", 14),
    text(241, 140, "export and import", "hi-muted", 10),
  ],
  keys: () => [
    ...[["⌘", 30], ["Z", 74], ["Q", 140], ["E", 184], ["F", 250]].map(([k, x]) => [s("rect", { x, y: 46, width: 38, height: 38, rx: 8, class: "hi-key" }), text(x + 19, 71, k, "hi-ink", 16)]).flat(),
    text(72, 108, "undo", "hi-muted", 10), text(181, 108, "rotate", "hi-muted", 10), text(269, 108, "frame all", "hi-muted", 10),
  ],
};

function art(id) {
  const svg = s("svg", { viewBox: "0 0 320 150", class: "help-art", role: "img", "aria-hidden": "true" });
  svg.append(...(ART[id]?.() || []));
  return svg;
}

export function createHelp() {
  const content = h("div", { class: "help-content", role: "tabpanel", tabindex: "-1" });
  const nav = h("nav", { class: "help-nav", "aria-label": "Help topics" });
  const buttons = HELP_TOPICS.map((t) => h("button", { type: "button", class: "help-topic", "aria-current": "false", dataset: { topic: t.id },
    onclick: () => show(t.id) }, [icon(t.icon), h("span", { text: t.title })]));
  nav.append(...buttons);
  const dialog = h("dialog", { class: "lg-modal lg-modal-lg help-modal", id: "help", "aria-labelledby": "help-title" }, [
    h("div", { class: "help-head" }, [
      h("h2", { class: "lg-modal-title", id: "help-title", text: "Help" }),
      h("button", { type: "button", class: "lg-btn lg-btn-ghost lg-btn-icon", "aria-label": "Close help", onclick: () => dialog.close() }, [icon("x")]),
    ]),
    h("div", { class: "help-body" }, [nav, content]),
  ]);
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  document.body.append(dialog);

  function show(id) {
    const t = HELP_TOPICS.find((x) => x.id === id) || HELP_TOPICS[0];
    for (const b of buttons) b.setAttribute("aria-current", String(b.dataset.topic === t.id));
    const i = HELP_TOPICS.indexOf(t);
    const step = (j, label) => (HELP_TOPICS[j] ? h("button", { type: "button", class: "lg-btn", onclick: () => show(HELP_TOPICS[j].id) }, [label, `: ${HELP_TOPICS[j].title}`]) : h("span"));
    content.replaceChildren(...[
      h("h3", { class: "help-title", text: t.title }),
      art(t.art),
      ...t.text.map((p) => h("p", { class: "help-text", text: p })),
      t.id === "keys"
        ? h("table", { class: "lg-table help-keys" }, [h("tbody", {}, SHORTCUTS.map(([k, what]) => h("tr", {}, [h("td", {}, [h("kbd", { text: k })]), h("td", { text: what })])))])
        : null,
      t.tips.length ? h("ul", { class: "help-tips" }, t.tips.map((tip) => h("li", {}, [icon("check"), h("span", { text: tip })]))) : null,
      h("div", { class: "help-steps" }, [step(i - 1, "Back"), step(i + 1, "Next")]),
    ].filter(Boolean));
    content.scrollTop = 0;
  }

  return { open(id = "start") { show(id); dialog.showModal(); buttons.find((b) => b.dataset.topic === id)?.focus(); } };
}
