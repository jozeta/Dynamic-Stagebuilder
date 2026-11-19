# Snapping, fine moves, mesh wall with port, and the reference look: design

Date: 2026-11-19 · Status: approved by request (Johan asked for no questions; calls marked *Claude's call*)

## Intent

Johan's requests after trying v1:
1. A **mesh wall with a port**.
2. When moving or placing an object, **snap to nearby objects** so walls placed next to each other
   join edge to edge; keep **grid snap** too.
3. **Hold Shift while moving** → the object moves much slower, for fine placement.
4. The surroundings and props should look like reference image 2 (outdoor dirt range at golden
   hour): **realistic with a slight illustration feel**.

## Decisions

- **Mesh wall with port** (`wall-mesh-port`): same params as the mesh wall plus port width, height
  and bottom (as `wall-port`); the opening has its own frame and is a real hole. The wooden
  `wall-port` is renamed "Wooden wall with port".
- **Object snap** (*Claude's call*): only walls snap to walls, end to end. A wall's ends are
  `position ± (length/2)(cos θ, sin θ)`. When the moving wall's nearest end is within **0.35 m** of
  another wall's end, the wall is moved so the ends meet exactly; this beats grid snap. Other props
  use grid snap only. Applies to placing, moving one object and dragging one object (not groups).
- **Toggles** in the toolbar: *Grid* (grid snap on/off, remembers the last size, default 0.25 m)
  and *Objects* (object snap, default on). `settings.objectSnap` is added to the stage (files
  without it read as `true`).
- **Shift = fine move** (*Claude's call*): while Shift is held during a drag, pointer movement
  counts 1/5 and neither grid nor object snap applies; the bay edge still holds.
- **Look** (*Claude's call*, aimed at reference image 2):
  - renderer: ACES filmic tone mapping, soft PCF shadows (radius), 4096 shadow map;
  - Outdoor: low warm sun from the side (long shadows), warm-to-blue gradient sky, warm haze;
    pebbly sandy dirt with a bump map; earth banks round the bay with grass on top, flat-shaded
    bushes and grass tufts (the illustration feel), a few trees beyond;
  - walls: light pine frames (default frame now *wood*), square-grid wire mesh (black or blue);
    plywood planks for wooden walls;
  - paper targets: cardboard with darker edges on two wooden sticks in a blue steel base;
  - steel: a `paint` setting (white or yellow; poppers default yellow, plates white);
  - new decorative prop **Potted plant** (a palm in a black pot);
  - new stages default to the **Outdoor** surroundings.
  - Technical keeps its grey look but gets the same renderer and prop improvements.

## Non-goals

Snapping non-wall props to walls; rotation snapping to neighbours; post-processing outlines; GLTF
models or downloaded textures (everything stays generated in code, no third-party requests).

## Testing

`node --test`: wall-end maths and snapping (in line, at an angle, out of range, disabled), fine
drag maths, editor integration (place/move/drag snap, Shift fine move, toggles), new prop sizes
and the port is a real opening, schema default for `objectSnap`, paint param. Browser: screenshots
compared with the reference image; snapping two walls by dragging.
