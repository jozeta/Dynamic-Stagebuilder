// The Projects panel (the left-hand panel's first tab): every stage saved in this browser, with open,
// duplicate, delete, new, import and export. With a stage open it shows that stage instead (its
// settings, statistics and briefing, `stageBox`), with Close stage in the corner and a breadcrumb of
// where it sits (Projects › folder › match › stage). Folders sort stages and matches (and other
// folders): drag a row onto a folder or a breadcrumb link, or use its Move to folder icon. Names and
// file contents are untrusted and only ever shown with textContent.
import { h, icon, rowIcon } from "./dom.js";
import { sortProjects, exportAge } from "../storage/projects.js";
import { parseFile } from "../storage/files.js";
import { STAGE_LIBRARY, librarySummary, libraryInfo, libraryFolders } from "../model/stage-library.js";
import { createMatches } from "./matches.js";
import { stageInfoButton } from "./stage-info.js";
import { stageDetails } from "../model/match.js";
import { trail } from "../model/trail.js";
import { createFolder, cleanFolder, folderOf, moveInto, removeFolder, pathTo, contents, canMoveFolder, renameFolder } from "../model/folders.js";
import { askName } from "./name-prompt.js";

// Rows dragged onto a folder (or a breadcrumb link) carry their key: "stage:…", "match:…", "folder:…".
const DND = "application/x-dsb-item";

const when = (t) => new Date(t).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export function createProjects({ panel, stageBox = null, docked = false, hide = [], onToggle = () => {}, onOpenLibrary = async () => {}, onCreateFrom = async () => null, onCloseStage = async () => {}, onModeChange = () => {}, store, currentId, onOpen, onDuplicate, onDelete, onImport, onExport,
  onNewStage = async () => null, onApplyBriefing = async () => {}, onPrintMatch = () => {}, onExportMatch = () => {}, onImportMatch = async () => [], onBackup = async () => {}, onRestore = async () => ({ ok: false, error: "Not available." }), onShareLink = async () => ({ ok: false, error: "Not available." }) }) {
  // Matches: their list above the stages, and a match's own page in place of the lists.
  const stagesBox = h("div", { class: "lg-stack" });
  const crumbs = h("nav", { class: "proj-crumbs", "aria-label": "Where you are" });
  let actions = null;
  // The button in the corner says what it closes: the match (on its page), the stage you have open,
  // or just the panel when nothing is open. Closing saves first and leaves an empty view.
  const closeB = h("button", { type: "button", class: "lg-btn lg-btn-primary", onclick: () => closeWhat(), text: "Done" });
  const mode = () => (matches.inMatch ? "match" : currentId() ? "stage" : "none");
  async function closeWhat() {
    const m = mode();
    if (m === "match") return closeMatch();
    if (m === "stage") return closeStageHere();

    close();
  }
  // Save and close the open stage: back to its match's page when you came through the match, else to
  // the start of Projects (also used by the Stage panel's Close stage).
  async function closeStageHere() {
    const inMatch = matches.contextId;
    const cur = currentId();
    if (cur && !inMatch) folderId = folderOf(folders, `stage:${cur}`);      // back to the folder it is in
    await onCloseStage("stage");
    if (inMatch && (await matches.list()).some((x) => x.id === inMatch)) await matches.show(inMatch); else { matches.showList(); matches.leaveMatch(); }
    await fill();
  }
  async function closeMatch() {
    const all = await matches.list(), m = all.find((x) => x.id === (matches.inMatch ? matches.openId : matches.contextId));
    if (m) folderId = folderOf(folders, `match:${m.id}`);
    await onCloseStage("match", m?.name || "");
    matches.showList(); matches.leaveMatch();
    await fill();
  }
  const matches = createMatches({
    store, currentId,
    onOpen: async (id) => { await onOpen(id); await fill(); },
    onNewStage, onCreateFrom, onApplyBriefing, onPrint: onPrintMatch, onExport: onExportMatch, onCloseMatch: () => closeMatch(),
    // A match's page shows only the match (with Close match at the top): the general buttons and the
    // stage list are hidden meanwhile.
    onViewChange: () => { applyView(); queueMicrotask(() => fillCrumbs()); },
    onChanged: async () => { await prepare(); await fillStages(); },     // stages a match added (example, library) show in the list
    // Only the matches in the folder shown; each can be dragged or moved to a folder.
    inFolder: (key) => shown.has(key),
    rowExtras: (row, key, name, normal) => { draggableRow(row, key); return [moveIcon(row, key, name, normal)]; },
  });

  // --- Folders ---
  let folders = [];            // every folder (checked), from the store
  let folderId = null;         // the folder the lists show (null: the top)
  let shown = new Set();       // keys of the stages and matches shown in it
  let shownFolders = [];
  const foldersBox = h("section", { class: "folders", "aria-label": "Folders" });
  const loadFolders = async () => {
    folders = (await store.matches.list()).map(cleanFolder).filter(Boolean);
    if (folderId && !folders.some((f) => f.id === folderId)) folderId = null;
  };
  // Save what changed: new or changed folders are written, deleted ones removed.
  async function saveFolders(next) {
    const before = new Map(folders.map((f) => [f.id, JSON.stringify(f)]));
    for (const f of next) if (before.get(f.id) !== JSON.stringify(f)) await store.matches.put(f);
    for (const id of before.keys()) if (!next.some((f) => f.id === id)) await store.matches.remove(id);
    folders = next;
  }
  async function moveKey(key, into) {
    if (key === `folder:${into}`) return;
    const next = moveInto(folders, key, into);
    if (next === folders) { say("A folder can't go inside itself or a folder inside it.", "bad"); return; }
    await saveFolders(next);
    await fill();
  }
  function draggableRow(row, key) {
    if (row.draggable) return;                  // once per row (a row redraws its icons)
    row.draggable = true;
    row.classList.add("is-draggable");
    row.addEventListener("dragstart", (e) => { e.dataTransfer.setData(DND, key); e.dataTransfer.effectAllowed = "move"; row.classList.add("is-dragging"); });
    row.addEventListener("dragend", () => row.classList.remove("is-dragging"));
  }
  // A folder row or a breadcrumb link: dropping a row on it moves that row's item into it.
  function dropOn(el, into) {
    el.addEventListener("dragover", (e) => { if (e.dataTransfer?.types.includes(DND)) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; el.classList.add("is-drop"); } });
    el.addEventListener("dragleave", () => el.classList.remove("is-drop"));
    el.addEventListener("drop", async (e) => {
      el.classList.remove("is-drop");
      const key = e.dataTransfer?.getData(DND);
      if (!key) return;
      e.preventDefault();
      await moveKey(key, into);
    });
  }
  const folderLabel = (f) => pathTo(folders, f.id).map((x) => x.name).join(" › ");
  // Move to folder without dragging (touch, keyboard): the row shows a list of folders.
  function moveIcon(row, key, name, normal) {
    return rowIcon("folder", `Move ${name} to a folder`, () => {
      const self = key.startsWith("folder:") ? key.slice(7) : null;
      const here = self ? folders.find((f) => f.id === self)?.parent ?? null : folderOf(folders, key);
      const options = [["", "Projects (the top)"], ...folders.filter((f) => !self || canMoveFolder(folders, self, f.id)).sort((a, b) => folderLabel(a).localeCompare(folderLabel(b))).map((f) => [f.id, folderLabel(f)])];
      const sel = h("select", { class: "lg-select", "aria-label": `Folder for ${name}` }, options.map(([v, t]) => h("option", { value: v, text: t })));
      sel.value = here ?? "";
      row.replaceChildren(h("span", { class: "proj-confirm", text: `Move "${name}" to:` }), sel,
        h("div", { class: "lg-row proj-buttons" }, [
          h("button", { type: "button", class: "lg-btn lg-btn-primary", onclick: () => moveKey(key, sel.value || null), text: "Move" }),
          h("button", { type: "button", class: "lg-btn", onclick: () => normal(), text: "Cancel" })]));
      sel.focus();
    });
  }
  async function newFolder() {
    const name = await askName({ title: "New folder", value: "" });
    if (!name) return;
    await saveFolders([...folders, createFolder({ name, parent: folderId })]);
    await fill();
  }
  function fillFolders() {
    const rows = shownFolders.map((id) => {
      const f = folders.find((x) => x.id === id);
      const sub = contents(folders, f.id, [...allKeys]);
      const n = sub.folders.length + sub.keys.length;
      const row = h("div", { class: "proj-row folder-row icon-row", role: "listitem" });
      const open = async () => { folderId = f.id; await fill(); };
      const normal = () => row.replaceChildren(
        h("button", { type: "button", class: "folder-open", onclick: open, "aria-label": `Open the folder ${f.name}` }, [icon("folder"),
          h("span", { class: "proj-info" }, [h("span", { class: "proj-name", text: f.name }), h("span", { class: "lg-muted proj-meta", text: n ? `${n} item${n === 1 ? "" : "s"}` : "Empty" })])]),
        h("div", { class: "row-icons" }, [
          rowIcon("edit", `Rename the folder ${f.name}`, async () => { const name = await askName({ title: "Rename folder", value: f.name }); if (name) { await saveFolders(renameFolder(folders, f.id, name)); await fill(); } }),
          moveIcon(row, `folder:${f.id}`, f.name, () => normal()),
          rowIcon("trash", `Delete the folder ${f.name}`, () => confirmDel(), { danger: true }),
        ]));
      const confirmDel = () => row.replaceChildren(h("span", { class: "proj-confirm", text: `Delete the folder "${f.name}"? What's in it moves up a level; nothing else is deleted.` }),
        h("div", { class: "lg-row proj-buttons" }, [
          h("button", { type: "button", class: "lg-btn lg-btn-danger", onclick: async () => { await saveFolders(removeFolder(folders, f.id)); await fill(); }, text: "Delete folder" }),
          h("button", { type: "button", class: "lg-btn", onclick: () => normal(), text: "Keep" })]));
      normal();
      draggableRow(row, `folder:${f.id}`);
      dropOn(row, f.id);
      return row;
    });
    const empty = folderId && !rows.length && !shown.size;
    foldersBox.replaceChildren(...[
      rows.length ? h("h3", { class: "lg-label stage-library-title", text: `Folders (${rows.length})` }) : null,
      rows.length ? h("div", { class: "proj-list", role: "list" }, rows) : null,
      empty ? h("p", { class: "lg-muted hint-text", text: "This folder is empty. Drag stages, matches or folders onto it, or use their Move to folder icon." }) : null,
    ].filter(Boolean));
  }
  let allKeys = new Set();
  // What the lists show: the folder's own folders, matches and stages.
  async function prepare() {
    await loadFolders();
    const keys = [...(await store.list()).map((r) => `stage:${r.id}`), ...(await matches.list()).map((m) => `match:${m.id}`)];
    allKeys = new Set(keys);
    const c = contents(folders, folderId, keys);
    shown = new Set(c.keys);
    shownFolders = c.folders;
  }
  const list = h("div", { class: "proj-list", role: "list" });
  const message = h("div", { class: "proj-message", role: "status", "aria-live": "polite" });
  const file = h("input", { type: "file", accept: ".json,application/json", hidden: true, onchange: () => importFile() });
  // The stage library: ready-made stages and drills, each opened as a new project to edit.
  const libSearch = h("input", { type: "search", placeholder: "Search stages", "aria-label": "Search the stage library", oninput: () => fillLibrary() });
  // The library's folders (one per category) start folded; a search opens those with matches.
  const libOpen = new Set();
  const libList = h("div", { class: "lib-stages", role: "list" });
  const summaries = new Map();
  const summaryOf = (spec) => { if (!summaries.has(spec.id)) summaries.set(spec.id, librarySummary(spec)); return summaries.get(spec.id); };
  const libraryBox = h("section", { class: "stage-library", "aria-labelledby": "library-title" }, [
    h("h3", { class: "lg-label stage-library-title", id: "library-title", text: `Stage library (${STAGE_LIBRARY.length})` }),
    h("p", { class: "lg-muted hint-text", text: "Ready-made stages and drills in folders. Open one as a new project, then change anything." }),
    h("div", { class: "lg-search" }, [icon("search"), libSearch]),
    libList,
  ]);
  function fillLibrary() {
    const q = libSearch.value.trim().toLowerCase();
    const hit = (s) => !q || `${s.name} ${s.summary} ${s.discipline}`.toLowerCase().includes(q);
    const card = (spec, catName) => {
      // The name, and on the right an ⓘ (category, shots, course length, targets and the description) and the open icon.
      const info = () => { const i = libraryInfo(spec); return { meta: `${catName} · ${spec.discipline === "both" ? "IPSC and USPSA" : spec.discipline}`,
        rows: [["Shots", i.shotsText.replace(/^Shots: /, "")], ["Course", i.courseText], ["Targets", summaryOf(spec).targets]], text: spec.summary }; };
      return h("div", { class: "lib-stage icon-row", role: "listitem" }, [
        h("span", { class: "proj-name", text: spec.name }),
        h("div", { class: "row-icons" }, [
          rowIcon("open", `Open ${spec.name} as a new project`, async () => { matches.leaveMatch(); matches.showList(); await onOpenLibrary(spec); await placeNew(); await fill(); }),
          stageInfoButton(spec.name, info),
        ]),
      ]);
    };
    const folders = libraryFolders().map((f) => ({ ...f, stages: f.stages.filter(hit) })).filter((f) => f.stages.length);
    libList.replaceChildren(...(folders.length ? folders.map((f) => {
      const sec = h("details", { class: "lib-section lib-folder", open: q ? true : libOpen.has(f.id) }, [
        h("summary", { class: "lib-summary" }, [icon("folder"), h("span", { class: "lg-label", text: f.name }), h("span", { class: "lib-count lg-muted", text: String(f.stages.length) })]),
        h("div", { class: "lib-stages", role: "list" }, f.stages.map((spec) => card(spec, f.name))),
      ]);
      sec.addEventListener("toggle", () => { if (q) return; if (sec.open) libOpen.add(f.id); else libOpen.delete(f.id); });
      return sec;
    }) : [h("p", { class: "lg-muted", text: "No stages match. Try another word." })]));
  }

  // The open stage: its settings, statistics and briefing (stageBox), then export and share.
  const stageView = h("div", { class: "lg-stack stage-view", hidden: true }, [
    stageBox,
    h("div", { class: "proj-actions stage-actions" }, [
      h("button", { type: "button", class: "lg-btn", onclick: async () => { await onExport(); await fill(); } }, [icon("doc"), "Export this stage"]),
      h("button", { type: "button", class: "lg-btn", onclick: () => shareLink() }, [icon("link"), "Copy share link"]),
    ]),
  ].filter(Boolean));
  const title = h("h2", { class: "lg-subtitle panel-title", id: "projects-title", text: "Projects" });
  // Which part shows: the open stage, a match's page, or the lists (matches, stages, library).
  function applyView() {
    const m = mode();
    stageView.hidden = m !== "stage";
    matches.box.hidden = m === "stage";
    stagesBox.hidden = m !== "none";
    foldersBox.hidden = m !== "none";
    libraryBox.hidden = m !== "none" || folderId !== null;          // the library is at the top only
    if (actions) actions.hidden = m !== "none";
    title.textContent = m === "stage" ? "Stage" : "Projects";
  }
  panel.append(
    h("div", { class: "side-head" }, [title, closeB]),
    crumbs,
    h("div", { class: "lg-stack proj-body" }, [
      actions = h("div", { class: "proj-actions" }, [
        h("button", { type: "button", class: "lg-btn", onclick: async () => { await matches.create(); if (matches.openId) await placeNew(`match:${matches.openId}`); } }, [icon("layers"), "New match"]),
        h("button", { type: "button", class: "lg-btn", onclick: () => newFolder() }, [icon("folder"), "New folder"]),
        h("button", { type: "button", class: "lg-btn", onclick: () => file.click(), title: "A stage, match or backup file" }, [icon("folder"), "Import file…"]),
        h("button", { type: "button", class: "lg-btn", onclick: () => backup(), title: "One file with every stage, match, folder and your own surroundings" }, [icon("doc"), "Back up everything"]),
        file,
      ]),
      message,
      stageView,
      foldersBox,
      matches.box,
      stagesBox,
      libraryBox,
    ]),
  );
  panel.setAttribute("aria-labelledby", "projects-title");
  let isOpen = false;
  function show(open) {
    isOpen = open;
    if (!docked) panel.hidden = !open;            // docked, the dock shows or hides its tab
    for (const el of hide) el.hidden = open;
    onToggle(open);
  }
  function close() { show(false); }
  panel.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.stopPropagation(); close(); } });

  const say = (text, tone) => message.replaceChildren(text ? h("p", { class: `lg-alert lg-alert-${tone}`, text }) : "");

  // Copy a link that holds the open stage. Where the clipboard isn't allowed, show the link to copy.
  async function shareLink() {
    const r = await onShareLink();
    if (!r.ok) return say(r.error, "bad");
    try {
      // A clipboard that doesn't answer (a permission prompt left open) falls back to the field below.
      await Promise.race([navigator.clipboard.writeText(r.url), new Promise((_, no) => setTimeout(() => no(new Error("clipboard timeout")), 3000))]);
      say("Share link copied. Anyone with the link can open a copy of this stage; nothing is uploaded.", "ok");
    } catch {
      const field = h("input", { class: "lg-input", readonly: true, value: r.url, "aria-label": "Share link", onfocus: (e) => e.target.select() });
      message.replaceChildren(h("div", { class: "lg-alert lg-alert-info" }, [h("p", { text: "Copy this link. Anyone with it can open a copy of this stage." }), field]));
      field.focus();
    }
  }

  // Back up everything: a download, nothing leaves the computer otherwise.
  async function backup() {
    const n = await onBackup();
    say(`Saved a backup of ${n.projects} stage${n.projects === 1 ? "" : "s"}, ${n.matches} match${n.matches === 1 ? "" : "es"}, ${n.folders} folder${n.folders === 1 ? "" : "s"} and ${n.surroundings} surroundings. Keep it somewhere safe: Import file… brings it back.`, "ok");
  }

  async function importFile() {
    const f = file.files?.[0];
    file.value = "";
    if (!f) return;
    if (f.size > 200_000_000) return say("The file is too large to be a stage, match or backup file.", "bad");
    const text = await f.text();
    // A backup (its kind comes first in the file) is restored: everything added as new records.
    if (/^\{\s*"kind"\s*:\s*"dynamic-stagebuilder-backup"/.test(text.slice(0, 80))) {
      const r = await onRestore(text);
      if (!r.ok) return say(r.error, "bad");
      const c = r.counts;
      say(`Restored ${c.projects} stage${c.projects === 1 ? "" : "s"}, ${c.matches} match${c.matches === 1 ? "" : "es"}, ${c.folders} folder${c.folders === 1 ? "" : "s"} and ${c.surroundings} surroundings, next to what you had${r.skipped ? ` (${r.skipped} damaged record${r.skipped === 1 ? "" : "s"} left out)` : ""}.`, "ok");
      await fill();
      return;
    }
    if (text.length > 20_000_000) return say("The file is too large to be a stage or match file.", "bad");
    const r = parseFile(text);
    if (!r.ok) return say(r.error, "bad");
    if (r.kind === "match") {
      // Every stage becomes a new project, and a new match holds them in the file's order.
      const ids = await onImportMatch(r.stages);
      await matches.adopt(r.name, ids);
      if (matches.openId) await placeNew(`match:${matches.openId}`);
      say(`Imported the match "${r.name}" with ${ids.length} stage${ids.length === 1 ? "" : "s"}.`, "ok");
      await fill();
      return;
    }
    await onImport(r.stage);
    await placeNew();
    say(`Imported "${r.stage.name}" as a new project.`, "ok");
    await fill();
  }

  stagesBox.append(
    h("h3", { class: "lg-label stage-library-title", text: "Stages" }),
    h("p", { class: "lg-muted hint-text", text: "Stages are saved in this browser only. Export a file to keep a copy or move a stage to another device." }),
    list,
  );
  // Something new (a stage, a match) made while a folder is shown goes into that folder.
  async function placeNew(key = currentId() ? `stage:${currentId()}` : null) {
    if (!key || !folderId || folderOf(folders, key)) return;
    await saveFolders(moveInto(folders, key, folderId));
  }

  // Each part fills on its own: a problem in one (a damaged record) can't leave the others empty.
  async function fill() {
    for (const part of [prepare, fillFolders, () => matches.fill(), fillStages, fillCrumbs]) {
      try { await part(); } catch (err) { console.error("Projects panel:", err); }
    }
  }
  // Where you are: Projects › a match (its page) › a stage of it, or Projects › a stage on its own.
  // Going up from an open stage saves and closes it first.
  async function fillCrumbs() {
    const all = await matches.list(), cur = currentId();
    const rec = cur ? (await store.list()).find((r) => r.id === cur) : null;
    const page = matches.openId ? all.find((m) => m.id === matches.openId) : null;
    // A stage in a match only when you came to it through the match (Close match leaves it).
    const match = page || (matches.contextId ? all.find((x) => x.id === matches.contextId) : null);
    const stage = page || !cur ? null : { id: cur, name: rec?.name ?? "" };
    // The folders round what is shown: the folder you are in, or the one holding the match or stage.
    const inMatch = match && (page || match.stageIds.includes(cur));
    const holder = mode() === "none" ? folderId : folderOf(folders, inMatch ? `match:${match.id}` : `stage:${cur}`);
    const crumbsNow = trail({ folders: pathTo(folders, holder), match, stage, page: page ? "match" : "" });
    const up = async () => { if (mode() === "stage") await onCloseStage("stage"); matches.showList(); matches.leaveMatch(); };
    const go = {
      home: async () => { await up(); folderId = null; await fill(); },
      folder: async (c) => { await up(); folderId = c.id; await fill(); },
      match: async (c) => { if (mode() === "stage") await onCloseStage("stage"); await matches.show(c.id); await fill(); },
    };
    const parts = [];
    crumbsNow.forEach((c, i) => {
      if (i) parts.push(h("span", { class: "crumb-sep", "aria-hidden": "true", text: "›" }));
      const el = c.here || !go[c.kind] ? h("span", { class: c.here ? "crumb-here" : "", text: c.text, "aria-current": c.here ? "page" : null })
        : h("button", { type: "button", class: "crumb-link", onclick: () => go[c.kind](c), text: c.text, title: mode() === "stage" ? "Save and close the stage, then go here" : null });
      if (!c.here && (c.kind === "home" || c.kind === "folder")) dropOn(el, c.kind === "home" ? null : c.id);     // drop a row here to move it up
      parts.push(el);
    });
    crumbs.replaceChildren(...parts);
    applyView();
    onModeChange();
    closeB.textContent = { match: "Close match", stage: "Close stage", none: "Done" }[mode()];
    closeB.hidden = mode() === "none";              // nothing open: no button (the panel tabs close it)
    closeB.title = { match: "Save and close the match; back to all your projects", stage: "Save and close this stage", none: "Close the panel" }[mode()];
  }
  async function fillStages() {
    const now = Date.now();
    const records = sortProjects(await store.list());
    const all = await matches.list();
    const id = currentId();
    const inView = records.filter((r) => shown.has(`stage:${r.id}`));
    list.replaceChildren(...(inView.length ? inView : []).map((r) => {
      const hint = exportAge(r, now);
      const row = h("div", { class: `proj-row icon-row${r.id === id ? " is-current" : ""}`, role: "listitem" });
      const infoB = stageInfoButton(r.name || "Untitled stage", stageDetails(r.stage, all));
      const info = h("div", { class: "proj-info" }, [
        h("span", { class: "proj-name", text: r.name || "Untitled stage" }),
        h("span", { class: "lg-muted proj-meta", text: `${r.id === id ? "Open now · " : ""}Changed ${when(r.modified)}` }),
        hint ? h("span", { class: "proj-hint", text: hint }) : null,
      ]);
      const nm = r.name || "Untitled stage";
      const normal = () => row.replaceChildren(info, h("div", { class: "row-icons" }, [
        r.id === id ? null : rowIcon("open", `Open ${nm}`, async () => { matches.leaveMatch(); matches.showList(); await onOpen(r.id); await fill(); }),
        rowIcon("copy", `Duplicate ${nm}`, async () => { await onDuplicate(r.id); await fill(); }),
        moveIcon(row, `stage:${r.id}`, nm, () => normal()),
        rowIcon("trash", `Delete ${nm}`, () => confirm(), { danger: true }),
        infoB,
      ]));
      const confirm = () => row.replaceChildren(h("span", { class: "proj-confirm", text: `Delete "${r.name || "Untitled stage"}"? This can't be undone.` }),
        h("div", { class: "lg-row proj-buttons" }, [
          h("button", { type: "button", class: "lg-btn lg-btn-danger", onclick: async () => { await onDelete(r.id); await fill(); }, text: "Delete" }),
          h("button", { type: "button", class: "lg-btn", onclick: () => normal(), text: "Keep" })]));
      normal();
      draggableRow(row, `stage:${r.id}`);
      return row;
    }));
    if (!inView.length && records.length) list.replaceChildren(h("p", { class: "lg-muted hint-text", text: folderId ? "No stages in this folder." : "Every stage is in a folder." }));
  }

  return {
    // Open, or close when it's open and in view; when it's open but its panel is folded, unfold it.
    // Opened, it shows the full list (matches, then your stages), not a match page left open earlier.
    async open() { if (isOpen && !panel.closest(".lg-dock-folded") && !panel.classList.contains("lg-dock-inactive")) return close(); if (isOpen) return show(true); say(""); matches.showList(); await fill(); try { fillLibrary(); } catch (err) { console.error("Stage library:", err); } show(true); panel.querySelector("button")?.focus(); },
    close,
    /** Shown by the dock (its tab clicked): fill it and count as open, without toggling. */
    async ensureOpen() { if (isOpen) return; say(""); matches.showList(); await fill(); try { fillLibrary(); } catch (err) { console.error("Stage library:", err); } show(true); },
    get isOpen() { return isOpen; },
    /** Save and close the open stage (the Stage panel's Close stage). */
    closeStage: () => closeStageHere(),
    /** Bring an open panel up to date (a stage made or closed elsewhere). */
    async refresh() { if (isOpen) await fill(); },
    /** The match you are working in (its page, or a stage opened from it), or null. */
    matchContext: () => (matches.inMatch ? matches.openId : matches.contextId) || null,
    /** New stage in that match: asks its name, adds it to the match, opens it. */
    /** A stage made elsewhere (the empty view's Create new stage) goes into the folder shown. */
    placeNew: (key) => placeNew(key),
    async newStageInMatch() { const id = matches.inMatch ? matches.openId : matches.contextId; if (id) { await matches.newStageIn(id); await fill(); } },
  };
}
