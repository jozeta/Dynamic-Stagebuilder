// Boot: create the 3D engine and show a demo stage (temporary until the editor UI lands).
import { createEngine } from "./render/engine.js";
import { createStageView } from "./render/stage-view.js";
import { createStage, addObject, addLine, setStart } from "./model/stage.js";
import { assignLabels } from "./model/numbering.js";

const canvas = document.getElementById("viewport");
const engine = createEngine(canvas);
const view = createStageView(engine.groups.stage);

let s = createStage();
const add = (t, x, z, r = 0, p = {}) => { s = addObject(s, t, [x, z], r, p).stage; };
add("wall-mesh", -4, 8, 0, { length: 3 });
add("wall-mesh", -2.5, 9.5, 90, { length: 3, mesh: "blue", frame: "wood" });
add("wall-port", 2, 8, 0, { length: 2.4 });
add("wall-wood", 5, 10, 60);
for (let i = 0; i < 4; i++) add("paper-ipsc", -6 + i * 1.2, 14, 0);
add("noshoot", -1, 14.3);
add("paper-mini", 3, 15);
add("popper", 6, 16);
add("mini-popper", 7, 16);
add("plate-round", 0.5, 18);
add("plate-square", 1.3, 18);
add("barrel", 0, 11);
add("tyre-stack", -6, 10, 0, { count: 4 });
add("tyre", -5.2, 10.6);
add("crate", 7, 9, 20);
s = addLine(s, "fault-line", [[-7, 4], [-3, 4], [-1, 6], [4, 6], [6, 3]], false).stage;
s = addLine(s, "shooting-area", [[-2, 0.5], [2, 0.5], [2, 2.5], [-2, 2.5]], true).stage;
s = setStart(s, [0, 1.5], 0);
s = assignLabels(s);
view.sync(s);

const params = new URLSearchParams(location.search);
engine.setEnvironment(params.get("env") === "outdoor" ? "outdoor" : "technical", s.bay);
engine.camera.position.set(-12, 14, -6);
engine.camera.lookAt(0, 0, 11);
engine.requestRender();
