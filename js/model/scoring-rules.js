// Scoring constants for the round count, maximum points and suggested course type.
//
// Source: IPSC Combined Competition Rules – 6 Disciplines, January 2024 Edition (Handgun, [HT]),
// https://www.ipsc.org/wp-content/uploads/2024/02/IPSC-Combined-Competition-Rules-6-Disciplines-Jan-2024-Edition-Final-31-Jan-2024.pdf
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
  edition: "IPSC Combined Competition Rules, January 2024 Edition (Handgun)",
  hitsPerPaper: 2,
  hitsPerSteel: 1,
  pointsPerPaperHit: 5,
  pointsPerSteelHit: 5,
  courseLimits,
  typeByRoundsOnly: false,
});
