// Environments: everything around the stage (ground, surroundings, sky, light). They build into their
// own group and never read or change stage objects.
import { technical } from "./technical.js";
import { outdoor } from "./outdoor.js";
import { disposeGroup } from "./common.js";
export { applyLook } from "./common.js";

const FACTORIES = { technical, outdoor };
export const ENVIRONMENT_NAMES = Object.keys(FACTORIES);
export const ENVIRONMENT_LABELS = { technical: "Technical", outdoor: "Outdoor" };

export function createEnvironment(name, bay) {
  const make = FACTORIES[name];
  if (!make) throw new Error(`Unknown environment: ${name}`);
  const env = make(bay);
  return {
    ...env,
    dispose() {
      disposeGroup(env.group);
      if (env.background?.isTexture) env.background.dispose();
      for (const l of env.lights) l.shadow?.map?.dispose();
    },
  };
}
