// A stage with one of every prop, a fault line, a shooting area and a start position.
import { createStage, addObject, addLine, setStart } from "../js/model/stage.js";
import { PROPS } from "../js/model/props.js";
import { assignLabels } from "../js/model/numbering.js";

export function everyPropStage() {
  let s = createStage();
  let x = -8;
  for (const type of Object.keys(PROPS)) { s = addObject(s, type, [x, 10], 30).stage; x += 1; }
  s = addLine(s, "fault-line", [[-5, 3], [5, 3], [5, 6]], false).stage;
  s = addLine(s, "shooting-area", [[-2, 0.5], [2, 0.5], [2, 2.5], [-2, 2.5]], true).stage;
  s = setStart(s, [0, 1.5], 0);
  return assignLabels(s);
}
