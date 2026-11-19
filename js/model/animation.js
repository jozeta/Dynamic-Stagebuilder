// Which props can move in the 3D view (each has an "Animate" switch; a global play/pause button in
// the view moves only the ones switched on). Pure data.
export const ANIMATED_TYPES = Object.freeze(["swinger", "drop-turner", "clamshell", "mover", "texas-star", "plate-rack", "dueling-tree", "popper", "mini-popper"]);
/** The Animate switch, a true/false parameter. */
export const ANIMATE_PARAM = Object.freeze({ animate: Object.freeze({ default: false, bool: true }) });
