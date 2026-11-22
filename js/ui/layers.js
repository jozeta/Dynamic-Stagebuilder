// The "On stage" panel (left, beside Props): every prop on the stage, in its groups. Clicking a
// row selects the prop (and the inspector shows it); Shift or ⌘/Ctrl-click, or *Select several*
// on an iPad, picks more. Each row hides or locks its prop; each group folds, renames
// (double-click or the pencil), hides and locks all of it. The bar acts on the selection: group,
// ungroup, move to a group, copy, paste, delete. Rows can be dragged onto a group (or the list's
// top to take them out). A right-click (or long press) opens the same menu as on the 3D view.
import { h, icon } from "./dom.js";
import { layerTree, itemName, isHidden, isLocked } from "../model/layers.js";

const LINE_NAMES = { "fault-line": "Fault line", "shooting-area": "Shooting area" };

export function createLayers(root, { editor, menu, onFocus = () => {} }) {
  const d = (a) => editor.dispatch(a);
  let several = false, filter = "", lastKey = "";
  // Group ids folded in the list, remembered in this browser.
  const FOLDS = "dsb:layer-folds";
  const folded = new Set((() => { try { const v = JSON.parse(localStorage.getItem(FOLDS) || "[]"); return Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, 500) : []; } catch { return []; } })());
  const keepFolds = () => { try { localStorage.setItem(FOLDS, JSON.stringify([...folded])); } catch { /* private mode */ } };
  let renaming = null;

  const list = h("div", { class: "layers-list", role: "list", "aria-label": "Props on the stage" });
  const search = h("input", { class: "lg-input layers-search", type: "search", placeholder: "Find a prop", "aria-label": "Find a prop on the stage",
    oninput: (e) => { filter = e.target.value.trim().toLowerCase(); lastKey = ""; update(); } });
  const bar = h("div", { class: "layers-bar", role: "toolbar", "aria-label": "Selected props" });
  const count = h("span", { class: "lg-chip layers-count" });
  root.append(
    h("div", { class: "layers-head" }, [h("h2", { class: "lg-subtitle panel-title", text: "On stage" }), count]),
    search, bar, list,
    h("p", { class: "lg-muted hint-text layers-hint", text: "Shift or ⌘-click picks several. Drag a row onto a group to move it there. Right-click for more." }),
  );

  const btn = (name, label, run, { disabled = false, pressed = null } = {}) => h("button", {
    type: "button", class: "lg-btn lg-btn-ghost lg-btn-icon layers-tool", "aria-label": label, title: label, disabled,
    "aria-pressed": pressed === null ? null : String(pressed), onclick: run,
  }, [icon(name)]);

  function pick(ids, e) {
    if (several || e?.shiftKey || e?.metaKey || e?.ctrlKey) {
      const sel = editor.state.selection;
      const allIn = ids.every((id) => sel.includes(id));
      d({ type: "select", ids: allIn ? sel.filter((id) => !ids.includes(id)) : [...sel, ...ids.filter((id) => !sel.includes(id))] });
    } else d({ type: "select", ids });
    if (editor.state.selection.length) onFocus(editor.state.selection);   // the camera slides over to it
  }

  function renderBar(stage) {
    const sel = stage.objects.filter((o) => editor.state.selection.includes(o.id));
    const has = sel.length > 0;
    const groups = stage.groups ?? [];
    const move = h("select", { class: "lg-select layers-move", "aria-label": "Move the selection to a group", disabled: !has,
      onchange: (e) => { if (e.target.value) d({ type: "moveToGroup", group: e.target.value === "-" ? null : e.target.value }); e.target.value = ""; } }, [
      h("option", { value: "", text: "Move to…" }),
      h("option", { value: "-", text: "No group" }),
      ...groups.map((g) => h("option", { value: g.id, text: g.name })),
    ]);
    const allLocked = has && sel.every((o) => isLocked(stage, o)), allHidden = has && sel.every((o) => isHidden(stage, o));
    bar.replaceChildren(
      btn("check", several ? "Select several: on" : "Select several", () => { several = !several; lastKey = ""; update(); }, { pressed: several }),
      btn("group", "Group the selection", () => d({ type: "group" }), { disabled: !has }),
      btn("layers", "Ungroup", () => d({ type: "ungroup" }), { disabled: !sel.some((o) => o.group) }),
      btn("copy", "Copy", () => d({ type: "copy" }), { disabled: !has }),
      btn("paste", "Paste", () => d({ type: "paste" }), { disabled: !editor.state.clipboard.length }),
      btn(allLocked ? "unlock" : "lock", allLocked ? "Unlock" : "Lock in place", () => d({ type: "setLocked", locked: !allLocked }), { disabled: !has }),
      btn(allHidden ? "eye" : "eyeoff", allHidden ? "Show" : "Hide", () => d({ type: "setHidden", hidden: !allHidden }), { disabled: !has }),
      btn("trash", "Delete", () => d({ type: "delete" }), { disabled: !has || allLocked }),
      move,
    );
  }

  // Drag a row onto a group (or the list's top) to move it.
  let dragging = null;
  const dropTarget = (el, group) => {
    el.addEventListener("dragover", (e) => { if (dragging) { e.preventDefault(); el.classList.add("is-drop"); } });
    el.addEventListener("dragleave", () => el.classList.remove("is-drop"));
    el.addEventListener("drop", (e) => {
      e.preventDefault(); el.classList.remove("is-drop");
      if (dragging) d({ type: "moveToGroup", ids: dragging, group });
      dragging = null;
      list.classList.remove("is-dragging");
    });
  };

  function itemRow(stage, o, depth) {
    const sel = editor.state.selection.includes(o.id);
    const hidden = isHidden(stage, o), locked = isLocked(stage, o);
    const row = h("div", { class: `layer-row${sel ? " is-selected" : ""}${hidden ? " is-hidden" : ""}`, role: "listitem", dataset: { id: o.id, depth: String(depth) },
      draggable: "true" }, [
      h("button", { type: "button", class: "layer-name", "aria-pressed": String(sel), onclick: (e) => pick([o.id], e), text: itemName(o) }),
      btn(o.hidden ? "eyeoff" : "eye", `${o.hidden ? "Show" : "Hide"} ${itemName(o)}`, () => d({ type: "setHidden", ids: [o.id], hidden: !o.hidden }), { pressed: !o.hidden }),
      btn(o.locked ? "lock" : "unlock", `${o.locked ? "Unlock" : "Lock"} ${itemName(o)}`, () => d({ type: "setLocked", ids: [o.id], locked: !o.locked }), { pressed: Boolean(o.locked) }),
    ]);
    if (locked && !o.locked) row.classList.add("is-locked");
    row.addEventListener("dragstart", (e) => {
      dragging = editor.state.selection.includes(o.id) ? editor.state.selection.filter((id) => stage.objects.some((x) => x.id === id)) : [o.id];
      e.dataTransfer.setData("text/plain", "props");
      e.dataTransfer.effectAllowed = "move";
      list.classList.add("is-dragging");
    });
    row.addEventListener("dragend", () => { dragging = null; list.classList.remove("is-dragging"); });
    return row;
  }

  function groupRow(stage, node) {
    const g = node.group, open = !folded.has(g.id);
    const ids = node.items.map((o) => o.id);
    const sel = ids.length && ids.every((id) => editor.state.selection.includes(id));
    const name = renaming === g.id
      ? h("input", { class: "lg-input layer-rename", value: g.name, maxlength: "60", "aria-label": "Group name",
        onkeydown: (e) => { if (e.key === "Enter") e.target.blur(); if (e.key === "Escape") { renaming = null; lastKey = ""; update(); } },
        onblur: (e) => { renaming = null; d({ type: "updateGroup", id: g.id, patch: { name: e.target.value } }); lastKey = ""; update(); } })
      : h("button", { type: "button", class: "layer-name layer-group-name", "aria-pressed": String(Boolean(sel)), onclick: (e) => pick(ids, e),
        ondblclick: () => { renaming = g.id; lastKey = ""; update(); } }, [h("strong", { text: g.name }), h("span", { class: "lg-muted", text: ` ${ids.length}` })]);
    const row = h("div", { class: `layer-row layer-group${g.hidden ? " is-hidden" : ""}`, role: "listitem", dataset: { group: g.id } }, [
      h("button", { type: "button", class: "lg-btn lg-btn-ghost lg-btn-icon layers-tool", "aria-expanded": String(open), "aria-label": `${open ? "Fold" : "Open"} ${g.name}`,
        onclick: () => { if (open) folded.add(g.id); else folded.delete(g.id); keepFolds(); lastKey = ""; update(); } }, [icon(open ? "chevd" : "chevr")]),
      name,
      btn("doc", `Rename ${g.name}`, () => { renaming = g.id; lastKey = ""; update(); }),
      btn(g.hidden ? "eyeoff" : "eye", `${g.hidden ? "Show" : "Hide"} ${g.name}`, () => d({ type: "updateGroup", id: g.id, patch: { hidden: !g.hidden } }), { pressed: !g.hidden }),
      btn(g.locked ? "lock" : "unlock", `${g.locked ? "Unlock" : "Lock"} ${g.name}`, () => d({ type: "updateGroup", id: g.id, patch: { locked: !g.locked } }), { pressed: Boolean(g.locked) }),
    ]);
    dropTarget(row, g.id);
    return row;
  }

  function update() {
    const stage = editor.stage();
    const key = JSON.stringify([stage.objects.map((o) => [o.id, o.label, o.locked, o.hidden, o.group]), stage.groups, stage.lines.map((l) => l.id),
      editor.state.selection, editor.state.clipboard.length, several, filter, [...folded], renaming]);
    if (key === lastKey) return;
    lastKey = key;
    count.textContent = String(stage.objects.length);
    renderBar(stage);
    const match = (o) => !filter || itemName(o).toLowerCase().includes(filter);
    const rows = [];
    const top = h("div", { class: "layers-top", text: "Drop here to take props out of their group" });
    dropTarget(top, null);
    rows.push(top);
    for (const node of layerTree(stage)) {
      if (node.kind === "item") { if (match(node.object)) rows.push(itemRow(stage, node.object, 0)); continue; }
      const items = node.items.filter(match);
      if (filter && !items.length) continue;
      rows.push(groupRow(stage, node));
      if (!folded.has(node.group.id) || filter) for (const o of items) rows.push(itemRow(stage, o, 1));
    }
    for (const l of stage.lines) {
      const sel = editor.state.selection.includes(l.id);
      if (filter && !LINE_NAMES[l.type].toLowerCase().includes(filter)) continue;
      rows.push(h("div", { class: `layer-row${sel ? " is-selected" : ""}`, role: "listitem", dataset: { id: l.id } }, [
        h("button", { type: "button", class: "layer-name", "aria-pressed": String(sel), onclick: (e) => pick([l.id], e), text: LINE_NAMES[l.type] }),
      ]));
    }
    if (rows.length === 1) rows.push(h("div", { class: "lg-state layers-empty" }, [h("p", { class: "lg-state-text", text: filter ? "No prop matches." : "Nothing on the stage yet. Add props from the Props tab." })]));
    list.replaceChildren(...rows);
    const focusRename = list.querySelector(".layer-rename");
    if (focusRename) { focusRename.focus(); focusRename.select(); }
  }

  // Right-click (or long press) on a row: the same menu as on the 3D view.
  menu.attach(list, { target: (e) => e.target.closest?.("[data-id]")?.dataset.id ?? null });
  return { update };
}
