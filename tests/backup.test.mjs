// Back up everything: one file with every project, match, folder and surroundings template. A
// restore is untrusted input: everything is checked, comes in as new records with new ids (nothing
// is overwritten), and the links between them (a match's stages, a folder's items, a stage's own
// surroundings) follow the new ids.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createStage, setSetting } from "../js/model/stage.js";
import { backupToJson, parseBackup, BACKUP_KIND, dataUrlToBytes } from "../js/storage/backup.js";

const stageA = { ...createStage({ name: "Alpha" }), id: "stageA" };
const stageB = setSetting({ ...createStage({ name: "Bravo" }), id: "stageB" }, "environment", "custom:envOne");
const data = () => ({
  projects: [{ id: "stageA", name: "Alpha", modified: 5, exportedAt: null, stage: stageA }, { id: "stageB", name: "Bravo", modified: 6, exportedAt: 3, stage: stageB }],
  matches: [{ kind: "match", id: "m1", name: "Club match", stageIds: ["stageA", "stageB"], created: 1, modified: 2 }],
  folders: [{ kind: "folder", id: "f1", name: "2026", parent: null, items: ["match:m1", "stage:stageA"], created: 1 }, { kind: "folder", id: "f2", name: "Inner", parent: "f1", items: [], created: 1 }],
  surroundings: [{ id: "envOne", name: "Our hall", plan: null, pieces: [], image: "data:image/png;base64,iVBORw0KGgo=" }],
});

test("a backup is one JSON file of its own kind with everything in it", () => {
  const json = JSON.parse(backupToJson(data(), { now: 1000 }));
  assert.equal(json.kind, BACKUP_KIND);
  assert.equal(json.version, 1);
  assert.equal(json.created, 1000);
  assert.equal(json.projects.length, 2);
  assert.equal(json.matches.length, 1);
  assert.equal(json.folders.length, 2);
  assert.equal(json.surroundings[0].image, "data:image/png;base64,iVBORw0KGgo=");
});

test("restoring gives new ids everywhere and keeps the links between records", () => {
  const r = parseBackup(backupToJson(data()));
  assert.equal(r.ok, true);
  const [a, b] = r.projects;
  assert.notEqual(a.id, "stageA");
  assert.equal(a.stage.id, a.id);
  assert.equal(a.name, "Alpha");
  assert.equal(b.exportedAt, 3);
  const [m] = r.matches;
  assert.notEqual(m.id, "m1");
  assert.deepEqual(m.stageIds, [a.id, b.id]);
  const [f1, f2] = r.folders;
  assert.notEqual(f1.id, "f1");
  assert.deepEqual(f1.items, [`match:${m.id}`, `stage:${a.id}`]);
  assert.equal(f2.parent, f1.id);
  const [env] = r.surroundings;
  assert.notEqual(env.id, "envOne");
  assert.equal(b.stage.settings.environment, `custom:${env.id}`);
  assert.deepEqual([...env.imageBytes], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.equal(env.imageType, "image/png");
  assert.deepEqual(r.counts, { projects: 2, matches: 1, folders: 2, surroundings: 1 });
});

test("a broken stage is left out, the rest comes in; references to it are dropped", () => {
  const d = data();
  d.projects[1] = { ...d.projects[1], stage: { nonsense: true } };
  const r = parseBackup(backupToJson(d));
  assert.equal(r.ok, true);
  assert.equal(r.projects.length, 1);
  assert.equal(r.matches[0].stageIds.length, 1);
  assert.equal(r.skipped, 1);
});

test("a stage that points at surroundings the backup doesn't have falls back to Outdoor", () => {
  const d = data();
  d.surroundings = [];
  const r = parseBackup(backupToJson(d));
  assert.equal(r.projects[1].stage.settings.environment, "outdoor");
});

test("not a backup, damaged or too large: a clear error", () => {
  assert.equal(parseBackup("{").ok, false);
  assert.match(parseBackup(JSON.stringify({ kind: "something-else" })).error, /not a backup/i);
  assert.equal(parseBackup("x".repeat(10), { maxBytes: 5 }).ok, false);
  assert.match(parseBackup(JSON.stringify({ kind: BACKUP_KIND, version: 1, projects: [] })).error, /empty/i);
});

test("only PNG, JPEG or WebP data URLs are images", () => {
  assert.equal(dataUrlToBytes("data:image/svg+xml;base64,PHN2Zz4="), null);
  assert.equal(dataUrlToBytes("data:image/png;base64,***"), null);
  assert.equal(dataUrlToBytes("javascript:alert(1)"), null);
  assert.equal(dataUrlToBytes("data:image/jpeg;base64,/9j/").type, "image/jpeg");
});

test("the club's name and logo travel in the backup, checked on the way back", () => {
  const r = parseBackup(backupToJson({ ...data(), club: { name: "GPSK", logo: "data:image/png;base64,iVBORw0KGgo=" } }));
  assert.deepEqual(r.club, { name: "GPSK", logo: "data:image/png;base64,iVBORw0KGgo=" });
  const bad = parseBackup(backupToJson({ ...data(), club: { name: "GPSK", logo: "javascript:x" } }));
  assert.equal(bad.club.logo, null);
  assert.equal(parseBackup(backupToJson(data())).club, null);
});
