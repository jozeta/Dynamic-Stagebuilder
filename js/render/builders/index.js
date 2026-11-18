// buildProp(obj): a Three.js group for one stage object, origin at its ground point, front facing −z.
// The stage view positions and rotates it.
import { buildPaper } from "./paper.js";
import { buildPopper, buildPlate } from "./steel.js";
import { buildMeshWall, buildWoodWall, buildPortWall } from "./walls.js";
import { buildBarrel, buildTyre, buildCrate } from "./obstacles.js";

export { buildLine, buildStartMarker } from "./lines.js";

const BUILDERS = {
  "paper-ipsc": buildPaper, "paper-mini": buildPaper, noshoot: buildPaper, "noshoot-mini": buildPaper,
  popper: buildPopper, "mini-popper": buildPopper, "plate-round": buildPlate, "plate-square": buildPlate,
  "wall-mesh": buildMeshWall, "wall-wood": buildWoodWall, "wall-port": buildPortWall,
  barrel: buildBarrel, tyre: buildTyre, "tyre-stack": buildTyre, crate: buildCrate,
};

export function buildProp(obj) {
  const build = BUILDERS[obj.type];
  if (!build) throw new Error(`No builder for ${obj.type}`);
  return build(obj);
}
