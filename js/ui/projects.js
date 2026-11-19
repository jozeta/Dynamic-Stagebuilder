// The Projects panel (in the left-hand panel, in place of the props): every stage saved in this browser, with open, duplicate, delete, new,
// import and export. Names and file contents are untrusted and only ever shown with textContent.
import { h, icon } from "./dom.js";
import { sortProjects, exportAge } from "../storage/projects.js";
import { parseStageFile } from "../storage/files.js";

const when = (t) => new Date(t).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export function createProjects({ panel, hide = [], onToggle = () => {}, store, currentId, onOpen, onNew, onDuplicate, onDelete, onImport, onExport }) {
  const list = h("div", { class: "proj-list", role: "list" });
  const message = h("div", { class: "proj-message", role: "status", "aria-live": "polite" });
  const file = h("input", { type: "file", accept: ".json,application/json", hidden: true, onchange: () => importFile() });
  panel.append(
    h("div", { class: "side-head" }, [
      h("h2", { class: "lg-subtitle panel-title", id: "projects-title", text: "Projects" }),
      h("button", { type: "button", class: "lg-btn lg-btn-primary", onclick: () => close(), text: "Done" }),
    ]),
    h("div", { class: "lg-stack proj-body" }, [
      h("div", { class: "proj-actions" }, [
        h("button", { type: "button", class: "lg-btn", onclick: async () => { await onNew(); close(); } }, [icon("new"), "New stage"]),
        h("button", { type: "button", class: "lg-btn", onclick: () => file.click() }, [icon("folder"), "Import file…"]),
        h("button", { type: "button", class: "lg-btn", onclick: async () => { await onExport(); await fill(); } }, [icon("doc"), "Export this stage"]),
        file,
      ]),
      message,
      h("p", { class: "lg-muted hint-text", text: "Stages are saved in this browser only. Export a file to keep a copy or move a stage to another device." }),
      list,
    ]),
  );
  panel.setAttribute("aria-labelledby", "projects-title");
  let isOpen = false;
  function show(open) {
    isOpen = open;
    panel.hidden = !open;
    for (const el of hide) el.hidden = open;
    onToggle(open);
  }
  function close() { show(false); }
  panel.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.stopPropagation(); close(); } });

  const say = (text, tone) => message.replaceChildren(text ? h("p", { class: `lg-alert lg-alert-${tone}`, text }) : "");

  async function importFile() {
    const f = file.files?.[0];
    file.value = "";
    if (!f) return;
    if (f.size > 5_000_000) return say("The file is too large to be a stage file.", "bad");
    const r = parseStageFile(await f.text());
    if (!r.ok) return say(r.error, "bad");
    await onImport(r.stage);
    say(`Imported "${r.stage.name}" as a new project.`, "ok");
    await fill();
  }

  async function fill() {
    const now = Date.now();
    const records = sortProjects(await store.list());
    const id = currentId();
    list.replaceChildren(...records.map((r) => {
      const hint = exportAge(r, now);
      const row = h("div", { class: `proj-row${r.id === id ? " is-current" : ""}`, role: "listitem" });
      const info = h("div", { class: "proj-info" }, [
        h("span", { class: "proj-name", text: r.name || "Untitled stage" }),
        h("span", { class: "lg-muted proj-meta", text: `${r.id === id ? "Open now · " : ""}Changed ${when(r.modified)}` }),
        hint ? h("span", { class: "proj-hint", text: hint }) : null,
      ]);
      const normal = () => row.replaceChildren(info, h("div", { class: "lg-row proj-buttons" }, [
        r.id === id ? null : h("button", { type: "button", class: "lg-btn lg-btn-primary", onclick: async () => { await onOpen(r.id); close(); }, text: "Open" }),
        h("button", { type: "button", class: "lg-btn", onclick: async () => { await onDuplicate(r.id); await fill(); }, text: "Duplicate" }),
        h("button", { type: "button", class: "lg-btn lg-btn-danger", onclick: () => confirm(), text: "Delete" }),
      ]));
      const confirm = () => row.replaceChildren(h("span", { class: "proj-confirm", text: `Delete "${r.name || "Untitled stage"}"? This can't be undone.` }),
        h("div", { class: "lg-row proj-buttons" }, [
          h("button", { type: "button", class: "lg-btn lg-btn-danger", onclick: async () => { await onDelete(r.id); await fill(); }, text: "Delete" }),
          h("button", { type: "button", class: "lg-btn", onclick: () => normal(), text: "Keep" })]));
      normal();
      return row;
    }));
  }

  return {
    async open() { if (isOpen) return close(); say(""); await fill(); show(true); panel.querySelector("button")?.focus(); },
    close,
    get isOpen() { return isOpen; },
  };
}
