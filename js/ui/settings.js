// The settings panel: surroundings, the default IPSC target style, time of day, light, shadows,
// haze and exposure. It opens in the right-hand panel in place of the inspector (toolbar
// *Settings* toggles it, *Done* or Escape closes it), so the 3D view stays visible and live.
// Sliders apply while dragging; settings are saved with the stage but aren't undo steps.
// The Props tab hides library groups and single props (a per-browser preference).
import { h } from "./dom.js";
import { LIBRARY_GROUPS, MARKINGS, isShown, setShown } from "../model/visibility.js";
import { PROPS } from "../model/props.js";
import { GROUNDS } from "../model/look.js";
import { customId, customEnv, BUILDING_TYPES } from "../model/surroundings.js";
import { ENVIRONMENT_NAMES, ENVIRONMENT_LABELS } from "../render/environments/index.js";

const SLIDERS = [
  ["hour", "Time of day", 6, 20, 0.25, (v) => `${String(Math.floor(v)).padStart(2, "0")}:${String(Math.round((v % 1) * 60)).padStart(2, "0")}`],
  ["sun", "Sunlight", 0, 2, 0.05, (v) => `${Math.round(v * 100)} %`],
  ["ambient", "Ambient light", 0, 2, 0.05, (v) => `${Math.round(v * 100)} %`],
  ["softness", "Shadow softness", 0, 8, 0.5, (v) => (v ? `${v}` : "Sharp")],
  ["shadowStrength", "Shadow strength", 0, 1, 0.05, (v) => `${Math.round(v * 100)} %`],
  ["haze", "Haze", 0, 1, 0.05, (v) => (v ? `${Math.round(v * 100)} %` : "Clear")],
  ["exposure", "Exposure", 0.5, 1.6, 0.05, (v) => v.toFixed(2)],
];

export function createSettings({ editor, panel, hide = [], onToggle = () => {}, getHidden = () => ({ categories: [], props: [] }), onHidden = () => {}, mine = null }) {
  const d = (a) => editor.dispatch(a);
  const body = h("div", { class: "settings-body" });
  const lookPane = h("div", { id: "settings-look", role: "tabpanel", "aria-labelledby": "settings-tab-look" }, [
    body,
    h("div", { class: "lg-row settings-actions" }, [
      h("button", { type: "button", class: "lg-btn", onclick: () => { d({ type: "setLook", reset: true }); fill(); }, text: "Reset light to defaults" }),
    ]),
  ]);
  const propsPane = h("div", { id: "settings-props", role: "tabpanel", "aria-labelledby": "settings-tab-props", hidden: true });
  const tabButtons = [["look", "Light and view"], ["props", "Props"]].map(([id, label]) =>
    h("button", { type: "button", class: "lg-tab", role: "tab", id: `settings-tab-${id}`, "aria-controls": `settings-${id}`, "aria-selected": String(id === "look"),
      onclick: () => selectTab(id), text: label }));
  const tabs = h("div", { class: "lg-tabs settings-tabs", role: "tablist", "aria-label": "Settings" }, tabButtons);
  tabs.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const next = tabButtons[(tabButtons.indexOf(document.activeElement) + 1) % 2];
    next.focus(); next.click();
  });
  function selectTab(id) {
    for (const b of tabButtons) b.setAttribute("aria-selected", String(b.id === `settings-tab-${id}`));
    lookPane.hidden = id !== "look";
    propsPane.hidden = id !== "props";
    if (id === "props") fillProps();
  }

  // Props tab: a switch per group, a checkbox per prop. Hidden props stay on stages that use them.
  const names = { ...Object.fromEntries(MARKINGS.map((m) => [m.id, m.name])), ...Object.fromEntries(Object.values(PROPS).map((p) => [p.type, p.name])) };
  function fillProps() {
    const hidden = getHidden();
    const set = (kind, id, shown) => { onHidden(setShown(getHidden(), kind, id, shown)); fillProps(); };
    propsPane.replaceChildren(
      h("p", { class: "lg-muted hint-text", text: "Choose what the props panel lists. Hiding a prop doesn't remove it from stages." }),
      ...LIBRARY_GROUPS.map((g) => {
        const groupOn = isShown(hidden, g.id);
        const sw = h("input", { type: "checkbox", class: "lg-toggle", id: `vis-${g.id}`, onchange: (e) => set("category", g.id, e.target.checked) });
        sw.checked = groupOn;
        return h("fieldset", { class: "vis-group" }, [
          h("legend", { class: "vis-head" }, [h("label", { for: `vis-${g.id}`, class: "vis-name", text: g.name }), sw]),
          h("div", { class: "vis-items" }, g.items.map((id) => {
            const box = h("input", { type: "checkbox", id: `vis-item-${id}`, disabled: !groupOn, onchange: (e) => set("prop", id, e.target.checked) });
            box.checked = !hidden.props.includes(id);
            return h("label", { class: "vis-item", for: `vis-item-${id}` }, [box, h("span", { text: names[id] || id })]);
          })),
        ]);
      }),
      h("div", { class: "lg-row settings-actions" }, [h("button", { type: "button", class: "lg-btn", text: "Show everything",
        onclick: () => { onHidden({ categories: [], props: [] }); fillProps(); } })]),
    );
  }
  panel.append(
    h("div", { class: "settings-head" }, [
      h("h2", { class: "lg-subtitle panel-title", id: "settings-title", text: "Settings" }),
      h("button", { type: "button", class: "lg-btn lg-btn-primary", onclick: () => close(), text: "Done" }),
    ]),
    tabs,
    lookPane,
    propsPane,
  );
  panel.setAttribute("aria-labelledby", "settings-title");
  panel.hidden = true;
  let isOpen = false;
  function show(open) {
    isOpen = open;
    panel.hidden = !open;
    for (const el of hide) el.hidden = open;
    onToggle(open);
  }
  function close() { show(false); }
  panel.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.stopPropagation(); close(); } });

  function fill() {
    const st = editor.stage().settings;
    const look = st.look;
    const env = h("div", { class: "lg-segmented", role: "radiogroup", "aria-label": "Surroundings" });
    for (const name of ENVIRONMENT_NAMES) {
      const id = `set-env-${name}`;
      const input = h("input", { type: "radio", name: "set-env", id, value: name, onchange: () => { d({ type: "setEnvironment", name }); fill(); } });
      input.checked = st.environment === name;
      env.append(input, h("label", { for: id, text: ENVIRONMENT_LABELS[name] }));
    }
    // Your own surroundings: pick one, make one from a plan, line up the plan, keep the building pieces.
    const myRows = [];
    if (mine) {
      const curId = customId(st.environment);
      const pick = h("select", { class: "lg-select", id: "set-mine", onchange: (e) => { if (e.target.value) d({ type: "setEnvironment", name: e.target.value }); fill(); } }, [
        h("option", { value: "", text: mine.list().length ? "Choose…" : "None yet" }),
        ...mine.list().map((t) => h("option", { value: customEnv(t.id), text: t.name })),
      ]);
      pick.value = curId ? customEnv(curId) : "";
      myRows.push(h("div", { class: "settings-row" }, [h("label", { for: "set-mine", text: "My surroundings" }), pick]),
        h("div", { class: "lg-row settings-actions" }, [h("button", { type: "button", class: "lg-btn", onclick: async () => {
          const id = await mine.newFromPlan();
          if (id) d({ type: "setEnvironment", name: customEnv(id) });
          fill();
        } }, ["New from a plan…"])]));
      const t = curId && mine.get(curId);
      if (curId && !t) myRows.push(h("p", { class: "lg-alert lg-alert-warn", text: "These surroundings aren't saved in this browser (the stage came from another device). Make them again from the plan here." }));
      if (t) {
        const onStage = editor.stage().objects.filter((o) => BUILDING_TYPES.includes(o.type)).length;
        const nameIn = h("input", { class: "lg-input", id: "set-mine-name", maxlength: "60", value: t.name, onchange: async (e) => { await mine.update(t.id, { name: e.target.value }); fill(); } });
        myRows.push(h("div", { class: "settings-row" }, [h("label", { for: "set-mine-name", text: "Name" }), nameIn]));
        if (t.plan) {
          const plan = (key, label, min, max, step, show) => {
            const id = `set-plan-${key}`;
            const out = h("output", { for: id, class: "lg-mono settings-value", text: show(t.plan[key]) });
            const input = h("input", { type: "range", class: "lg-slider", id, min, max, step, value: String(t.plan[key]),
              oninput: (e) => { out.textContent = show(Number(e.target.value)); },
              onchange: (e) => mine.update(t.id, { plan: { [key]: Number(e.target.value) } }) });
            return h("div", { class: "settings-row" }, [h("label", { for: id, text: label }), input, out]);
          };
          myRows.push(
            plan("x", "Plan across", -100, 100, 0.1, (v) => `${v.toFixed(1)} m`),
            plan("z", "Plan down range", -100, 150, 0.1, (v) => `${v.toFixed(1)} m`),
            plan("rotation", "Plan turn", -180, 180, 1, (v) => `${Math.round(v)}°`),
            plan("opacity", "Plan strength", 0.1, 1, 0.05, (v) => `${Math.round(v * 100)} %`),
            h("p", { class: "lg-muted hint-text", text: `Scale: 1 pixel = ${(t.plan.metresPerPixel * 100).toFixed(2)} cm.` }));
        }
        // Deleting asks once more on the same button (no pop-up).
        const del = h("button", { type: "button", class: "lg-btn lg-btn-danger", onclick: async () => {
          if (!del.dataset.sure) { del.dataset.sure = "1"; del.textContent = "Delete for good? Tap again"; return; }
          await mine.remove(t.id); d({ type: "setEnvironment", name: "technical" }); fill();
        } }, ["Delete these surroundings"]);
        myRows.push(
          h("p", { class: "lg-muted hint-text", text: `Building pieces: ${t.pieces.length} in these surroundings, ${onStage} on the stage. Place walls, pillars and more from the Buildings group in the props panel, then save them here.` }),
          h("div", { class: "lg-row settings-actions mine-actions" }, [
            h("button", { type: "button", class: "lg-btn lg-btn-primary", disabled: !onStage, onclick: async () => { await mine.savePieces(t.id); fill(); } }, [`Save ${onStage} piece${onStage === 1 ? "" : "s"} to these surroundings`]),
            h("button", { type: "button", class: "lg-btn", disabled: !t.pieces.length, onclick: async () => { await mine.editPieces(t.id); fill(); } }, ["Edit the pieces on the stage"]),
            del,
          ]));
      }
    }
    const rows = SLIDERS.map(([key, label, min, max, step, show]) => {
      const id = `set-${key}`;
      const off = key === "haze" && st.environment !== "outdoor";     // haze is for the Outdoor range only
      const out = h("output", { for: id, class: "lg-mono settings-value", text: show(look[key]) });
      const input = h("input", { type: "range", class: "lg-slider", id, min, max, step, value: String(look[key]), disabled: off,
        title: off ? "Haze applies to the Outdoor surroundings" : null,
        oninput: (e) => { const v = Number(e.target.value); out.textContent = show(v); d({ type: "setLook", patch: { [key]: v } }); } });
      return h("div", { class: "settings-row" }, [h("label", { for: id, text: label }), input, out]);
    });
    const shadows = h("input", { type: "checkbox", class: "lg-toggle", id: "set-shadows", onchange: (e) => d({ type: "setLook", patch: { shadows: e.target.checked } }) });
    shadows.checked = look.shadows;
    // Default style for new IPSC paper targets (each target can still be switched in its properties).
    const ts = h("div", { class: "lg-segmented", role: "radiogroup", "aria-label": "Default target style" });
    for (const [value, label] of [["classic", "Classic (octagon)"], ["head", "With head"]]) {
      const id = `set-ts-${value}`;
      const input = h("input", { type: "radio", name: "set-ts", id, value, onchange: () => d({ type: "setSetting", key: "targetStyle", value }) });
      input.checked = (st.targetStyle || "classic") === value;
      ts.append(input, h("label", { for: id, text: label }));
    }
    // The Outdoor range floor (the other surroundings have their own fixed floor).
    const groundSel = h("select", { class: "lg-select", id: "set-ground", onchange: (e) => d({ type: "setLook", patch: { ground: e.target.value } }) },
      GROUNDS.map((g) => h("option", { value: g.id, text: g.name })));
    groundSel.value = look.ground || "sand";
    body.replaceChildren(...[
      h("div", { class: "settings-row" }, [h("span", { class: "settings-label", text: "Surroundings" }), env]),
      st.environment === "outdoor" ? h("div", { class: "settings-row" }, [h("label", { for: "set-ground", text: "Ground" }), groundSel]) : null,
      ...myRows,
      h("div", { class: "settings-row" }, [h("span", { class: "settings-label", text: "Default target style" }), ts]),
      ...rows.slice(0, 3),
      h("div", { class: "settings-row" }, [h("label", { for: "set-shadows", text: "Shadows" }), shadows]),
      ...rows.slice(3),
      h("p", { class: "lg-muted", text: "Saved with this stage and used for the printed 3D view. Changing these is not an undo step." }),
    ].filter(Boolean));
  }

  return {
    open() { if (isOpen) return close(); fill(); show(true); panel.querySelector("input, button")?.focus(); },
    close,
    get isOpen() { return isOpen; },
  };
}
