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
    TextureLoader,
} from "three";
import Engine from "./engine";

const BACKGROUND = "cloud-sky.jpg";



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

    cubeParams = {
        x: 0,
        y: 0,
        z: 0,
        scale: 1,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        length: 1,  // Scale along x-axis
        width: 1,   // Scale along y-axis
        height: 1   // Scale along z-axis
    };

    constructor(engine: Engine) {
        this.rayCaster = new Raycaster();
        this.mouseLocation = new Vector2();
        this.scene = engine.scene;
        this.gui = new dat.GUI({ width: 200 });
        this.renderer = engine.renderer;
        this.gui.domElement.style.left = "10px";
        this.gui.domElement.style.top = "70px";
        this.gui.domElement.style.zIndex = "100";
        this.gui.domElement.style.marginTop = "147px";
        this.gui.domElement.style.marginRight = "40px";


        const loader = new TextureLoader();
        this.scene.background = loader.load(BACKGROUND);

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
            this.gui.domElement.style.display = 'none';
            return;
        }

        this.cubeParams.x = this.selected.position.x;
        this.cubeParams.y = this.selected.position.y;
        this.cubeParams.z = this.selected.position.z;
        this.cubeParams.scale = this.selected.scale.x;
        if (!this.selected) {
            return;
        }

        this.gui.add(this.cubeParams, 'x', -MAX_INPUT, MAX_INPUT).onChange(() => this.selected!.position.x = this.cubeParams.x);
        this.gui.add(this.cubeParams, 'y', -MAX_INPUT, MAX_INPUT).onChange(() => this.selected!.position.y = this.cubeParams.y);
        this.gui.add(this.cubeParams, 'z', -MAX_INPUT, MAX_INPUT).onChange(() => this.selected!.position.z = this.cubeParams.z);
        this.gui.add(this.cubeParams, 'scale', 0.1, 3).onChange(() => {
            this.selected!.scale.set(this.cubeParams.scale, this.cubeParams.scale, this.cubeParams.scale);
            if (this.outlineMesh) {
                this.outlineMesh.scale.copy(this.selected!.scale).multiplyScalar(1.05);
            }
        });

        // Adding the independent scaling controls for each axis
        this.gui.add(this.cubeParams, 'length', 0.1, 5).onChange(() => {
            this.selected!.scale.x = this.cubeParams.length;
            if (this.outlineMesh) {
                this.outlineMesh.scale.x = this.cubeParams.length * 1.05;
            }
        });

        this.gui.add(this.cubeParams, 'width', 0.1, 5).onChange(() => {
            this.selected!.scale.y = this.cubeParams.width;
            if (this.outlineMesh) {
                this.outlineMesh.scale.y = this.cubeParams.width * 1.05;
            }
        });

        this.gui.add(this.cubeParams, 'height', 0.1, 5).onChange(() => {
            this.selected!.scale.z = this.cubeParams.height;
            if (this.outlineMesh) {
                this.outlineMesh.scale.z = this.cubeParams.height * 1.05;
            }
        });

        this.gui.add(this.cubeParams, 'rotationX', -Math.PI, Math.PI).onChange(() => {
            this.selected!.rotation.x = this.cubeParams.rotationX;
        });
        this.gui.add(this.cubeParams, 'rotationY', -Math.PI, Math.PI).onChange(() => {
            this.selected!.rotation.y = this.cubeParams.rotationY;
        });
        this.gui.add(this.cubeParams, 'rotationZ', -Math.PI, Math.PI).onChange(() => {
            this.selected!.rotation.z = this.cubeParams.rotationZ;
        });

        document.addEventListener('keydown', (event) => {
            if (!this.selected) {
                return;
            }
            switch (event.key) {
                case 'ArrowUp':
                    this.selected.position.z -= MOVE_SPEED; // Move forward (negative Z)
                    break;
                case 'ArrowDown':
                    this.selected.position.z += MOVE_SPEED; // Move backward (positive Z)
                    break;
                case 'ArrowLeft':
                    this.selected.position.x -= MOVE_SPEED; // Move left (negative X)
                    break;
                case 'ArrowRight':
                    this.selected.position.x += MOVE_SPEED; // Move right (positive X)
                    break;
            }
        });

        this.gui.domElement.style.display = 'block'; // Show GUI when object is selected


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
