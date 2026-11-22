// buildProp(obj): a Three.js group for one stage object, origin at its ground point, front facing −z.
// The stage view positions and rotates it.
import { buildPaper } from "./paper.js";
import { buildPopper, buildPlate } from "./steel.js";
import { buildMeshWall, buildWoodWall, buildSolidWall, buildDoor, buildPortShutterWall, buildHardcoverPanel, buildRaisedBarricade } from "./walls.js";
import { buildStepPad, buildPullLever, buildStartMarks, buildBobber, buildTwister, buildWobblePlatform, buildBalanceRope, buildStepBox } from "./nationals.js";
import { buildRamp, buildPlatform, buildTable, buildChair, buildPallet, buildSandbags, buildCone } from "./furniture.js";
import { buildCar } from "./car.js";
import { buildBuildingWall, buildPillar, buildContainer, buildFence, buildBarrier } from "./building.js";
import { buildBerm } from "./berm.js";
import { buildBed, buildSofa, buildOfficeDesk, buildDiningSet, buildCoffeeTable } from "./home.js";
import { buildShootingPosition } from "./position.js";
import { buildSwinger, buildDropTurner, buildClamshell, buildMover, buildTexasStar, buildPlateRack, buildDuelingTree } from "./moving.js";
import { buildBarrel, buildTyre, buildCrate, buildPlant } from "./obstacles.js";

export { buildLine, buildStartMarker } from "./lines.js";

const BUILDERS = {
  "paper-ipsc": buildPaper, "paper-mini": buildPaper, noshoot: buildPaper, "noshoot-mini": buildPaper,
  popper: buildPopper, "mini-popper": buildPopper, "plate-round": buildPlate, "plate-square": buildPlate,
  "wall-mesh": buildMeshWall, "wall-wood": buildWoodWall,
  barrel: buildBarrel, tyre: buildTyre, crate: buildCrate, "plant-palm": buildPlant, door: buildDoor, "wall-port-shutter": buildPortShutterWall, "hardcover-panel": buildHardcoverPanel, "raised-barricade": buildRaisedBarricade,
  "step-pad": buildStepPad, "pull-lever": buildPullLever, "start-marks": buildStartMarks, bobber: buildBobber, twister: buildTwister, "wobble-platform": buildWobblePlatform, "balance-rope": buildBalanceRope, "step-box": buildStepBox, "wall-solid": buildSolidWall,
  ramp: buildRamp, platform: buildPlatform, car: buildCar, table: buildTable, chair: buildChair,
  pallet: buildPallet, sandbags: buildSandbags, cone: buildCone,
  "shooting-position": buildShootingPosition,
  "building-wall": buildBuildingWall, pillar: buildPillar, berm: buildBerm, bed: buildBed, sofa: buildSofa, "office-desk": buildOfficeDesk, "dining-set": buildDiningSet, "coffee-table": buildCoffeeTable, container: buildContainer, fence: buildFence, barrier: buildBarrier,
  swinger: buildSwinger, "drop-turner": buildDropTurner, clamshell: buildClamshell, mover: buildMover,
  "texas-star": buildTexasStar, "plate-rack": buildPlateRack, "dueling-tree": buildDuelingTree,
};

export function buildProp(obj) {
  const build = BUILDERS[obj.type];
  if (!build) throw new Error(`No builder for ${obj.type}`);
  return build(obj);
}
