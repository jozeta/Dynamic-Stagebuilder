// The example stage shown on first open (until saved projects arrive in a later version).
import { createStage, addObject, addLine, setStart } from "./model/stage.js";
import { assignLabels } from "./model/numbering.js";

export function demoStage() {
  let s = createStage({ name: "Example stage" });
  const add = (t, x, z, r = 0, p = {}) => { s = addObject(s, t, [x, z], r, p).stage; };
  add("wall-mesh", -3, 7, 0, { length: 3 });
  add("wall-mesh", -4.5, 8.5, 90, { length: 3 });
  add("wall-port", 2, 7, 0, { length: 2.4 });
  add("wall-mesh", 4.25, 8.25, 60, { length: 2.5, mesh: "blue", frame: "wood" });
  add("wall-wood", 0, 12, 0, { length: 2, height: 1.8 });
  for (let i = 0; i < 3; i++) add("paper-ipsc", -6.5 + i * 1, 12, 0);
  add("noshoot", -4.5, 12.4);
  add("paper-ipsc", 1.75, 14, 15);
  add("paper-mini", 3, 15, -15);
  add("popper", 6, 14);
  add("mini-popper", 7, 14);
  add("plate-round", -1, 16);
  add("plate-square", -0.25, 16);
  add("barrel", 0, 9.5);
  add("barrel", 0.6, 9.8);
  add("tyre-stack", -6.5, 9, 0, { count: 4 });
  add("crate", 6, 10, 20);
  s = addLine(s, "fault-line", [[-8, 3], [-3, 3], [-1, 5], [4, 5], [7, 2]], false).stage;
  s = addLine(s, "shooting-area", [[-2, 0.5], [2, 0.5], [2, 2.5], [-2, 2.5]], true).stage;
  s = setStart(s, [0, 1.5], 0);
  return assignLabels(s);
}
