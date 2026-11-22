// Reorder a list by dragging a row's grip (mouse, finger or pen alike: pointer events, not HTML
// drag and drop, which iPads don't do). The row follows the pointer, the rows it passes slide out of
// its way, and onDrop(from, to) gets the move when it is let go. The arrow keys on a focused grip
// move it one place (onDrop(i, i ± 1)), so it works without a pointer too.
import { h, icon } from "./dom.js";

/** A grip button for row `index` of `container` (an element whose children are the rows). */
export function dragGrip({ container, index, label, onDrop }) {
  const grip = h("button", { type: "button", class: "drag-grip", "aria-label": `Move ${label}: drag, or use the arrow keys`, title: "Drag to move" }, [icon("grip")]);
  grip.addEventListener("keydown", (e) => {
    const by = e.key === "ArrowUp" ? -1 : e.key === "ArrowDown" ? 1 : 0;
    if (!by) return;
    e.preventDefault();
    const to = index + by;
    if (to >= 0 && to < container.children.length) onDrop(index, to);
  });
  grip.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    const rows = [...container.children], row = rows[index];
    const boxes = rows.map((r) => r.getBoundingClientRect());
    const step = boxes.length > 1 ? boxes[1].top - boxes[0].top : boxes[0].height;
    const y0 = e.clientY;
    let to = index;
    grip.setPointerCapture?.(e.pointerId);
    row.classList.add("is-dragging");
    const move = (ev) => {
      const dy = ev.clientY - y0;
      row.style.setProperty("transform", `translateY(${dy}px)`);
      const mid = boxes[index].top + boxes[index].height / 2 + dy;
      to = boxes.filter((b, k) => k !== index && b.top + b.height / 2 < mid).length;
      rows.forEach((r, k) => {
        if (k === index) return;
        const shift = index < to && k > index && k <= to ? -step : index > to && k >= to && k < index ? step : 0;
        r.style.setProperty("transform", shift ? `translateY(${shift}px)` : "none");
      });
    };
    const end = () => {
      grip.removeEventListener("pointermove", move);
      grip.removeEventListener("pointerup", end);
      grip.removeEventListener("pointercancel", end);
      for (const r of rows) r.style.removeProperty("transform");
      row.classList.remove("is-dragging");
      if (to !== index) onDrop(index, to);
    };
    grip.addEventListener("pointermove", move);
    grip.addEventListener("pointerup", end);
    grip.addEventListener("pointercancel", end);
  });
  return grip;
}
