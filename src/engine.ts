import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BoxGeometry,
    Mesh,
    MeshPhongMaterial,
    DoubleSide,
    AmbientLight,
    PlaneGeometry,
    MeshBasicMaterial,
} from "three";


import { CSG } from 'three-csg-ts';

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default class Engine {
    container: HTMLElement;
    renderer: WebGLRenderer;
    camera: PerspectiveCamera;

    constructor(container: HTMLElement) {
        this.container = container;
        this.renderer = new WebGLRenderer({ antialias: true });
        this.camera = new PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 5000);
    }

    run() {
        const container = this.container;
        const renderer = this.renderer;
        const camera = new PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 5000);
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // Run code
        const controls = addControls(camera);
        addLighting()
        animate();
        render();

        document.getElementById("visualizeBtn")?.addEventListener("click", _ => this.render());

        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(SCENE, camera);
        }
    }


    addControls() {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        this.camera.position.z = 600;
        return controls;
    }
}