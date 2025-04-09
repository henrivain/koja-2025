import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    DirectionalLight,
    BoxGeometry,
    Mesh,
    MeshLambertMaterial,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";


const panelData: any = {
    "panel": { title: "Luukku", width: 1000.0, depth: 900.0 },
    "panelInside": { title: "Luukun sisäpaneeli", width: 984.2, depth: 704.2 },
    "panelOutside": { title: "Luukun ulkopaneeli", width: 987.0, depth: 707.0 },
};

const container = document.getElementById("viewer") as HTMLDivElement;
const scene = new Scene();
const camera = new PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 2000);
const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const light = new DirectionalLight(0xffffff, 1);
light.position.set(0, 1, 1).normalize();
scene.add(light);

camera.position.z = 600;

// Clear old meshes
function clearScene() {
    while (scene.children.length > 0) {
        const obj = scene.children[0] as any;
        scene.remove(obj);


        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
    }
    scene.add(light); // re-add light
}

function drawPanel(data: any) {
    clearScene();

    const geometry = new BoxGeometry(data.width, data.depth, 100);
    const material = new MeshLambertMaterial({ color: 0x3498db });
    const cube = new Mesh(geometry, material);
    scene.add(cube);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

document.getElementById("visualizeBtn")?.addEventListener("click", () => {
    const selector = document.getElementById("panelSelector") as HTMLSelectElement;
    const selectedKey = selector.value;
    drawPanel(panelData[selectedKey]);
});

animate(); // start animation loop
