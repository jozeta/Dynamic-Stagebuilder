// Where you are, for the left panel's breadcrumb: Projects › folders › a match › a stage. Pure: the
// panel turns each crumb into a link (or plain text for the last one, where you are).

/**
 * The crumbs for what is open. `folders` are the folders round it, outermost first; `match` the
 * match you are working in (left out when it doesn't hold the open stage); `stage` the open stage
 * ({ id, name }); `page: "match"` for a match's own page. Each crumb is { kind, id?, text, here }.
 */
export function trail({ folders = [], match = null, stage = null, page = "" } = {}) {
  const out = [{ kind: "home", text: "Projects" }];
  for (const f of folders) out.push({ kind: "folder", id: f.id, text: f.name });
  const inMatch = match && (page === "match" || (stage && match.stageIds.includes(stage.id)));
  if (inMatch) out.push({ kind: "match", id: match.id, text: match.name });
  if (stage && page !== "match") {
    const name = stage.name || "Untitled stage";
    out.push({ kind: "stage", id: stage.id, text: inMatch ? `Stage ${match.stageIds.indexOf(stage.id) + 1}: ${name}` : name });
  }
  return out.map((c, i) => ({ ...c, here: i === out.length - 1 }));
}
