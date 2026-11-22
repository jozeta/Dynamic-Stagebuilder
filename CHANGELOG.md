# Changelog

All notable changes to Dynamic-Stagebuilder are listed here, newest first.

## Unreleased

- A paper target's stand height is whole centimetres, also when a new layout or style sets it to
  keep the top of the cards in place (no more heights like 0.6145 m).

## 0.11.0 (2026-11-22)

- Turning a prop with the rotate ring shows, on the ground, a line for the angle it started at, a
  line for the angle now, the area between them in see-through grey, and the turn ("+30°") beside it.
- Dragging a prop marks where it started, draws a line to where it is now and shows how far it has
  moved in metres (one decimal).

- Fix: the rotate ring in the 3D view turns in the angle-snap steps (15° by default) while you drag,
  not only when you let go; hold Shift to turn freely to an exact angle.

- Paper targets are set up in two steps: a *Layout* (one card, two side by side, two one above the
  other, three side by side, and the overlaps from the IPSC Target Array Book: two overlapping with
  the left or the right one in front, the lower one in front over the lower half, three in a row
  with the middle in front or behind, two with one above between them; no two layouts are the same
  arrangement), then one dropdown per card: target or no-shoot, each with or without hard cover.
  Stages saved with the old presentations open as the same cards.

- The bay's width and depth go in whole metres, and the grid (and grid snapping) now starts at the
  bay's edges, so the two line up at any width, odd ones included.
- Blueprint and Technical have a *Grid* switch beside the grid's intensity and colour; Industrial
  has an optional floor grid with its opacity, like Outdoor.
- The IPSC popper and the mini popper are one *Popper* with a choice of IPSC (85 cm) or mini
  (57 cm); stages with mini poppers open with them as mini poppers.
- Round plates come in Ø 20 or 30 cm, square plates in 15 × 15 or 30 × 30 cm (a size saved before
  opens as the nearest). The Props panel's text under each name says so.

## 0.10.1 (2026-11-22)

- Props panel: *Walls* and *Paper* come right under *Stage markings*, and only those three groups
  start open; the rest start folded (the groups you open or fold are still remembered).

## 0.10.0 (2026-11-22)

- The New match window's button reads *Create match* (still *Save match* when editing a match).

- *New stage* is gone from the Projects panel: a new stage is made with *Create new stage* in the
  greyed view (after *Close stage*), or *New stage in this match*. That button is now the side
  panels' grey button.

- Alerts show in the 3D view, centred near its top (above the grey cover): *Saved*, problems, an
  opened share link, a full *My shapes*, and new ones when you close: "*Name* saved and closed" for a
  stage or a match.
- After you create a stage (New stage, Create new stage, or in a match), the left panel shows Props.

- The right-hand Stage panel has *Close stage* under *Written stage briefing…*: it saves and closes
  the stage like *Close stage* in Projects (back to its match when you came through one). With no
  stage open both buttons hide.

- Stage library: each card shows just the name, with an *open as a new project* icon and an ⓘ on the
  right; the category, rounds and description show in the ⓘ's box (hover, tap or focus). In your
  stage list too, the ⓘ is the last icon.

- Projects: the buttons on matches and stages are small icons on the right of each row (open,
  duplicate, delete or remove); the trash glows red under the pointer and still asks first. The ⓘ
  is smaller and sits with them.

- Fix: the Projects panel could stay empty (no matches, no stages, no stage library) when a saved
  stage still held a prop under an older name (from before walls, tyres and pillars were merged):
  counting its targets stopped the panel filling. Saved stages are now upgraded as they are read,
  the counts skip anything they don't know, and each part of the panel fills on its own.

- Projects: every saved stage has a small ⓘ at the top right of its row. Hovering (or a tap, or
  keyboard focus) shows its details: paper and steel targets, no-shoots, minimum rounds, maximum
  points, stage type, bay size, props, and the matches it is in with its stage number.

- The Projects panel's corner button says what it closes: *Close stage* (saves it; back to the start
  of Projects, or to its match's page when you came through the match) or *Close match* (saves; back
  to the start); with nothing open there is no button. Closing leaves the view empty: greyed out under one
  button, *Create new stage*, or *Create new stage within this match* while a match is loaded. A
  reload stays closed. Building on the empty view asks for the stage's name first.

- Matches: drag a stage by its grip (⠿) to any place, in the match window and in the match's list in
  the Projects panel (mouse, finger or pen; the arrow keys on a grip move it too). The up and down
  arrows are gone. In the panel, × takes a stage out of the match after a warning that it stays in
  your saved stages.
- *Close match* leaves the match: the panel goes back to all your projects and the breadcrumb shows
  the stage on its own. A match's page shows only the match, with *Close match* at the top (the
  general buttons hide meanwhile). The breadcrumb follows how you got to a stage: through the
  match (Projects › match › Stage 2: name) or on its own (Projects › name).

- Matches are made in a window: *New match* asks for the name, then a dropdown adds stages (your
  saved stages, the example, the stage library), with up, down and remove on each; *Save match*
  shows the match in the Projects panel, where *Edit match…* opens the same window and *Close match*
  goes back to all your projects. The panel's in-place checklist and reorder buttons are gone.
- A breadcrumb under *Projects* shows where you are: Projects › a match (its page), Projects › a
  match › Stage 2: its name (a stage in a match), or Projects › a stage on its own.

- Stages from the stage library (opened, or added to a match) open clean too: their own layout on
  the default surroundings and light, nothing taken over from the stage you had open (no hall, no
  plan drawing or walls from your own surroundings). Imported files keep the settings they were
  saved with; opening any stage starts a fresh undo history.

- Fix: a new stage didn't seem to appear under Stages: when a match's page was open, the Projects
  panel came back on that match page, which hides the stage list. *New stage*, and opening the
  Projects panel, now show the full list (matches, then your stages).

- A new stage is clean: no props, no lines and the default surroundings and light. It used to take
  over the open stage's surroundings, so an Industrial hall or your own surroundings' buildings and
  walls came along.

- The stage's name shows over the 3D view, between the view buttons and the camera arrows, in white
  with a thin black outline and no background (just under the view buttons when the view is too
  narrow for both). It follows renames at once.

- *New stage* (and *New stage in this match*) asks for the stage's name first; *Cancel* or Escape
  makes no stage, and an empty name isn't accepted.

- Matches: *Add stages…* also offers the example stage and every stage in the stage library (with a
  search); each one ticked is saved as a new project and added to the match, without leaving the
  stage you have open. The stage list shows them straight away.

- Matches: a stage that is already in another match can be added (it was greyed out, so adding
  your stages to a new match could do nothing); it moves from that match, which closes up its
  numbers. *Add selected* with nothing ticked says so. A match's page shows only the match (the
  stage list and library showed below it), and a stray "null" under its buttons is gone.
- Fix: anything hidden by the app is hidden whatever its style (some panels and buttons showed
  anyway).

- Picking a prop (or a group) in the *On stage* list slides the camera over to it, so it is in the
  middle of the view; the distance and angle stay, nothing zooms.

- The 3D view runs to the top of the window: the toolbar (Undo, Redo, Print, Settings, Help,
  About) sits at the top of the right-hand column, above its panels (the left-hand one when the right
  is folded or empty), and only falls back to a bar across the top when both side columns are folded.

- Deleting (or cutting) a target closes its number's gap: numbers below it stay, numbers above move
  down by one (by two for a two-target array). The same for steel, no-shoots and shooting positions,
  each in its own series; labels typed by hand stay. *Renumber* is gone from the toolbar.
- Undo and Redo moved to the right side of the toolbar, beside Print.

- *Measure*, *Grid* and *Objects* moved from the toolbar to the right-click menu (a long press on an
  iPad): *Measure distances* (M), *Snap to the grid* and *Snap wall ends to walls*, each showing
  whether it is on.

- Every window (Settings, Briefing, About, Help, the drawing and plan windows, the questions) hangs
  from a fixed place near the top and grows downwards only; they were centred, so a window whose
  content changed grew up and down at once.

- With something selected, turning the view circles round it: dragging the ground swings the view
  round the selection (the pivot glides onto it), and the view pad's *Look* arrows circle the camera
  round it (pan) or raise and lower it round it (tilt).

- Settings opens as a window over the app (Done or Escape closes it) instead of a tab in the
  right-hand panel.
- The toolbar: *Duplicate* and *Delete* are gone from it (they are in the inspector, the right-click
  menu and ⌘/Ctrl D, Delete); *Print* sits left of *Settings*; *Written stage briefing…* moved to the
  right-hand panel, under the stage statistics, shown while the panel shows the stage (nothing selected).
- Saving shows a green *Saved* alert under the toolbar that fades away after a few seconds (it was a
  chip in the toolbar); a problem saving stays until you close it.
- The Help window is nearly as big as the browser window.

- Dining table and chairs: the chairs are pushed in, half of each seat under the table, and spaced
  between the table's legs.

- Sandbag wall: bags look like filled sandbags (squashed pillows, rounded edges, a tied end) and lie
  in a running bond with half bags closing the offset rows, so no bag hangs in the air at the ends;
  each row settles a little into the one below.

- Walls: *Mesh wall*, *Mesh wall with port* and *Mesh doorway* are one prop, *Mesh wall*, with a
  *Type* (Wall, Wall with port, Doorway); the same for *Wooden wall*, which gains a doorway. They
  are 1 m wide to start. A *Port* switch adds or removes the port, and the port moves left/right
  and up/down besides its width and height; the port's and the door's settings show only when they
  apply. Sight lines pass through the port where it is.
- Pillars: *Pillar* and *Round column* are one prop, *Pillar*, with a *Shape* (square or round);
  Size is its width or diameter. Old round columns (also in your own surroundings) open as round pillars.
- Tyres: *Tyre* and *Tyre stack* are one prop, *Tyres*, with a count (1 to 6).
- Stages saved with the old props open as the new ones, at their old sizes.

- Targets stand the way they do on a range, nothing floats:
  - Paper: in *Two overlapping targets*, *No-shoot over the left/right side* and *Target between
    two no-shoots*, the card that only overlaps an edge stands on its own stand 32 cm in front
    (it was stapled on and hung in the air); *Target in front of a no-shoot* has its rear stand
    behind, with its sticks in its sockets (the stands overlapped). Every stand is centred under
    its sticks and card, and the whole array is centred on the prop.
  - Steel: a raised popper stands on a foot plate (it stood on a bare post); a plate's post runs
    up behind it to its centre (it held the plate by its bottom edge).
  - Moving: the twister's card sits on its spindle, the bobber's riser runs up its guide post, the
    Texas star's hub sits on its post and the plate rack's plates are hinged to the beam.
- The version number now matches everywhere (package-lock.json still said 0.2.0); a test keeps it so.

## 0.9.1 (2026-11-21)

- Fix: opened over plain `http://` from another computer (a network address, not `localhost`), the
  app crashed on start (`crypto.randomUUID is not a function`): browsers offer that only on HTTPS or
  localhost. Ids are now made from `crypto.getRandomValues` there, so everything works. The README
  explains serving the app to other computers.

## 0.9.0 (2026-11-21)

- View pad: faint arrow buttons in the top-right corner of the 3D view steer the camera. *Look*
  pans left or right and tilts up or down, *Move* goes forward or back along the ground, *Height*
  raises or lowers it. Press and hold to keep moving (faster the higher the camera is). In a narrow
  view the pad sits at the bottom right.

## 0.8.0 (2026-11-20)

- New *Furniture* props, at real size with wood, fabric and leather textures:
  - **Bed:** single (90 × 200 cm) or double (160 × 200 cm); four wood finishes, five bedding colours.
  - **Sofa:** armchair, 2 or 3 seats, L-shape (chaise left or right), U-shape or corner sofa; four
    fabrics or black or brown leather.
  - **Office desk and chair:** small, medium or large desk with a drawer pedestal and a swivel chair.
  - **Dining table and chairs:** 2, 4, 6 or 8 chairs, the table sized to match.
  - **Coffee table:** rectangular or round, in oak, walnut, white or glass and steel.
- Plan drawing: *Force 90°* and *Colour the drawing* are now on by default.

- Plan drawing: snapping is gentler. Walls snap onto another wall within 15 cm (was 40 cm) and to its
  end within about 8 cm; doors and windows still find their wall within 40 cm. *Snap walls to walls*
  turns wall snapping off for points placed exactly where you click.

- Your own surroundings: under *Plan strength*, *Walls, doors and windows* makes the walls drawn on
  the plan see-through (10–100 %), saved with the surroundings.

- Plan drawing: *Force 90°* keeps every wall (and a door or window drawn across a gap) level or
  upright, whichever it is nearer.

- Switching surroundings gives the new ones their own light and surroundings settings. If you have
  changed any (sun, shadows, ground, foliage, grid…), a warning says they will be lost, with *Cancel*
  to keep everything as it is and *Switch anyway*.

- Industrial: the hall is higher (14 m walls), so the camera has room to move, and *Show roof and
  baffles* (Settings) hides the roof, trusses, lamps, light shafts and overhead baffles. Seen from
  outside the hall, a wall between the camera and the stage hides, like a cut-away drawing; from
  inside every wall is there.

- Plan drawing: walls snap onto other walls readily but to a wall's end only when very close, so a
  wall can stop near an end without being pulled onto it. *Move* picks a wall's, door's or window's
  end; the arrow keys nudge it 1 cm (Shift: 10 cm), and ends that meet move together.
- The drawn walls look real: *Walls* picks cast concrete, concrete block, brick, rendered plaster,
  timber boards or corrugated steel, textured at true scale and continuous from wall to wall, with
  grime at the foot (they were drawn black). Doors get a painted timber frame and, if chosen
  (*Door leaf*: none, closed or standing open), a four-panel door with a kick plate and lever
  handles; windows an aluminium frame with a centre mullion, glass and a concrete ledge.
- Fix: a saved plan lay on the ground upside down (its text mirrored) after a reload.

- Earth berm blends into the ground: a new *Surface* choice, *Same as the ground* (the default),
  follows the Outdoor ground; the berm's texture now continues the ground's pattern unbroken, and its
  foot takes the floor's tone, turning to the bank earth up the slope. A drawn berm no longer shows
  length and depth (its size comes from the drawing); *Base depth* is now *Depth, front to back*.
- Chain-link fence: the wire is drawn heavier so it stays visible at a distance, with a faint grey
  veil behind it, as real chain link reads from afar.
- Plan drawing: *Plan image* fades the plan so the drawing stands out, and *Colour the drawing* shows
  walls blue, doors pink and windows green (in the drawing only; the 3D walls are unchanged).

- Industrial looks more real: sealed concrete with a slight sheen, a worn walking lane and pools of
  lamp light; lighter cladding with sheet joints and rust runs, and a band of ribbed, dusty
  polycarbonate windows high on the walls; a pale insulated roof on purlins; glowing lamps with soft
  halos and faint light shafts under the skylights; overhead plywood-faced safety baffles across the
  range; rubber blocks that read as blocks, a steel cap and a sand trap; hazard-striped column bases;
  and the clutter of a working hall along the walls (pallets, drums, a pallet rack with boxes, an
  electrical cabinet, a fire extinguisher). Seen from above the roof, the structure overhead hides
  so the overviews look straight in.

- Surroundings from a plan: *My surroundings* and *New from a plan…* are offered with Technical and
  your own surroundings (not Outdoor, Blueprint or Industrial). The plan window is now nearly
  full screen with the plan scaled to fit (no scrollbars). After the scale, *Next: draw walls*: draw
  walls point to point, then doors and windows on them; ends snap together, walls straighten when
  nearly level or upright, doors and windows are set into their wall (or fill a gap between two
  walls, which then meet them), and windows become part of the wall (sill, glass, head). Set the
  walls', doors' and windows' heights and the wall thickness, and *Cut at* a height for walls,
  doors, windows or any mix. The walls are built in 3D; *Edit the plan: walls, doors, windows…*
  (Settings) goes back to change them or the scale.

- New surroundings, *Industrial*: an indoor range in an old factory hall, all of it worn. Polished
  concrete floor with saw-cut joints, cracks, oil stains, tyre marks and faded yellow walkway lines;
  grimy concrete block walls with dirty corrugated cladding above and a roller door; steel I-beam
  columns; roof trusses with skylights and high-bay lamps; a black rubber backstop. It is lit from
  the lamps overhead, so the time of day only sets how bright it is. The front is left open so the
  overviews from behind the shooters see in.
- Fix: after a reload, an open Settings panel showed the example stage's surroundings instead of
  the opened project's.

- Earth berm: a real mound now, with sloping sides and ends and lumpy dug-earth faces, on the
  Outdoor ground's own photo-scanned surface; *Surface* picks sand, light sand, dark sand, red dirt
  or gravel, and *Plants* grass and bushes, grass only or none. *Draw the outline…* opens the
  drawing window (up to 10 × 10 m): black squares become the berm at its *Height*, with a slope at
  their edges; *Back to a plain berm* undoes it.

- Outdoor ground grid: *Settings → Grid on the ground* draws 1 m squares (a stronger line every
  5 m) lying on the ground, with *Grid opacity* to set how see-through it is. Off by default.

- Fix: *Mirror the stage* mirrors the bay's shape too (notch side, L, dogleg, a drawing), so props
  stay on the floor.
- Fix: the drawing window no longer closes on a click outside it; *Cancel* or Escape ask before
  discarding a changed drawing.
- Fix: resizing a drawn bay in the Stage panel keeps the drawing centred under the props.
- Fix: lining props up or spreading them keeps them on the floor of a shaped bay.
- Fix: stages opened, imported or shared with props on a cut-away or raised part put them back on
  the floor.
- Fix: when another tab upgrades the app, the pending save is written before this tab reloads.
- Fix: Technical builds no walls round a drawn bay (they were buried in its raised ground).

- Rules: checked against the IPSC Handgun Competition Rules, January 2026 Edition. Every rule and
  value the app uses (course round limits 1.2.1.1–1.2.1.3, 5 points for A hits and steel, Comstock
  9.2.1, no-shoot penalties 9.4.2, minimum distances 2.1.3, 10.4.2 and 10.4.7) is unchanged; the app
  now cites the 2026 edition. Target arrays still follow the separate Target Array Book.
- Worn, real-scale building pieces and steel. Brick pillars, columns and walls now show bricks in
  horizontal courses at real size (215 × 65 mm in 10 mm joints, running bond) on every face, with
  colour variation, chipped arrises, salt bloom, grime streaks and recessed mortar; concrete has
  form seams, tie holes, bug holes, rain streaks and cracks; boards and steel cladding are
  weathered; all of them get dirtier toward the ground. Shipping containers are modelled like ISO
  boxes: trapezoidal corrugated sides with a few dents, two doors with pressings, four locking
  bars with cam keepers and handles, hinges, corner castings with their holes, rails and forklift
  pockets (20 ft), faded paint with re-painted patches, rust runs and patches, scrapes, road dirt
  and a made-up stencilled number (every colour kept). The chain-link fence has galvanised round
  posts with caps, a top rail, a woven 50 mm diamond mesh that sags a little between posts, and
  some white rust. Concrete barriers have a true Jersey profile, slots through the foot, lifting
  pockets, chipped top edges, rust runs and tyre scuffs at the base. Steel targets show re-painted
  old hits, fresh lead splash in the middle, chipped rusty edges and dust, with the paint colour
  still clear; stands and frames are worn, rusty, lead-spattered steel.

## 0.7.0 (2026-11-19)

- Draw your own bay shape: *Bay shape → Draw a new shape…* opens a white sheet with a 1 m grid (down
  range at the top, 35 × 35 m to start). Set the width and depth, pick black (raised ground) or
  white (floor), and draw with the pencil (1–5 m) or fill with the paint bucket, which fills the
  connected area of one colour as in other paint apps. Everything beside and behind the sheet is
  raised ground; up range stays open. Name it and save it to *My shapes* in the list. Raised ground
  is 2.5 m high with a 1.5 m slope down to the floor, which stays flat; Outdoor puts grass, bushes
  and stones on it (no trees on the drawn area), Technical and Blueprint show it as a relief, and
  the printed map shades it. A stage keeps its own copy of the drawing, so it travels in files and
  share links; *Edit this shape…* changes it.

## 0.6.0 (2026-11-19)

- More bay shapes: L and reverse L (full width at the front, one side carries on to the back), T (a
  narrow stem at the front opening to full width), U (two arms to the back round a berm), reverse U
  (two arms reaching to the front), and dogleg (Z) and reverse dogleg (S), where the back part is
  shifted to one side. Each has its own size fields; the banks, walls and printed map follow it.

- Fix: the app no longer hangs at start-up when an older copy is open in another tab or window; it
  says to close the other copies (and a newer copy opened elsewhere reloads this one).
- Fix: *Line up on the shooter's left / right* went the wrong way.
- Fix: mirroring now also swaps no-shoots over one side and left/right half hard cover.
- Fix: a share link pasted into a tab where the app is open now opens the stage.
- Fix: a stage can be in one match only; *Add stages you made…* shows the match a stage is already in.
- Fix: a match's name and stage number on the open stage are no longer undo steps (Undo keeps them).
- Fix: deleting a project takes it out of its match and renumbers the stages after it.
- Fix: dragging a group in a shaped bay stops the group as a whole at the floor's edge.

## 0.5.0 (2026-11-19)

- Safety distances: select a paper or steel target and switch on *Show safety distances* to draw the
  rulebook's rings on the ground round it (saved with the stage): steel 7 m in red (rules 2.1.3 and
  10.4.7) and 8 m in yellow (fault lines, rule 2.1.3); paper 3 m in yellow (rule 10.4.2, IPSC sets no
  minimum distance for paper). The inspector explains each ring.
- Removed the safety checks list under the stage statistics (added in 0.4.0) and its lines; the
  safety-distance rings, the sight lines and the library's steel at 7 m stay.

## 0.4.0 (2026-11-19)

- Share links: *Copy share link* (Projects) copies a link that holds the stage itself after the #,
  so nothing is uploaded. Opening it adds the stage as a new project, checked like an imported file.
- Run-time estimate: the stage statistics give a time for a fast and a steady run (draw, shots,
  movement along the route, reloads) and the hit factors they give with all A hits. A rule of
  thumb, not a rule.
- Bay shapes: under the Stage panel, a bay can be a rectangle, tapered (narrower at the back or the
  front) or have a back corner cut away. Props stay on the floor; the Outdoor banks, the Technical
  walls, the Blueprint corner marks and the printed map follow the shape.

- Setup sheet: the printed brief ends with a page listing where each prop goes, measured from the
  left side line and the up-range edge and to both up-range corners (two tapes), with its rotation,
  and the corner points of the fault lines and shooting areas.

- Sight lines: select a shooting position to see which targets it sees (at its stance's eye
  height) and which are hidden, in the inspector, with a green sight line to each target seen.

- Safety checks under the stage statistics, from the IPSC Combined Competition Rules (January
  2024): steel closer than 7 m to where a shooter may stand, fault lines closer than 8 m to steel
  (rule 2.1.3), targets that can only be shot, or can also be shot, with the muzzle past 90° from
  down range (rule 2.1.2), and targets nobody can see from a shooting area, position or the start.
  *Show* selects the props concerned.
- Library: steel in seven stages (Barrel Gate, Popper Curtain, Zigzag Run, Split Wall, Dogleg,
  Octagon House, Chicane) moved down range to keep the 7 m minimum distance.

- Match files: *Export the match* saves the match and all its stages in one file; *Import file…*
  takes stage files and match files (each stage becomes a new project, in a new match).

- Exact positions: the inspector shows a prop's position (across, + to the shooter's left, and down
  range, in metres); type a value to place it exactly, without grid snap.
- Mirror, align and spread: *Mirror the stage* flips everything left to right (Stage panel or the
  right-click menu); with props selected, mirror them, line them up (left, centre, right, front,
  back) or spread three or more evenly across or down range. Locked props stay put.

- Paper target stands have dark brown feet instead of blue ones.

## 0.3.0 (2026-11-19)

- Matches: under Projects, *New match* starts a match of one or more stages in order. On its page,
  add a new stage to it or add stages you already made, move them up and down, take one out, open
  one, rename the match and *Print the match* (a cover page with every stage's rounds and points,
  then each stage's brief page). Each stage in a match gets the match name and its stage number in
  its briefing; taking it out, or deleting the match, keeps the stage as a project.
- Fix: a Projects tab still shown after a reload no longer tries to fill before the project store
  has opened.

- Measuring tool (toolbar *Measure* or M): tap two points on the ground to see the distance
  between them; near a prop or the start a point snaps to its centre (Shift: exactly where you tap).
  Take as many as you like; *Clear* or Escape removes them. Not saved with the stage.

- Fault lines and shooting areas are a muted, weathered red instead of a bright one.

- Fix: CI's test run (Node 22) names the test files by pattern instead of the folder.

- New Blueprint defaults: the sun set by hand like Outdoor and Technical, a deep blue paper
  (220°, 54 % intensity, 40 % brightness) and a faint white grid (14 %).

## 0.2.0 (2026-11-19)

- New Technical defaults: the sun set by hand like Outdoor (31°, 35°, warm white; sunlight 85 %,
  ambient 105 %, softness 4), the floor at 110 % brightness, the grid at 40 %, walls hidden.

- Outdoor's default foliage is now Nordic (spruce, pine, birch).

- With Play on, an activated target (with Animate on) waits at rest until its activator falls,
  then moves, and eases back to rest as the activator stands up again; a step pad or pull lever
  goes 1.5 s into each 7 s cycle.

- Settings → Environment, Blueprint and Technical: *Grid intensity* (0 hides it) and *Grid
  colour* (swatches or your own). The grid is drawn on its own layer, so the ground colour no
  longer changes it.

- New View defaults: figures 20 %, position marks 30 %, route line 15 % opacity.

- Much more detailed, realistic foliage: trees grow from branching, tapered, bark-textured
  skeletons carrying hundreds of leaf cards painted with leaves, needles or leaflets, shaded as
  volumes. Oak-like broadleaf trees, spruces in tiers of needle sprigs, Scots pines with orange
  upper bark, white birches with hanging twigs, umbrella acacias, coconut palms with arching
  fronds, dead fronds and coconuts, ribbed saguaros with spines, flowering barrel cacti and prickly
  pear with fruit; bushes built from leaf cards in each kind's own leaves.

- New Outdoor defaults: sun 31° high at 35°, warm white; sunlight 85 %, ambient 105 %, shadow
  softness 4, haze 15 %, exposure 1.00, clouds 45 % at 50 % speed.

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
