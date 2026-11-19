# Detail, environment settings and more obstacles: design

Date: 2026-11-19 · Status: approved by request (Johan asked for no questions; all calls are Claude's)

## Requests
More detail and texture on trees, ground, barrels, plants, crates, tyres and all props; IPSC
target and popper proportions (sticks too tall, targets cramped vertically); a settings function
for the environment (lighting, shadows, time of day, atmosphere) with the Technical/Outdoor switch
moved into it; more obstacles common on IPSC and 2/3-gun stages (ramps, a car and more).

## Decisions
- **Targets:** IPSC outline after the rulebook drawing: body 46 × 43 cm with chamfers, head
  15 × 15 cm on top (58 cm overall). Default mount height (target bottom) 0.7 m (was 1.0); sticks
  reach half way up the card. Poppers get a hinge bracket and a wider foot.
- **Look settings** (`stage.settings.look`, saved with the stage, not in undo, like the
  surroundings): `hour` 6–20 (default 17.5), `sun` 0–2 (1), `ambient` 0–2 (1), `shadows` on/off
  (on), `softness` 0–8 (3), `haze` 0–1 (0.35), `exposure` 0.5–1.6 (1.05). The sun's elevation and
  azimuth follow the hour (rises east, sets west), its colour warms near sunrise and sunset, and
  its strength falls toward the horizon. Files without `look` read with the defaults.
- **Settings dialog** (toolbar *Settings*): surroundings (Technical/Outdoor), the look sliders
  applied live, and *Reset to defaults*. The toolbar's surroundings switch is removed.
- **New props:** structures (ramp, platform), range furniture (car, table, chair, pallet stack,
  sandbag wall, traffic cone) and a mesh doorway wall (a wall: it snaps). Barrels get a colour
  (black, blue, red, green). Complex models are fitted to their catalogue size exactly.
- **Detail** is all generated in code (canvas textures, bump maps, lathe profiles, seeded random).

## Testing
`node --test`: look defaults/cleaning, sun maths (noon high, evening low and warm, morning east),
schema reads old files, editor `setLook` not undoable and clamped, new props exist with real sizes
(builder bounding boxes), the doorway is a real opening and snaps, target proportions. Browser:
screenshots of each new prop and the settings dialog, time of day changes the light.
