// Matches in the Projects panel: the list of matches, and a match's own page. A match holds one or
// more stages in order (Stage 1, 2, 3…): add a new stage to it, import stages you already made,
// move them up and down, take one out, open one to edit, rename the match, print all its briefs.
// The stages stay ordinary projects; each one in the match gets its name and number in the briefing.
// Names come from storage and are only ever shown with textContent.
import { h, icon } from "./dom.js";
import { createMatch, addStages, removeStage, moveStage, renameMatch, briefingFor, matchSummary, cleanMatch } from "../model/match.js";
import { sortProjects } from "../storage/projects.js";

export function createMatches({ store, currentId, onOpen, onNewStage, onApplyBriefing, onPrint, onViewChange = () => {}, onChanged = async () => {} }) {
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

  async function fillMatch(m) {
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
      const checks = others.map((r) => {
        const cb = h("input", { type: "checkbox", value: r.id, id: `add-${r.id}` });
        return h("label", { class: "vis-item", for: `add-${r.id}` }, [cb, h("span", { text: r.name || "Untitled stage" })]);
      });
      picker = h("fieldset", { class: "vis-group match-picker" }, [
        h("legend", { class: "vis-head" }, [h("span", { class: "vis-name", text: "Add stages you already made" })]),
        h("div", { class: "vis-items" }, checks.length ? checks : [h("p", { class: "lg-muted hint-text", text: "Every stage is in this match already." })]),
        h("div", { class: "lg-row" }, [
          btn("Add selected", async () => {
            const ids = [...picker.querySelectorAll("input:checked")].map((c) => c.value);
            adding = false;
            await update(addStages(m, ids));
          }, "lg-btn lg-btn-primary", null, { disabled: !checks.length }),
          btn("Cancel", async () => { adding = false; await fill(); }),
        ]),
      ]);
    }
    box.replaceChildren(
      h("div", { class: "match-head" }, [
        btn("All projects", async () => { openId = null; adding = false; await fill(); }, "lg-btn lg-btn-ghost", "chevl"),
      ]),
      h("label", { class: "lg-label", for: "match-name-input", text: "Match" }),
      Object.assign(name, { id: "match-name-input" }),
      h("p", { class: "lg-muted proj-meta", text: `${sum.stages} stage${sum.stages === 1 ? "" : "s"} · ${sum.minRounds} rounds minimum · ${sum.maxPoints} points` }),
      h("div", { class: "proj-list", role: "list", "aria-label": "Stages in this match" }, stageRows.length ? stageRows
        : [h("p", { class: "lg-muted hint-text", text: "No stages yet. Add a new one, or add stages you already made." })]),
      h("div", { class: "proj-actions" }, [
        btn("New stage in this match", async () => { const id = await onNewStage(); if (id) await update(addStages(m, [id])); }, "lg-btn", "new"),
        btn("Add stages you made…", async () => { adding = true; await fill(); }, "lg-btn", "folder", { "aria-expanded": String(adding) }),
        btn("Print the match", () => onPrint(m, m.stageIds.map((id) => byId.get(id).stage)), "lg-btn", "print", { disabled: !m.stageIds.length }),
      ]),
      picker,
      h("p", { class: "lg-muted hint-text", text: "Each stage here gets the match name and its stage number in its briefing. Taking a stage out (or deleting the match) keeps the stage as a project." }),
    );
  }

  async function fill() {
    const m = openId ? (await listMatches()).find((x) => x.id === openId) : null;
    if (openId && !m) openId = null;
    onViewChange(Boolean(m));
    if (m) await fillMatch(m); else await fillList();
  }

  return { box, fill, create, get inMatch() { return Boolean(openId); } };
}
