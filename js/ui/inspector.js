// The inspector: settings for the selected object(s), or the stage when nothing is selected.
// Fields commit on change (Enter or leaving the field); every change goes through the editor.
import { h, icon } from "./dom.js";
import { getProp } from "../model/props.js";
import { labelPrefix } from "../model/numbering.js";
import { PRESENTATIONS, HARD_COVERS, arrayIssues } from "../model/arrays.js";
import { canBeActivated, isActivator, activatorsFor, activatorOf, activationLinks, describe } from "../model/activation.js";
import { isLocked } from "../model/layers.js";
import { sightFrom, safetyRings } from "../model/safety.js";
import { eyeHeight } from "../model/positions.js";
import { BAY_SHAPE_NAMES, bayShapeFields as shapeFieldsOf } from "../model/bay.js";

const PARAM_LABELS = {
  presentation: "Presentation", hardCover: "Hard cover", mountHeight: "Stand height (m)", style: "Target style", baseHeight: "Base height (m)", size: "Size (m)", length: "Length (m)",
  height: "Height (m)", mesh: "Mesh colour", frame: "Frame", portWidth: "Port width (m)",
  portHeight: "Port height (m)", portBottom: "Port up/down: bottom edge (m)", portOffset: "Port left/right (m, + left)", variant: "Type", shape: "Shape", count: "Count", paint: "Paint", color: "Colour", width: "Width (m)", rows: "Rows",
  doorWidth: "Door width (m)", ground: "Surface", plants: "Plants", plates: "Plates", model: "Model", stance: "Stance", pads: "Pads", stack: "Drums high", items: "On the table", targets: "Targets on the carrier", shutter: "Shutter", panelHeight: "Panel height (m)", gap: "Gap underneath (m)", open: "Open (°)", hinge: "Hinge side", swing: "Opens", animate: "Animate (moves when Play is on)", thickness: "Thickness (m)", material: "Material", diameter: "Diameter (m)", depth: "Base depth (m)", pitch: "Look up/down (°)", doorHeight: "Door height (m)",
};
const OPTION_LABELS = { square: "Square", round: "Round", classic: "Classic (octagon)", head: "With head", orange: "Orange", black: "Black", blue: "Blue", wood: "Wood", white: "White", yellow: "Yellow", red: "Red",
  green: "Green", grey: "Grey", auto: "Same as the ground", sand: "Sand", "light-sand": "Light sand", "dark-sand": "Dark sand", "red-dirt": "Red dirt", gravel: "Gravel", mixed: "Grass and bushes", grass: "Grass only", rust: "Rusty", concrete: "Concrete", brick: "Brick", metal: "Metal", "20ft": "20 ft", "40ft": "40 ft", left: "Left", right: "Right", away: "Away from the shooter", toward: "Toward the shooter", closed: "Closed", open: "Open", none: "Nothing", pistol: "Pistol", "pistol-mags": "Pistol and magazines", case: "Gun case (closed)", standing: "Standing", crouching: "Crouching", kneeling: "Kneeling", sitting: "Sitting", prone: "Prone", sedan: "Saloon", hatchback: "Hatchback", pickup: "Pickup", van: "Van",
  ...Object.fromEntries([...PRESENTATIONS, ...HARD_COVERS].map((p) => [p.id, p.name])) };
// Furniture options, named by parameter (a sofa's "2" is two seats, a dining set's "2" two chairs).
const FURNITURE_LABELS = {
  "size:single": "Single (90 × 200 cm)", "size:double": "Double (160 × 200 cm)", "size:small": "Small (120 × 60 cm)", "size:medium": "Medium (140 × 70 cm)", "size:large": "Large (160 × 80 cm)",
  "shape:1": "Armchair (1 seat)", "shape:2": "2 seats", "shape:3": "3 seats", "shape:l-left": "L-shape, chaise left", "shape:l-right": "L-shape, chaise right", "shape:u": "U-shape", "shape:corner": "Corner sofa",
  "shape:rect": "Rectangular (120 × 60 cm)", "shape:round": "Round (Ø 80 cm)",
  "seats:2": "2 chairs (80 × 80 cm)", "seats:4": "4 chairs (140 × 90 cm)", "seats:6": "6 chairs (180 × 90 cm)", "seats:8": "8 chairs (240 × 100 cm)",
  "finish:oak": "Oak", "finish:walnut": "Walnut", "finish:white": "White lacquer", "finish:black": "Black lacquer", "finish:glass": "Glass and steel",
  "cover:grey-fabric": "Grey fabric", "cover:beige-fabric": "Beige fabric", "cover:blue-fabric": "Blue fabric", "cover:green-fabric": "Green fabric", "cover:black-leather": "Black leather", "cover:brown-leather": "Brown leather",
  "bedding:beige": "Beige",
};
const WALL_TYPES = { wall: "Wall", port: "Wall with port", doorway: "Doorway" };
const FURNITURE_PARAMS = { size: "Size", shape: "Shape", seats: "Seats", finish: "Wood finish", cover: "Cover", bedding: "Bedding", chair: "Chair colour" };
const GRID_OPTIONS = [[0, "Off"], [0.1, "0.1 m"], [0.25, "0.25 m"], [0.5, "0.5 m"], [1, "1 m"]];
const ANGLE_OPTIONS = [[0, "Off"], [5, "5°"], [15, "15°"], [45, "45°"], [90, "90°"]];
let uid = 0;

function field(label, control) {
  const id = `f${++uid}`;
  control.id = id;
  return h("div", { class: "lg-field" }, [h("label", { for: id, text: label }), control]);
}
const numberInput = (key, value, spec, onchange) =>
  h("input", { class: "lg-input", type: "number", inputmode: "decimal", value: String(value), min: spec.min, max: spec.max, step: spec.step,
    dataset: { field: key }, onchange: (e) => { if (e.target.value !== "") onchange(Number(e.target.value)); } });
const select = (key, value, options, onchange) => {
  const s = h("select", { class: "lg-select", dataset: { field: key }, onchange: (e) => onchange(e.target.value) },
    options.map(([v, label]) => h("option", { value: String(v), text: label })));
  s.value = String(value);
  return s;
};

export function createInspector(root, { editor, shapes = { list: () => [], draw: () => {} }, berms = { draw: () => {} } }) {
  const d = (action) => editor.dispatch(action);
  let lastKey = "";

  function objectPanel(o, angle, stage) {
    const def = getProp(o.type);
    const nodes = [h("h2", { class: "lg-subtitle panel-title", text: def.name })];
    if (labelPrefix(o) !== null) {
      nodes.push(field("Label", h("input", { class: "lg-input", value: o.label ?? "", maxlength: "12", dataset: { field: "label" },
        placeholder: "Automatic", onchange: (e) => d({ type: "setLabel", id: o.id, text: e.target.value }) })));
    }
    // The exact position, typed in: across the bay (+ is the shooter's left, from the centre line)
    // and down range (from the up-range edge). Used as typed, without grid snap.
    const pos = (k, i, label) => field(label, h("input", { class: "lg-input", type: "number", inputmode: "decimal", step: "0.01", value: String(o.position[i]),
      dataset: { field: k }, disabled: isLocked(stage, o), onchange: (e) => d({ type: "setPosition", id: o.id, [k]: e.target.value }) }));
    nodes.push(h("div", { class: "pos-fields" }, [pos("x", 0, "Across (m, + left)"), pos("z", 1, "Down range (m)")]));
    const step = angle || 15;
    nodes.push(field("Rotation (°)", h("div", { class: "lg-row rot-row" }, [
      h("button", { type: "button", class: "lg-btn lg-btn-icon", "aria-label": `Rotate −${step}°`, onclick: () => d({ type: "rotate", by: -step }) }, [icon("rotl")]),
      numberInput("rotation", o.rotation, { min: 0, max: 359, step: angle || 1 }, (v) => d({ type: "setRotation", id: o.id, value: v })),
      h("button", { type: "button", class: "lg-btn lg-btn-icon", "aria-label": `Rotate +${step}°`, onclick: () => d({ type: "rotate", by: step }) }, [icon("rotr")]),
    ])));
    for (const [k, spec] of Object.entries(def.params)) {
      if (o.type === "berm" && o.outline && (k === "length" || k === "depth")) continue;      // a drawn berm's size is its drawing
      // Options for one choice only (a wall's port or door settings): shown when that is chosen.
      if (spec.when && !Object.entries(spec.when).every(([wk, wv]) => o.params[wk] === wv)) continue;
      const furniture = getProp(o.type)?.category === "furniture";
      const label = o.type === "berm" && k === "depth" ? "Depth, front to back (m)" : (furniture && FURNITURE_PARAMS[k]) || PARAM_LABELS[k] || k;
      const set = (v) => d({ type: "setParams", id: o.id, params: { [k]: v } });
      if (spec.bool) {
        // A switch (true/false), e.g. Animate: the label sits beside it.
        const id = `f${++uid}`;
        const sw = h("input", { type: "checkbox", class: "lg-toggle", id, dataset: { field: k }, onchange: (e) => set(e.target.checked) });
        sw.checked = o.params[k] === true;
        nodes.push(h("div", { class: "lg-field inspector-switch" }, [h("label", { for: id, text: label }), sw]));
        continue;
      }
      nodes.push(field(label, spec.options
        ? select(k, o.params[k], spec.options.map((v) => [v, (furniture && FURNITURE_LABELS[`${k}:${v}`]) || (k === "variant" && WALL_TYPES[v]) || OPTION_LABELS[v] || v]), set)
        : numberInput(k, o.params[k], spec, set)));
      // A wall's Port switch, beside its Type: on is "Wall with port", off a plain wall.
      if (k === "variant" && o.params.variant !== "doorway") {
        const id = `f${++uid}`;
        const sw = h("input", { type: "checkbox", class: "lg-toggle", id, dataset: { field: "port" }, onchange: (e) => set(e.target.checked ? "port" : "wall") });
        sw.checked = o.params.variant === "port";
        nodes.push(h("div", { class: "lg-field inspector-switch" }, [h("label", { for: id, text: "Port" }), sw]));
      }
    }
    // Activation: what starts a moving target, and what an activator starts.
    if (canBeActivated(o.type)) {
      const options = [["", "Nothing (moves by itself)"], ...activatorsFor(stage, o.id).map((a) => [a.id, describe(a)])];
      nodes.push(field("Activated by", select("activatedBy", activatorOf(stage, o)?.id ?? "", options, (v) => d({ type: "setActivator", id: o.id, by: v || null }))));
      if (options.length === 1) nodes.push(h("p", { class: "lg-muted hint-text", text: "Place a popper, plate, step pad or pull lever to activate it." }));
    }
    if (isActivator(o.type)) {
      const starts = activationLinks(stage).filter((l) => l.activator.id === o.id).map((l) => describe(l.target));
      if (starts.length) nodes.push(h("p", { class: "lg-muted hint-text", text: `Activates ${starts.join(", ")}.` }));
    }
    // Lock in place (not clickable or draggable in the 3D view) and hide (not drawn; still counts).
    for (const [k, label, hint] of [["locked", "Locked in place", "Can't be clicked or moved in the 3D view; pick it in the On stage list."], ["hidden", "Hidden", "Not drawn in the 3D view; it still counts in the statistics."]]) {
      const id = `f${++uid}`;
      const sw = h("input", { type: "checkbox", class: "lg-toggle", id, dataset: { field: k },
        onchange: (e) => d(k === "locked" ? { type: "setLocked", ids: [o.id], locked: e.target.checked } : { type: "setHidden", ids: [o.id], hidden: e.target.checked }) });
      sw.checked = o[k] === true;
      nodes.push(h("div", { class: "lg-field inspector-switch", title: hint }, [h("label", { for: id, text: label }), sw]));
    }
    // An earth berm: its outline can be drawn (squares, up to 10 × 10 m) instead of length × depth.
    if (o.type === "berm") {
      nodes.push(h("div", { class: "lg-row berm-outline" }, [
        h("button", { type: "button", class: "lg-btn", onclick: () => berms.draw(o) }, [icon("ruler"), o.outline ? "Edit the outline…" : "Draw the outline…"]),
        o.outline ? h("button", { type: "button", class: "lg-btn", onclick: () => d({ type: "setOutline", id: o.id, outline: null }), text: "Back to a plain berm" }) : null,
      ].filter(Boolean)));
      if (o.outline) nodes.push(h("p", { class: "lg-muted hint-text", text: `Drawn outline, ${o.outline.width} × ${o.outline.depth} m: its size comes from the drawing; Height sets how high it rises.` }));
    }
    // Safety distances from the rulebook, drawn as rings on the ground round the target.
    const ringSpec = safetyRings(o);
    if (ringSpec.length) {
      const id = `f${++uid}`;
      const sw = h("input", { type: "checkbox", class: "lg-toggle", id, dataset: { field: "safetyRings" },
        onchange: (e) => d({ type: "setSafetyRings", ids: [o.id], on: e.target.checked }) });
      sw.checked = o.safetyRings === true;
      nodes.push(h("div", { class: "lg-field inspector-switch", title: "Rings on the ground at the rulebook's distances" }, [h("label", { for: id, text: "Show safety distances" }), sw]));
      if (o.safetyRings) nodes.push(h("ul", { class: "ring-legend" }, ringSpec.map((r) =>
        h("li", { class: `ring-${r.level}` }, [h("strong", { text: r.label }), h("span", { text: ` ${r.text}` })]))));
    }
    if (o.group && stage.groups?.some((g) => g.id === o.group && (g.locked || g.hidden))) {
      nodes.push(h("p", { class: "lg-muted hint-text", text: "Its group is locked or hidden (On stage panel)." }));
    }
    // What the shooter sees from a shooting position (at its stance's eye height); the 3D view
    // draws a green sight line to each target seen.
    if (o.type === "shooting-position") {
      const r = sightFrom(stage, o.position, eyeHeight(o.params.stance));
      const name = (id) => { const t = stage.objects.find((x) => x.id === id); return t.label || getProp(t.type).name; };
      nodes.push(h("div", { class: "lg-stack sight" }, [
        h("span", { class: "lg-label", text: "From here" }),
        h("p", { class: "sight-seen", text: r.seen.length ? `Sees ${r.seen.map((x) => name(x.id)).join(", ")}` : "Sees no targets." }),
        r.hidden.length ? h("p", { class: "lg-muted sight-hidden", text: `Hidden: ${r.hidden.map(name).join(", ")}` }) : null,
      ].filter(Boolean)));
    }
    // Rule problems with a paper target array (cited from the Target Array Handbook).
    if (def.note) nodes.splice(1, 0, h("p", { class: "lg-muted hint-text", text: def.note }));
    if (o.type.startsWith("paper-")) for (const text of arrayIssues(o)) nodes.push(h("p", { class: "lg-alert lg-alert-warn inspector-warning", role: "status", text }));
    return nodes;
  }

  // Align and spread buttons for two or more selected props, and mirror.
  const ARRANGE = [["left", "alignl", "Line up on the shooter's left"], ["centre-x", "alignc", "Centre across"], ["right", "alignr", "Line up on the shooter's right"],
    ["front", "alignf", "Align fronts (nearest the shooter)"], ["back", "alignb", "Align backs"]];
  function arrangeTools(count) {
    return h("div", { class: "lg-stack arrange" }, [
      h("span", { class: "lg-label", text: "Arrange" }),
      h("div", { class: "lg-row arrange-row" }, [
        ...ARRANGE.map(([edge, ic, label]) => h("button", { type: "button", class: "lg-btn lg-btn-icon", "aria-label": label, title: label, onclick: () => d({ type: "align", edge }) }, [icon(ic)])),
        h("button", { type: "button", class: "lg-btn lg-btn-icon", "aria-label": "Spread evenly across", title: count < 3 ? "Select three or more to spread them" : "Spread evenly across", disabled: count < 3, onclick: () => d({ type: "distribute", axis: "x" }) }, [icon("spreadx")]),
        h("button", { type: "button", class: "lg-btn lg-btn-icon", "aria-label": "Spread evenly down range", title: count < 3 ? "Select three or more to spread them" : "Spread evenly down range", disabled: count < 3, onclick: () => d({ type: "distribute", axis: "z" }) }, [icon("spreadz")]),
      ]),
      h("button", { type: "button", class: "lg-btn", onclick: () => d({ type: "mirror" }) }, [icon("mirror"), "Mirror left to right"]),
    ]);
  }

  // The bay's shape: a rectangle, tapered (narrower at one end) or with a back corner cut away.
  // Width and depth stay the outer rectangle.
  function bayShapeFields(bay) {
    const set = (patch) => d({ type: "setBay", ...bay, ...patch });
    const shape = bay.shape || "rect";
    // The list: the built-in shapes, then My shapes (drawn and saved in this browser), then Draw.
    const mine = shapes.list();
    const current = shape === "drawn" ? (mine.some((m) => m.id === bay.shapeId) ? `my:${bay.shapeId}` : "drawn") : shape;
    const sel = h("select", { class: "lg-select", dataset: { field: "bayShape" }, onchange: (e) => {
      const v = e.target.value;
      if (v === "draw") { e.target.value = current; shapes.draw(); return; }
      if (v.startsWith("my:")) { const m = mine.find((x) => `my:${x.id}` === v); if (m) { const { id, ...b } = m; d({ type: "setBay", ...b, shapeId: id }); } return; }
      d({ type: "setBay", width: bay.width, depth: bay.depth, shape: v });
    } }, [
      ...BAY_SHAPE_NAMES.map(([v, label]) => h("option", { value: v, text: label })),
      shape === "drawn" && current === "drawn" ? h("option", { value: "drawn", text: `${bay.name} (drawn)` }) : null,
      mine.length ? h("optgroup", { label: "My shapes" }, mine.map((m) => h("option", { value: `my:${m.id}`, text: m.name }))) : null,
      h("option", { value: "draw", text: "Draw a new shape…" }),
    ].filter(Boolean));
    sel.value = current;
    const out = [field("Bay shape", sel)];
    if (shape === "drawn") {
      out.push(h("div", { class: "lg-row" }, [
        h("button", { type: "button", class: "lg-btn", onclick: () => shapes.draw({ shape: bay, id: current.startsWith("my:") ? bay.shapeId : null }) }, [icon("ruler"), "Edit this shape…"]),
      ]), h("p", { class: "lg-muted hint-text", text: `${bay.width} × ${bay.depth} m, drawn. Black squares are raised ground with a slope down to the floor.` }));
      return out;
    }
    const fields = shapeFieldsOf(bay).map((f) => field(f.label, f.options
      ? select(f.key, bay[f.key], f.options, (v) => set({ [f.key]: v }))
      : numberInput(f.key, bay[f.key], { min: f.min, max: f.max, step: 0.5 }, (v) => set({ [f.key]: v }))));
    // Two size fields side by side; a choice (which end, which side) on its own row above them.
    const choices = fields.filter((_, i) => shapeFieldsOf(bay)[i].options), sizes = fields.filter((_, i) => !shapeFieldsOf(bay)[i].options);
    out.push(...choices);
    if (sizes.length) out.push(h("div", { class: "pos-fields" }, sizes));
    if (shape !== "rect") out.push(h("p", { class: "lg-muted hint-text", text: "Width and depth are the outer rectangle; the shape is the floor inside it. Seen from behind the shooter, left is the shooter's left." }));
    return out;
  }



  function stagePanel(stage) {
    return [
      h("h2", { class: "lg-subtitle panel-title", text: "Stage" }),
      h("p", { class: "lg-muted hint-text", text: "Nothing selected. Tap a prop on the stage to edit it." }),
      field("Bay width (m)", numberInput("bayWidth", stage.bay.width, { min: 1, max: 200, step: 0.5 }, (v) => d({ type: "setBay", width: v, depth: stage.bay.depth }))),
      field("Bay depth (m)", numberInput("bayDepth", stage.bay.depth, { min: 1, max: 200, step: 0.5 }, (v) => d({ type: "setBay", width: stage.bay.width, depth: v }))),
      ...bayShapeFields(stage.bay),
      field("Grid snap", select("grid", stage.settings.grid, GRID_OPTIONS, (v) => d({ type: "setSetting", key: "grid", value: Number(v) }))),
      field("Angle snap", select("angle", stage.settings.angleSnap, ANGLE_OPTIONS, (v) => d({ type: "setSetting", key: "angleSnap", value: Number(v) }))),
      h("button", { type: "button", class: "lg-btn", title: "Flip every prop, line and the start left to right about the centre line", onclick: () => d({ type: "mirror", ids: [] }) }, [icon("mirror"), "Mirror the stage"]),
    ];
  }

  const actions = (locked = false) => h("div", { class: "lg-row panel-actions" }, [
    h("button", { type: "button", class: "lg-btn", onclick: () => d({ type: "duplicate" }) }, [icon("copy"), "Duplicate"]),
    h("button", { type: "button", class: "lg-btn lg-btn-danger", disabled: locked, title: locked ? "Unlock it to delete it" : null, onclick: () => d({ type: "delete" }) }, [icon("trash"), "Delete"]),
  ]);

  return function update(state) {
    const stage = state.history.present;
    const sel = state.selection;
    const objs = stage.objects.filter((o) => sel.includes(o.id));
    const lines = stage.lines.filter((l) => sel.includes(l.id));
    const links = stage.objects.filter((o) => isActivator(o.type) || o.activatedBy).map((o) => [o.id, o.label, o.activatedBy]);
    links.push(stage.groups ?? null);
    const sights = objs.length === 1 && objs[0].type === "shooting-position" ? stage.objects : null;     // what it sees changes with the rest
    const key = JSON.stringify([sel, objs, lines, links, sights, sel.length ? null : [stage.bay, stage.settings.grid, stage.settings.angleSnap, shapes.version]]);     // My shapes changed: rebuilt
    if (key === lastKey) return;
    lastKey = key;
    const focused = root.contains(document.activeElement) ? document.activeElement.dataset.field : null;

    let nodes;
    if (!sel.length) nodes = stagePanel(stage);
    else if (objs.length === 1 && sel.length === 1) nodes = [...objectPanel(objs[0], stage.settings.angleSnap, stage), actions(isLocked(stage, objs[0]))];
    else if (lines.length === 1 && sel.length === 1) {
      const l = lines[0];
      nodes = [h("h2", { class: "lg-subtitle panel-title", text: l.type === "fault-line" ? "Fault line" : "Shooting area" }),
        h("p", { class: "lg-muted", text: `${l.points.length} points. Drag it to move it.` }),
        h("div", { class: "lg-row panel-actions" }, [h("button", { type: "button", class: "lg-btn lg-btn-danger", onclick: () => d({ type: "delete" }) }, [icon("trash"), "Delete"])])];
    } else {
      const step = stage.settings.angleSnap || 15;
      nodes = [h("h2", { class: "lg-subtitle panel-title", text: `${sel.length} selected` }),
        h("div", { class: "lg-row" }, [
          h("button", { type: "button", class: "lg-btn", onclick: () => d({ type: "rotate", by: -step }) }, [icon("rotl"), `−${step}°`]),
          h("button", { type: "button", class: "lg-btn", onclick: () => d({ type: "rotate", by: step }) }, [icon("rotr"), `+${step}°`])]),
        arrangeTools(objs.length),
        actions()];
    }
    root.replaceChildren(...nodes);
    if (focused) root.querySelector(`[data-field="${CSS.escape(focused)}"]`)?.focus();
  };
}
