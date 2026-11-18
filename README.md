# Dynamic-Stagebuilder

A browser-based 3D stage builder for IPSC practical shooting. Lay out a stage at real scale, look at
it from any angle, and print a Written Stage Briefing with a stage map for range officers and
competitors.

**Version:** 0.1.0 · **Status:** early development (v1 is being built; see the
[v1 design](docs/superpowers/specs/2026-11-18-stage-builder-v1-design.md)). Started 2026-11-18.

## Who it's for

Professional stage builders and enthusiast IPSC shooters who design stages for club matches and
training, and want a clear briefing sheet without drawing the map by hand.

## What v1 will do

- **Shooting bay** at real scale: width × depth in metres (default 20 × 30 m), 1 m grid.
- **Prop library**, every prop drawn in 3D at real dimensions:
  - paper: IPSC target, mini target, no-shoot, mini no-shoot (on stick stands, adjustable height)
  - steel: IPSC popper, mini popper, round plate, square plate
  - walls: mesh wall (black or blue mesh, black or wood frame), wooden wall, wall with a real port
  - obstacles: barrel, tyre, tyre stack, wooden crate
  - fault lines, shooting areas and the start position
- **Editing by eye:** click or drag props in, drag them on the ground, rotate them, all with grid
  and angle snapping; multi-select, duplicate, delete, undo and redo.
- **Automatic target numbers** (T1…, P1… for steel, NS1… for no-shoots), with hand-set labels kept.
- **Live statistics:** targets, no-shoots, minimum rounds, maximum points, suggested stage type.
- **Written Stage Briefing** editor: match, stage name and number, designer, stage type, scoring,
  targets, minimum rounds, maximum points, start signal, start position, gun condition, procedure,
  stop time and notes. Counted fields come from the stage itself.
- **Printable brief** (A4, two pages): briefing and top-down map with a scale bar on page 1, a 3D
  view on page 2. Save it as a PDF from the print dialog.
- **Two surroundings,** Technical (grey floor, grid) and Outdoor (dirt, sunlight). Switching never
  moves anything on the stage.
- **Cameras:** orbit, pan, zoom, Top, Isometric, Front and a shooter's-eye view from the start position.
- **Projects** saved in the browser automatically, plus JSON export and import.
- **Works offline** and can be installed as an app (PWA).

Later versions (not in v1): matches with several stages, build sheet with coordinates, sight-line
analysis, measuring tools, moving targets, more surroundings and props, model import, version history.

## Devices

Computers (mouse and keyboard first) and iPads (touch; every action also has a button). Phones are
not supported: below 768 px wide the app asks you to use a larger screen. English only.

## What's new

### 0.1.0

- Project created; v1 design agreed. Older versions are listed in [CHANGELOG.md](CHANGELOG.md).

## Screenshots

<!-- Once the UI exists, show the screenshots in a grid with a caption under each (claude-shots
     --write Dynamic-Stagebuilder refreshes the images), e.g.:
<table>
  <tr>
    <td><img src="docs/main.png" alt="Main screen" width="400"><br>The main screen</td>
    <td><img src="docs/settings.png" alt="Settings" width="400"><br>Settings</td>
  </tr>
</table>
-->

## Installation

No build step and no server-side code. Serve the folder and open it in a browser:

```sh
python3 -m http.server 8002      # then open http://localhost:8002/ (or: claude-update)
```

## Configuration

(Every setting, what it does and its default, once there are any. Planned: bay width and depth,
grid snap (default 0.25 m), angle snap (default 15°), surroundings (default Technical).)

## How to

(A short how-to for each main task once the app does something: build a stage, number targets,
fill in the briefing, print the brief as a PDF, export and import a stage, install the app.)

## Tests

```sh
npm test            # node --test: tests/*.test.mjs
npm run lint        # ESLint, including the unsafe-DOM rule
```

## License

MIT. See [LICENSE](LICENSE).
