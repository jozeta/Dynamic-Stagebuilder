# Changelog

All notable changes to Dynamic-Stagebuilder are listed here, newest first.

## Unreleased

- Changing the Outdoor ground recolours the stones and the earth banks to match (sandstone on
  sand, grey stones and banks on gravel, red-brown on red dirt).
- The Projects button left the top toolbar; Projects is a tab in the left panel.

- Settings → Environment, Blueprint and Technical: the ground's colour, as hue, intensity and
  brightness (Blueprint's white lines stay white). Saved with the stage; unchanged, each keeps its
  own blue paper or grey floor.
- Technical: *Show walls* hides the backstop and side walls, and the floor now runs on to the
  horizon, fading into a background of its own colour (so the background is a darker grey).
- Outdoor: *Cloud shadows* sets how dark the clouds' shadows on the ground are (0–100 %, 50 % as
  before).

- New Outdoor defaults: the sun set by hand (36° high, 30°, warm white), sunlight 60 %, ambient
  65 %, shadow softness 3, shadow strength 55 %, haze 10 %, exposure 1.10, clouds 75 % at 130 %
  speed, wind 70°. Stages keep their own light; *Reset light to defaults* takes the new one.
- Outdoor: the floor runs into the earth banks without a line: the banks rise from the floor
  without a crease, their earth colour blends in over a couple of metres, and the cloud shadows
  lie over the banks too (they used to end in a straight edge).
- Shadow strength now changes only the shadows props cast: cloud shadows keep their own
  strength, and the scenery (stones, trees, the Technical walls) no longer casts sun shadows.
- Fault lines and shooting areas are thinner: 5 × 4 cm timber.

- Panels move one at a time (Låda Glass 2.5.0): Props, On stage and Projects are tabs of one
  frame on the left, Inspector and Settings of one on the right. Drag a tab onto a side to give
  it a frame of its own there, or onto another frame to add it there as a tab; the grip's menu
  does the same. Projects and Settings in the toolbar bring their tab forward.
- A reload brings back the view as you left it: the panels and their tabs, the Settings tab you
  had open, folded groups in On stage, Play or Pause, and Shooter's eye at the position you stood on
  (with the camera, View settings and walking speed, already remembered).
- Default target style moved to the top of Settings → Props.

- Fix: panning with a right-button or two-finger drag (a Mac trackpad) no longer opens the
  right-click menu; it opens only for a click without a drag.

- Settings → Environment: *Time of day* can be switched off; then the sun is set by hand: its
  height (2–90°), direction (0° = behind the shooter) and colour, from dark orange through yellow
  to bright white. Saved with the stage.

- Dockable side panels (Låda Glass 2.4.0): drag a panel's grip (⋮⋮) to the left, the right or
  under the view, or click it for *Move to…*; panels sharing a side stack. Fold with the arrow,
  resize from the inner edge. Where they are, their sizes and folds are remembered. The Inspector
  under the view shows its settings and the statistics side by side.

- On stage panel (a tab beside Props in the left panel): every prop on the stage in a list; click a
  row to select it and see its settings, Shift / ⌘-click or *Select several* to pick more. Group
  props, rename, fold, hide and lock groups, drag rows into groups or use *Move to…*, and copy,
  paste and delete from its bar.
- Right-click menu on the 3D view and the list (long-press on an iPad): cut, copy, paste (here),
  duplicate, delete, lock in place, hide, group / ungroup, rotate 90°, select all of a kind,
  frame the selection and Shooter's eye from a shooting position.
- Lock in place (not clickable or draggable in the 3D view; also a switch in the inspector) and
  Hide (not drawn; still counted). Shortcuts: ⌘C, ⌘X, ⌘V, ⌘A, ⌘G / ⇧⌘G, L and H.

- New View defaults: walking speed Sprint; figures, position marks and the route line shown in
  light grey at 30 % opacity.

- Clouds show from every camera: a distant ring of clouds just above the horizon (behind the banks
  and trees), and their soft shadows drift across the range floor, as dark as the shadow strength.

- Selecting a prop brings its settings into view: a folded inspector unfolds, and Settings (which
  shares that panel) closes. Folding it again while the prop stays selected keeps it folded.

- Clouds over the Outdoor range: a soft cloud layer painted in code, thinning out toward the
  horizon and warmed by the evening sun. With Play on they drift with the wind; Pause holds them.
  Settings → Environment: Clouds (amount, 0 % = clear), Cloud speed and Wind direction, saved
  with the stage.

- Settings has three tabs: Environment (was Light and view), View and Props. View holds the
  Shooter's eye walking speed and, for the figures, the position marks and the route line each:
  show or hide, a colour (seven swatches or your own) and opacity. Kept in this browser.

- Activation links: a swinger, drop turner, clamshell, mover, bobber, twister, Texas star or
  shuttered port can be *Activated by* a popper, plate, step pad or pull lever on the stage
  (inspector). Selecting either shows an orange dashed line between them, and the briefing and
  the printed brief list them ("T5 (swinger) by P1 (IPSC popper)").
- The route line on the ground is light grey, like the figures.

- Walks between shooting positions are faster (the pace is set in Settings → View) and
  smoother: stepping onto a platform or a ramp rises over a stride instead of jumping.
- Settings → Light and view: Shooter's eye walking speed (slow walk, walk, quick move, sprint),
  kept in this browser.

- Figures (at the start and the shooting positions) fade out as the camera comes close and are
  gone when it is inside one, so Shooter's eye never looks out from inside a body.

- The start position has the shooter in it, posed as the briefing's start position says (wrists
  above the shoulders, arms hanging, hands on the head, palms on the wall, seated, kneeling), with
  the pistol in a holster on the belt unless it starts on a table or in a case; "facing up range"
  turns him round. Shooter's eye at the start uses the pose's eye height, and looking around
  there saves the view (one undo step).
- With a shooting position selected, Shooter's eye opens at that position.
- Smoother walks between positions: rounded corners, a steady jogging pace that eases in and out,
  getting up and dropping into the next stance at the ends, and turns that begin a little early.
- Fix: Shooter's eye at a start turned sideways looked the mirror-image way from the box's arrow.

- Shooting positions show a detailed, see-through grey man in the stance: a shaped torso and
  tapered limbs, a cap, shooting glasses and ear muffs, shoes, and both hands round a pistol with
  slide, frame, angled grip, trigger guard, trigger and sights. Only its outer surface is drawn,
  so it is one even grey without dark overlaps.
- Shooter's eye: standing on a shooting position, grey arrows in the lower left move it forward,
  back, left or right (25 cm, relative to the way it faces; one undo step each).
- Walking between positions, the camera looks the way the shooter walks, turning to the
  position's view as it arrives.
- The camera view is remembered per project in this browser: a reload opens where you left off.

- Every stage in the library comes with suggested shooting positions and the walk between
  them, worked out from its layout: each target is seen from a position inside the shooting
  areas (walls block, ports and doorways don't; low ports mean kneeling), each position faces
  its targets, and the walk goes round walls.

- Shooting positions are light grey and see-through, with a detailed mannequin for each stance
  (head, body, arms holding a pistol in a firing grip, legs and feet) and a small chevron on the
  ring for the facing. The route line stops at each ring, has fewer, smaller arrows, and its grab
  points are flat discs in the line's colour.

- **The shooter's route:** a dashed line with arrows on the ground runs from the start through the
  shooting positions, lying on ramps, platforms and step boxes. Click the line to add a grab
  point; drag one to reshape the route; click one to remove it (each an undo step, saved with the
  stage). Shooter's eye walks along the route, up and down ramps.
- **Play / Pause** also decides how Shooter's eye moves: playing walks between positions, paused
  jumps. It shows whenever the stage has shooting positions.
- At a shooting position in Shooter's eye, looking around saves the view to that position when you
  let go (no Save view button needed).
- Settings: *Done* moved to the bottom of the panel and stays in view.

- **Shooter's eye walks the run:** stepping between the start and the shooting positions now walks
  the camera from one to the next (turning the short way, changing eye height with the stance),
  and *Play run* walks the whole course, pausing at every position. Grab the view to stop. The
  bar now always shows in Shooter's eye, with a hint on how to add positions when there are none.

- Fixed: a side panel you had resized didn't fold (it kept its width with the handle in the middle).

- A folded side panel is now only a slim grab handle at the edge of the 3D view (a horizontal one
  under the view on iPad portrait), so the view gets nearly the whole window.

- **From the 2012 US IPSC Nationals stage diagrams:**
  - 24 match stages in the library (original layouts and wording after the Nationals' stages)
  - new props:
    - step pads (one or three)
    - pull levers
    - start X marks
    - a wall with a shuttered port (Animate drops it open)
    - black hard-cover panels
    - raised barricades with a gap underneath
    - bobbers that rise from behind hard cover
    - twisters that spin on their post
    - movers carrying up to four cards
    - a wobble platform
    - a balance rope
    - a step box
  - barrels stacked two high
  - tables with a pistol, magazines or a gun case for table starts
  - map colours as on stage diagrams (steel blue, hard cover black)
  - more start positions and gun conditions in the briefing
- Fixed: opening Projects or Settings while its side panel was folded, or clicking it again after
  folding the panel with it open, left it out of sight; the panel now unfolds and shows it.

- **Door:** a wooden door in a frame (Walls group, snaps onto wall runs) with door width, height,
  how far it stands open, hinge side and whether it opens away from or toward the shooter;
  *Animate* opens and shuts it.

- **Blueprint** now looks like a worn, much-handled drafting sheet: bright blue paper with a fine
  grid, grit, stains, faded patches, scratches and fold creases, and round the stage handwritten
  comments, leader arrows, revision clouds, callouts, loose dimensions, level and section marks,
  stamps, check marks, scribbles, tape and a coffee ring. The bay stays clear. New Blueprint light
  defaults: 11:00, sunlight 100 %, ambient 115 %, softness 4, shadow strength 70 %, exposure 1.05.
- Fixed: dueling-tree paddles now swing round the post, behind it, to the other side at the same
  height, instead of flipping up over the top.

- **Your own surroundings:** Settings → Surroundings → *New from a plan…* takes a blueprint or site
  plan (PNG, JPEG or WebP). Click both ends of something you know the length of and type it (for
  example a 5.2 m wall), and the plan is laid on the ground at true scale. Sliders move, turn and
  fade it.
- **Building pieces:** a new props group (building walls in concrete, brick, wood or metal, square
  pillars, round columns, earth berms, 20/40 ft containers, chain-link fences, concrete barriers)
  to rebuild your range on the plan. *Save pieces to these surroundings* keeps them as a template
  that every stage can choose; *Edit the pieces on the stage* brings them back. Templates are saved
  in this browser.
- **Animation:** swingers, drop turners, clamshells, movers, Texas stars, plate racks, dueling trees
  and poppers have an *Animate* switch. The *Play / Pause* button over the 3D view starts or stops
  all switched-on props together.
- **Resizable side panels:** drag a panel's inner edge (or use the arrow keys on it) to make it
  wider or narrower; double-click to reset. On iPad portrait, drag the top of the bottom panel.
- Fixed: a change with nothing valid in it no longer adds an empty undo step.

- **Stage library:** 34 ready-made stages in the Projects panel, searchable and grouped:
  - drills and standards (El Presidente, Vice Presidente, Bill Drill, Mozambique, Hostage
    Presidente and more)
  - 8 short, 8 medium and 6 long IPSC courses
  - 4 USPSA and club stages with moving and reactive targets

  *Open as new project* makes an editable copy. The layouts and briefs are original, modelled on
  published stage books and stage-design guides (sources in docs/stage-library-sources.md); IPSC
  stages keep to the course round limits and use no stars, racks or trees.

- **Shooting positions:** a new stage marking. Tap each place the shooter shoots from; they are
  numbered 1, 2, 3… and each remembers its place, facing, look up/down angle and stance (standing,
  crouching, kneeling, sitting, prone), shown as a see-through figure at real size. In Shooter's eye
  the arrows next to the view buttons (or [ and ]) step from the start through every position at
  that stance's eye height; *Save view* stores where you're looking. Positions are on the printed
  map.
- **Blueprint surroundings:** the stage drawn on an endless blue drafting sheet with a 1 m / 5 m
  grid, title block, north arrow, scale bar, dimension lines, registration crosses, a detail
  callout and handwritten notes. No bay floor or walls; props keep their colours.
- **Outdoor ground:** choose sand, light sand, dark sand, red dirt or gravel (Settings → Ground).
- **Target heights:** switching presentation keeps the top of the targets where it was and changes
  the sticks instead; an array that would go over the IPSC 1.8 m (mini 1.6 m) limit gets a lower
  stand. An array with two targets takes two numbers (T2–3).
- Fixed: the printed 3D view (page 2) was blank. The brief now waits for the 3D picture before the
  print dialog opens, renders it at 2000 px, and is also built when printing with ⌘P / Ctrl+P.
- Fixed for iPads: 16 px text in fields (no zoom when you tap one), 44 px Help topics, view buttons
  and toolbar buttons; the view buttons are easier to read over bright ground; the Help topic strip
  shows that it scrolls.

- **Cars rebuilt:** each car is one smooth body lofted along its length, with real glass, pillars,
  bumpers, door seams and wheel arches, in four models: saloon, hatchback, pickup (with a bed
  cover) and van. Every model keeps the wear, lights, mirrors, handles, wipers, aerial and exhaust.
- **Target presentations:** the separate no-shoot props are gone. The IPSC target and the mini
  target each have a *Presentation* choice: target, no-shoot, no-shoot over the lower half, over
  the left or right side, target between two no-shoots, target in front of a no-shoot, two
  overlapping targets, two targets with a no-shoot between, two stacked targets, or a target above
  a no-shoot. *Hard cover* paints the lower ¼, ⅓ or ½, the left or right half, or a lower diagonal
  black. Arrays follow the IPSC Target Array Handbook (January 2019). The inspector warns when a
  target's top is above 1.8 m (1.6 m for mini targets). Stages with old no-shoot props open with
  them as targets presented as no-shoots. Stats and labels count every target in an array.
- **Moving and reactive targets:** a new group with a swinger, drop turner, clamshell and mover on
  a track (paper), and a Texas star (5 or 10 plates), plate rack (4–8 plates) and dueling tree
  (steel; each plate counts). Stars, racks and trees are marked as not allowed in IPSC (Target
  Array Handbook 4.1).
- **Panels:** fault line, shooting area and start position are now at the top of the props panel.
  Both side panels fold away with an arrow. Projects opens in the left-hand panel instead of a
  pop-up.
- **Settings:** tabs for *Light and view* and *Props*. The Props tab hides whole groups or single
  props from the props panel (remembered per browser). Outdoor and Technical each have their own
  light defaults (Outdoor 15:45, sunlight 50 %, softness 4, shadow strength 50 %, haze 35 %;
  Technical 16:00, sunlight 115 %, ambient 110 %, softness 3, shadow strength 55 %). An untouched
  look follows the surroundings when you switch.
- **Help:** a new *Help* button opens a guide with a drawing, text and tips for every main task,
  plus the keyboard shortcuts.
- **Briefing:** scoring, start signal, start position, gun condition and stop time offer common
  choices, with *Custom text…* for your own. Procedure has common sentences to add.
- **Print:** a redesigned brief. Page 1 has a header with the stage number, name and key figures,
  the briefing in a grid, a highlighted procedure, and a map cropped to the stage with a legend.
  Labels no longer overlap, and the stray "nullnull" text is gone.
- Fixed: hidden props and search results really hide in the props panel.

- Cars more detailed and worn: dark wheel wells, wipers, door mirrors with glass, 3D door
  handles, an aerial, an exhaust, orange indicators, fog lamps, framed lights, a mesh grille and
  number plates; paint with dust, swirl scratches, faded clear coat, a few dents, mud thrown up
  round the arches, rust starting at the arch lips (heavy on the rusty car) and grime low on
  the doors; slightly dusty glass.

- Cars rebuilt: one smooth body traced from a side profile with real wheel arches, rounded edges
  and leaning sides; printed sides with tinted windows, pillars, door seams and handles; tinted
  windscreen and rear window; treaded tyres on five-spoke alloys; lights, grille, bumpers,
  number plates and mirrors; clear-coated paint (the rusty car faded with rust patches).
- Worn props: barrels in muted, faded colours with more scratches, rust patches and runs; all
  timber (wall frames, target sticks, plywood, crates, pallets, platform, ramp, table)
  weathered with sun-greying, soft water stains, dirt, splits and rust under nails; orange
  netting faded and grimy with a few snapped strands and a slight sag; wire mesh rusty and dusty;
  poppers and plates with bullet splash, chipped paint and rusty bases.
- Settings open in the right-hand panel (instead of a pop-up) while the 3D view stays live.
- Haze now works at stage distances (distance fog that thickens with the slider), and a new
  *Shadow strength* slider lightens shadows (default 85 %).

- Two IPSC target versions at their real sizes: **Classic** (octagon, 45 × 57 cm; mini 30 ×
  37.5 cm) and **With head** (46 × 76 cm; mini 31 × 51 cm), each with printed dotted A/C zone
  outlines and letters on corrugated card. Each paper target and no-shoot has a *Target style*
  switch; *Settings → Default target style* sets the style of new targets (Classic by default).
  Older stages' targets read as Classic.
- The paper targets' height setting is now called *Stand height* (how high the sticks hold the
  card's bottom edge, 0.1–2 m).

- Ground: a photo-scanned sand-and-gravel texture (Poly Haven "Gravelly Sand", CC0, kept in
  `vendor/textures/`) with colour, normal, roughness and AO, graded toward a dusty tan; many
  more random stones in four sizes, the larger ones broken and angular, scattered everywhere.
- Barrels rebuilt after real 216 l steel drums: rolled rims, corrugated rolling hoops, a
  recessed lid with a pressed ring and 2" and 3/4" bung caps, glossy enamel with a clear-coat
  sheen (black more worn and matte), scuffs on the hoops, dust at the base, a label on worn lids.
- Mesh walls look like DIY range walls: orange safety-barrier netting (new default; black and
  blue remain) stapled to the front of light 45 mm pine frames with corner gussets; every wall
  stands on feet (40 cm deep footprint; the print map still draws the wall's frame).
- Crates rebuilt as shipping crates: light pine boards, a nailed cleat frame round every face,
  diagonal braces on the sides, stencilled arrows and FRAGILE on the front.

- Look rework, step 2 (ground and berms): a compacted dirt-and-gravel floor with colour, normal,
  roughness and ambient-occlusion maps baked in code from a tileable gravel height field
  (256 px per metre); large-scale tones of dry dust, compacted earth and damp patches, a worn lane
  through the middle; stones in three sizes sunk into the ground, denser toward the berms and
  sparser in the lane; berms 2–3 m high with an irregular line and lumpy raw-earth faces, patchy
  grass on top and grass cards on the tops, faces and foot. The overview now frames what is on
  the stage (the bay when empty), with the berm edges at the frame's borders.

- Look rework, step 1 (lighting and camera): a low golden sun (about 24° at the new default
  18:15) with long diagonal shadows and crisp edges (4096 shadow map on computers, tuned bias),
  a cool-sky / warm-ground fill light, image-based reflections from a generated late-afternoon
  sky (not shown as the backdrop), a warmer hazy sky, ACES tone mapping. The default view is a
  high oblique overview (45° down, 25° yaw, 32° lens) that frames the whole bay; the shooter's
  eye and Front views use a natural 55° lens.

- Library: each prop group (Paper, Steel, Walls, Structures, Obstacles and range furniture) is
  a collapsible section; the folded state is remembered per browser and a search opens groups
  with matches.
- Reference range look: 6 cm pine frames with a post at every panel, bold black wire mesh and a
  denser royal-blue mesh, a new Solid panel wall (grey sheet, snaps like other walls), targets
  with printed scoring-zone outlines, bevelled yellow/white poppers, 10 × 8 cm red fault-line
  timber, dense areca palms, steep cut dirt banks with shrubs on top, crisper light (default
  16:30, sharper shadows, exposure 0.92); the sun now passes on the shooter's side so target
  faces are lit.

- Environment settings dialog (toolbar *Settings*): surroundings (moved from the toolbar), time
  of day 06:00–20:00 driving the sun's position and colour, sunlight, ambient light, shadows,
  shadow softness, haze and exposure; `settings.look` in stage files (older files get defaults).
- New props: ramp, platform (structures); car, table, chair, pallets, sandbag wall, traffic cone;
  mesh doorway (a wall, it snaps). Barrels get a colour (black, blue, red, green).
- More detail and texture: worn steel drums with hoops, chimes, bungs, scratches and rust;
  treaded tyres; board crates with battens; palms with leaflets; trees with bark, branches and
  leafy crowns; a bump-mapped gravel ground with scattered stones.
- IPSC target outline after the rulebook drawing (43 cm body, 15 × 15 cm head); targets stand
  lower (default 0.7 m to the card's bottom) on sticks reaching half way up; poppers get a hinge.

- Object snapping: walls (mesh, mesh with port, wooden) snap end to end to nearby walls (35 cm),
  grid snap otherwise; *Grid* and *Objects* toggles in the toolbar; `settings.objectSnap` in stage
  files (older files read as on).
- Shift while dragging: slow fine moves (1/5 speed) without snapping.
- New props: Mesh wall with port (a real, framed opening) and Potted plant (decoration). Poppers
  and plates get a paint setting (white/yellow). The wooden "Wall with port" is now "Wooden wall
  with port".
- New look after the reference photo: pine frames and 10 cm square wire mesh, plywood walls,
  cardboard targets on blue steel stands; Outdoor has earth banks with grass, bushes and trees, a
  low warm sun with soft shadows, a gradient sky and haze; ACES tone mapping. Outdoor is now the
  default for new stages, and mesh walls default to a pine frame.
- Fixed: the service worker no longer stores stale files from the browser's HTTP cache.
- Steel saved before the paint setting keeps its white paint; a wall dropped close behind a
  parallel wall no longer jumps on top of it; lighter shadows on iPads.

- 3D stage editor (Three.js 0.187.0, self-hosted): shooting bay, prop library with IPSC and mini
  targets, no-shoots, poppers, plates, mesh/wooden walls, a wall with a real port, barrels, tyres and
  crates, all at real size; fault lines, shooting areas and the start position.
- Place by tap or drag-and-drop, drag to move with grid snap, rotate with a ring, buttons or Q/E,
  multi-select, duplicate, delete, undo/redo, New stage.
- Automatic target numbers (T/P/NS) with Renumber and hand-set labels; live statistics (rounds,
  points, suggested stage type, warnings for over 32 rounds and duplicate labels).
- Technical and Outdoor surroundings that never change the stage; camera presets including the
  shooter's eye; About dialog with the version and the rulebook edition.
- Computers and iPads; phones get a "use a larger screen" message.
- Written Stage Briefing editor; the counted fields (targets, rounds, points) come from the stage.
- Print: a two-page A4 brief with a top-down map, scale bar and 3D view (Save as PDF).
- Projects saved in the browser with autosave, a Projects dialog (open, duplicate, delete, new),
  JSON export and safe import (validated, always a new project), and a "not exported" hint.
- Installable PWA that works offline (network first, the app's own files cached per version).

- v1 design agreed (docs/superpowers/specs/2026-11-18-stage-builder-v1-design.md); README and CLAUDE.md describe the plan.

## 0.1.0 (2026-11-18)

- Project created.
