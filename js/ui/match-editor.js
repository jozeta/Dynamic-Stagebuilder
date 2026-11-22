// The New match / Edit match window: the match's name, a dropdown of stages to add (your saved
// stages, the example stage and the stage library) with Add, and the match's stages in order, each
// with up, down and remove. Save returns { name, items: [{ key, name }] } (key "own:<id>", "demo" or
// "lib:<id>"); Cancel or Escape returns null. Names are shown with textContent only.
import { h, icon } from "./dom.js";
import { draftAdd, draftMoveTo, draftRemove } from "../model/match.js";
import { dragGrip } from "./drag-sort.js";
import { STAGE_LIBRARY, LIBRARY_CATEGORIES } from "../model/stage-library.js";

let n = 0;
/**
 * @param {{ title: string, name?: string, items?: {key: string, name: string}[], own: {id: string, name: string, inMatch?: string}[] }} o
 */
export function openMatchEditor({ title, name = "", items = [], own, action = "Save match" }) {
  return new Promise((resolve) => {
    const id = `match-ed-${++n}`;
    let list = [...items];
    let result = null;

    const nameIn = h("input", { class: "lg-input", id: `${id}-name`, maxlength: "120", value: name, autocomplete: "off", placeholder: "e.g. Club match, June" });
    // The dropdown: your stages, then the example and the library by category.
    const pick = h("select", { class: "lg-select", id: `${id}-pick`, "aria-label": "Stage to add" });
    const option = (key, text) => h("option", { value: key, text });
    const labelOf = new Map();
    const fillPick = () => {
      const taken = new Set(list.map((x) => x.key));
      const groups = [
        ["Your stages", own.map((r) => [`own:${r.id}`, r.name || "Untitled stage", r.inMatch ? ` (moves from ${r.inMatch})` : ""])],
        ["Example", [["demo", "Example stage (a new copy)", ""]]],
        ...LIBRARY_CATEGORIES.map((c) => [`Stage library: ${c.name}`, STAGE_LIBRARY.filter((s) => s.category === c.id).map((s) => [`lib:${s.id}`, s.name, ""])]),
      ];
      pick.replaceChildren(h("option", { value: "", text: "Choose a stage…" }),
        ...groups.filter(([, opts]) => opts.length).map(([label, opts]) => h("optgroup", { label }, opts.map(([key, text, note]) => {
          labelOf.set(key, text);
          const o = option(key, `${text}${note}`);
          if (taken.has(key)) o.disabled = true;
          return o;
        }))));
    };
    const addB = h("button", { type: "button", class: "lg-btn", onclick: () => add() }, [icon("plus"), "Add"]);
    const listBox = h("ol", { class: "match-ed-list", "aria-label": "Stages in this match" });
    const error = h("p", { class: "lg-alert lg-alert-bad", role: "alert", hidden: true });

    function add() {
      const key = pick.value;
      if (!key) { pick.focus(); return; }
      list = draftAdd(list, { key, name: labelOf.get(key) || key });
      render();
      pick.value = "";
    }
    function render() {
      fillPick();
      const drop = (from, to) => { list = draftMoveTo(list, from, to); render(); listBox.children[to]?.querySelector(".drag-grip")?.focus(); };
      listBox.replaceChildren(...(list.length ? list.map((x, i) => h("li", { class: "match-ed-row drag-row" }, [
        dragGrip({ container: listBox, index: i, label: x.name, onDrop: drop }),
        h("span", { class: "match-num", text: String(i + 1) }),
        h("span", { class: "match-ed-name", text: x.name }),
        h("button", { type: "button", class: "lg-btn lg-btn-icon", "aria-label": `Remove ${x.name}`, title: "Remove from the match", onclick: () => { list = draftRemove(list, i); render(); } }, [icon("x")]),
      ])) : [h("li", { class: "lg-muted hint-text match-ed-empty", text: "No stages yet. Choose one above and press Add." })]));
    }

    const submit = (e) => {
      e?.preventDefault();
      const nm = nameIn.value.trim().slice(0, 120);
      if (!nm) { error.textContent = "Give the match a name."; error.hidden = false; nameIn.focus(); return; }
      result = { name: nm, items: list };
      dialog.close();
    };
    const form = h("form", { onsubmit: submit }, [
      h("h2", { class: "lg-modal-title", id: `${id}-title`, text: title }),
      h("div", { class: "lg-modal-body lg-stack" }, [
        h("div", { class: "lg-field" }, [h("label", { for: `${id}-name`, text: "Match name" }), nameIn]),
        h("div", { class: "lg-field" }, [h("label", { for: `${id}-pick`, text: "Add a stage: one you saved, the example or from the stage library" }),
          h("div", { class: "match-ed-add" }, [pick, addB])]),
        h("span", { class: "lg-label", text: "Stages, in order" }),
        listBox,
        h("p", { class: "lg-muted hint-text", text: "The example and library stages are saved as new projects when the match is saved. Each stage gets the match name and its number in its briefing." }),
        error,
      ]),
      h("div", { class: "lg-modal-actions" }, [
        h("button", { type: "button", class: "lg-btn", onclick: () => dialog.close(), text: "Cancel" }),
        h("button", { type: "submit", class: "lg-btn lg-btn-primary" }, [icon("check"), action]),
      ]),
    ]);
    const dialog = h("dialog", { class: "lg-modal match-editor", "aria-labelledby": `${id}-title` }, [form]);
    dialog.addEventListener("close", () => { dialog.remove(); resolve(result); });
    nameIn.addEventListener("input", () => { error.hidden = true; });
    pick.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); add(); } });
    render();
    document.body.append(dialog);
    dialog.showModal();
    nameIn.focus();
  });
}
