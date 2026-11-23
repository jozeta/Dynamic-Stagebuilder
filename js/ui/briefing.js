// The Written Stage Briefing dialog. Free-text fields commit on change; common fields offer a list
// of usual wordings plus "Custom text…" (model/briefing-options.js). Counted values are shown
// read-only because they come from the stage.
import { h } from "./dom.js";
import { activationText } from "../model/activation.js";
import { stageStats } from "../model/stats.js";
import { targetsText } from "../model/briefing.js";
import { BRIEFING_OPTIONS, choiceFor } from "../model/briefing-options.js";
import { cleanClub, LOGO_MAX } from "../model/club.js";
import { loadClub, saveClub } from "./prefs.js";

// A chosen logo, redrawn on a canvas (at most 600 × 300 px) and kept as PNG, or JPEG if that is too
// large: only the redrawn pixels are stored, never the file itself.
async function logoFromFile(file) {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) throw new Error("Choose a PNG, JPEG or WebP image.");
  if (file.size > 20_000_000) throw new Error("The image is larger than 20 MB.");
  let bmp;
  try { bmp = await createImageBitmap(file); } catch { throw new Error("That file couldn't be read as an image."); }
  const k = Math.min(1, 600 / bmp.width, 300 / bmp.height);
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(bmp.width * k)); c.height = Math.max(1, Math.round(bmp.height * k));
  c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close?.();
  let url = c.toDataURL("image/png");
  if (url.length > LOGO_MAX) url = c.toDataURL("image/jpeg", 0.85);
  if (url.length > LOGO_MAX) throw new Error("The logo is too detailed to keep. Try a simpler or smaller image.");
  return url;
}

const TEXT_FIELDS = [
  ["matchName", "Match name"], ["designer", "Designer"], ["scoring", "Scoring"],
  ["startSignal", "Start signal"], ["startPosition", "Start position"], ["gunCondition", "Gun condition"],
  ["stopTime", "Stop time"],
];

export function createBriefing({ editor }) {
  const d = (a) => editor.dispatch(a);
  const body = h("div", { class: "lg-modal-body briefing-body" });
  const dialog = h("dialog", { class: "lg-modal lg-modal-lg", id: "briefing", "aria-labelledby": "briefing-title" }, [
    h("h2", { class: "lg-modal-title", id: "briefing-title", text: "Written Stage Briefing" }),
    body,
    h("div", { class: "lg-modal-actions" }, [h("button", { type: "button", class: "lg-btn lg-btn-primary", onclick: () => dialog.close(), text: "Done" })]),
  ]);
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  document.body.append(dialog);
  let n = 0;

  const field = (label, control, wide = false) => {
    control.id = `wsb-${++n}`;
    return h("div", { class: `lg-field${wide ? " wsb-wide" : ""}` }, [h("label", { for: control.id, text: label }), control]);
  };

  function fill() {
    const stage = editor.stage();
    const b = stage.briefing;
    const s = stageStats(stage);
    const set = (key, value) => d({ type: "setBriefing", patch: { [key]: value } });
    const text = (key, label) => {
      const input = h("input", { class: "lg-input", value: b[key], maxlength: "4000", onchange: (e) => set(key, e.target.value) });
      if (!BRIEFING_OPTIONS[key]) return field(label, input);
      // A list of common wordings; "Custom text…" shows the text box for your own.
      const { choice, custom } = choiceFor(key, b[key]);
      input.hidden = !custom;
      input.setAttribute("aria-label", `${label}, custom text`);
      input.placeholder = "Type your own wording";
      const list = h("select", { class: "lg-select", onchange: (e) => {
        const v = e.target.value;
        input.hidden = v !== "custom";
        if (v === "custom") { input.value = ""; input.focus(); } else set(key, v);
      } }, [
        h("option", { value: "", text: "Not set" }),
        ...BRIEFING_OPTIONS[key].map((o) => h("option", { value: o, text: o })),
        h("option", { value: "custom", text: "Custom text…" }),
      ]);
      list.value = choice;
      const f = field(label, list);
      f.append(input);
      f.classList.add("wsb-choice");
      return f;
    };
    const area = (key, label) => {
      const ta = h("textarea", { class: "lg-input", maxlength: "4000", rows: "5", onchange: (e) => set(key, e.target.value) }, [b[key]]);
      const f = field(label, ta, true);
      if (BRIEFING_OPTIONS[key]) {
        // Add a common sentence to the text (it stays editable).
        const add = h("select", { class: "lg-select wsb-insert", "aria-label": `Add a common ${label.toLowerCase()} sentence`, onchange: (e) => {
          const v = e.target.value;
          e.target.value = "";
          if (!v) return;
          ta.value = ta.value.trim() ? `${ta.value.trim()}\n${v}` : v;
          set(key, ta.value);
        } }, [h("option", { value: "", text: "Add a common sentence…" }), ...BRIEFING_OPTIONS[key].map((o) => h("option", { value: o, text: o }))]);
        f.insertBefore(add, ta);
      }
      return f;
    };
    const type = h("select", { class: "lg-select", onchange: (e) => d({ type: "setBriefing", patch: { stageType: e.target.value } }) }, [
      h("option", { value: "", text: s.suggestedType ? `Suggested: ${s.suggestedType}` : "Suggested (no targets yet)" }),
      ...["Short", "Medium", "Long"].map((t) => h("option", { value: t, text: t }))]);
    type.value = b.stageType;
    const counted = h("dl", { class: "lg-kv wsb-wide" }, [
      h("dt", { text: "Targets" }), h("dd", { text: targetsText(s) }),
      h("dt", { text: "Minimum rounds" }), h("dd", { class: "lg-num", text: String(s.minRounds) }),
      h("dt", { text: "Maximum points" }), h("dd", { class: "lg-num", text: String(s.maxPoints) }),
      ...(activationText(stage) ? [h("dt", { text: "Activated" }), h("dd", { text: activationText(stage) })] : []),
    ]);
    body.replaceChildren(
      clubFields(),
      h("p", { class: "lg-muted wsb-wide", text: "Targets, rounds and points are counted from the stage." }),
      counted,
      field("Stage name", h("input", { class: "lg-input", value: stage.name, maxlength: "120", onchange: (e) => d({ type: "rename", name: e.target.value }) })),
      field("Stage number", h("input", { class: "lg-input", type: "number", min: "0", max: "999", step: "1", value: String(b.stageNumber),
        onchange: (e) => d({ type: "setBriefing", patch: { stageNumber: e.target.value } }) })),
      field("Stage type", type),
      ...TEXT_FIELDS.map(([k, label]) => text(k, label)),
      area("procedure", "Procedure"),
      area("notes", "Notes"),
    );
  }

  // The club's name and logo: on every printed brief in this browser, not saved in the stage.
  function clubFields() {
    let club = loadClub();
    const note = h("p", { class: "lg-muted hint-text", text: "On every printed brief from this browser (not saved in the stage, its file or share link)." });
    const status = h("p", { class: "hint-text", role: "status" });
    const keep = (next) => { club = cleanClub(next); if (!saveClub(club)) status.textContent = "The browser's storage is full: the club details couldn't be saved."; paint(); };
    const file = h("input", { type: "file", accept: "image/png,image/jpeg,image/webp", hidden: true, onchange: async () => {
      const f = file.files?.[0]; file.value = "";
      if (!f) return;
      try { status.textContent = ""; keep({ ...club, logo: await logoFromFile(f) }); } catch (err) { status.textContent = err.message; }
    } });
    const logoBox = h("div", { class: "lg-row club-logo" });
    const paint = () => logoBox.replaceChildren(...[
      club.logo ? h("img", { class: "club-logo-img", src: club.logo, alt: "Club logo" }) : null,
      h("button", { type: "button", class: "lg-btn", text: club.logo ? "Change logo…" : "Add a logo…", onclick: () => file.click() }),
      club.logo ? h("button", { type: "button", class: "lg-btn lg-btn-ghost", text: "Remove logo", onclick: () => keep({ ...club, logo: null }) }) : null,
    ].filter(Boolean));
    paint();
    const name = h("input", { class: "lg-input", value: club.name, maxlength: "120", placeholder: "e.g. Göteborgs Pistolskytteklubb", onchange: (e) => keep({ ...club, name: e.target.value }) });
    return h("fieldset", { class: "wsb-wide club-fields" }, [
      h("legend", { class: "lg-subtitle", text: "Club" }),
      field("Club name", name),
      h("div", { class: "lg-field" }, [h("span", { class: "club-label", text: "Logo" }), logoBox, file]),
      note, status,
    ]);
  }

  return { open() { fill(); dialog.showModal(); } };
}
