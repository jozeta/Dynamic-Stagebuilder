// The move indicator shown while a prop is dragged: its starting spot, a line to where it is now,
// and how far it has moved. Pure geometry in stage coordinates ([x, z], metres).

/** How far `to` is from `from`: distance (m), text ("2.3 m", one decimal), labelAt (the line's middle). */
export function moveOf([x0, z0], [x1, z1]) {
  const distance = Math.hypot(x1 - x0, z1 - z0);
  return { distance, text: `${distance.toFixed(1)} m`, labelAt: [(x0 + x1) / 2, (z0 + z1) / 2] };
}
