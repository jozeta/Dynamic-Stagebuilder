# Dynamic-Stagebuilder

A browser-based 3D stage builder for IPSC practical shooting. Lay out a stage at real scale, look at
it from any angle, and print a Written Stage Briefing with a stage map for range officers and
competitors.

**Version:** 0.8.0 · **Try it:** [jozeta.github.io/Dynamic-Stagebuilder](https://jozeta.github.io/Dynamic-Stagebuilder/)
(runs in the browser; nothing to install, nothing leaves your device) · Started 2026-11-18 (see the
[v1 design](docs/superpowers/specs/2026-11-18-stage-builder-v1-design.md)).

## Who it's for

Professional stage builders and enthusiast IPSC shooters who design stages for club matches and
training, and want a clear briefing sheet without drawing the map by hand.

## What it does

- **Shooting bay** at real scale: width × depth in metres (default 20 × 30 m), 1 m grid; a
  rectangle or tapered, L, T, U, dogleg or with a corner cut away.
- **Safety distances** from the IPSC Handgun Rules (January 2026): rings round a target at 7 and 8 m for
  steel, 3 m for paper.
- **Sight lines** from a shooting position, a **run-time estimate**, a printed **setup sheet**, and
  **share links** that carry the stage itself.
- **Prop library**, every prop drawn in 3D at real dimensions:
  - stage markings (first in the panel): fault lines, shooting areas, the start position and
    numbered shooting positions with a facing, look angle and stance
  - paper: IPSC target and mini target, each in two versions, Classic (octagon, 45 × 57 cm) or
    With head (46 × 76 cm), on sticks with an adjustable stand height. Each one can be a target, a
    no-shoot or a common competition array (no-shoots over a side or the lower half, between two
    no-shoots, overlapping targets, two targets with a no-shoot between, stacked), with painted
    hard cover (lower ¼, ⅓ or ½, left or right half, lower diagonal)
  - moving and reactive: swinger, drop turner, clamshell, mover on a track (up to four cards),
    bobber, twister, Texas star (5 or 10 plates), plate rack, dueling tree (the last three are
    marked as not allowed in IPSC)
  - activators: step pads and pull levers; start X marks
  - a door that opens, a wall with a shuttered port, hard-cover panels, raised barricades, a wobble
    platform, a balance rope and a step box
  - steel: IPSC popper, mini popper, round plate, square plate
  - walls: mesh wall and mesh wall with port (orange safety netting, or black or blue wire mesh,
    in a light pine or black frame on feet),
    wooden wall, wooden wall with port; ports are real openings
  - mesh doorway (a wall with a door opening) and solid panel (a grey sheet in a pine frame);
    both snap like the other walls
  - structures: ramp, platform
  - obstacles and range furniture: 200 l steel drum (black, blue, red, green), tyre, tyre stack,
    shipping crate, potted plant, car (saloon, hatchback, pickup or van, in five colours), table,
    chair, pallets, sandbag wall, traffic cone
  - furniture: bed (single or double), sofa (armchair, 2 or 3 seats, L, U or corner, in fabric or
    leather), office desk with a swivel chair, dining table with 2–8 chairs, coffee table (rectangular
    or round), each in several wood finishes and colours
- **Editing by eye:** tap or drag props in, drag them on the ground, rotate them, all with grid and
  angle snapping; multi-select, duplicate, delete, undo and redo.
- **Snapping:** walls snap end to end onto nearby walls, so a run of walls joins up cleanly; other
  props snap to the grid. Hold **Shift** while dragging for slow, fine moves without snapping.
- **Automatic target numbers** (T1…, P1… for steel, NS1… for no-shoots), with hand-set labels kept.
- **Live statistics:** targets, no-shoots, minimum rounds, maximum points, suggested stage type.
- **Written Stage Briefing** editor: match, stage name and number, designer, stage type, scoring,
  start signal, start position, gun condition, procedure, stop time and notes, with common choices
  or your own text. Targets, rounds and points are counted from the stage.
- **Printable brief** (A4): a header with the stage number and key figures, the briefing grid, the
  procedure and a top-down map with a legend and scale bar on page 1, a 3D view on page 2. Save it
  as a PDF from the print dialog.
- **Help** guide with a drawing for every main task, and side panels you can dock left, right or
  under the view, fold away and resize (remembered).
- **Your own surroundings** from a blueprint or site plan, measured with one known length. Draw
  its walls, doors and windows over the plan (snapping, Force 90°, a Move tool with arrow-key
  nudging), set their heights or cut them at a height, and pick a realistic wall surface and door
  leaf; they are built in 3D. Add building pieces (walls, pillars, columns, earth berms you can
  draw, containers, fences, barriers) and save it all as a template.
- **Activation links** from poppers, plates, step pads and pull levers to the moving targets they
  start, listed in the briefing.
- **Animated moving targets** (swingers, drop turners, clamshells, movers, Texas stars, plate racks,
  dueling trees, poppers) with a per-prop switch and one Play / Pause button.
- **Four surroundings,** Outdoor (a dirt range with earth banks, bushes and trees, stones, a
  choice of sand, light sand, dark sand, red dirt or gravel, and an optional ground grid), Technical
  (grey floor, grid), Blueprint (an endless, worn blue drafting sheet with grid, title block,
  comments, arrows and stamps) and Industrial (a worn indoor factory hall, with a roof you can hide).
  Switching never moves anything on the stage; a warning asks first if your surroundings settings
  would be lost.
- **Environment settings:** time of day (the sun moves and warms toward evening), sunlight,
  ambient light, shadows and their softness, haze, exposure and drifting clouds (amount, speed,
  wind), saved with the stage.
- **The shooter's run:** numbered shooting positions with a stance (standing, crouching,
  kneeling, sitting, prone), facing and look angle, each shown as a detailed see-through grey man
  holding a pistol; the shooter at the start is posed as the briefing's start position says
  (hands up, arms hanging, seated…), pistol holstered. A route on the ground links them; Shooter's
  eye walks it at a chosen speed, looking the way the shooter moves, or jumps between positions.
- **Cameras:** orbit, pan, zoom, Top, Isometric, Front and Shooter's eye; the view is remembered
  per project, so a reload opens where you left off. Figures fade out as the camera comes close.
- **Matches** of one or more stages, numbered in order, with the match name in every briefing and
  one print for the whole match.
- **Projects** saved in the browser automatically, with JSON export and import, and a **stage
  library** of 58 ready-made drills and IPSC/USPSA stages (including 24 after the 2012 US IPSC
  Nationals) to open and edit, each with suggested shooting positions worked out from its sight lines.
- **Works offline** and can be installed as an app (PWA).

Not in v1 (ideas for later): matches with several stages, a build sheet with coordinates, measuring
tools, more surroundings and props, model import, version history.

## Devices

Computers (mouse and keyboard first) and iPads (touch; every action also has a button). Phones are
not supported: below 768 px wide the app asks you to use a larger screen. English only.

## What's new

### 0.8.0 (2026-11-20)

- **Furniture:** a bed, sofas (1–3 seats, L, U and corner), an office desk with chair, a dining
  table with 2–8 chairs and a coffee table, at real size in wood, fabric and leather.
- **Draw walls, doors and windows on a plan:** in a near full-screen window, with gentle snapping,
  *Force 90°*, a *Move* tool, colours while drawing, realistic wall surfaces, door leaves and
  window frames, heights and a cut; *Walls, doors and windows* makes them see-through.
- **Industrial surroundings:** an indoor factory hall, worn and realistic, with a 14 m roof you can
  hide and walls that cut away when you look in from outside.
- **Realistic, worn props:** bricks, containers, chain-link fence, barriers, steel targets; an earth
  berm that blends with the ground, with plants and a drawn outline.
- **Outdoor ground grid**, a warning before switching surroundings, rules checked against the
  January 2026 IPSC Handgun Rules, and fixes.

Older versions are listed in [CHANGELOG.md](CHANGELOG.md).

## Screenshots

<table>
  <tr>
    <td><img src="docs/screenshots/editor-outdoor.png" alt="The editor on the Outdoor range" width="400"><br>The editor: Props, the stage on an outdoor range with Nordic foliage, the Inspector and statistics</td>
    <td><img src="docs/screenshots/outdoor-close.png" alt="A stage from the front" width="400"><br>A library stage from the front: mesh walls, a port, targets and the shooting positions</td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/shooters-eye.png" alt="Shooter's eye at a shooting position" width="400"><br>Shooter's eye at position 1, with the move arrows and the run controls</td>
    <td><img src="docs/screenshots/on-stage-menu.png" alt="The On stage panel and the right-click menu" width="400"><br>The On stage panel (groups, hide, lock) and the right-click menu</td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/foliage-nordic.png" alt="Nordic foliage" width="400"><br>Foliage: Nordic spruces, pines and birches</td>
    <td><img src="docs/screenshots/foliage-tropical.png" alt="Tropical foliage" width="400"><br>Foliage: coconut palms and lush bushes</td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/blueprint.png" alt="The Blueprint surroundings" width="400"><br>Blueprint: a worn drafting sheet, with paper and grid colours in Settings</td>
    <td><img src="docs/screenshots/technical.png" alt="The Technical surroundings without walls" width="400"><br>Technical with a tinted floor running on to the horizon, walls hidden</td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/settings.png" alt="Settings, Environment tab" width="400"><br>Settings → Environment: surroundings, ground, foliage, sun, light, clouds</td>
    <td><img src="docs/screenshots/settings-view.png" alt="Settings, View tab" width="400"><br>Settings → View: walking speed, and the colour and opacity of figures, marks and route</td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/projects.png" alt="The Projects tab with the stage library" width="400"><br>Projects and the stage library (58 stages)</td>
    <td><img src="docs/screenshots/briefing.png" alt="The Written Stage Briefing" width="400"><br>The Written Stage Briefing; rounds and points are counted from the stage</td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/print-page1.png" alt="Printed brief, page 1" width="400"><br>Printed brief, page 1: header, top-down map with scale bar, briefing</td>
    <td><img src="docs/screenshots/print-page2.png" alt="Printed brief, page 2" width="400"><br>Printed brief, page 2: the 3D view</td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/ipad-portrait.png" alt="The editor on an upright iPad" width="400"><br>On an upright iPad: the Inspector docks under the view</td>
    <td></td>
  </tr>
</table>

## Installation

**Use it online:** open [jozeta.github.io/Dynamic-Stagebuilder](https://jozeta.github.io/Dynamic-Stagebuilder/).
Everything runs in your browser and your stages stay in it.

**Run it yourself:** no build step and no server-side code. Serve the folder and open it in a browser:

```sh
python3 -m http.server 8002      # then open http://localhost:8002/ (or: claude-update)
```

Any static web server works (the app only loads its own files). Offline support and installing
need `http://localhost` or HTTPS; opened as a `file://` page the editor works but nothing is cached.

**Install as an app:** in Safari on an iPad or Mac, Share → Add to Home Screen (or Add to Dock); in
Chrome or Edge, the install button in the address bar. Installed, it works without a connection, and
Safari keeps its saved stages (a site that isn't installed can lose them after 7 days unvisited).

## Configuration

Stage settings are in the inspector when nothing is selected. They are saved with the stage.

| Setting | What it does | Default |
|---|---|---|
| Bay width | Width of the shooting bay across the range, 1–200 m | 20 m |
| Bay depth | Depth of the bay down range, 1–200 m | 30 m |
| Bay shape | Rectangle; *Tapered* (narrow end back or front, its width); *Corner cut away* (back left or right, cut width and depth); *L* / *Reverse L* (width of the back part, depth of the full-width front); *T* (width and depth of the front stem); *U* (arm width, depth of the full-width front); *Reverse U* (arm width, depth of the front arms); *Dogleg (Z)* / *Reverse dogleg (S)* (width of each part, where it bends). Width and depth stay the outer rectangle. *Draw a new shape…* and *My shapes*: a drawn grid of raised ground and floor (see How to) | Rectangle |
| Grid snap | Positions snap to this grid: off, 0.1, 0.25, 0.5 or 1 m (toolbar *Grid* turns it on/off) | 0.25 m |
| Object snap | Toolbar *Objects*: a wall's end jumps onto another wall's end within 35 cm | On |
| Angle snap | Rotations snap to this step: off, 5°, 15°, 45° or 90° | 15° |
| Surroundings | *Settings*: Outdoor (dirt range), Technical (grey floor, grid), Blueprint (drafting sheet) or Industrial (an indoor factory hall, lit from overhead); never moves the stage | Outdoor |
| Ground | *Settings* (Outdoor): sand, light sand, dark sand, red dirt or gravel | Gravel |
| Foliage | *Settings* (Outdoor): mixed broadleaf, Nordic, desert, savanna, tropical or bare banks | Nordic |
| Grid on the ground | *Settings* (Outdoor): 1 m squares on the ground, a stronger line every 5 m; *Grid opacity* 5–100 % | Off, 35 % |
| Paper / Floor hue, intensity, brightness | *Settings* (Blueprint, Technical): 0–359°, 0–100 %, 40–160 % | Blueprint 220°, 54 %, 40 % (deep blue); Technical's grey floor at 110 % brightness |
| Grid intensity, Grid colour | *Settings* (Blueprint, Technical): 0 % (hidden) – 100 %; seven swatches or your own colour | Blueprint 14 %, white; Technical 40 %, dark grey |
| Show walls | *Settings* (Technical): the backstop and side walls; the floor runs on to the horizon either way | Off |
| Cloud shadows | *Settings* (Outdoor): how dark the clouds' shadows on the ground are, 0–100 % | 50 % |
| Time of day | *Settings*: on/off; on, 06:00–20:00 moves the sun (its height, direction and colour follow it) | Off (the sun set by hand) |
| Sun height, direction, colour | *Settings*, with Time of day off: 2–90°; 0–359° (0° = behind the shooter, 90° = to the shooter's left); dark orange → yellow → white | 31°, 35°, warm white |
| Sunlight | *Settings*: 0–200 % | 85 % |
| Ambient light | *Settings*: 0–200 % | 105 % |
| Shadows, Shadow softness | *Settings*: on/off, 0 (sharp) – 8 | On; 4 |
| Shadow strength | *Settings*: 0–100 %; lower makes shadows lighter | 55 % (only the props' shadows) |
| Haze | *Settings*: 0 (clear) – 100 % (Outdoor only) | Outdoor 15 % |
| Exposure | *Settings*: 0.5–1.6 | 1.00 |
| Clouds | *Settings → Environment* (Outdoor): 0 % (clear) – 100 % | 45 % |
| Cloud speed | *Settings → Environment* (Outdoor): 0 (still) – 300 %; 100 % ≈ 8 m/s; they move only with Play on | 50 % |
| Wind direction | *Settings → Environment* (Outdoor): which way the clouds drift, 0° = toward down range, 90° = toward +x | 70° |
| Hidden props | *Settings → Props*: groups and single props the props panel leaves out (per browser) | None |
| Panel places | Drag a panel's tab (or a lone panel's grip ⋮⋮) onto a side for a frame of its own, or onto another frame to add it as a tab; or click the grip for *Move to…* (per browser) | Props, On stage and Projects as tabs on the left; Inspector and Settings on the right (under the view on a narrow screen) |
| Folded panels | The arrow beside the grip (per browser) | Both open |
| Panel sizes | Drag a dock's inner edge, or arrow keys on it (Shift: bigger steps); double-click resets (per browser) | 260 / 300 px, bottom 260 px |
| My surroundings | *Settings*: your own plan-based surroundings, with plan position, turn and strength | None |
| Default target style | *Settings → Props*: Classic (octagon) or With head, for new paper targets | Classic |
| Shooter's eye walking speed | *Settings → View*: slow walk 1.6, walk 2.4, quick move 3.4 or sprint 4.6 m/s, when Play is on (per browser) | Sprint |
| Figures, position marks, route line | *Settings → View*, each: show or hide, colour (seven swatches or your own), opacity 10–100 % (per browser) | Shown, light grey; figures 20 %, marks 30 %, route 15 % |
| Camera view | Remembered per project as you move the camera (per browser) | The Isometric overview |

Prop settings (inspector, one prop selected): label (targets), rotation, and per prop: stand height
for paper targets (0.1–2 m, default 0.7 m to the lowest card's bottom), presentation (target,
no-shoot or an array; default target), hard cover (default none), target style (Classic or With head), base height for steel, plate size
(15–30 cm), wall length (0.5–4 m) and height (0.5–2.5 m), mesh colour (black/blue), frame
(wood/black), port width, height and bottom edge, door width and height, paint for poppers and
plates (white/yellow), plates on a Texas star (5 or 10) or plate rack (4–8), mover track length
(1.5–6 m), car model (saloon, hatchback, pickup, van) and colour, barrel colour, ramp and platform length, width and height, table
length, pallets in a stack (1–6), sandbag wall length and rows, tyres in a stack (1–6), crate size.

Scoring follows the IPSC Handgun Competition Rules, January 2026 edition: 2 hits per
paper target and 1 per steel target (Comstock), 5 points per A-zone or steel hit, and Short ≤ 12,
Medium ≤ 24, Long ≤ 32 rounds. The rules also limit hits per shooting position, so the stage type
is a suggestion from the round count.

## How to

**Build a stage.** The props panel on the left is grouped (Stage markings, Paper, Steel, Moving
and reactive, Walls, Structures, Obstacles and range furniture, Furniture: bed, sofa, office desk and chair, dining table and chairs, coffee table); click a group's heading to fold it
away, or hide groups and props you never use in *Settings → Props*. The arrow at the top of each
side panel folds the whole panel to give the 3D view more room, and the grip beside it (⋮⋮) moves the
panel to the left, the right or under the view (drag it there, or click it and choose). Pick a prop in the library, then tap (or click) the ground to place it.
With a mouse you can also drag a prop from the library onto the stage. Drag a placed prop to move it;
it snaps to the grid and stays inside the bay. Rotate the selected prop with the green ring, the
↺/↻ buttons in the inspector, or Q and E. Shift-click selects several props.

**Join walls.** Drag or drop a wall so its end comes within about 35 cm of another wall's end and
it jumps into place, end to end (in a straight line or at a corner). Turn *Objects* off in the
toolbar to place walls freely, and *Grid* off to stop grid snapping. For fine adjustments, hold
**Shift** while you drag: the prop moves at a fifth of the speed and doesn't snap.

**Set up targets and arrays.** Select an IPSC or mini target and pick a *Presentation*: target,
no-shoot, or a common array (no-shoots over a side or the lower half, between two no-shoots,
overlapping, two targets with a no-shoot between, stacked). *Hard cover* paints part of the first
card black. The inspector warns when the top of the array is above 1.8 m (1.6 m for mini targets),
the IPSC limit. Moving and reactive targets (swinger, drop turner, clamshell, mover, Texas star,
plate rack, dueling tree) are in their own group.

**Draw fault lines and shooting areas.** Choose *Fault line* or *Shooting area* at the top of the props panel, tap
the points on the ground, then double-click, press Enter or tap *Finish*. Escape or *Cancel* stops.
*Start position* then a tap sets where the shooter starts (the shooter's-eye camera stands there).

**Build an earth berm.** *Earth berm* (Buildings and surroundings) is a mound with sloping sides and
ends, on the Outdoor ground's own surface. In the inspector set its length, height and base depth,
its *Surface* (sand, light sand, dark sand, red dirt or gravel) and *Plants* (grass and bushes, grass
only or none). *Draw the outline…* opens the drawing window (up to 10 × 10 m): the black squares
become the berm at its height, with a slope at their edges; *Back to a plain berm* goes back.

**Use your own range.** In *Settings → Surroundings* (with Technical or your own surroundings), choose *New from a plan…* and pick an image of your range's blueprint or site plan.
Click both ends of something whose real length you know (a wall, a bay line) and type that length;
the plan is scaled to match. *Next: draw walls* lets you trace the building on the plan: *Wall*
(click corner to corner, double-click or *Finish wall* to stop), *Door* and *Window* (click both
ends on a wall, or across a gap between two walls), *Move* (pick an end, then nudge it with the
arrow keys, 1 cm a press or 10 cm with Shift) and *Erase*; *Force 90°* (on by default) keeps every line level or upright, and *Colour the drawing* (on by default) shows walls blue, doors pink and windows green. Walls snap onto other walls and to an end
only when very close; doors and windows are set into their walls. *Plan image* fades the plan and
*Colour the drawing* shows walls blue, doors pink and windows green. *In 3D* sets the walls'
surface (cast concrete, concrete block, brick, rendered plaster, timber boards or corrugated steel)
and the doors' leaf (none, closed or standing open). Set the heights of walls, doors and windows (sill and top), the
wall thickness, and *Cut at* a height for walls, doors, windows or any mix, to see over them. *Save*
lays the plan on the ground with the walls built on it; *Edit the plan: walls, doors, windows…* in
Settings goes back to it. Use the
sliders to move, turn and fade it until it lines up. Then rebuild what's really there with the
*Buildings and surroundings* props (walls, pillars, columns, berms, containers, fences, barriers) and
press *Save pieces to these surroundings*. The template then shows up under *My surroundings* for
every stage. *Edit the pieces on the stage* brings them back to change. Templates live in this
browser only; a stage opened on another device shows a plain floor until you make the template there.

**Link activators.** Select a moving target (swinger, drop turner, clamshell, mover, bobber,
twister, Texas star or shuttered port) and choose what starts it under *Activated by*: a popper,
plate, step pad or pull lever on the stage. Selecting either one shows an orange dashed line
between them; the briefing and the printed brief list every link. With Play on (and Animate on for the
target), the target waits until its popper or plate falls, then moves.

**Animate moving targets.** Select a swinger, drop turner, clamshell, mover, Texas star, plate rack,
dueling tree or popper and switch on *Animate*. The *Play / Pause* button over the 3D view (it
appears once something is animated) starts and stops all of them together.

**Plan the shooter's run.** Pick *Shooting position* in Stage markings and tap each place the
shooter shoots from; they are numbered 1, 2, 3…. In the inspector set the stance (standing,
crouching, kneeling, sitting, prone), the facing and the look up/down angle; each position shows
a grey man in that stance. The man in the start box takes the pose the briefing's *Start position*
describes and has his pistol holstered unless the gun starts on a table or in a case; "facing up
range" turns him round. Library stages come with suggested positions: each target is seen from
one of them, from inside the shooting areas, round the walls.

Click *Shooter's eye*: it opens at the selected shooting position, else at the start. The arrows
under the view buttons (or [ and ]) step from the start to each position, at that stance's eye
height, and *Play run* walks the whole course, pausing at each position. A dashed line on the
ground shows the route between them: click it to add a grab point, drag a grab point to reshape
the route, click one to remove it. With *Play* on, the camera walks the route over the ground,
ramps and platforms, looking the way the shooter moves and turning to the position's view as it
arrives (set the speed in *Settings*); with *Pause* on, it jumps. Standing at the start or a
position, look around and let go: that view is saved. The grey arrows in the lower left move the
position you stand on 25 cm forward, back, left or right (one undo step each). Figures fade out as
the camera comes close, so you never look out from inside one.

**Organise what's on the stage.** The *On stage* tab in the left panel lists every prop on the
stage. Click a row to select it (its settings show on the right); Shift- or ⌘-click, or switch on
*Select several* on an iPad, to pick more. *Group* (⌘G) puts the selection in a group: double-click
its name to rename it, fold it with its arrow, and hide or lock the whole group with its eye and
lock. Drag rows onto a group, or use *Move to…*; copy, paste and delete from the bar. A locked prop
can't be clicked or dragged in the 3D view (change it from the list or the inspector); a hidden
prop isn't drawn but still counts in the statistics and the brief. Right-click a prop in the view
or the list (long-press on an iPad) for cut, copy, paste, duplicate, delete, lock, hide, group,
rotate 90°, select all of that kind, frame the selection and Shooter's eye from a shooting
position; right-click the ground to paste there.

**Measure distances.** Press *Measure* in the toolbar (or M), then tap two points on the ground: a
dashed line shows the distance in metres. Near a prop or the start, a point snaps to its centre, so a
shooting position to a target is exact; hold Shift to place it exactly where you tap. Take as many as
you like; *Clear* removes them and *Done* or Escape ends measuring. Measurements aren't saved.

**Place props exactly.** Select a prop: the inspector shows its position, *Across* (metres from the
centre line, + to the shooter's left) and *Down range* (metres from the up-range edge). Type a value
to put it exactly there, without grid snap. With two or more selected, *Arrange* lines them up (left,
centre, right, front or back) or spreads three or more evenly across or down range. *Mirror left to
right* flips the selection about its centre; with nothing selected, *Mirror the stage* flips every
prop, line and the start about the centre line (doors swap hinge sides). Locked props stay put.

**Show safety distances.** Select a paper or steel target and switch on *Show safety distances*:
rings on the ground round it at the IPSC rulebook's distances (Handgun Competition Rules, January
2026), each explained in the inspector and saved with the stage. Steel: 7 m in red (nobody
closer while it is shot, rule 2.1.3; a shot from closer is a disqualification, rule 10.4.7) and 8 m in
yellow (the nearest a fault line limiting the approach may be, rule 2.1.3). Paper: 3 m in yellow (rule
10.4.2; IPSC sets no minimum distance for paper). A designer's aid, not a range approval.

**See what a position sees.** Select a shooting position: green sight lines run from its eye (at its
stance's height) to each target it can see, and the inspector lists the targets seen and hidden.

**Estimate the run time.** The stage statistics give a time for a fast and a steady run (draw, the
minimum rounds, the walk along the route through the shooting positions, and a reload every 15
rounds) and the hit factors they give with all A hits. A rule of thumb for designers.

**Shape the bay.** With nothing selected, *Bay shape* fits the bay to a range that isn't a
rectangle: tapered, a back corner cut away, an L or reverse L, a T, a U (a berm jutting in from the
back) or reverse U (from the front), or a dogleg (Z or S) where the back is shifted to one side. Each
shape has its own sizes; "left" is the shooter's left.

**Draw a bay shape.** Choose *Draw a new shape…* in *Bay shape*: a white sheet with a 1 × 1 m grid,
down range at the top and the shooter's left on the left, 35 × 35 m to start. Set the width and depth
in whole metres, then pick a colour, black (raised ground) or white (floor), and a tool: the *Pencil*
paints the squares under it (1, 2, 3 or 5 m wide), the *Paint bucket* fills the connected area of one
colour, as in other paint apps (draw a closed outline, then fill its inside). *Clear the drawing*
starts over. Everything beside and behind the sheet is raised ground too; up range stays open. Name it and *Save shape*: it is put on the
stage and saved under *My shapes* in the list, in this browser (up to 30). Raised ground is 2.5 m high
and slopes down over 1.5 m to the floor, which stays flat; props can't stand on it. In Outdoor it
gets grass, bushes and stones (trees stay out beyond the bay); Technical and Blueprint show it as a
raised surface, and the printed map shades it grey. A stage keeps its own copy of the drawing, so it
goes with exported files and share links. *Edit this shape…* reopens the drawing (and *Delete from My
shapes* removes a saved one). Props move onto the floor if
they would be off it; the Outdoor banks, Technical walls and the printed map follow the shape.

**Number targets.** Targets are numbered as you place them: T1… for paper, P1… for steel, NS1… for
a lone no-shoot (an array with a target is one T label; its targets and no-shoots all count in the
statistics). Deleting a target leaves a gap until you press *Renumber*. To set a label by hand, type
it in the inspector; Renumber keeps hand-set labels and warns about duplicates.

**Look at the stage.** Drag the empty ground to orbit, right-drag (two fingers on an iPad) to pan,
scroll or pinch to zoom. The buttons over the view jump to Isometric, Top, Front, Shooter's eye or
frame everything. *Isometric* is a high oblique "drone" overview (45° down, slightly turned, a
long 32° lens) that fits the whole bay; *Shooter's eye* and *Front* use a natural 55° lens.

**Change the light and surroundings.** *Settings* opens in the right-hand panel (the 3D view stays
live; *Done* or Escape returns to the inspector). It switches between Outdoor and Technical and sets
the time of day, sunlight, ambient light, shadows (on/off, softness, strength), haze and exposure. Changes show as you drag the
sliders; *Reset light to defaults* goes back to the defaults of the surroundings you're in. Nothing on the stage moves, and
the printed 3D view uses the same light.

**Undo anything** with Undo/Redo or ⌘Z / ⇧⌘Z (Ctrl on Windows).

**Write the briefing.** *Briefing* opens the Written Stage Briefing. Fill in the match, stage
number, designer, start signal, start position, gun condition, procedure and notes. Scoring, start
signal, start position, gun condition and stop time have a list of common wordings; *Custom text…*
lets you type your own. *Add a common sentence…* adds a usual procedure line. Targets,
minimum rounds and maximum points are counted from the stage and can't be typed over. Stage type
is suggested from the round count; pick Short, Medium or Long to set it yourself.

**Print the brief or save it as a PDF.** *Print* makes a two-page A4 brief. Page 1: a header with
the stage number, name, minimum rounds and maximum points, the briefing in a grid, the procedure,
and a top-down map of the stage (down range at the top) with a legend and scale bar. Page 2: a 3D
view. Page 3: the setup sheet, for building it: every prop measured from the shooter's-left side line
and the up-range edge and to both up-range corners (two tapes), with its rotation, and the corner
points of the fault lines and shooting areas. A long
procedure carries on to the next page instead of being cut. In the print dialog choose
*Save as PDF*; on an iPad, tap Share → Print, then pinch out on the preview and Share → Save to Files.

**Run a match.** In the *Projects* tab, *New match* starts a match: name it, then *Add stages you
made…* to tick stages you already have, or *New stage in this match* for a fresh one. The match lists
its stages in order as Stage 1, 2, 3… with each one's rounds and points and the match's totals; move a
stage with its arrows, *Remove* it from the match, or *Open* it to edit. Every stage in the match gets
the match name and its stage number in its briefing, renumbered when you change the order. *Print the
match* prints a cover page (the stages with their rounds and points) and then each stage's brief page;
the 3D view page is left out, since only the open stage can be drawn. A stage taken out of a match, or
the stages of a deleted match, stay as ordinary projects. *Export the match* saves the match and all
its stages in one file; *Import file…* takes it back as new projects in a new match.

**Projects, export and import.** Every change is saved in this browser automatically (the chip in
the toolbar says *Saved*). The *Projects* tab in the left-hand panel lists your stages: open, duplicate or delete them, start a
*New stage*, *Export this stage* as a `.json` file, or *Import file…* to add a stage from a file.
An import always becomes a new project, so it never overwrites one. Below your projects is the
*Stage library*: 58 ready-made stages (drills and standards, short, medium and long IPSC courses,
USPSA and club stages with moving targets). Search or pick a category, then *Open as new project*
to get your own copy to change. *Copy share link* copies a link that holds the open stage itself
(after the #, which browsers never send to a server): whoever opens it gets a copy as a new project.
A project with changes that
aren't in an exported file shows a hint, so you know when to export a backup.

### Keyboard shortcuts

| Key | Action |
|---|---|
| ⌘/Ctrl Z, ⇧⌘/Ctrl Z | Undo, redo |
| ⌘/Ctrl D | Duplicate the selection |
| Delete / Backspace | Delete the selection |
| Q / E | Rotate the selection by the angle snap |
| Shift while dragging | Move slowly (1/5 speed), without snapping |
| Enter / Escape | Finish / cancel drawing; Escape also clears the selection |
| F | Frame all |
| 1 2 3 4 | Isometric, Top, Front, Shooter's eye |
| [ / ] | In Shooter's eye: previous / next shooting position |
| ⌘/Ctrl C, X, V | Copy, cut, paste the selection |
| ⌘/Ctrl A | Select everything that isn't hidden or locked |
| ⌘/Ctrl G, ⇧⌘/Ctrl G | Group the selection, ungroup |
| L / H | Lock or unlock, hide or show the selection |
| M | Measure distances on the ground |
| Right-click (long-press) | The prop menu |

## Tests

```sh
npm test            # node --test: tests/*.test.mjs
npm run lint        # ESLint, including the unsafe-DOM rule
```

## Credits

- Ground texture: [Gravelly Sand](https://polyhaven.com/a/gravelly_sand) by Dario Barresi,
  Poly Haven, CC0 (kept in `vendor/textures/polyhaven/gravelly_sand/`).
- [Three.js](https://threejs.org) (MIT), self-hosted in `vendor/three/`.

## License

MIT. See [LICENSE](LICENSE).
