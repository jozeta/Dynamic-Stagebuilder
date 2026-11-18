// Target labels (T1, P1, NS1): white bold text with a dark outline on a sprite that always faces the
// camera and stays readable through walls. The text is drawn on a canvas, never parsed as HTML.
import * as THREE from "three";

const HEIGHT = 0.28;   // label height in metres

export function createLabel(text) {
  const c = document.createElement("canvas");
  const g = c.getContext("2d");
  const px = 64;
  g.font = `700 ${px}px -apple-system, "Segoe UI", system-ui, sans-serif`;
  const w = Math.ceil(g.measureText(text).width) + 24;
  c.width = w;
  c.height = px + 24;
  g.font = `700 ${px}px -apple-system, "Segoe UI", system-ui, sans-serif`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.lineWidth = 10;
  g.strokeStyle = "rgba(20,22,25,0.85)";
  g.strokeText(text, w / 2, c.height / 2);
  g.fillStyle = "#ffffff";
  g.fillText(text, w / 2, c.height / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set((HEIGHT * c.width) / c.height, HEIGHT, 1);
  sprite.renderOrder = 10;
  sprite.userData.ownMaterial = true;
  sprite.userData.label = text;
  sprite.raycast = () => {};   // labels are not clickable
  return sprite;
}
