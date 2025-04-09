// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('viewport').appendChild(renderer.domElement);

// Create a cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Set camera position
camera.position.set(0, 1, 5);

// Add lighting
const light = new THREE.AmbientLight(0x404040);
scene.add(light);

// Create floor
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1;
scene.add(floor);

// OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Raycaster and mouse for selection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedObject = null;
let outlineMesh = null;

// Highlight function
function highlightObject(object) {
    if (outlineMesh) {
        scene.remove(outlineMesh);
        outlineMesh = null;
    }

    if (object) {
        const outlineMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.BackSide,
        });

        outlineMesh = new THREE.Mesh(object.geometry.clone(), outlineMaterial);
        outlineMesh.position.copy(object.position);
        outlineMesh.rotation.copy(object.rotation);
        outlineMesh.scale.copy(object.scale).multiplyScalar(1.05);
        scene.add(outlineMesh);
    }
}

// Object selection
function onClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, false);

    for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object !== floor) {
            selectedObject = intersects[i].object;
            highlightObject(selectedObject);
            updateGUIForSelected();
            return;
        }
    }

    selectedObject = null;
    highlightObject(null);
    updateGUIForSelected();
}
renderer.domElement.addEventListener('click', onClick);

// GUI controls
const gui = new dat.GUI();
gui.domElement.style.display = 'none'; // Initially hidden
gui.domElement.style.position = 'absolute';
gui.domElement.style.left = '10px';
gui.domElement.style.top = '0px';
gui.domElement.style.zIndex = '100';

const cubeParams = {
    x: 0,
    y: 0,
    z: 0,
    scale: 1,
};

function updateGUIForSelected() {
    while (gui.__controllers.length > 0) {
        gui.remove(gui.__controllers[0]);
    }

    if (!selectedObject) {
        gui.domElement.style.display = 'none';
        return;
    }

    cubeParams.x = selectedObject.position.x;
    cubeParams.y = selectedObject.position.y;
    cubeParams.z = selectedObject.position.z;
    cubeParams.scale = selectedObject.scale.x;

    gui.add(cubeParams, 'x', -10, 10).onChange(() => selectedObject.position.x = cubeParams.x);
    gui.add(cubeParams, 'y', -10, 10).onChange(() => selectedObject.position.y = cubeParams.y);
    gui.add(cubeParams, 'z', -10, 10).onChange(() => selectedObject.position.z = cubeParams.z);
    gui.add(cubeParams, 'scale', 0.1, 3).onChange(() => {
        selectedObject.scale.set(cubeParams.scale, cubeParams.scale, cubeParams.scale);
        if (outlineMesh) {
            outlineMesh.scale.copy(selectedObject.scale).multiplyScalar(1.05);
        }
    });

    gui.domElement.style.display = 'block'; // Show GUI when object is selected
}

// Add Cube/Sphere GUI
const guiAdd = new dat.GUI({ width: 200 });
guiAdd.domElement.style.position = 'absolute';
guiAdd.domElement.style.left = '300px';
guiAdd.domElement.style.top = '0px';
guiAdd.domElement.style.zIndex = '100';

const objectAdder = {
    addCube: function () {
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set((Math.random() - 0.5) * 10, 0, (Math.random() - 0.5) * 10);
        scene.add(cube);
    },
    addSphere: function () {
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set((Math.random() - 0.5) * 10, 0, (Math.random() - 0.5) * 10);
        scene.add(sphere);
    }
};

guiAdd.add(objectAdder, 'addCube').name('Add Cube');
guiAdd.add(objectAdder, 'addSphere').name('Add Sphere');

// Move selected object with arrow keys
let moveSpeed = 0.1;
document.addEventListener('keydown', (event) => {
    if (!selectedObject) return;

    switch (event.key) {
        case 'ArrowUp':
            selectedObject.position.z -= moveSpeed;
            break;
        case 'ArrowDown':
            selectedObject.position.z += moveSpeed;
            break;
        case 'ArrowLeft':
            selectedObject.position.x -= moveSpeed;
            break;
        case 'ArrowRight':
            selectedObject.position.x += moveSpeed;
            break;
    }

    if (outlineMesh) {
        outlineMesh.position.copy(selectedObject.position);
    }

    // Sync GUI
    cubeParams.x = selectedObject.position.x;
    cubeParams.z = selectedObject.position.z;
    gui.updateDisplay();
});

// Ensure the cube starts on floor
cube.position.y = 0;

// Animate
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
