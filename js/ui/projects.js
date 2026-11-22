// The Projects panel (in the left-hand panel, in place of the props): every stage saved in this browser, with open, duplicate, delete, new,
// import and export. Names and file contents are untrusted and only ever shown with textContent.
import { h, icon, rowIcon } from "./dom.js";
import { sortProjects, exportAge } from "../storage/projects.js";
import { parseFile } from "../storage/files.js";
import { STAGE_LIBRARY, LIBRARY_CATEGORIES, librarySummary } from "../model/stage-library.js";
import { createMatches } from "./matches.js";
import { stageInfoButton } from "./stage-info.js";
import { stageDetails } from "../model/match.js";

const when = (t) => new Date(t).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export function createProjects({ panel, docked = false, hide = [], onToggle = () => {}, onOpenLibrary = async () => {}, onCreateFrom = async () => null, onCloseStage = async () => {}, onModeChange = () => {}, store, currentId, onOpen, onDuplicate, onDelete, onImport, onExport,
  onNewStage = async () => null, onApplyBriefing = async () => {}, onPrintMatch = () => {}, onExportMatch = () => {}, onImportMatch = async () => [], onShareLink = async () => ({ ok: false, error: "Not available." }) }) {
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
    await onCloseStage("stage");
    if (inMatch && (await matches.list()).some((x) => x.id === inMatch)) await matches.show(inMatch); else { matches.showList(); matches.leaveMatch(); }
    await fill();
  }
  async function closeMatch() {
    const all = await matches.list(), m = all.find((x) => x.id === (matches.inMatch ? matches.openId : matches.contextId));
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
    onViewChange: (inMatch) => { stagesBox.hidden = inMatch; if (actions) actions.hidden = inMatch; queueMicrotask(() => fillCrumbs()); },
    onChanged: async () => { await fillStages(); },     // stages a match added (example, library) show in the list
  });
  const list = h("div", { class: "proj-list", role: "list" });
  const message = h("div", { class: "proj-message", role: "status", "aria-live": "polite" });
  const file = h("input", { type: "file", accept: ".json,application/json", hidden: true, onchange: () => importFile() });
  // The stage library: ready-made stages and drills, each opened as a new project to edit.
  const libSearch = h("input", { type: "search", placeholder: "Search stages", "aria-label": "Search the stage library", oninput: () => fillLibrary() });
  const libCat = h("select", { class: "lg-select", "aria-label": "Stage category", onchange: () => fillLibrary() },
    [h("option", { value: "", text: "All categories" }), ...LIBRARY_CATEGORIES.map((c) => h("option", { value: c.id, text: c.name }))]);
  const libList = h("div", { class: "lib-stages", role: "list" });
  const summaries = new Map();
  const summaryOf = (spec) => { if (!summaries.has(spec.id)) summaries.set(spec.id, librarySummary(spec)); return summaries.get(spec.id); };
  const libraryBox = h("section", { class: "stage-library", "aria-labelledby": "library-title" }, [
    h("h3", { class: "lg-label stage-library-title", id: "library-title", text: `Stage library (${STAGE_LIBRARY.length})` }),
    h("p", { class: "lg-muted hint-text", text: "Ready-made stages and drills. Open one as a new project, then change anything." }),
    h("div", { class: "lg-search" }, [icon("search"), libSearch]),
    libCat,
    libList,
  ]);
  function fillLibrary() {
    const q = libSearch.value.trim().toLowerCase(), cat = libCat.value;
    const shown = STAGE_LIBRARY.filter((s) => (!cat || s.category === cat) && (!q || `${s.name} ${s.summary} ${s.discipline}`.toLowerCase().includes(q)));
    libList.replaceChildren(...(shown.length ? shown.map((spec) => {
      const catName = LIBRARY_CATEGORIES.find((c) => c.id === spec.category)?.name || spec.category;
      // The name, and on the right an ⓘ (category, rounds and the description on hover) and the open icon.
      return h("div", { class: "lib-stage icon-row", role: "listitem" }, [
        h("span", { class: "proj-name", text: spec.name }),
        h("div", { class: "row-icons" }, [
          rowIcon("open", `Open ${spec.name} as a new project`, async () => { matches.leaveMatch(); await onOpenLibrary(spec); close(); }),
          stageInfoButton(spec.name, () => ({ meta: `${catName} · ${spec.discipline === "both" ? "IPSC and USPSA" : spec.discipline} · ${summaryOf(spec).rounds}`, text: spec.summary })),
        ]),
      ]);
    }) : [h("p", { class: "lg-muted", text: "No stages match. Try another word or category." })]));
  }

  panel.append(
    h("div", { class: "side-head" }, [
      h("h2", { class: "lg-subtitle panel-title", id: "projects-title", text: "Projects" }),
      closeB,
    ]),
    crumbs,
    h("div", { class: "lg-stack proj-body" }, [
      actions = h("div", { class: "proj-actions" }, [
        h("button", { type: "button", class: "lg-btn", onclick: () => matches.create() }, [icon("layers"), "New match"]),
        h("button", { type: "button", class: "lg-btn", onclick: () => file.click() }, [icon("folder"), "Import file…"]),
        h("button", { type: "button", class: "lg-btn", onclick: async () => { await onExport(); await fill(); } }, [icon("doc"), "Export this stage"]),
        h("button", { type: "button", class: "lg-btn", onclick: () => shareLink() }, [icon("link"), "Copy share link"]),
        file,
      ]),
      message,
      matches.box,
      stagesBox,
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

  async function importFile() {
    const f = file.files?.[0];
    file.value = "";
    if (!f) return;
    if (f.size > 20_000_000) return say("The file is too large to be a stage or match file.", "bad");
    const r = parseFile(await f.text());
    if (!r.ok) return say(r.error, "bad");
    if (r.kind === "match") {
      // Every stage becomes a new project, and a new match holds them in the file's order.
      const ids = await onImportMatch(r.stages);
      await matches.adopt(r.name, ids);
      say(`Imported the match "${r.name}" with ${ids.length} stage${ids.length === 1 ? "" : "s"}.`, "ok");
      await fill();
      return;
    }
    await onImport(r.stage);
    say(`Imported "${r.stage.name}" as a new project.`, "ok");
    await fill();
  }

  stagesBox.append(
    h("h3", { class: "lg-label stage-library-title", text: "Stages" }),
    h("p", { class: "lg-muted hint-text", text: "Stages are saved in this browser only. Export a file to keep a copy or move a stage to another device." }),
    list,
    libraryBox,
  );

  // Each part fills on its own: a problem in one (a damaged record) can't leave the others empty.
  async function fill() {
    for (const part of [() => matches.fill(), fillStages, fillCrumbs]) {
      try { await part(); } catch (err) { console.error("Projects panel:", err); }
    }
  }
  // Where you are: Projects › a match (its page) › a stage of it, or Projects › a stage on its own.
  async function fillCrumbs() {
    const all = await matches.list(), cur = currentId();
    const rec = cur ? (await store.list()).find((r) => r.id === cur) : null;
    const stageName = rec?.name || "Untitled stage";
    const page = matches.openId ? all.find((m) => m.id === matches.openId) : null;
    const home = matches.inMatch || matches.contextId ? h("button", { type: "button", class: "crumb-link", onclick: async () => { matches.showList(); matches.leaveMatch(); await fill(); }, text: "Projects" }) : h("span", { text: "Projects" });
    const parts = [home];
    const sep = () => h("span", { class: "crumb-sep", "aria-hidden": "true", text: "›" });
    if (page) {
      parts.push(sep(), h("span", { class: "crumb-here", text: `${page.name} (match)` }));
    } else {
      // A stage in a match only when you came to it through the match (Close match leaves it).
      const m = cur && matches.contextId ? all.find((x) => x.id === matches.contextId && x.stageIds.includes(cur)) : null;
      if (m) parts.push(sep(), h("button", { type: "button", class: "crumb-link", onclick: async () => { await matches.show(m.id); await fill(); }, text: m.name }),
        sep(), h("span", { class: "crumb-here", text: `Stage ${m.stageIds.indexOf(cur) + 1}: ${stageName}` }));
      else if (rec) parts.push(sep(), h("span", { class: "crumb-here", text: `${stageName} (stage)` }));
    }
    crumbs.replaceChildren(...parts);
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
    list.replaceChildren(...records.map((r) => {
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
        r.id === id ? null : rowIcon("open", `Open ${nm}`, async () => { matches.leaveMatch(); await onOpen(r.id); close(); }),
        rowIcon("copy", `Duplicate ${nm}`, async () => { await onDuplicate(r.id); await fill(); }),
        rowIcon("trash", `Delete ${nm}`, () => confirm(), { danger: true }),
        infoB,
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
    async newStageInMatch() { const id = matches.inMatch ? matches.openId : matches.contextId; if (id) { await matches.newStageIn(id); await fill(); } },
  };
}
