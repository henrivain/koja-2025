import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    AmbientLight,
    DirectionalLight,
    Object3D,
} from "three";

import * as dat from 'dat.gui';




import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default class Engine {
    container: HTMLElement;
    renderer: WebGLRenderer;
    camera: PerspectiveCamera;
    scene: Scene;
    controls: OrbitControls;
    elems: Object3D[];
    gui: dat.GUI | null = null;
    selectedObject: Object3D | null = null;

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







}