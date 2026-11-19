// IPSC cardboard target shapes, origin bottom-centre, in centimetres on each style's own grid.
// Shared by the card geometry and the printed card texture.
//
// - classic: the octagonal IPSC target without a head, 45 × 57 cm (mini 30 × 37.5 cm).
// - head:    the tall target with a head, 46 × 76 cm (18 × 30 in; mini about 31 × 51 cm).
// Zones are polygons (A, C) printed as darker outlines with their letters; the outline is D.
export const STYLES = Object.freeze({
  classic: {
    grid: { w: 45, h: 57 },
    outline: [[-11.5, 0], [11.5, 0], [22.5, 10], [22.5, 38], [7.5, 57], [-7.5, 57], [-22.5, 38], [-22.5, 10]],
    zones: [
      [[-7.5, 23], [7.5, 23], [7.5, 42], [4.5, 51], [-4.5, 51], [-7.5, 42]],
      [[-12, 5.5], [12, 5.5], [17.5, 12], [17.5, 37], [5.5, 53], [-5.5, 53], [-17.5, 37], [-17.5, 12]],
    ],
    letters: [["A", 0, 33], ["C", -12.5, 26], ["C", 12.5, 26], ["D", -20, 26], ["D", 20, 26]],
  },
  head: {
    grid: { w: 46, h: 76 },
    outline: [[-9.5, 0], [9.5, 0], [23, 14], [23, 55], [16, 62], [7.5, 62], [7.5, 76], [-7.5, 76], [-7.5, 62], [-16, 62], [-23, 55], [-23, 14]],
    zones: [
      [[-7.5, 27], [7.5, 27], [7.5, 55], [-7.5, 55]],
      [[-5, 68], [5, 68], [5, 73.5], [-5, 73.5]],
      [[-9.5, 12.5], [9.5, 12.5], [14.5, 26], [14.5, 57], [9.5, 60], [-9.5, 60], [-14.5, 57], [-14.5, 26]],
    ],
    letters: [["A", 0, 40], ["A", 0, 70.5], ["C", -12, 40], ["C", 12, 40], ["D", -19.5, 40], ["D", 19.5, 40]],
  },
});

/** The style's outline, kept for older code that imported OUTLINE (the classic shape). */
export const OUTLINE = STYLES.classic.outline;
