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



import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default class Engine {
    container: HTMLElement;
    renderer: WebGLRenderer;
    camera: PerspectiveCamera;
    scene: Scene;
    renderFunc: (renderer: Scene) => void

    constructor(container: HTMLElement, renderFunc: (renderer: Scene) => void) {
        this.container = container;
        this.renderer = new WebGLRenderer({ antialias: true });
        this.camera = new PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 5000);
        this.scene = new Scene();
        this.renderFunc = renderFunc;
    }

    run() {
        const scene = this.scene;
        const camera = this.camera;
        const container = this.container;
        const renderer = this.renderer;
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        // Run code
        const controls = this.addControls();
        this.addLighting()
        animate();
        this.render();

        document.getElementById("visualizeBtn")?.addEventListener("click", _ => this.render());


        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
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
        floor.rotateX(-Math.PI / 2);
        floor.rotateY(-1);
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
    }
}