# Reference look and collapsible library: design

Date: 2026-11-19 · Status: approved by request (Johan: no questions; Claude's calls)

Johan asked for collapsible prop groups in the library, and for the 3D graphics to match his
reference image (an outdoor dirt range seen from above at golden hour) as exactly as possible,
with every other prop designed in the same style. The two club logos in the image are not
reproduced (real organisations' marks).

## What the reference shows, and what changes
- Walls: light pine frames, thicker (6 cm posts), a post at every ~1 m panel; bold black square
  wire mesh; a denser, brighter royal-blue mesh; grey solid sheet panels set into wall runs
  (new prop **Solid panel**, a wall that snaps).
- Paper targets: tan cardboard with darker brown scoring-zone outlines printed on the face
  (a canvas texture, replacing thin line geometry), on two pine uprights in a blue steel stand.
- Poppers and plates: chunky, bevelled edges; bright yellow and white paint.
- Fault lines: heavier red-painted timber (10 × 8 cm) with bevelled edges.
- Palms: dense, upright areca palms in black pots.
- Surroundings: steep cut dirt banks (reddish earth faces, grass and dense shrubs along the top),
  light gravel floor, crisp strong afternoon shadows (less ambient, sharper default softness).
- Other props follow the same palette (pine, black, royal blue, tan cardboard, red) and the same
  crisp lighting.

## Library
Each group (Paper, Steel, Walls, Structures, Obstacles and range furniture) is a native
`<details>`/`<summary>` (keyboard and screen-reader friendly); the open/closed state is
remembered per browser; a search opens groups with matches.
