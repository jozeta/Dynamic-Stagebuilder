// Matches in the Projects panel: the list of matches, and a match's own page. A match holds one or
// more stages in order (Stage 1, 2, 3…): add a new stage to it, import stages you already made,
// move them up and down, take one out, open one to edit, rename the match, print all its briefs.
// The stages stay ordinary projects; each one in the match gets its name and number in the briefing.
// Names come from storage and are only ever shown with textContent.
import { h, icon } from "./dom.js";
import { createMatch, addStages, removeStage, moveStage, renameMatch, briefingFor, matchSummary, cleanMatch, inOtherMatches, takeFromOthers } from "../model/match.js";
import { sortProjects } from "../storage/projects.js";
import { STAGE_LIBRARY, LIBRARY_CATEGORIES } from "../model/stage-library.js";

export function createMatches({ store, currentId, onOpen, onNewStage, onCreateFrom = async () => null, onApplyBriefing, onPrint, onExport = () => {}, onViewChange = () => {}, onChanged = async () => {} }) {
  const box = h("section", { class: "matches", "aria-labelledby": "matches-title" });
  let openId = null;            // the match whose page is shown, or null for the list
  let adding = false;           // the "add existing stages" checklist is open

  const listMatches = async () => (await store.matches.list()).map(cleanMatch).filter(Boolean).sort((a, b) => b.modified - a.modified);
  const stageRecords = async () => sortProjects(await store.list());
  async function save(m) { await store.matches.put(m); }
  // Every stage in the match carries its name and number.
  async function syncBriefings(m) { for (const id of m.stageIds) await onApplyBriefing(id, briefingFor(m, id)); }
  // A stage that leaves the match drops the match's name (its number stays as it was).
  async function release(m, id) { await onApplyBriefing(id, { matchName: "" }, { onlyIf: m.name }); }

  async function create() {
    const m = createMatch({ name: "New match" });
    await save(m);
    openId = m.id;
    adding = true;
    await fill();
    box.querySelector(".match-name")?.select();
  }

  /** A match from a match file: its stages are already saved as projects; open its page. */
  async function adopt(name, ids) {
    const m = addStages(renameMatch(createMatch({ name }), name), ids);
    await save(m);
    await syncBriefings(m);
    openId = m.id;
    adding = false;
    await fill();
  }

  const btn = (label, onclick, cls = "lg-btn", ic = null, extra = {}) => h("button", { type: "button", class: cls, onclick, ...extra }, [ic ? icon(ic) : null, label].filter(Boolean));

  async function fillList() {
    const matches = await listMatches();
    const records = await stageRecords();
    const stages = records.map((r) => r.stage);
    const rows = matches.map((m) => {
      const sum = matchSummary(m, stages);
      const row = h("div", { class: "proj-row match-row", role: "listitem" });
      const normal = () => row.replaceChildren(
        h("div", { class: "proj-info" }, [
          h("span", { class: "proj-name", text: m.name }),
          h("span", { class: "lg-muted proj-meta", text: `${sum.stages} stage${sum.stages === 1 ? "" : "s"} · ${sum.minRounds} rounds · ${sum.maxPoints} points` }),
        ]),
        h("div", { class: "lg-row proj-buttons" }, [
          btn("Open", async () => { openId = m.id; adding = false; await fill(); }, "lg-btn lg-btn-primary"),
          btn("Delete", () => confirm(), "lg-btn lg-btn-danger"),
        ]));
      const confirm = () => row.replaceChildren(h("span", { class: "proj-confirm", text: `Delete the match "${m.name}"? Its stages stay as projects.` }),
        h("div", { class: "lg-row proj-buttons" }, [
          btn("Delete", async () => { for (const id of m.stageIds) await release(m, id); await store.matches.remove(m.id); await fill(); await onChanged(); }, "lg-btn lg-btn-danger"),
          btn("Keep", () => normal())]));
      normal();
      return row;
    });
    box.replaceChildren(
      h("h3", { class: "lg-label stage-library-title", id: "matches-title", text: `Matches (${matches.length})` }),
      matches.length ? h("div", { class: "proj-list", role: "list" }, rows)
        : h("p", { class: "lg-muted hint-text", text: "A match is one or more stages, in order. Start one with New match." }),
    );
  }

  // A short note under the match's buttons (e.g. "Tick the stages to add first.").
  let note = null;
  const say = (text) => { note?.remove(); note = text ? h("p", { class: "lg-alert lg-alert-info", role: "status", text }) : null; if (note) box.querySelector(".match-picker")?.after(note); };

  async function fillMatch(m) {
    note = null;
    const records = await stageRecords();
    const byId = new Map(records.map((r) => [r.id, r]));
    // Stages deleted since: dropped from the match.
    if (m.stageIds.some((id) => !byId.has(id))) { m = { ...m, stageIds: m.stageIds.filter((id) => byId.has(id)) }; await save(m); await syncBriefings(m); }
    const sum = matchSummary(m, records.map((r) => r.stage));
    const update = async (next, { sync = true } = {}) => { await save(next); if (sync) await syncBriefings(next); await fill(); await onChanged(); };
    const name = h("input", { class: "lg-input match-name", value: m.name, maxlength: "120", "aria-label": "Match name",
      onchange: (e) => update(renameMatch(m, e.target.value)) });
    const current = currentId();
    const stageRows = m.stageIds.map((id, i) => {
      const r = byId.get(id);
      const st = matchSummary({ stageIds: [id] }, [r.stage]);
      return h("div", { class: `proj-row match-stage${id === current ? " is-current" : ""}`, role: "listitem" }, [
        h("span", { class: "match-num", text: String(i + 1), "aria-label": `Stage ${i + 1}` }),
        h("div", { class: "proj-info" }, [
          h("span", { class: "proj-name", text: r.name || "Untitled stage" }),
          h("span", { class: "lg-muted proj-meta", text: `${id === current ? "Open now · " : ""}${st.minRounds} rounds · ${st.maxPoints} points` }),
        ]),
        h("div", { class: "lg-row proj-buttons" }, [
          id === current ? null : btn("Open", () => onOpen(id), "lg-btn lg-btn-primary"),
          btn("", () => update(moveStage(m, id, -1)), "lg-btn lg-btn-icon", "chevu", { "aria-label": `Move ${r.name} up`, title: "Move up", disabled: i === 0 }),
          btn("", () => update(moveStage(m, id, 1)), "lg-btn lg-btn-icon", "chevd", { "aria-label": `Move ${r.name} down`, title: "Move down", disabled: i === m.stageIds.length - 1 }),
          btn("Remove", async () => { await release(m, id); await update(removeStage(m, id)); }, "lg-btn", null, { title: "Take it out of the match (the stage stays)" }),
        ].filter(Boolean)),
      ]);
    });
    // Import stages already made: a checklist of the projects not in the match.
    let picker = null;
    if (adding) {
      const others = records.filter((r) => !m.stageIds.includes(r.id));
      // A stage belongs to one match (its briefing carries that match's name and number): one that is
      // in another match can still be picked, and moves from that match to this one.
      const all = await listMatches();
      const taken = inOtherMatches(all, m.id);
      const checks = others.map((r) => {
        const inMatch = taken.get(r.id);
        const cb = h("input", { type: "checkbox", value: r.id, id: `add-${r.id}` });
        return h("label", { class: "vis-item", for: `add-${r.id}` }, [cb,
          h("span", { text: r.name || "Untitled stage" }), inMatch ? h("span", { class: "lg-muted proj-meta", text: ` · moves it from ${inMatch}` }) : null]);
      });
      // Ready-made stages: the example stage and the stage library, each saved as a new project when added.
      const ready = [{ key: "demo", name: "Example stage (a new copy)", meta: "The example shown on first open", text: "Example stage" },
        ...STAGE_LIBRARY.map((s) => ({ key: `lib:${s.id}`, name: s.name, meta: LIBRARY_CATEGORIES.find((c) => c.id === s.category)?.name || "", text: `${s.name} ${s.summary || ""}` }))];
      const readyList = h("div", { class: "vis-items match-ready" });
      const picked = new Set();
      const fillReady = (q = "") => {
        const words = q.trim().toLowerCase();
        const shown = ready.filter((r) => !words || `${r.text || r.name} ${r.meta}`.toLowerCase().includes(words));
        readyList.replaceChildren(...(shown.length ? shown.map((r) => {
          const id = `add-${r.key.replace(/[^a-z0-9-]/gi, "-")}`;
          const cb = h("input", { type: "checkbox", value: r.key, id, onchange: (e) => (e.target.checked ? picked.add(r.key) : picked.delete(r.key)) });
          cb.checked = picked.has(r.key);
          return h("label", { class: "vis-item", for: id }, [cb, h("span", { text: r.name }), h("span", { class: "lg-muted proj-meta", text: ` · ${r.meta}` })]);
        }) : [h("p", { class: "lg-muted hint-text", text: "No ready-made stage matches. Try another word." })]));
      };
      fillReady();
      const readySearch = h("input", { type: "search", class: "lg-input", placeholder: "Search the stage library", "aria-label": "Search the example and library stages", oninput: (e) => fillReady(e.target.value) });
      picker = h("fieldset", { class: "vis-group match-picker" }, [
        h("legend", { class: "vis-head" }, [h("span", { class: "vis-name", text: "Add stages" })]),
        h("span", { class: "lg-label", text: "Your stages" }),
        h("div", { class: "vis-items match-own" }, checks.length ? checks : [h("p", { class: "lg-muted hint-text", text: "Every stage you made is in this match already." })]),
        h("span", { class: "lg-label", text: "Example and stage library (added as new projects)" }),
        readySearch,
        readyList,
        h("div", { class: "lg-row" }, [
          btn("Add selected", async () => {
            const ids = [...picker.querySelectorAll(".match-own input:checked")].map((c) => c.value);
            if (!ids.length && !picked.size) return say("Tick the stages to add first.");
            // Ready-made ones are saved as new projects first (in the order they are listed).
            for (const r of ready) if (picked.has(r.key)) { const id = await onCreateFrom(r.key); if (id) ids.push(id); }
            // Stages taken from another match leave it, and that match's stages are numbered again.
            for (const other of takeFromOthers(await listMatches(), m.id, ids)) { await save(other); await syncBriefings(other); }
            adding = false;
            await update(addStages(m, ids));
          }, "lg-btn lg-btn-primary"),
          btn("Cancel", async () => { adding = false; await fill(); }),
        ]),
      ]);
    }
    box.replaceChildren(...[
      h("div", { class: "match-head" }, [
        btn("All projects", async () => { openId = null; adding = false; await fill(); }, "lg-btn lg-btn-ghost", "chevl"),
      ]),
      h("label", { class: "lg-label", for: "match-name-input", text: "Match" }),
      Object.assign(name, { id: "match-name-input" }),
      h("p", { class: "lg-muted proj-meta", text: `${sum.stages} stage${sum.stages === 1 ? "" : "s"} · ${sum.minRounds} rounds minimum · ${sum.maxPoints} points` }),
      h("div", { class: "proj-list", role: "list", "aria-label": "Stages in this match" }, stageRows.length ? stageRows
        : [h("p", { class: "lg-muted hint-text", text: "No stages yet. Add a new one, or add stages: yours, the example or ones from the stage library." })]),
      h("div", { class: "proj-actions" }, [
        btn("New stage in this match", async () => { const id = await onNewStage(); if (id) await update(addStages(m, [id])); }, "lg-btn", "new"),
        btn("Add stages…", async () => { adding = true; await fill(); }, "lg-btn", "folder", { "aria-expanded": String(adding) }),
        btn("Print the match", () => onPrint(m, m.stageIds.map((id) => byId.get(id).stage)), "lg-btn", "print", { disabled: !m.stageIds.length }),
        btn("Export the match", () => onExport(m, m.stageIds.map((id) => byId.get(id).stage)), "lg-btn", "doc", { disabled: !m.stageIds.length, title: "One file with the match and all its stages" }),
      ]),
      picker,
      note,
      h("p", { class: "lg-muted hint-text", text: "Each stage here gets the match name and its stage number in its briefing. Taking a stage out (or deleting the match) keeps the stage as a project." }),
    ].filter(Boolean));
  }

  async function fill() {
    const m = openId ? (await listMatches()).find((x) => x.id === openId) : null;
    if (openId && !m) openId = null;
    onViewChange(Boolean(m));
    if (m) await fillMatch(m); else await fillList();
  }

  /** Back to the list of matches (and, in the Projects panel, the stages under it). */
  const showList = () => { openId = null; adding = false; };
  return { box, fill, create, adopt, showList, get inMatch() { return Boolean(openId); } };
}
