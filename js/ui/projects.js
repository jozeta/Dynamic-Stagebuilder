// The Projects dialog: every stage saved in this browser, with open, duplicate, delete, new,
// import and export. Names and file contents are untrusted and only ever shown with textContent.
import { h, icon } from "./dom.js";
import { sortProjects, exportAge } from "../storage/projects.js";
import { parseStageFile } from "../storage/files.js";

const when = (t) => new Date(t).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export function createProjects({ store, currentId, onOpen, onNew, onDuplicate, onDelete, onImport, onExport }) {
  const list = h("div", { class: "proj-list", role: "list" });
  const message = h("div", { class: "proj-message", role: "status", "aria-live": "polite" });
  const file = h("input", { type: "file", accept: ".json,application/json", hidden: true, onchange: () => importFile() });
  const dialog = h("dialog", { class: "lg-modal lg-modal-lg", id: "projects", "aria-labelledby": "projects-title" }, [
    h("h2", { class: "lg-modal-title", id: "projects-title", text: "Projects" }),
    h("div", { class: "lg-modal-body lg-stack" }, [
      h("div", { class: "lg-row proj-actions" }, [
        h("button", { type: "button", class: "lg-btn", onclick: async () => { await onNew(); dialog.close(); } }, [icon("new"), "New stage"]),
        h("button", { type: "button", class: "lg-btn", onclick: () => file.click() }, [icon("folder"), "Import file…"]),
        h("button", { type: "button", class: "lg-btn", onclick: async () => { await onExport(); await fill(); } }, [icon("doc"), "Export this stage"]),
        file,
      ]),
      message,
      h("p", { class: "lg-muted", text: "Stages are saved in this browser only. Export a file to keep a copy or move a stage to another device." }),
      list,
    ]),
    h("div", { class: "lg-modal-actions" }, [h("button", { type: "button", class: "lg-btn lg-btn-primary", onclick: () => dialog.close(), text: "Close" })]),
  ]);
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  document.body.append(dialog);

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
        r.id === id ? null : h("button", { type: "button", class: "lg-btn lg-btn-primary", onclick: async () => { await onOpen(r.id); dialog.close(); }, text: "Open" }),
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

  return { async open() { say(""); await fill(); dialog.showModal(); } };
}
