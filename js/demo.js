// The example stage saved as the first project: walls joined end to end, black and blue mesh in
// pine frames, targets on stands, poppers and plates, barrels, plants and a winding fault line.
import { createStage, addObject, addLine, setStart } from "./model/stage.js";
import { assignLabels } from "./model/numbering.js";

// The centre of a wall of `length` at `deg` that starts at the point `from`.
const from = ([x, z], deg, length) => {
  const t = (deg * Math.PI) / 180;
  return [x + (length / 2) * Math.cos(t), z + (length / 2) * Math.sin(t)];
};

export function demoStage() {
  let s = createStage({ name: "Example stage" });
  const add = (t, p, r = 0, params = {}) => { s = addObject(s, t, p, r, params).stage; };

  // Left bay: an L of black mesh with a blue return.
  add("wall-mesh", from([-7, 8], 0, 2), 0, { length: 2 });
  add("wall-solid", from([-5, 8], 0, 1.5), 0, { length: 1.5 });
  add("wall-mesh", from([-3.5, 8], 90, 2), 90, { length: 2 });
  // Centre: a mesh wall with a port between two mesh walls.
  add("wall-mesh", from([-1.5, 6.5], 0, 1.5), 0, { length: 1.5 });
  add("wall-mesh", from([0, 6.5], 0, 2), 0, { variant: "port", length: 2 });
  add("wall-mesh", from([2, 6.5], 0, 2), 0, { length: 2 });
  // Right: a V of mesh walls with a barrel and target inside.
  add("wall-mesh", from([4.5, 11], 45, 2), 45, { length: 2 });
  add("wall-mesh", from([4.5 + Math.SQRT2, 11 + Math.SQRT2], 135, 2), 135, { length: 2 });
  add("wall-wood", [-0.5, 12.5], 0, { length: 1.2, height: 1.2 });

  // Targets on stands behind the walls.
  // Classic octagon targets, and two with a head, so both IPSC versions show.
  for (const [p, r, style] of [[[-6.4, 11], 0], [[-5, 11.6], 10], [[-2.4, 14.5], 0, "head"], [[0.9, 15.4], -10, "head"], [[3.4, 16.2], 0], [[7.2, 15.6], -20]]) {
    add("paper-ipsc", p, r, style ? { style } : {});
  }
  add("paper-ipsc", [-1.6, 14.7], 0, { layout: "single", card1: "noshoot" });
  add("barrel", [5.3, 12.6]);
  add("paper-mini", [5.3, 12.05], 0, { mountHeight: 0.95 });
  add("popper", [-7.6, 14.6]);
  add("popper", [-7, 14.8], 0, { paint: "white" });
  add("popper", [-6.4, 14.6], 0, { kind: "mini" });
  add("plate-round", [8.2, 18]);
  add("plate-square", [8.8, 18]);
  add("plant-palm", [2.6, 8.2]);
  add("plant-palm", [8.6, 10.4]);
  add("tyre", [-2.8, 10.2], 0, { count: 3 });
  // 2/3-gun furniture: a car to shoot over, a ramp, a staging table, sandbags, pallets, cones.
  add("car", [-6.5, 19.5], 15, { color: "rust" });
  add("ramp", [6.6, 7.4], 90, { length: 2.4, width: 1, height: 0.4 });
  add("table", [-5.8, 1.6], 0, { length: 1.2 });
  add("sandbags", [1.2, 11.2], 0, { length: 1.8, rows: 3 });
  add("pallet", [-8.3, 10.6], 30, { count: 3 });
  add("wall-mesh", from([-3.5, 10], 90, 1.5), 90, { variant: "doorway", length: 1.5, height: 2.2 });
  add("barrel", [3.6, 18.6], 0, { color: "blue" });
  add("barrel", [4.2, 18.9], 0, { color: "red" });
  add("cone", [-8.8, 3.4]);
  add("cone", [8.2, 3.9]);
  add("crate", [-4.5, 17.2], 20);

  s = addLine(s, "fault-line", [[-8.5, 3], [-3.5, 3], [-2.5, 5.2], [1.5, 5.2], [3.2, 3.6], [7.5, 3.6]], false).stage;
  s = addLine(s, "shooting-area", [[-2, 0.5], [2, 0.5], [2, 2.5], [-2, 2.5]], true).stage;
  s = setStart(s, [0, 1.5], 0);
  return assignLabels(s);
}
