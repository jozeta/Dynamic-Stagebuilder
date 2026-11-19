// Moves the animated props (those with Animate switched on) in the 3D view: swingers swing, drop
// turners turn, clamshells drop and reset, movers run their track, Texas stars spin, plates and
// poppers fall and reset, dueling-tree paddles swing round the post to the other side. Only pivot groups the builders mark
// (userData.anim) move; the stage data never changes. One global play/pause stops or starts them.
import { ANIMATED_TYPES } from "../model/animation.js";

const ease = (x) => x * x * (3 - 2 * x);
const clamp01 = (x) => Math.min(1, Math.max(0, x));

// Fall back and stand up again: down in 0.35 s, a pause, back up in 0.6 s.
function fallAngle(t, delay, period) {
  const p = (((t - delay) % period) + period) % period;
  if (t < delay) return 0;
  if (p < 0.35) return 1.45 * (p / 0.35) ** 2;
  if (p < period - 0.6) return 1.45;
  return 1.45 * (1 - ease((p - (period - 0.6)) / 0.6));
}

const MOTIONS = {
  swing: (n, t) => { n.rotation.z = Math.sin(t * 2.1) * 0.85; },
  turn: (n, t) => { n.rotation.y = ease(clamp01(0.5 + Math.sin(t * 1.4) * 0.7)) * (Math.PI / 2); },
  clam: (n, t, a) => { n.rotation.x = a.rest - (0.5 - 0.5 * Math.cos(t * 1.5)) * (1.45 + a.rest); },
  slide: (n, t, a) => { n.position.x = Math.sin(t * 0.9) * a.range; },
  spin: (n, t) => { n.rotation.z = -t * 1.1; },
  fall: (n, t, a) => { n.rotation.x = fallAngle(t, a.delay, a.period); },
  // Dueling tree: the paddle's arm turns round the vertical post, swinging back behind it to the
  // other side at the same height (−side: a paddle on +x passes through +z, away from the shooter).
  bob: (n, t, a) => { n.position.y = -a.drop * (0.5 - 0.5 * Math.cos(t * 1.4)); },
  twist: (n, t) => { n.rotation.y = t * 1.8; },
  wobble: (n, t) => { n.rotation.x = Math.sin(t * 1.7) * 0.06; n.rotation.z = Math.sin(t * 1.1 + 1) * 0.08; },
  shutter: (n, t) => { n.rotation.x = -(0.5 - 0.5 * Math.cos(t * 1.2)) * (Math.PI / 2); },
  door: (n, t, a) => { n.rotation.y = a.sign * (0.5 - 0.5 * Math.cos(t * 0.9)) * (Math.PI / 2); },
  flip: (n, t, a) => { n.rotation.y = -a.side * (fallAngle(t, a.delay, a.period) / 1.45) * Math.PI; },
};

export function createAnimator(stageGroup) {
  let parts = [];             // [{ node, anim }]
  let playing = true;

  return {
    /** Collect the moving parts of the props whose Animate switch is on (call after the view syncs). */
    sync(stage) {
      const on = new Set(stage.objects.filter((o) => ANIMATED_TYPES.includes(o.type) && o.params.animate === true).map((o) => o.id));
      parts = [];
      for (const root of stageGroup.children) {
        if (!on.has(root.userData.id)) continue;
        root.traverse((c) => { if (c.userData.anim && MOTIONS[c.userData.anim.kind]) parts.push({ node: c, anim: c.userData.anim }); });
      }
    },
    update(t) {
      if (!playing) return;
      for (const { node, anim } of parts) MOTIONS[anim.kind](node, t, anim);
    },
    setPlaying(v) { playing = Boolean(v); },
    playing: () => playing,
    /** How many props are switched on (whether playing or not). */
    count() { return new Set(parts.map((p) => { let n = p.node; while (n.parent && n.parent !== stageGroup) n = n.parent; return n; })).size; },
    active: () => playing && parts.length > 0,
  };
}
