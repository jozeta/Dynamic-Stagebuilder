# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A browser-based 3D IPSC stage builder for professional stage builders and enthusiast shooters:
build one stage at real scale, view it in 3D, print a Written Stage Briefing (WSB) with a stage map.
Static web app, no backend, no build step. Created 2026-11-18.

**The v1 design is `docs/superpowers/specs/2026-11-18-stage-builder-v1-design.md`** (goals,
non-goals, data schema, module layout, my calls). Read it before working on features. Anything in
its non-goals list is a later version, not v1.

## Commands

```sh
python3 -m http.server 8002      # then open http://localhost:8002/ (or: claude-update)
```

Tests:

```sh
npm test            # node --test: tests/*.test.mjs
npm run lint        # ESLint, including the unsafe-DOM rule
```

## Layout

- `index.html`: entry page (strict CSP with the import map's sha256, app grid, small-screen message)
- `css/app.css`: the app's own styles on Låda Glass tokens
- `js/main.js`: boot and wiring; `js/editor.js`: user actions → undoable stage edits (no DOM)
- `js/model/`: pure stage data (props, scoring-rules, stage, history, snap, numbering, stats, schema)
- `js/render/`: Three.js (engine, stage-view, builders/, environments/, camera, labels, picking, ground)
- `js/ui/`: Låda Glass panels (toolbar, library, inspector, stats, shortcuts, about, dom helpers)
- `js/demo.js`: the example stage shown on open (until saved projects exist)
- `vendor/three/0.187.0/`, `vendor/lada-glass/2.3.0/`: self-hosted libraries (don't edit)
- `tests/`: `node --test` (model, editor, builders and environments run in Node; Three.js from
  node_modules, pinned to the vendored version)
- `docs/superpowers/`: the v1 design and the implementation plans

Still to come (Plans 2 and 3): `js/storage/` (IndexedDB, JSON files), `print.html` + `css/print.css`,
`sw.js` + `manifest.webmanifest`.

## Architecture rules

- **1 world unit = 1 metre.** x across the bay (centred), z down range (0 at the uprange edge), y up.
  Right-handed: looking down range, +x is to the shooter's left. Rotation is degrees about y;
  a node's `rotation.y = −degrees`.
- **Stage data is plain JSON and the single source of truth.** It never holds Three.js objects; the
  3D view is rebuilt from it. Every edit goes through `model/history.js` so it can be undone.
- **Environments never touch stage data.** Scene groups: `environmentGroup` (ground, sky, lights)
  and `stageGroup` (props). A wall's mesh colour and frame are wall properties. A test asserts the
  stage JSON is identical before and after an environment switch.
- `js/model/` has no DOM and no Three.js imports, so it runs under `node --test`. Put logic there.
- Scoring constants live in `js/model/scoring-rules.js` with the IPSC rulebook edition they come
  from; don't add rule checks without a cited rule and edition.
- Imported JSON is validated by `model/schema.js` before use and never overwrites an existing project.
- Three.js is loaded through an inline import map allowed by its `sha256` hash in the CSP. If you
  change the import map, update the hash.

## Design

Låda Glass 2.3.0 (`~/Desktop/code/tools/design`, preview: `design/preview.html` there): dark frosted
glass is the main theme, light the alternative, compact density. Use its `lg-` components and
tokens instead of new styles; don't edit the vendored copy (update it when `claude-check` says it's
old). The 3D viewport is the app's own canvas.

Devices: computers (mouse first, keyboard shortcuts) and iPads (touch; every action also has an
on-screen button, touch targets ≥ 44 px, nothing hover-only). Check at 768, 1024 and 1280 px. No
phones: below 768 px show a "use a computer or an iPad" message (waiver in `.claude-standards`).
English only. Installable PWA (`pwa=yes`): the service worker caches only the app's own files,
versioned with the app.

## Working agreements

- This repo follows the app standards in `~/Desktop/code/tools/standards/STANDARDS.md` (rule IDs,
  severities). `claude-check --repo .` checks it; decisions and reasoned waivers go in `.claude-standards`.
- Plan before building: agree on goals, scope and tech choices first, then implement in small,
  tested steps (failing test first).
- Never commit secrets. `.env` files are gitignored; commit only `.env.example` with placeholders.
- Untrusted data (network, files, URLs, storage, user input) is rendered with `textContent` or a
  sanitizer, never `innerHTML`; no `eval`; no third-party requests (self-host libraries in `vendor/`).
- Keep CI (`.github/workflows/ci.yml`) green; record user-visible changes under "Unreleased" in
  `CHANGELOG.md`.
- Version 0.1.0 (in `package.json`). Show it in the app (an About page, `--version` or a footer, read
  from that file). Bump it on every push that changes the app (patch: fixes, minor: features, major:
  breaking changes), and in the same commit move "Unreleased" under the new version and update the
  README's version and "What's new".
- The README stays detailed: what it is, installation, configuration and settings, how-tos, and
  screenshots in a grid with a caption under each.
- There is no GitHub remote yet. Don't push or create repos unless asked.
