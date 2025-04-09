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

const SCENE = new Scene();

function main() {
    const container = document.getElementById("viewer") as HTMLDivElement;

    const camera = new PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 5000);
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Run code
    const controls = addControls(renderer, camera);
    addLighting()
    animate();
    render();

    document.getElementById("visualizeBtn")?.addEventListener("click", _ => render());

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(SCENE, camera);
    }
}

function render() {
    clearScene();

    const blueMaterial = new MeshPhongMaterial({ color: 0x3498db, side: DoubleSide });
    const greenMaterial = new MeshPhongMaterial({ color: 0x1db32e, side: DoubleSide });

    const geometry = new BoxGeometry(200, 200, 100);
    const cube = new Mesh(geometry, blueMaterial);
    cube.position.set(0, 0, 0)

    const geometry2 = new BoxGeometry(200, 200, 200);
    const cube2 = new Mesh(geometry2, greenMaterial);
    cube2.position.set(100, 100, 0)

    SCENE.add(cube)
    SCENE.add(cube2)

    const subtract = CSG.subtract(cube, cube2)
    SCENE.add(subtract)
}


function addControls(renderer: WebGLRenderer, camera: PerspectiveCamera) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    camera.position.z = 600;
    return controls;
}

function addFloor() {
    const plane = new PlaneGeometry(100, 100);
    const material = new MeshBasicMaterial({ color: 0x808080, side: DoubleSide })
    const floor = new Mesh(plane, material);
    floor.rotateX(-Math.PI / 2);
    floor.rotateY(-1);
    SCENE.add(floor);
}

function addLighting() {
    const ambientLight = new AmbientLight(0xffffff, 0.5);
    ambientLight.position.set(0, 1, 1).normalize();
    SCENE.add(ambientLight);
}


// Clear old meshes
function clearScene() {
    while (SCENE.children.length > 0) {
        const obj = SCENE.children[0] as any;
        SCENE.remove(obj);


        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
    }
    addLighting();
}


main();

