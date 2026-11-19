// Side panel behaviour that isn't layout (the panels dock with Låda Glass's dock).

/** Should a selection change unfold the inspector? Yes when something new is selected. */
export function revealOnSelect(prev, next) {
  if (!next.length) return false;
  return next.some((id) => !prev.includes(id));
}
