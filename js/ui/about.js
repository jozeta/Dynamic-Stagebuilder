// About dialog: name, version (read from package.json), the rulebook the counts come from, licence.
import { h } from "./dom.js";
import { SCORING } from "../model/scoring-rules.js";

export function createAbout() {
  const version = h("p", { class: "lg-about-version", text: "Version …" });
  const dialog = h("dialog", { class: "lg-modal", id: "about", "aria-labelledby": "about-title" }, [
    h("section", { class: "lg-modal-body lg-about" }, [
      h("div", { class: "lg-about-head" }, [h("div", {}, [h("h2", { class: "lg-about-name", id: "about-title", text: "Dynamic-Stagebuilder" }), version])]),
      h("p", { class: "lg-about-text", text: "A 3D stage builder for IPSC practical shooting: lay out a stage at real scale and print the stage briefing." }),
      h("p", { class: "lg-about-text lg-muted", text: `Round counts and points follow the ${SCORING.edition}. Stage type is suggested from the round count; check the rules for the hits-per-position limits.` }),
      h("p", { class: "lg-about-text lg-muted", text: "MIT licence. Uses Three.js (MIT) and the Låda Glass design system." }),
    ]),
    h("div", { class: "lg-modal-actions" }, [h("button", { type: "button", class: "lg-btn lg-btn-primary", autofocus: true, onclick: () => dialog.close(), text: "Close" })]),
  ]);
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  document.body.append(dialog);

  fetch("./package.json").then((r) => r.json()).then((p) => { version.textContent = `Version ${p.version}`; })
    .catch(() => { version.textContent = "Version unknown"; });

  return { open: () => dialog.showModal() };
}
