import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    Mesh,
    DoubleSide,
    AmbientLight,
    PlaneGeometry,
    MeshBasicMaterial,
} from "three";

import * as dat from 'dat.gui';



import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default class Engine {
    container: HTMLElement;
    renderer: WebGLRenderer;
    camera: PerspectiveCamera;
    scene: Scene;
    controls: OrbitControls;
    renderFunc: (renderer: Scene) => void

    constructor(container: HTMLElement, renderFunc: (renderer: Scene) => void) {
        this.container = container;
        this.renderer = new WebGLRenderer({ antialias: true });
        this.camera = new PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 5000);
        this.scene = new Scene();
        this.renderFunc = renderFunc;
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
        this.addFloor();

        document.getElementById("visualizeBtn")?.addEventListener("click", _ => this.render());
    }

    animate() {
        requestAnimationFrame(_ => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    setFunc(renderFunc: (renderer: Scene) => void) {
        this.renderFunc = renderFunc;
    }

    addControls() {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        this.camera.position.z = 600;
        return controls;
    }



    addFloor() {
        const plane = new PlaneGeometry(100, 100);
        const material = new MeshBasicMaterial({ color: 0x808080, side: DoubleSide })
        const floor = new Mesh(plane, material);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -1;
        this.scene.add(floor);
    }

    addLighting() {
        const ambientLight = new AmbientLight(0xffffff, 0.5);
        ambientLight.position.set(0, 1, 1).normalize();
        this.scene.add(ambientLight);
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
        this.renderFunc(this.scene);
        this.addFloor();
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

        gui.add(cubeParams, 'x', -5, 5).onChange(() => {
            elem.position.x = cubeParams.x;
        });
        gui.add(cubeParams, 'y', -5, 5).onChange(() => {
            elem.position.y = cubeParams.y;
        });
        gui.add(cubeParams, 'z', -5, 5).onChange(() => {
            elem.position.z = cubeParams.z;
        });
        gui.add(cubeParams, 'scale', 0.1, 3).onChange(() => {
            elem.scale.set(cubeParams.scale, cubeParams.scale, cubeParams.scale);
        });

        // Function to move the cube using arrow keys
        let moveSpeed = 0.1; // Define how fast the cube moves

        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'ArrowUp':
                    elem.position.z -= moveSpeed; // Move forward (negative Z)
                    break;
                case 'ArrowDown':
                    elem.position.z += moveSpeed; // Move backward (positive Z)
                    break;
                case 'ArrowLeft':
                    elem.position.x -= moveSpeed; // Move left (negative X)
                    break;
                case 'ArrowRight':
                    elem.position.x += moveSpeed; // Move right (positive X)
                    break;
            }
        });

        // Ensure the cube stays on the flat surface
        elem.position.y = 0;


    }

}