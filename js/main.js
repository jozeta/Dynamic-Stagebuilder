// Boot: create the 3D engine and show the bay.
import * as THREE from "three";
import { createEngine } from "./render/engine.js";

const canvas = document.getElementById("viewport");
const engine = createEngine(canvas);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 30), new THREE.MeshStandardMaterial({ color: 0x7a7d80 }));
ground.rotation.x = -Math.PI / 2;
ground.position.z = 15;
engine.groups.environment.add(ground, new THREE.HemisphereLight(0xffffff, 0x444444, 2));
engine.scene.background = new THREE.Color(0x9aa0a6);
engine.requestRender();
