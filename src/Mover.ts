import * as dat from "dat.gui";
import {
  Mesh,
  MeshBasicMaterial,
  Raycaster,
  Vector2,
  Scene,
  BackSide,
  WebGLRenderer,
  Object3D,
} from "three";
import Engine from "./engine";

const MAX_INPUT = 2000;
const MOVE_SPEED = 20;

export class Mover {
  rayCaster: Raycaster;
  mouseLocation: Vector2;
  selected: Object3D | null = null;
  outlineMesh: Mesh | null = null;
  scene: Scene;
  gui: dat.GUI;
  renderer: WebGLRenderer;
  engine: Engine;

  cubeParams = {
    x: 0,
    y: 0,
    z: 0,
    scale: 1,
  };

  constructor(engine: Engine) {
    this.rayCaster = new Raycaster();
    this.mouseLocation = new Vector2();
    this.scene = engine.scene;
    this.gui = new dat.GUI({ width: 200 });
    this.renderer = engine.renderer;

    // Add Cube/Sphere GUI
    document.addEventListener("click", (e) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouseLocation.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouseLocation.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.rayCaster.setFromCamera(this.mouseLocation, engine.camera);
      const intersects = this.rayCaster.intersectObjects(
        this.scene.children,
        false
      );

      for (let i = 0; i < intersects.length; i++) {
        this.selected = intersects[i].object;
        this.highLight(this.selected);
        this.updateGUIForSelected();
        return;
      }

      //this.selected = null;
      //this.highLight(null);
      //this.updateGUIForSelected();
    });
  }

  highLight(obj: any) {
    if (this.outlineMesh) {
      this.scene.remove(this.outlineMesh);
      this.outlineMesh = null;
    }
    if (!obj) {
      return;
    }

    const outlineMaterial = new MeshBasicMaterial({
      color: 0x000000,
      side: BackSide,
    });

    this.outlineMesh = new Mesh(obj.geometry.clone(), outlineMaterial);
    this.outlineMesh.position.copy(obj.position);
    this.outlineMesh.rotation.copy(obj.rotation);
    this.outlineMesh.scale.copy(obj.scale).multiplyScalar(1.05);
    this.scene.add(this.outlineMesh);
  }

  updateGUIForSelected() {
    while (this.gui.__controllers.length > 0) {
      this.gui.remove(this.gui.__controllers[0]);
    }

    if (!this.selected) {
      this.gui.domElement.style.display = "none";
      return;
    }

    this.cubeParams.x = this.selected.position.x;
    this.cubeParams.y = this.selected.position.y;
    this.cubeParams.z = this.selected.position.z;
    this.cubeParams.scale = this.selected.scale.x;
    if (!this.selected) {
      return;
    }

    this.gui
      .add(this.cubeParams, "x", -MAX_INPUT, MAX_INPUT)
      .onChange(() => (this.selected!.position.x = this.cubeParams.x));
    this.gui
      .add(this.cubeParams, "y", -MAX_INPUT, MAX_INPUT)
      .onChange(() => (this.selected!.position.y = this.cubeParams.y));
    this.gui
      .add(this.cubeParams, "z", -MAX_INPUT, MAX_INPUT)
      .onChange(() => (this.selected!.position.z = this.cubeParams.z));
    this.gui.add(this.cubeParams, "scale", 0.1, 3).onChange(() => {
      this.selected!.scale.set(
        this.cubeParams.scale,
        this.cubeParams.scale,
        this.cubeParams.scale
      );
      if (this.outlineMesh) {
        this.outlineMesh.scale.copy(this.selected!.scale).multiplyScalar(1.05);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (!this.selected) {
        return;
      }
      switch (event.key) {
        case "ArrowUp":
          this.selected.position.z -= MOVE_SPEED; // Move forward (negative Z)
          break;
        case "ArrowDown":
          this.selected.position.z += MOVE_SPEED; // Move backward (positive Z)
          break;
        case "ArrowLeft":
          this.selected.position.x -= MOVE_SPEED; // Move left (negative X)
          break;
        case "ArrowRight":
          this.selected.position.x += MOVE_SPEED; // Move right (positive X)
          break;
      }
    });

    this.gui.domElement.style.display = "block"; // Show GUI when object is selected
  }
}
