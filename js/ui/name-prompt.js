// Ask for a name in a small Låda Glass modal (never the browser's prompt(), which blocks the page):
// resolves with the name typed (model/stage.js stageName), or null when cancelled.
import { h } from "./dom.js";
import { stageName } from "../model/stage.js";

let n = 0;
export function askName({ title = "New stage", label = "Name", value = "", action = "Create" } = {}) {
  return new Promise((resolve) => {
    const id = `name-${++n}`;
    const input = h("input", { class: "lg-input", id, maxlength: "120", value, autocomplete: "off" });
    const error = h("p", { class: "lg-alert lg-alert-bad", role: "alert", hidden: true, text: "Type a name first." });
    let result = null;
    const submit = (e) => {
      e?.preventDefault();
      const name = stageName(input.value);
      if (!name) { error.hidden = false; input.focus(); return; }
      result = name;
      dialog.close();
    };
    const form = h("form", { onsubmit: submit }, [
      h("h2", { class: "lg-modal-title", id: `${id}-title`, text: title }),
      h("div", { class: "lg-modal-body lg-stack" }, [h("div", { class: "lg-field" }, [h("label", { for: id, text: label }), input]), error]),
      h("div", { class: "lg-modal-actions" }, [
        h("button", { type: "button", class: "lg-btn", onclick: () => dialog.close(), text: "Cancel" }),
        h("button", { type: "submit", class: "lg-btn lg-btn-primary", text: action }),
      ]),
    ]);
    const dialog = h("dialog", { class: "lg-modal name-prompt", "aria-labelledby": `${id}-title` }, [form]);
    dialog.addEventListener("close", () => { dialog.remove(); resolve(result); });   // Cancel, Escape or Create
    input.addEventListener("input", () => { error.hidden = true; });
    document.body.append(dialog);
    dialog.showModal();
    input.select();
  });
}
