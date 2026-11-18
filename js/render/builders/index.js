// buildProp(obj): a Three.js group for one stage object, origin at its ground point, front facing −z.
// The stage view positions and rotates it.
import { buildPaper } from "./paper.js";
import { buildPopper, buildPlate } from "./steel.js";

const BUILDERS = {
  "paper-ipsc": buildPaper, "paper-mini": buildPaper, noshoot: buildPaper, "noshoot-mini": buildPaper,
  popper: buildPopper, "mini-popper": buildPopper, "plate-round": buildPlate, "plate-square": buildPlate,
};

export function buildProp(obj) {
  const build = BUILDERS[obj.type];
  if (!build) throw new Error(`No builder for ${obj.type}`);
  return build(obj);
}
