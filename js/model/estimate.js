// A rough run-time estimate for a stage: a fast run and a steady one, from the walk route (start →
// shooting positions in order), the minimum rounds and the reloads they need. This is the app's own
// rule of thumb for designers, not an IPSC rule: real times depend on the shooter, the targets'
// distances and how the stage is solved. Pure: no DOM.
import { stageStats } from "./stats.js";
import { routeLegs, legLength } from "./route.js";

export const ESTIMATE = Object.freeze({
  draw: [1.1, 1.6],          // seconds from the start signal to the first shot (fast, steady)
  split: [0.25, 0.38],       // seconds per further shot, transitions between targets included
  speed: [4.2, 2.6],         // metres per second between positions
  settle: [0.5, 0.9],        // seconds per move to stop and set up at a position
  reload: [1.2, 1.9],        // seconds per reload
  magazine: 15,              // rounds per magazine (a common handgun capacity)
});

/** { rounds, metres, reloads, fast, steady (seconds), hitFactor: [steady, fast] }, or null. */
export function runEstimate(stage) {
  const s = stageStats(stage);
  if (!s.minRounds) return null;
  const legs = routeLegs(stage).filter((l) => legLength(l.points) > 0.3);
  const metres = legs.reduce((sum, l) => sum + legLength(l.points), 0);
  const reloads = Math.max(0, Math.ceil(s.minRounds / ESTIMATE.magazine) - 1);
  const time = (i) => ESTIMATE.draw[i] + (s.minRounds - 1) * ESTIMATE.split[i] + metres / ESTIMATE.speed[i] + legs.length * ESTIMATE.settle[i] + reloads * ESTIMATE.reload[i];
  const fast = +time(0).toFixed(1), steady = +time(1).toFixed(1);
  return { rounds: s.minRounds, metres: +metres.toFixed(1), reloads, fast, steady, hitFactor: [+(s.maxPoints / steady).toFixed(2), +(s.maxPoints / fast).toFixed(2)] };
}
