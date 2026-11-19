// The right-click menu (long-press on an iPad), on the 3D view and on the props-on-stage list:
// cut, copy, paste (here), duplicate, delete, lock, hide, group, rotate, select all of a kind,
// frame the selection, and Shooter's eye from a shooting position. A Låda Glass .lg-menu:
// arrow keys move, Enter picks, Escape or a click outside closes.
import { h, icon } from "./dom.js";
import { getProp } from "../model/props.js";
import { isLocked, isHidden } from "../model/layers.js";

const mac = typeof navigator !== "undefined" && /Mac|iPad|iPhone/.test(navigator.platform || navigator.userAgent);
const key = (k) => (mac ? `⌘${k}` : `Ctrl+${k}`);
const LONG_PRESS_MS = 550;

export function createContextMenu({ editor, rig, onShooterEye = () => {} }) {
  const d = (a) => editor.dispatch(a);
  const menu = h("div", { class: "lg-menu stage-menu", role: "menu", "aria-label": "Prop actions", tabindex: "-1" });
  document.body.append(menu);
  let lastFocus = null;

  function close() {
    if (!menu.hasAttribute("data-lg-open")) return;
    menu.removeAttribute("data-lg-open");
    lastFocus?.focus?.();
  }
  const item = (label, iconName, run, { kbd = null, disabled = false, danger = false } = {}) => h("button", {
    type: "button", role: "menuitem", tabindex: "-1", disabled, dataset: danger ? { danger: "" } : {},
    onclick: () => { close(); run(); },
  }, [icon(iconName), h("span", { text: label }), kbd ? h("kbd", { class: "lg-kbd", text: kbd }) : null].filter(Boolean));
  const sep = () => h("div", { class: "lg-menu-sep", role: "separator" });

  /** The menu's items for the current selection; `ground` is where it was opened on the floor. */
  function items(ground) {
    const s = editor.stage();
    const sel = s.objects.filter((o) => editor.state.selection.includes(o.id));
    const has = sel.length > 0, one = sel.length === 1 ? sel[0] : null;
    const clip = editor.state.clipboard.length > 0;
    const allLocked = has && sel.every((o) => isLocked(s, o)), allHidden = has && sel.every((o) => isHidden(s, o));
    const grouped = sel.some((o) => o.group);
    const step = 90;
    const pasteHere = () => {
      const c = editor.state.clipboard;
      const mid = c.reduce((a, o) => [a[0] + o.position[0] / c.length, a[1] + o.position[1] / c.length], [0, 0]);
      d({ type: "paste", offset: [ground[0] - mid[0], ground[1] - mid[1]] });
    };
    const out = [];
    if (has) {
      out.push(
        item("Cut", "cut", () => d({ type: "cut" }), { kbd: key("X"), disabled: allLocked }),
        item("Copy", "copy", () => d({ type: "copy" }), { kbd: key("C") }),
      );
    }
    out.push(item(ground && clip ? "Paste here" : "Paste", "paste", () => (ground && clip ? pasteHere() : d({ type: "paste" })), { kbd: key("V"), disabled: !clip }));
    if (has) {
      out.push(
        item("Duplicate", "copy", () => d({ type: "duplicate" }), { kbd: key("D") }),
        item("Delete", "trash", () => d({ type: "delete" }), { kbd: "⌫", disabled: allLocked, danger: true }),
        sep(),
        item(allLocked ? "Unlock" : "Lock in place", allLocked ? "unlock" : "lock", () => d({ type: "setLocked", locked: !allLocked }), { kbd: "L" }),
        item(allHidden ? "Show" : "Hide", allHidden ? "eye" : "eyeoff", () => d({ type: "setHidden", hidden: !allHidden }), { kbd: "H" }),
        item("Group", "group", () => d({ type: "group" }), { kbd: key("G") }),
      );
      if (grouped) out.push(item("Ungroup", "layers", () => d({ type: "ungroup" }), { kbd: mac ? "⇧⌘G" : "Ctrl+Shift+G" }));
      out.push(
        sep(),
        item(`Rotate ${step}° left`, "rotl", () => d({ type: "rotate", by: -step }), { disabled: allLocked }),
        item(`Rotate ${step}° right`, "rotr", () => d({ type: "rotate", by: step }), { disabled: allLocked }),
        item("Mirror left to right", "mirror", () => d({ type: "mirror" }), { disabled: allLocked }),
      );
      if (sel.length >= 2) out.push(
        item("Align fronts", "alignf", () => d({ type: "align", edge: "front" })),
        item("Centre across", "alignc", () => d({ type: "align", edge: "centre-x" })),
      );
      if (sel.length >= 3) out.push(item("Spread evenly across", "spreadx", () => d({ type: "distribute", axis: "x" })));
      if (one) out.push(item(`Select all: ${getProp(one.type).name}`, "check", () => d({ type: "selectAll", propType: one.type })));
      out.push(item("Frame the selection", "frame", () => rig.frameAll({ ...s, objects: sel, lines: [] })));
      if (one?.type === "shooting-position") out.push(item("Shooter's eye from here", "eye", () => onShooterEye()));
    } else {
      out.push(
        item("Select all", "check", () => d({ type: "selectAll" }), { kbd: key("A") }),
        item("Frame all", "frame", () => rig.frameAll(s), { kbd: "F" }),
        item("Mirror the stage", "mirror", () => d({ type: "mirror", ids: [] }), { disabled: !s.objects.length && !s.lines.length }),
      );
    }
    return out;
  }

  /** Open at a screen point; `ground` ([x, z]) is the floor point under it, or null. */
  function open(x, y, ground = null) {
    lastFocus = document.activeElement;
    menu.replaceChildren(...items(ground));
    menu.setAttribute("data-lg-open", "");
    const r = menu.getBoundingClientRect();
    menu.style.setProperty("left", `${Math.max(8, Math.min(x, innerWidth - r.width - 8))}px`);
    menu.style.setProperty("top", `${Math.max(8, Math.min(y, innerHeight - r.height - 8))}px`);
    menu.querySelector('[role="menuitem"]:not(:disabled)')?.focus();
  }

  menu.addEventListener("keydown", (e) => {
    const all = [...menu.querySelectorAll('[role="menuitem"]:not(:disabled)')];
    const i = all.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); all[(i + 1) % all.length]?.focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); all[(i - 1 + all.length) % all.length]?.focus(); }
    else if (e.key === "Home") { e.preventDefault(); all[0]?.focus(); }
    else if (e.key === "End") { e.preventDefault(); all.at(-1)?.focus(); }
    else if (e.key === "Escape" || e.key === "Tab") { e.preventDefault(); e.stopPropagation(); close(); }
  });
  document.addEventListener("pointerdown", (e) => { if (!menu.contains(e.target)) close(); }, true);
  addEventListener("blur", close);
  addEventListener("resize", close);

  /**
   * Open the menu from an element: right-click, or a long press with a finger. `target(e)`
   * returns the id under the pointer (or null) and selects it first; `ground(e)` the floor point.
   */
  function attach(el, { target = () => null, ground = () => null } = {}) {
    const prepare = (e) => {
      const id = target(e);
      if (id && !editor.state.selection.includes(id)) d({ type: "select", ids: [id] });
      if (!id && el.tagName === "CANVAS") d({ type: "select", ids: [] });
      open(e.clientX, e.clientY, ground(e));
    };
    // A right-button (or two-finger) press opens the menu only when it's let go without moving: a
    // drag pans the view. On a Mac the contextmenu event comes on the press, so the menu waits for
    // the release; where it comes on the release, it opens straight away unless the pointer moved.
    let right = null;          // { x, y, moved, pending, released }
    el.addEventListener("pointerdown", (e) => { if (e.button === 2) right = { x: e.clientX, y: e.clientY, moved: false, pending: null }; });
    addEventListener("pointermove", (e) => {
      if (right && Math.hypot(e.clientX - right.x, e.clientY - right.y) > 6) right.moved = true;
    }, true);
    addEventListener("pointerup", (e) => {
      if (e.button !== 2 || !right) return;
      const r = right;
      right = null;
      if (r.pending) { if (!r.moved) prepare(r.pending); }
      else right = { ...r, released: true };                         // the contextmenu event may still come
    }, true);
    el.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if (right && !right.released) { right.pending = { clientX: e.clientX, clientY: e.clientY, target: e.target }; return; }
      const moved = right?.moved;
      right = null;
      if (!moved) prepare(e);
    });
    let timer = 0, start = null;
    el.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "touch") return;
      start = { x: e.clientX, y: e.clientY };
      clearTimeout(timer);
      timer = setTimeout(() => { if (start) prepare({ clientX: start.x, clientY: start.y, target: e.target }); }, LONG_PRESS_MS);
    });
    const cancel = (e) => { if (!start || (e.type === "pointermove" && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 10)) return; clearTimeout(timer); start = null; };
    el.addEventListener("pointermove", cancel);
    el.addEventListener("pointerup", () => { clearTimeout(timer); start = null; });
    el.addEventListener("pointercancel", () => { clearTimeout(timer); start = null; });
  }

  return { open, close, attach };
}
