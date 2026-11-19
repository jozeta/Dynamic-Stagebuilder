// The IPSC target outline and scoring zones (rulebook drawing, Appendix B2) on a 46 × 58 cm grid,
// origin bottom-centre. Shared by the card geometry and the printed card texture.
export const OUTLINE = [[-15, 0], [15, 0], [23, 8], [23, 34], [15, 43], [7.5, 43], [7.5, 58], [-7.5, 58], [-7.5, 43], [-15, 43], [-23, 34], [-23, 8]];
// Rectangles [x, y, w, h]: the body A zone, the head A zone, the C zone and the head (D line).
export const ZONES = [[-7.5, 13, 15, 28], [-4, 48, 8, 6], [-15, 5, 30, 37], [-7.5, 43, 15, 15]];
export const GRID = { w: 46, h: 58 };
