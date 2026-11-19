// buildProp(obj): a Three.js group for one stage object, origin at its ground point, front facing −z.
// The stage view positions and rotates it.
import { buildPaper } from "./paper.js";
import { buildPopper, buildPlate } from "./steel.js";
import { buildMeshWall, buildMeshPortWall, buildWoodWall, buildPortWall, buildDoorWall, buildSolidWall } from "./walls.js";
import { buildRamp, buildPlatform, buildTable, buildChair, buildPallet, buildSandbags, buildCone } from "./furniture.js";
import { buildCar } from "./car.js";
import { buildSwinger, buildDropTurner, buildClamshell, buildMover, buildTexasStar, buildPlateRack, buildDuelingTree } from "./moving.js";
import { buildBarrel, buildTyre, buildCrate, buildPlant } from "./obstacles.js";

export { buildLine, buildStartMarker } from "./lines.js";

const BUILDERS = {
  "paper-ipsc": buildPaper, "paper-mini": buildPaper, noshoot: buildPaper, "noshoot-mini": buildPaper,
  popper: buildPopper, "mini-popper": buildPopper, "plate-round": buildPlate, "plate-square": buildPlate,
  "wall-mesh": buildMeshWall, "wall-mesh-port": buildMeshPortWall, "wall-wood": buildWoodWall, "wall-port": buildPortWall,
  barrel: buildBarrel, tyre: buildTyre, "tyre-stack": buildTyre, crate: buildCrate, "plant-palm": buildPlant, "wall-door": buildDoorWall, "wall-solid": buildSolidWall,
  ramp: buildRamp, platform: buildPlatform, car: buildCar, table: buildTable, chair: buildChair,
  pallet: buildPallet, sandbags: buildSandbags, cone: buildCone,
  swinger: buildSwinger, "drop-turner": buildDropTurner, clamshell: buildClamshell, mover: buildMover,
  "texas-star": buildTexasStar, "plate-rack": buildPlateRack, "dueling-tree": buildDuelingTree,
};

export function buildProp(obj) {
  const build = BUILDERS[obj.type];
  if (!build) throw new Error(`No builder for ${obj.type}`);
  return build(obj);
}
