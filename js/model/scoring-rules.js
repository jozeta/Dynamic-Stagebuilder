// Scoring constants for the round count, maximum points and suggested course type.
//
// Source: IPSC Handgun Competition Rules, January 2026 Edition (www.ipsc.org, Rules). Checked
// 2026-11-20: every rule and value below reads the same as in the January 2024 Combined Competition
// Rules this file cited before.
// - Rule 1.2.1.1–1.2.1.3: Short ≤ 12 rounds, Medium ≤ 24, Long ≤ 32 (Handgun). Course types ALSO limit
//   scoring hits per location or view (≤ 9) and, for Medium/Long, forbid shooting all targets from one
//   place, so the app only *suggests* a type from the round count (typeByRoundsOnly: false).
// - Appendix B2/B3: an A-zone hit scores 5 points (Major and Minor). Appendix C2 / Rule 9.4.1: poppers
//   and plates score 5 points.
// - 2 hits per paper target and 1 per steel target is the usual Comstock stage convention (Rule 9.2.1),
//   stated in each Written Stage Briefing, not a fixed rule.
// - Rule 9.4.2: no-shoots are penalties, they add no rounds and no points.

const courseLimits = Object.freeze({ Short: 12, Medium: 24, Long: 32 });

export const SCORING = Object.freeze({
  edition: "IPSC Handgun Competition Rules, January 2026 Edition",
  hitsPerPaper: 2,
  hitsPerSteel: 1,
  pointsPerPaperHit: 5,
  pointsPerSteelHit: 5,
  courseLimits,
  typeByRoundsOnly: false,
});

// Target arrays. Source: IPSC Target Array Handbook, January 2019 Edition (the 2026 Handgun Rules,
// section 1.3, still refer to "the separate Target Array Book"),
// https://www.ipsc.org/wp-content/uploads/2019/10/Target-Arrays-2019.pdf
// - 1.2: hard cover is painted on the lower portion, a diagonal portion or the sides only.
// - 1.5: the top of an IPSC Target or No-shoot must never exceed 1.8 m, a Mini Target 1.6 m.
// - 2.1: the upper portion of a target or no-shoot must never be concealed.
// - 2.3 / 2.4: a no-shoot may be in front of or behind two adjoining targets; overlapping arrays
//   are two scoring targets, or two scoring targets with a no-shoot between them.
// - 4.1: "carnival" arrays such as stars, plate racks and trees are not acceptable in IPSC.
export const TARGET_ARRAY_RULES = Object.freeze({
  edition: "IPSC Target Array Handbook, January 2019 Edition",
  maxTop: Object.freeze({ ipsc: 1.8, mini: 1.6 }),
  heightRule: "1.5",
  carnivalRule: "4.1",
});
