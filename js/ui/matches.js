// Matches in the Projects panel: the list of matches, and a match's own page. A match holds one or
// more stages in order (Stage 1, 2, 3…). New match and Edit match open a window (ui/match-editor.js)
// for its name and stages (yours, the example, the library), their order and removal; the page then
// shows the match: open a stage, make a new one in it, print or export it, or close it.
// The stages stay ordinary projects; each one in the match gets its name and number in the briefing.
// Names come from storage and are only ever shown with textContent.
import { h, icon, rowIcon } from "./dom.js";
import { createMatch, addStages, renameMatch, briefingFor, matchSummary, cleanMatch, inOtherMatches, takeFromOthers, draftMoveTo, removeStage } from "../model/match.js";
import { openMatchEditor } from "./match-editor.js";
import { dragGrip } from "./drag-sort.js";
import { sortProjects } from "../storage/projects.js";
import { matchChecks } from "../model/rule-checks.js";
import { checkList } from "./rule-checks.js";

export function createMatches({ store, currentId, inFolder = () => true, rowExtras = () => [], onOpen, onNewStage, onCreateFrom = async () => null, onCloseMatch = null, onApplyBriefing, onPrint, onExport = () => {}, onViewChange = () => {}, onChanged = async () => {} }) {
  const box = h("section", { class: "matches", "aria-labelledby": "matches-title" });
  let openId = null;            // the match whose page is shown, or null for the list
  let contextId = null;         // the match you are working in (its page, or a stage opened from it); null: a stage on its own

  const listMatches = async () => (await store.matches.list()).map(cleanMatch).filter(Boolean).sort((a, b) => b.modified - a.modified);
  const stageRecords = async () => sortProjects(await store.list());
  async function save(m) { await store.matches.put(m); }
  // Every stage in the match carries its name and number.
  async function syncBriefings(m) { for (const id of m.stageIds) await onApplyBriefing(id, briefingFor(m, id)); }
  // A stage that leaves the match drops the match's name (its number stays as it was).
  async function release(m, id) { await onApplyBriefing(id, { matchName: "" }, { onlyIf: m.name }); }

  // New match and Edit match: the window (ui/match-editor.js), then the panel shows the match.
  async function editInWindow(m = null) {
    const records = await stageRecords();
    const byId = new Map(records.map((r) => [r.id, r]));
    const taken = inOtherMatches(await listMatches(), m?.id ?? "");
    const own = records.map((r) => ({ id: r.id, name: r.name, inMatch: taken.get(r.id) }));
    const items = (m?.stageIds ?? []).filter((id) => byId.has(id)).map((id) => ({ key: `own:${id}`, name: byId.get(id).name || "Untitled stage" }));
    const r = await openMatchEditor({ title: m ? "Edit match" : "New match", name: m?.name ?? "", items, own, action: m ? "Save match" : "Create match" });
    if (!r) return;
    // Example and library stages become new projects; your own stages are used as they are.
    const ids = [];
    for (const it of r.items) {
      if (it.key.startsWith("own:")) ids.push(it.key.slice(4));
      else { const id = await onCreateFrom(it.key); if (id) ids.push(id); }
    }
    // A stage taken from another match leaves it (that match closes up its numbers).
    for (const other of takeFromOthers(await listMatches(), m?.id ?? "", ids)) { await save(other); await syncBriefings(other); }
    const base = m ?? createMatch({ name: r.name });
    for (const gone of (m?.stageIds ?? []).filter((id) => !ids.includes(id))) await release(m, gone);   // taken out: drops the match name
    const next = { ...renameMatch(base, r.name), stageIds: [], modified: Date.now() };
    const saved = addStages(next, ids);
    await save(saved);
    await syncBriefings(saved);
    openId = saved.id;
    await fill();
    await onChanged();
  }
  const create = () => editInWindow(null);

  /** A match from a match file: its stages are already saved as projects; open its page. */
  async function adopt(name, ids) {
    const m = addStages(renameMatch(createMatch({ name }), name), ids);
    await save(m);
    await syncBriefings(m);
    openId = m.id;
    await fill();
  }

  const btn = (label, onclick, cls = "lg-btn", ic = null, extra = {}) => h("button", { type: "button", class: cls, onclick, ...extra }, [ic ? icon(ic) : null, label].filter(Boolean));

  async function fillList() {
    const matches = (await listMatches()).filter((m) => inFolder(`match:${m.id}`));      // the folder shown
    const records = await stageRecords();
    const stages = records.map((r) => r.stage);
    const rows = matches.map((m) => {
      const sum = matchSummary(m, stages);
      const row = h("div", { class: "proj-row match-row icon-row", role: "listitem" });
      const normal = () => row.replaceChildren(
        h("div", { class: "proj-info" }, [
          h("span", { class: "proj-name", text: m.name }),
          h("span", { class: "lg-muted proj-meta", text: `${sum.stages} stage${sum.stages === 1 ? "" : "s"} · ${sum.minRounds} rounds · ${sum.maxPoints} points` }),
        ]),
        h("div", { class: "row-icons" }, [
          rowIcon("open", `Open the match ${m.name}`, async () => { openId = m.id; await fill(); }),
          ...rowExtras(row, `match:${m.id}`, m.name, () => normal()),
          rowIcon("trash", `Delete the match ${m.name}`, () => confirm(), { danger: true }),
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
    const current = currentId();
    // Drag a stage by its grip to another place: saved at once, every stage renumbered in its briefing.
    const listEl = h("div", { class: "proj-list", role: "list", "aria-label": "Stages in this match" });
    const drop = async (from, to) => {
      const next = { ...m, stageIds: draftMoveTo(m.stageIds, from, to), modified: Date.now() };
      await save(next); await syncBriefings(next); await fill(); await onChanged();
      box.querySelectorAll(".match-stage .drag-grip")[to]?.focus();
    };
    const stageRows = m.stageIds.map((id, i) => {
      const r = byId.get(id), name = r.name || "Untitled stage";
      const st = matchSummary({ stageIds: [id] }, [r.stage]);
      const row = h("div", { class: `proj-row match-stage icon-row${m.stageIds.length > 1 ? " drag-row" : ""}${id === current ? " is-current" : ""}`, role: "listitem" });
      const normal = () => row.replaceChildren(...[
        m.stageIds.length > 1 ? dragGrip({ container: listEl, index: i, label: name, onDrop: drop }) : null,
        h("span", { class: "match-num", text: String(i + 1), "aria-label": `Stage ${i + 1}` }),
        h("div", { class: "proj-info" }, [
          h("span", { class: "proj-name", text: name }),
          h("span", { class: "lg-muted proj-meta", text: `${id === current ? "Open now · " : ""}${st.minRounds} rounds · ${st.maxPoints} points` }),
        ]),
        h("div", { class: "row-icons" }, [
          id === current ? null : rowIcon("open", `Open ${name}`, () => { contextId = m.id; openId = null; return onOpen(id); }),
          rowIcon("trash", `Remove ${name} from the match`, () => confirm(), { danger: true }),
        ]),
      ].filter(Boolean));
      // Taking a stage out asks first: it leaves the match, not your saved stages.
      const confirm = () => row.replaceChildren(
        h("span", { class: "proj-confirm", text: `Take "${name}" out of "${m.name}"? It stays in your saved stages.` }),
        h("div", { class: "lg-row proj-buttons" }, [
          btn("Remove", async () => { await release(m, id); const next = removeStage(m, id); await save(next); await syncBriefings(next); await fill(); await onChanged(); }, "lg-btn lg-btn-danger"),
          btn("Keep", () => normal()),
        ]));
      normal();
      return row;
    });
    box.replaceChildren(
      h("div", { class: "match-head" }, [btn("Close match", async () => { if (onCloseMatch) return onCloseMatch(); openId = null; contextId = null; await fill(); }, "lg-btn", "chevl", { title: "Leave the match: back to all your projects" })]),
      h("h3", { class: "match-title", text: m.name }),
      h("p", { class: "lg-muted proj-meta", text: `${sum.stages} stage${sum.stages === 1 ? "" : "s"} · ${sum.minRounds} rounds minimum · ${sum.maxPoints} points` }),
      stageRows.length ? (listEl.replaceChildren(...stageRows), listEl)
        : h("p", { class: "lg-muted hint-text", text: "No stages yet. Edit the match to add some, or make a new stage in it." }),
      m.stageIds.length ? h("div", { class: "stats match-checks" }, [checkList(matchChecks(m.stageIds.map((id) => byId.get(id).stage)), { title: "Match checks", note: "Each stage's own checks are in its Rule checks." })]) : null,
      h("div", { class: "proj-actions" }, [
        btn("Edit match…", () => editInWindow(m), "lg-btn lg-btn-primary", "edit", { title: "Name, stages and their order" }),
        // The new stage opens in stage edit mode, inside this match (Close stage comes back here).
        btn("New stage in this match", async () => { await newStageIn(m.id); await fill(); }, "lg-btn", "new"),
        btn("Print the match", () => onPrint(m, m.stageIds.map((id) => byId.get(id).stage)), "lg-btn", "print", { disabled: !m.stageIds.length }),
        btn("Export the match", () => onExport(m, m.stageIds.map((id) => byId.get(id).stage)), "lg-btn", "doc", { disabled: !m.stageIds.length, title: "One file with the match and all its stages" }),
      ]),
      h("p", { class: "lg-muted hint-text", text: "Each stage here gets the match name and its stage number in its briefing. Taking a stage out (or deleting the match) keeps the stage as a project." }),
    );
  }

  async function fill() {
    const m = openId ? (await listMatches()).find((x) => x.id === openId) : null;
    if (m) contextId = m.id;                        // on a match's page you are working in that match
    if (openId && !m) openId = null;
    onViewChange(Boolean(m));
    if (m) await fillMatch(m); else await fillList();
  }

  /** Back to the list of matches (and, in the Projects panel, the stages under it). */
  const showList = () => { openId = null; };
  /** A new stage (named first) at the end of match `id`, opened, with the match as its context. */
  async function newStageIn(id) {
    const m = (await listMatches()).find((x) => x.id === id);
    if (!m) return;
    const sid = await onNewStage();
    if (!sid) return;
    const next = addStages(m, [sid]);
    await save(next); await syncBriefings(next);
    contextId = id;
    openId = null;                                  // the new stage is shown, not the match's page
    await onChanged();
  }
  /** Working on a stage on its own (opened from the stage list, a new stage…): no match around it. */
  const leaveMatch = () => { contextId = null; };
  return { box, fill, create, adopt, showList, leaveMatch, newStageIn, get contextId() { return contextId; }, list: listMatches, get inMatch() { return Boolean(openId); }, get openId() { return openId; },
    /** Show a match's page. */
    async show(id) { openId = id; await fill(); } };
}
