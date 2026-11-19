// The settings panel: surroundings, the default IPSC target style, time of day, light, shadows,
// haze and exposure. It opens in the right-hand panel in place of the inspector (toolbar
// *Settings* toggles it, *Done* or Escape closes it), so the 3D view stays visible and live.
// Sliders apply while dragging; settings are saved with the stage but aren't undo steps.
// The View tab: Shooter's eye walking speed, and how the figures, position marks and route are
// drawn (shown, colour, see-through). The Props tab hides library groups and single props. Both
// are per-browser preferences.
import { h } from "./dom.js";
import { WALK_SPEEDS } from "../model/route.js";
import { RUN_PARTS, RUN_COLORS } from "../model/run-look.js";
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

export function createSettings({ editor, panel, hide = [], onToggle = () => {}, getHidden = () => ({ categories: [], props: [] }), onHidden = () => {}, mine = null,
  getSpeed = () => "quick", onSpeed = () => {}, getRunLook = () => null, onRunLook = () => {} }) {
  const d = (a) => editor.dispatch(a);
  const body = h("div", { class: "settings-body" });
  const lookPane = h("div", { id: "settings-look", role: "tabpanel", "aria-labelledby": "settings-tab-look" }, [
    body,
    h("div", { class: "lg-row settings-actions" }, [
      h("button", { type: "button", class: "lg-btn", onclick: () => { d({ type: "setLook", reset: true }); fill(); }, text: "Reset light to defaults" }),
    ]),
  ]);
  const viewPane = h("div", { id: "settings-view", role: "tabpanel", "aria-labelledby": "settings-tab-view", hidden: true });
  const propsPane = h("div", { id: "settings-props", role: "tabpanel", "aria-labelledby": "settings-tab-props", hidden: true });
  const tabButtons = [["look", "Environment"], ["view", "View"], ["props", "Props"]].map(([id, label]) =>
    h("button", { type: "button", class: "lg-tab", role: "tab", id: `settings-tab-${id}`, "aria-controls": `settings-${id}`, "aria-selected": String(id === "look"),
      onclick: () => selectTab(id), text: label }));
  const tabs = h("div", { class: "lg-tabs settings-tabs", role: "tablist", "aria-label": "Settings" }, tabButtons);
  tabs.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const n = tabButtons.length, step = e.key === "ArrowRight" ? 1 : n - 1;
    const next = tabButtons[(tabButtons.indexOf(document.activeElement) + step) % n];
    next.focus(); next.click();
  });
  function selectTab(id) {
    for (const b of tabButtons) b.setAttribute("aria-selected", String(b.id === `settings-tab-${id}`));
    lookPane.hidden = id !== "look";
    viewPane.hidden = id !== "view";
    propsPane.hidden = id !== "props";
    if (id === "props") fillProps();
    if (id === "view") fillView();
  }

  // View tab: the walking speed, then each part of the shooter's run: show, colour, see-through.
  function fillView() {
    const look = getRunLook();
    const speedSel = h("select", { class: "lg-select", id: "set-walk-speed", onchange: (e) => onSpeed(e.target.value) },
      WALK_SPEEDS.map((s) => h("option", { value: s.id, text: `${s.name} (${s.pace.toFixed(1)} m/s)` })));
    speedSel.value = getSpeed();
    const part = ({ id, name }) => {
      const p = look[id];
      const set = (patch) => { onRunLook(id, patch); fillView(); viewPane.querySelector(`#run-${id}-show`)?.focus(); };
      const show = h("input", { type: "checkbox", class: "lg-toggle", id: `run-${id}-show`, onchange: (e) => set({ show: e.target.checked }) });
      show.checked = p.show;
      const swatches = h("div", { class: "run-swatches", role: "radiogroup", "aria-label": `${name} colour` }, RUN_COLORS.map((c) => {
        const b = h("button", { type: "button", class: "run-swatch", role: "radio", "aria-checked": String(p.color === c.hex), "aria-label": c.name, title: c.name,
          onclick: () => set({ color: c.hex }) });
        b.style.setProperty("--swatch", c.hex);
        return b;
      }));
      const own = h("input", { type: "color", class: "run-color", id: `run-${id}-color`, value: p.color, "aria-label": `${name}: your own colour`, title: "Your own colour",
        onchange: (e) => set({ color: e.target.value }) });
      const out = h("output", { for: `run-${id}-opacity`, class: "lg-mono settings-value", text: `${Math.round(p.opacity * 100)} %` });
      const slider = h("input", { type: "range", class: "lg-slider", id: `run-${id}-opacity`, min: "0.1", max: "1", step: "0.05", value: String(p.opacity), disabled: !p.show,
        oninput: (e) => { const v = Number(e.target.value); out.textContent = `${Math.round(v * 100)} %`; onRunLook(id, { opacity: v }); } });
      return h("fieldset", { class: "vis-group run-part" }, [
        h("legend", { class: "vis-head" }, [h("label", { for: `run-${id}-show`, class: "vis-name", text: `Show ${name.toLowerCase()}` }), show]),
        h("div", { class: "run-colors" }, [swatches, own]),
        h("div", { class: "settings-row" }, [h("label", { for: `run-${id}-opacity`, text: "Opacity" }), slider, out]),
      ]);
    };
    viewPane.replaceChildren(
      h("div", { class: "settings-row" }, [h("label", { for: "set-walk-speed", text: "Shooter's eye walking speed" }), speedSel]),
      h("p", { class: "lg-muted hint-text", text: "How fast Shooter's eye moves between positions when Play is on." }),
      h("h3", { class: "settings-sub", text: "The shooter's run" }),
      ...RUN_PARTS.map(part),
      h("p", { class: "lg-muted hint-text", text: "Figures are the shooter at the start and at each shooting position; marks are the rings with the facing arrow. Kept in this browser, not saved with the stage." }),
    );
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
    ]),
    tabs,
    lookPane,
    viewPane,
    propsPane,
    // Done at the bottom, staying in view while the panel scrolls.
    h("div", { class: "settings-foot" }, [h("button", { type: "button", class: "lg-btn lg-btn-primary", onclick: () => close(), text: "Done" })]),
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
    // Open, or close when it's open and in view; when it's open but its panel is folded, unfold it.
    open() { if (isOpen && !panel.closest(".panel-collapsed")) return close(); if (isOpen) return show(true); fill(); show(true); panel.querySelector("input, button")?.focus(); },
    close,
    get isOpen() { return isOpen; },
  };
}
