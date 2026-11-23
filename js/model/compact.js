// A stage made as small as it can be for a view link (storage/share.js) and the QR code on the
// printed brief: short ids (random UUIDs barely compress), no values equal to their defaults, no
// empty labels or briefing fields, no camera. The schema puts the defaults back when it loads, so
// the stage comes back the same (only the ids differ). Pure: no DOM.
import { PROPS } from "./props.js";
import { LOOK_DEFAULTS } from "./look.js";

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function compactStage(stage) {
  const ids = new Map();
  const short = (id) => { if (!ids.has(id)) ids.set(id, ids.size.toString(36)); return ids.get(id); };
  for (const o of stage.objects) short(o.id);
  for (const l of stage.lines) short(l.id);
  for (const g of stage.groups ?? []) short(g.id);

  const objects = stage.objects.map((o) => {
    const spec = PROPS[o.type]?.params ?? {};
    const params = {};
    // A missing paint reads as white (old steel), so paint is always kept.
    for (const [k, v] of Object.entries(o.params ?? {})) if (k === "paint" || !spec[k] || !same(v, spec[k].default)) params[k] = v;
    const { id, label, labelManual, group, activatedBy, ...rest } = o;
    delete rest.params;
    return { ...rest, id: short(id), ...(label != null ? { label } : {}), ...(labelManual ? { labelManual } : {}),
      ...(group ? { group: short(group) } : {}), ...(activatedBy ? { activatedBy: short(activatedBy) } : {}),
      ...(Object.keys(params).length ? { params } : {}) };
  });
  const look = Object.fromEntries(Object.entries(stage.settings.look ?? {}).filter(([k, v]) => !same(v, LOOK_DEFAULTS[k])));
  const briefing = Object.fromEntries(Object.entries(stage.briefing).filter(([, v]) => v !== ""));
  const { groups, ...rest } = stage;
  delete rest.camera;
  return { ...rest, id: "v", objects, lines: stage.lines.map((l) => ({ ...l, id: short(l.id) })),
    settings: { ...stage.settings, look }, briefing,
    ...(groups?.length ? { groups: groups.map((g) => ({ ...g, id: short(g.id) })) } : {}) };
}
