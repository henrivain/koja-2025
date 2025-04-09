import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    Mesh,
    AmbientLight,
    DirectionalLight,
    Object3D,
} from "three";

import * as dat from 'dat.gui';
const MAX_INPUT = 200;
const MOVE_SPEED = 20;



import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default class Engine {
    container: HTMLElement;
    renderer: WebGLRenderer;
    camera: PerspectiveCamera;
    scene: Scene;
    controls: OrbitControls;
    elems: Object3D[];

    constructor(container: HTMLElement, elems: Object3D[]) {
        this.container = container;
        this.renderer = new WebGLRenderer({ antialias: true });
        this.camera = new PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 5000);
        this.scene = new Scene();
        this.elems = elems;
        this.controls = this.addControls();
    }

    run() {
        const container = this.container;
        const renderer = this.renderer;
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // Run code
        this.addLighting()
        this.render();
        this.animate();

        document.getElementById("visualizeBtn")?.addEventListener("click", _ => this.render());
    }

    animate() {
        requestAnimationFrame(_ => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    addElem(elem: Object3D) {
        this.scene.add(elem);
        this.elems.push(elem);
    }

    deleteElem(elem: Object3D) {
        this.elems = this.elems.filter(x => x != elem);
        this.scene.remove(elem);
    }

    addControls() {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        this.camera.position.z = 600;
        return controls;
    }





    addLighting() {
        const ambientLight = new AmbientLight(0xffffff, 0.5);
        ambientLight.position.set(0, 1, 1).normalize();
        this.scene.add(ambientLight);

        const directionalLight = new DirectionalLight(0xffffff, 2);
        directionalLight.position.set(100, 100, 100);
        this.scene.add(directionalLight);
    }


    // Clear old meshes
    clearScene() {
        while (this.scene.children.length > 0) {
            const obj = this.scene.children[0] as any;
            this.scene.remove(obj);


            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        }
        this.addLighting();
    }

    render() {
        this.clearScene();
        for (const elem of this.elems) {
            this.scene.add(elem);
        }
        this.animate();
    }


    addGui(elem: Mesh) {
        // GUI controls using dat.GUI
        const gui = new dat.GUI();
        const cubeParams = {
            x: 0,
            y: 0,
            z: 0,
            scale: 1,
        };

        gui.add(cubeParams, 'x', -MAX_INPUT, MAX_INPUT).onChange(() => {
            elem.position.x = cubeParams.x;
        });
        gui.add(cubeParams, 'y', -MAX_INPUT, MAX_INPUT).onChange(() => {
            elem.position.y = cubeParams.y;
        });
        gui.add(cubeParams, 'z', -MAX_INPUT, MAX_INPUT).onChange(() => {
            elem.position.z = cubeParams.z;
        });
        gui.add(cubeParams, 'scale', 0.1, 3).onChange(() => {
            elem.scale.set(cubeParams.scale, cubeParams.scale, cubeParams.scale);
        });

        // Function to move the cube using arrow keys

        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'ArrowUp':
                    elem.position.z -= MOVE_SPEED; // Move forward (negative Z)
                    break;
                case 'ArrowDown':
                    elem.position.z += MOVE_SPEED; // Move backward (positive Z)
                    break;
                case 'ArrowLeft':
                    elem.position.x -= MOVE_SPEED; // Move left (negative X)
                    break;
                case 'ArrowRight':
                    elem.position.x += MOVE_SPEED; // Move right (positive X)
                    break;
            }
        });

        // Ensure the cube stays on the flat surface
        elem.position.y = 0;
    }

}